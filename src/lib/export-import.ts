import { z } from 'zod';

import { categorySchema } from '@/schemas/category';
import { appSettingsSchema } from '@/schemas/settings';
import { taskSchema } from '@/schemas/task';
import type { Category, Task } from '@/types';

import { db, DEFAULT_SETTINGS, seedDatabase } from './db/schema';
import { backupFilename, downloadBlob } from './download';
import { getSettings, mirrorPrefsToStorage, updateSettings } from './settings';

/**
 * JSON backup + backup/quota helpers (Step 8).
 *
 * JSON is the full, lossless backup and the *only* import path: a plain
 * `{ app, schemaVersion, exportedAt, data }` envelope, validated + date-revived
 * + enum-normalized through Zod before it touches Dexie. CSV export lives in
 * `csv-export.ts` so its PapaParse dependency only loads with the Settings page.
 *
 * The pure/data functions here are unit-tested directly; only the thin
 * `export*` orchestrator touches the DOM.
 */

/** Current Dexie schema version, stamped into JSON backups. */
const DB_SCHEMA_VERSION = 2;

/** Two weeks in milliseconds — the backup-reminder threshold (Req 7.7). */
const BACKUP_INTERVAL_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Rewrite the retired `timeCommitment` literals to the consolidated bucket,
 * mirroring the Dexie v2 `.upgrade()` in db/schema.ts. Dexie only runs that
 * upgrade on a *version transition* of stored rows, so a `bulkPut` of a
 * v1-shaped export is NOT re-upgraded — the importer must normalize itself.
 */
export function normalizeTimeCommitment(value: unknown): unknown {
  return value === '5hrs+' || value === '4hrs' ? '4hrs+' : value;
}

// --- Import validation schemas ------------------------------------------------
// Variants of the canonical schemas that accept ISO date strings (JSON has no
// Date type) and normalize stale enums, so imported rows revive as real `Date`s.

const taskImportSchema = taskSchema.extend({
  createdAt: z.coerce.date(),
  lastCompletedAt: z.coerce.date().nullable(),
  timeCommitment: z.preprocess(normalizeTimeCommitment, taskSchema.shape.timeCommitment),
});

const settingsImportSchema = appSettingsSchema.extend({
  lastBackupDate: z.coerce.date().nullable(),
});

const backupDataSchema = z.object({
  tasks: z.array(taskImportSchema),
  categories: z.array(categorySchema),
  settings: settingsImportSchema,
});

const backupEnvelopeSchema = z.object({
  app: z.literal('how-long-since'),
  schemaVersion: z.number(),
  exportedAt: z.string(),
  data: backupDataSchema,
});

/** The validated, date-revived payload restored from a JSON backup. */
export type BackupData = z.infer<typeof backupDataSchema>;

/** Full JSON backup envelope. */
export interface BackupEnvelope {
  app: 'how-long-since';
  schemaVersion: number;
  exportedAt: string;
  data: { tasks: Task[]; categories: Category[]; settings: BackupData['settings'] };
}

// --- JSON backup --------------------------------------------------------------

/** Read all three tables into an in-memory backup envelope. */
export async function buildBackup(): Promise<BackupEnvelope> {
  const [tasks, categories, settings] = await Promise.all([
    db.tasks.toArray(),
    db.categories.toArray(),
    getSettings(),
  ]);
  return {
    app: 'how-long-since',
    schemaVersion: DB_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: { tasks, categories, settings },
  };
}

/** Serialize an envelope to pretty JSON (`Date`s become ISO strings). */
export function serializeBackup(env: BackupEnvelope): string {
  return JSON.stringify(env, null, 2);
}

/**
 * Parse + validate a JSON backup string, reviving dates and normalizing stale
 * enums. Throws on anything that isn't a valid How Long Since backup — the
 * caller maps that to the friendly "Import failed…" copy.
 */
export function parseBackup(text: string): BackupData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('Backup file is not valid JSON');
  }
  const result = backupEnvelopeSchema.safeParse(raw);
  if (!result.success) {
    throw new Error('Backup file is not a valid How Long Since backup');
  }
  return result.data.data;
}

/** Replace all data with a validated backup payload (all-or-nothing). */
export async function applyBackup(data: BackupData): Promise<void> {
  await db.transaction('rw', db.tasks, db.categories, db.settings, async () => {
    await db.tasks.clear();
    await db.categories.clear();
    await db.settings.clear();
    await db.tasks.bulkPut(data.tasks);
    await db.categories.bulkPut(data.categories);
    await db.settings.put(data.settings);
  });
  // Keep the pre-paint flash guard in sync with the restored appearance prefs.
  mirrorPrefsToStorage(data.settings);
}

/** Export a full JSON backup as a download and stamp `lastBackupDate`. */
export async function exportJson(): Promise<void> {
  const env = await buildBackup();
  downloadBlob(
    new Blob([serializeBackup(env)], { type: 'application/json' }),
    backupFilename('json'),
  );
  await updateSettings({ lastBackupDate: new Date() });
}

/** Restore from a JSON backup string (full replace). */
export async function importJson(text: string): Promise<void> {
  await applyBackup(parseBackup(text));
}

// --- Clear all data -----------------------------------------------------------

/**
 * Wipe every table, then re-seed so the app boots into a valid state (10 default
 * categories + the settings singleton) rather than a broken no-categories state.
 * Seeding runs after the clear transaction to avoid nesting transactions.
 */
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.tasks, db.categories, db.settings, async () => {
    await db.tasks.clear();
    await db.categories.clear();
    await db.settings.clear();
  });
  await seedDatabase();
  mirrorPrefsToStorage(DEFAULT_SETTINGS);
}

// --- Backup reminder + quota --------------------------------------------------

/** True when a backup has never been taken or is at least two weeks old. */
export function isBackupDue(lastBackupDate: Date | null, now: Date = new Date()): boolean {
  return lastBackupDate === null || now.getTime() - lastBackupDate.getTime() >= BACKUP_INTERVAL_MS;
}

/** Recognize IndexedDB storage-quota failures (DOMException or Dexie wrap). */
export function isQuotaError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'QuotaExceededError' ||
      /quota/i.test(error.name) ||
      /quota/i.test(error.message))
  );
}
