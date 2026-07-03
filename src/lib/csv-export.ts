import Papa from 'papaparse';

import type { Category, Task } from '@/types';

import { db } from './db/schema';
import { backupFilename, downloadBlob } from './download';

/**
 * CSV export (tasks only, export-only). Kept out of `export-import.ts` so the
 * PapaParse dependency loads only with the code-split Settings page — the
 * backup-reminder banner on the root route never pulls it in. JSON is the
 * import path; CSV is a human-readable interchange/inspection format.
 */

const CSV_COLUMNS = [
  'id',
  'name',
  'description',
  'categoryId',
  'categoryName',
  'createdAt',
  'lastCompletedAt',
  'frequencyValue',
  'frequencyUnit',
  'timeCommitment',
  'isArchived',
  'notes',
  // Phase 1.1 columns appended last so positional consumers of older exports
  // keep working.
  'instanceLabel',
  'seriesId',
] as const;

type CsvColumn = (typeof CSV_COLUMNS)[number];

/**
 * Render tasks to CSV. Dates are full ISO-8601 UTC instants (lossless, no
 * off-by-a-day); `expectedFrequency` is flattened to two columns; the category
 * is emitted as both a readable `categoryName` and its `categoryId`.
 */
export function tasksToCsv(tasks: Task[], categories: Category[]): string {
  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  const rows: Record<CsvColumn, string>[] = tasks.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    categoryId: t.categoryId,
    categoryName: nameById.get(t.categoryId) ?? '',
    createdAt: t.createdAt.toISOString(),
    lastCompletedAt: t.lastCompletedAt ? t.lastCompletedAt.toISOString() : '',
    frequencyValue: t.expectedFrequency ? String(t.expectedFrequency.value) : '',
    frequencyUnit: t.expectedFrequency ? t.expectedFrequency.unit : '',
    timeCommitment: t.timeCommitment ?? '',
    isArchived: t.isArchived ? 'true' : 'false',
    notes: t.notes,
    instanceLabel: t.instanceLabel ?? '',
    seriesId: t.seriesId ?? '',
  }));
  return Papa.unparse({
    fields: [...CSV_COLUMNS],
    data: rows.map((r) => CSV_COLUMNS.map((c) => r[c])),
  });
}

/** Export tasks to a CSV download. Does not touch `lastBackupDate`. */
export async function exportCsv(): Promise<void> {
  const [tasks, categories] = await Promise.all([db.tasks.toArray(), db.categories.toArray()]);
  downloadBlob(
    new Blob([tasksToCsv(tasks, categories)], { type: 'text/csv;charset=utf-8' }),
    backupFilename('csv', 'tasks'),
  );
}
