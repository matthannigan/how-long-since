import { beforeEach, describe, expect, it } from 'vitest';

import { seedSampleTasks } from './dev-seed';
import { db } from './schema';

describe('seedSampleTasks', () => {
  beforeEach(async () => {
    await Promise.all([db.tasks.clear(), db.completions.clear()]);
  });

  it('seeds sample tasks into an empty table, with bootstrap completion rows', async () => {
    await seedSampleTasks();
    expect(await db.tasks.count()).toBe(15);
    expect(await db.completions.count()).toBe(14); // 15 samples − 1 never-completed
  });

  it('is idempotent — a second call adds nothing', async () => {
    await seedSampleTasks();
    await seedSampleTasks();
    expect(await db.tasks.count()).toBe(15);
    expect(await db.completions.count()).toBe(14);
  });

  it('seeds a 3-task series sharing one seriesId, spanning status tiers', async () => {
    await seedSampleTasks();
    const siblings = (await db.tasks.toArray()).filter((t) => t.seriesId);

    expect(siblings).toHaveLength(3);
    expect(new Set(siblings.map((t) => t.seriesId)).size).toBe(1);
    expect(siblings.map((t) => t.instanceLabel).sort()).toEqual([
      'Guest room',
      "Kids' room",
      'Main bedroom',
    ]);
    expect(new Set(siblings.map((t) => t.timeCommitment))).toEqual(new Set(['30min']));
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
    expect(await db.completions.count()).toBe(0);
  });
});
