import Dexie, { type EntityTable } from 'dexie';

import type { AppSettings, Category, Task } from '@/types';

export class HowLongSinceDB extends Dexie {
  tasks!: EntityTable<Task, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super('HowLongSinceDB');

    this.version(1).stores({
      tasks: 'id, categoryId, lastCompletedAt, isArchived',
      categories: 'id, isDefault',
      settings: 'id',
    });

    // v2: the `timeCommitment` enum dropped `5hrs+` and renamed `4hrs` → `4hrs+`
    // (one open-ended "Big projects" bucket). Indexes are unchanged; the upgrade
    // just rewrites any orphaned value on existing rows. `tx.table('tasks')` is
    // untyped so the retired literals don't fight the narrowed TimeCommitment.
    this.version(2)
      .stores({
        tasks: 'id, categoryId, lastCompletedAt, isArchived',
        categories: 'id, isDefault',
        settings: 'id',
      })
      .upgrade((tx) =>
        tx
          .table('tasks')
          .toCollection()
          .modify((task) => {
            if (task.timeCommitment === '5hrs+' || task.timeCommitment === '4hrs') {
              task.timeCommitment = '4hrs+';
            }
          }),
      );

    // --- Phase 3, not enabled in v1 — see docs/ARCHITECTURE.md "Turning on sync" ---
    // super('HowLongSinceDB', { addons: [dexieCloud] });
    // this.cloud.configure({ databaseUrl: 'https://xxxxx.dexie.cloud' });
  }
}

export const db = new HowLongSinceDB();

/**
 * The 10 built-in categories seeded on first run. Colors come from
 * STYLE_GUIDE.md §1.4; icons are Lucide names. IDs are fixed UUIDs so that
 * re-seeding and task reassignment stay deterministic across sessions.
 */
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: '4a2c1e91-df59-40c8-af6c-ae499c468cdf',
    name: 'Kitchen',
    color: '#3B82F6',
    icon: 'utensils',
    isDefault: true,
  },
  {
    id: '40083e10-3b59-4743-91ea-034333432a60',
    name: 'Bathroom',
    color: '#8B5CF6',
    icon: 'shower-head',
    isDefault: true,
  },
  {
    id: 'cc0377a5-065a-44a5-b68f-6e63dabf116a',
    name: 'Bedroom',
    color: '#EC4899',
    icon: 'bed',
    isDefault: true,
  },
  {
    id: '2f70cef1-7070-4083-abc3-0244e46d045b',
    name: 'Living Areas',
    color: '#10B981',
    icon: 'sofa',
    isDefault: true,
  },
  {
    id: '9c9a1355-f236-4e08-899e-aafc9a45e1a8',
    name: 'Exterior',
    color: '#F59E0B',
    icon: 'house',
    isDefault: true,
  },
  {
    id: '1fa47498-a3e0-4641-9537-d4b466212b41',
    name: 'Vehicles',
    color: '#EF4444',
    icon: 'car',
    isDefault: true,
  },
  {
    id: 'a38ff5ad-bf4f-4071-8938-6121a0b16981',
    name: 'Digital/Tech',
    color: '#6366F1',
    icon: 'monitor',
    isDefault: true,
  },
  {
    id: '1e16a7f7-3567-4ea1-b61a-42f5c12ce64c',
    name: 'Health',
    color: '#14B8A6',
    icon: 'heart-pulse',
    isDefault: true,
  },
  {
    id: 'c12fa9a5-e338-45d8-87a8-7ac3fd04d58c',
    name: 'Pets',
    color: '#F97316',
    icon: 'paw-print',
    isDefault: true,
  },
  {
    id: 'b1f8dd4c-1927-4f74-89dd-7a3600b14ca1',
    name: 'Garden/Plants',
    color: '#84CC16',
    icon: 'leaf',
    isDefault: true,
  },
];

/** Default values for the singleton `AppSettings` row (`id: '1'`). */
export const DEFAULT_SETTINGS: AppSettings = {
  id: '1',
  lastBackupDate: null,
  currentView: 'quick',
  theme: 'system',
  textSize: 'default',
  highContrast: false,
  reducedMotion: false,
};

/**
 * Idempotent, create-if-absent seed. Safe to call on every boot: it adds the
 * default categories only when the table is empty and the settings singleton
 * only when it does not yet exist, so user-modified categories and preferences
 * are never clobbered on reload. Step 4 calls this once at bootstrap.
 */
export async function seedDatabase(): Promise<void> {
  await db.transaction('rw', db.categories, db.settings, async () => {
    if ((await db.categories.count()) === 0) {
      await db.categories.bulkAdd(DEFAULT_CATEGORIES);
    }
    if (!(await db.settings.get('1'))) {
      await db.settings.add(DEFAULT_SETTINGS);
    }
  });
}
