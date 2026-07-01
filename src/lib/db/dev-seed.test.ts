import { beforeEach, describe, expect, it } from 'vitest';

import { seedSampleTasks } from './dev-seed';
import { db } from './schema';

describe('seedSampleTasks', () => {
  beforeEach(async () => {
    await db.tasks.clear();
  });

  it('seeds sample tasks into an empty table', async () => {
    await seedSampleTasks();
    expect(await db.tasks.count()).toBe(10);
  });

  it('is idempotent — a second call adds nothing', async () => {
    await seedSampleTasks();
    await seedSampleTasks();
    expect(await db.tasks.count()).toBe(10);
  });

  it('no-ops when the table already has tasks', async () => {
    await db.tasks.add({
      id: '99999999-9999-4999-8999-999999999999',
      name: 'Existing task',
      description: '',
      categoryId: '4a2c1e91-df59-40c8-af6c-ae499c468cdf',
      createdAt: new Date(),
      lastCompletedAt: null,
      isArchived: false,
      notes: '',
    });
    await seedSampleTasks();
    expect(await db.tasks.count()).toBe(1);
  });
});
