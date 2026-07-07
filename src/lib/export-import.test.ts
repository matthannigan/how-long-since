import { beforeEach, describe, expect, it } from 'vitest';

import type { Category, Task } from '@/types';

import { db, DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from './db/schema';
import {
  buildBackup,
  clearAllData,
  importJson,
  isBackupDue,
  isQuotaError,
  normalizeTimeCommitment,
  parseBackup,
  serializeBackup,
} from './export-import';

const DAY = 24 * 60 * 60 * 1000;

const sampleCategory: Category = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Kitchen',
  color: '#3B82F6',
  icon: 'utensils',
  isDefault: false,
};

const sampleTask: Task = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Clean oven',
  description: 'A deep clean',
  categoryId: sampleCategory.id,
  createdAt: new Date('2026-06-01T10:00:00.000Z'),
  lastCompletedAt: new Date('2026-06-15T14:30:00.000Z'),
  expectedFrequency: { value: 3, unit: 'month' },
  timeCommitment: '1hr',
  isArchived: false,
  notes: 'note',
};

async function clearAll(): Promise<void> {
  await Promise.all([
    db.tasks.clear(),
    db.categories.clear(),
    db.settings.clear(),
    db.completions.clear(),
  ]);
}

describe('lib/export-import', () => {
  beforeEach(async () => {
    await clearAll();
    localStorage.clear();
  });

  describe('JSON round-trip', () => {
    it('restores tasks, categories, settings, and completions losslessly with real Dates', async () => {
      await db.categories.add(sampleCategory);
      await db.tasks.add(sampleTask);
      await db.settings.add({ ...DEFAULT_SETTINGS, currentView: 'quick', theme: 'dark' });
      await db.completions.add({
        id: '88888888-8888-4888-8888-888888888888',
        taskId: sampleTask.id,
        completedAt: sampleTask.lastCompletedAt!,
      });

      const json = serializeBackup(await buildBackup());
      expect(JSON.parse(json).schemaVersion).toBe(3);
      await clearAll();
      await importJson(json);

      const tasks = await db.tasks.toArray();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].createdAt).toBeInstanceOf(Date);
      expect(tasks[0].createdAt.getTime()).toBe(sampleTask.createdAt.getTime());
      expect(tasks[0].lastCompletedAt).toBeInstanceOf(Date);
      expect(tasks[0].lastCompletedAt?.getTime()).toBe(sampleTask.lastCompletedAt?.getTime());
      expect(tasks[0].expectedFrequency).toEqual({ value: 3, unit: 'month' });

      expect(await db.categories.toArray()).toHaveLength(1);

      const settings = await db.settings.get('1');
      expect(settings?.currentView).toBe('quick');
      expect(settings?.theme).toBe('dark');

      const completions = await db.completions.toArray();
      expect(completions).toHaveLength(1);
      expect(completions[0].taskId).toBe(sampleTask.id);
      expect(completions[0].completedAt).toBeInstanceOf(Date);
      expect(completions[0].completedAt.getTime()).toBe(sampleTask.lastCompletedAt!.getTime());
    });

    it('round-trips every currentView value, including the widened "quick"', async () => {
      for (const view of ['quick', 'category', 'time'] as const) {
        await db.settings.clear();
        await db.settings.add({ ...DEFAULT_SETTINGS, currentView: view });

        const json = serializeBackup(await buildBackup());
        await clearAll();
        await importJson(json);

        expect((await db.settings.get('1'))?.currentView).toBe(view);
      }
    });
  });

  describe('instances & series (Phase 1.1)', () => {
    it('round-trips instanceLabel and seriesId', async () => {
      const seriesId = '55555555-5555-4555-8555-555555555555';
      await db.categories.add(sampleCategory);
      await db.tasks.bulkAdd([
        {
          ...sampleTask,
          id: '66666666-6666-4666-8666-666666666666',
          instanceLabel: 'Main bedroom',
          seriesId,
        },
        {
          ...sampleTask,
          id: '77777777-7777-4777-8777-777777777777',
          instanceLabel: 'Guest room',
          seriesId,
        },
      ]);
      await db.settings.add(DEFAULT_SETTINGS);

      const json = serializeBackup(await buildBackup());
      await clearAll();
      await importJson(json);

      const tasks = await db.tasks.toArray();
      expect(new Set(tasks.map((t) => t.seriesId))).toEqual(new Set([seriesId]));
      expect(tasks.map((t) => t.instanceLabel).sort()).toEqual(['Guest room', 'Main bedroom']);
    });

    it('imports a pre-1.1 backup (no instanceLabel/seriesId anywhere) cleanly', async () => {
      // Literal fixture matching the Phase 1 export shape — do not "modernize".
      const pre11 = JSON.stringify({
        app: 'how-long-since',
        schemaVersion: 2,
        exportedAt: '2026-07-02T00:00:00.000Z',
        data: {
          tasks: [
            {
              id: '22222222-2222-4222-8222-222222222222',
              name: 'Clean oven',
              description: 'A deep clean',
              categoryId: sampleCategory.id,
              createdAt: '2026-06-01T10:00:00.000Z',
              lastCompletedAt: '2026-06-15T14:30:00.000Z',
              expectedFrequency: { value: 3, unit: 'month' },
              timeCommitment: '1hr',
              isArchived: false,
              notes: 'note',
            },
          ],
          categories: [sampleCategory],
          settings: { ...DEFAULT_SETTINGS, lastBackupDate: null },
        },
      });

      await importJson(pre11);

      const tasks = await db.tasks.toArray();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].instanceLabel).toBeUndefined();
      expect(tasks[0].seriesId).toBeUndefined();

      // No completions key in a pre-v3 backup → one bootstrap row synthesized.
      const completions = await db.completions.toArray();
      expect(completions).toHaveLength(1);
      expect(completions[0].taskId).toBe(tasks[0].id);
      expect(completions[0].completedAt.getTime()).toBe(tasks[0].lastCompletedAt!.getTime());
    });
  });

  describe('v1 → v2 import', () => {
    it('normalizes retired timeCommitment values on import', async () => {
      const envelope = {
        app: 'how-long-since',
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        data: {
          tasks: [
            {
              ...sampleTask,
              id: '33333333-3333-4333-8333-333333333333',
              timeCommitment: '5hrs+',
              createdAt: sampleTask.createdAt.toISOString(),
              lastCompletedAt: null,
            },
            {
              ...sampleTask,
              id: '44444444-4444-4444-8444-444444444444',
              timeCommitment: '4hrs',
              createdAt: sampleTask.createdAt.toISOString(),
              lastCompletedAt: null,
            },
          ],
          categories: [sampleCategory],
          settings: { ...DEFAULT_SETTINGS, lastBackupDate: null },
        },
      };

      await importJson(JSON.stringify(envelope));

      const tasks = await db.tasks.toArray();
      expect(tasks.map((t) => t.timeCommitment)).toEqual(['4hrs+', '4hrs+']);
      // Both fixture tasks are never-completed → nothing to synthesize.
      expect(await db.completions.count()).toBe(0);
    });
  });

  describe('completions import rules', () => {
    it('trusts an explicit empty completions array (no synthesis for v3+ backups)', async () => {
      const envelope = {
        app: 'how-long-since',
        schemaVersion: 3,
        exportedAt: new Date().toISOString(),
        data: {
          tasks: [
            {
              ...sampleTask,
              createdAt: sampleTask.createdAt.toISOString(),
              lastCompletedAt: sampleTask.lastCompletedAt!.toISOString(),
            },
          ],
          categories: [sampleCategory],
          settings: { ...DEFAULT_SETTINGS, lastBackupDate: null },
          completions: [],
        },
      };

      await importJson(JSON.stringify(envelope));

      expect(await db.tasks.count()).toBe(1);
      expect(await db.completions.count()).toBe(0);
    });
  });

  describe('parseBackup', () => {
    it('throws on non-JSON input', () => {
      expect(() => parseBackup('not json at all')).toThrow();
    });

    it('throws on a structurally invalid backup', () => {
      expect(() => parseBackup(JSON.stringify({ foo: 'bar' }))).toThrow();
    });
  });

  describe('clearAllData', () => {
    it('wipes user data and re-seeds defaults', async () => {
      await db.categories.add(sampleCategory);
      await db.tasks.add(sampleTask);
      await db.settings.add({ ...DEFAULT_SETTINGS, theme: 'dark' });
      await db.completions.add({
        id: '99999999-9999-4999-8999-999999999999',
        taskId: sampleTask.id,
        completedAt: new Date(),
      });

      await clearAllData();

      expect(await db.tasks.count()).toBe(0);
      expect(await db.completions.count()).toBe(0);
      expect(await db.categories.count()).toBe(DEFAULT_CATEGORIES.length);
      const settings = await db.settings.get('1');
      expect(settings).toBeDefined();
      expect(settings?.theme).toBe('system');
    });
  });

  describe('isBackupDue', () => {
    const now = new Date('2026-07-01T00:00:00.000Z');

    it('is due when never backed up', () => {
      expect(isBackupDue(null, now)).toBe(true);
    });

    it('is not due before two weeks', () => {
      expect(isBackupDue(new Date(now.getTime() - 13 * DAY), now)).toBe(false);
    });

    it('is due at and beyond the two-week threshold', () => {
      expect(isBackupDue(new Date(now.getTime() - 14 * DAY), now)).toBe(true);
      expect(isBackupDue(new Date(now.getTime() - 15 * DAY), now)).toBe(true);
    });
  });

  describe('isQuotaError', () => {
    it('recognizes quota failures by name or message', () => {
      const named = new Error('boom');
      named.name = 'QuotaExceededError';
      expect(isQuotaError(named)).toBe(true);
      expect(isQuotaError(new Error('The storage quota has been exceeded'))).toBe(true);
    });

    it('ignores unrelated errors and non-errors', () => {
      expect(isQuotaError(new Error('something else'))).toBe(false);
      expect(isQuotaError('nope')).toBe(false);
    });
  });

  describe('normalizeTimeCommitment', () => {
    it('maps retired values and passes others through', () => {
      expect(normalizeTimeCommitment('5hrs+')).toBe('4hrs+');
      expect(normalizeTimeCommitment('4hrs')).toBe('4hrs+');
      expect(normalizeTimeCommitment('1hr')).toBe('1hr');
      expect(normalizeTimeCommitment(undefined)).toBeUndefined();
    });
  });
});
