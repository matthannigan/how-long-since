import type { Task } from '@/types';

import { db, DEFAULT_CATEGORIES } from './schema';

const DAY_MS = 864e5;

/** Resolve a default category's id by name (samples target real seeded rows). */
function categoryId(name: string): string {
  const category = DEFAULT_CATEGORIES.find((c) => c.name === name);
  if (!category) throw new Error(`Unknown default category: ${name}`);
  return category.id;
}

/**
 * Seed a handful of sample tasks spanning every status tier so the views aren't
 * empty before the Add-Task form (Step 7) exists.
 *
 * DEV-only and idempotent: it no-ops in production and whenever the tasks table
 * already has rows (create-if-absent, mirroring `seedDatabase`), so it never
 * clobbers real data or resurrects a task the user deleted. Fixed ids keep it
 * from duplicating across reloads. Frequencies are weekly, so a completion N
 * days ago yields: <5.6d none · 5.6–7d due-soon · 7–10.5d overdue · ≥10.5d very
 * overdue (see `calculateOverdueStatus`).
 */
export async function seedSampleTasks(): Promise<void> {
  if (!import.meta.env.DEV) return;
  if ((await db.tasks.count()) > 0) return;

  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * DAY_MS);
  const createdAt = daysAgo(60);
  const weekly = { value: 1, unit: 'week' } as const;

  const samples: Task[] = [
    {
      id: 'a1e1b2c3-0001-4a00-8000-000000000001',
      name: 'Descale coffee maker',
      description: '',
      categoryId: categoryId('Kitchen'),
      createdAt,
      lastCompletedAt: daysAgo(6), // due-soon
      expectedFrequency: weekly,
      timeCommitment: '15min',
      isArchived: false,
      notes: '',
    },
    {
      id: 'a1e1b2c3-0002-4a00-8000-000000000002',
      name: 'Clean oven',
      description: '',
      categoryId: categoryId('Kitchen'),
      createdAt,
      lastCompletedAt: daysAgo(3), // none (no frequency set)
      timeCommitment: '1hr',
      isArchived: false,
      notes: '',
    },
    {
      id: 'a1e1b2c3-0003-4a00-8000-000000000003',
      name: 'Deep clean refrigerator',
      description: '',
      categoryId: categoryId('Kitchen'),
      createdAt,
      lastCompletedAt: daysAgo(9), // overdue
      expectedFrequency: weekly,
      timeCommitment: '30min',
      isArchived: false,
      notes: '',
    },
    {
      id: 'a1e1b2c3-0004-4a00-8000-000000000004',
      name: 'Clean shower grout',
      description: '',
      categoryId: categoryId('Bathroom'),
      createdAt,
      lastCompletedAt: daysAgo(40), // very-overdue
      expectedFrequency: weekly,
      timeCommitment: '1hr',
      isArchived: false,
      notes: '',
    },
    {
      id: 'a1e1b2c3-0005-4a00-8000-000000000005',
      name: 'Restock toiletries',
      description: '',
      categoryId: categoryId('Bathroom'),
      createdAt,
      lastCompletedAt: daysAgo(1), // none — "Yest."
      expectedFrequency: weekly,
      timeCommitment: '15min',
      isArchived: false,
      notes: '',
    },
    {
      id: 'a1e1b2c3-0006-4a00-8000-000000000006',
      name: 'Vacuum living room',
      description: '',
      categoryId: categoryId('Living Areas'),
      createdAt,
      lastCompletedAt: daysAgo(2), // none — "2 d"
      expectedFrequency: weekly,
      timeCommitment: '30min',
      isArchived: false,
      notes: '',
    },
    {
      id: 'a1e1b2c3-0007-4a00-8000-000000000007',
      name: 'Water the plants',
      description: '',
      categoryId: categoryId('Living Areas'),
      createdAt,
      lastCompletedAt: null, // never completed — "New"
      expectedFrequency: weekly,
      timeCommitment: '15min',
      isArchived: false,
      notes: '',
    },
  ];

  await db.tasks.bulkAdd(samples);
}
