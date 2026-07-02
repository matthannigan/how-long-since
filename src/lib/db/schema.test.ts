import { beforeEach, describe, expect, it } from 'vitest';

import { db, DEFAULT_CATEGORIES, seedDatabase } from '@/lib/db/schema';
import { taskSchema } from '@/schemas/task';
import type { Task } from '@/types';

beforeEach(async () => {
  // The `db` module singleton persists across cases under fake-indexeddb, so
  // clear every store before each test for deterministic isolation.
  await Promise.all([db.tasks.clear(), db.categories.clear(), db.settings.clear()]);
});

describe('HowLongSinceDB', () => {
  it('opens with the v1 stores', async () => {
    await db.open();
    expect(db.tables.map((t) => t.name).sort()).toEqual(['categories', 'settings', 'tasks']);
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
