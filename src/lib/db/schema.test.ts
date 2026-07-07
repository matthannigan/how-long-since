import Dexie from 'dexie';
import { beforeEach, describe, expect, it } from 'vitest';

import { db, DEFAULT_CATEGORIES, HowLongSinceDB, seedDatabase } from '@/lib/db/schema';
import { taskSchema } from '@/schemas/task';
import type { Task } from '@/types';

beforeEach(async () => {
  // The `db` module singleton persists across cases under fake-indexeddb, so
  // clear every store before each test for deterministic isolation.
  await Promise.all([
    db.tasks.clear(),
    db.categories.clear(),
    db.settings.clear(),
    db.completions.clear(),
  ]);
});

describe('HowLongSinceDB', () => {
  it('opens with the current stores', async () => {
    await db.open();
    expect(db.tables.map((t) => t.name).sort()).toEqual([
      'categories',
      'completions',
      'settings',
      'tasks',
    ]);
  });

  it('stores and reads Date fields as native Date objects (no ISO strings)', async () => {
    const now = new Date();
    const task: Task = {
      id: crypto.randomUUID(),
      name: 'Water the plants',
      description: '',
      categoryId: DEFAULT_CATEGORIES[0].id,
      createdAt: now,
      lastCompletedAt: now,
      isArchived: false,
      notes: '',
    };

    await db.tasks.add(task);
    const read = await db.tasks.get(task.id);

    expect(read?.createdAt).toBeInstanceOf(Date);
    expect(read?.lastCompletedAt).toBeInstanceOf(Date);
    expect(read?.createdAt.getTime()).toBe(now.getTime());
  });
});

describe('v2 → v3 upgrade (completions log backfill)', () => {
  it('synthesizes one completion per already-completed task, none for never-completed', async () => {
    const name = `HLSUpgradeTest-${crypto.randomUUID()}`;

    // Recreate the pre-v3 database shape under a scratch name...
    const legacy = new Dexie(name);
    legacy.version(2).stores({
      tasks: 'id, categoryId, lastCompletedAt, isArchived',
      categories: 'id, isDefault',
      settings: 'id',
    });
    const doneAt = new Date('2026-06-15T14:30:00.000Z');
    const done = {
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Clean oven',
      description: '',
      categoryId: DEFAULT_CATEGORIES[0].id,
      createdAt: new Date('2026-06-01T10:00:00.000Z'),
      lastCompletedAt: doneAt,
      isArchived: false,
      notes: '',
    };
    const never = { ...done, id: '33333333-3333-4333-8333-333333333333', lastCompletedAt: null };
    await legacy.table('tasks').bulkAdd([done, never]);
    legacy.close();

    // ...then reopen it through the real class so the real 2→3 upgrade runs.
    const upgraded = new HowLongSinceDB(name);
    try {
      const completions = await upgraded.completions.toArray();
      expect(completions).toHaveLength(1);
      expect(completions[0].taskId).toBe(done.id);
      expect(completions[0].completedAt.getTime()).toBe(doneAt.getTime());
    } finally {
      upgraded.close();
      await Dexie.delete(name);
    }
  });
});

describe('seedDatabase', () => {
  it('creates exactly 10 categories and 1 settings singleton', async () => {
    await seedDatabase();

    expect(await db.categories.count()).toBe(10);
    expect(await db.settings.count()).toBe(1);

    const settings = await db.settings.get('1');
    expect(settings).toBeDefined();
    expect(settings?.currentView).toBe('quick');
    expect(settings?.theme).toBe('system');
    expect(settings?.lastBackupDate).toBeNull();
  });

  it('is idempotent — calling twice does not duplicate rows', async () => {
    await seedDatabase();
    await seedDatabase();

    expect(await db.categories.count()).toBe(10);
    expect(await db.settings.count()).toBe(1);
  });

  it('does not overwrite user-modified settings on reseed', async () => {
    await seedDatabase();
    await db.settings.update('1', { theme: 'dark' });

    await seedDatabase();

    const settings = await db.settings.get('1');
    expect(settings?.theme).toBe('dark');
  });

  it('does not re-add default categories once any category exists', async () => {
    await seedDatabase();
    await db.categories.delete(DEFAULT_CATEGORIES[0].id);

    await seedDatabase();

    expect(await db.categories.count()).toBe(9);
  });
});

describe('taskSchema validation', () => {
  const validTask = {
    id: crypto.randomUUID(),
    name: 'Clean the sink',
    description: '',
    categoryId: crypto.randomUUID(),
    createdAt: new Date(),
    lastCompletedAt: null,
    isArchived: false,
    notes: '',
  };

  it('accepts a valid task', () => {
    expect(taskSchema.safeParse(validTask).success).toBe(true);
  });

  it('rejects an empty name', () => {
    expect(taskSchema.safeParse({ ...validTask, name: '' }).success).toBe(false);
  });

  it('rejects a name longer than 128 characters', () => {
    expect(taskSchema.safeParse({ ...validTask, name: 'a'.repeat(129) }).success).toBe(false);
  });
});
