/**
 * Deterministic seed data for the user-guide screenshot capture.
 *
 * `buildGuideBackup(now)` returns the real JSON backup envelope
 * (`{ app, schemaVersion, exportedAt, data: { tasks, categories, settings } }`,
 * see src/lib/export-import.ts), with ISO date strings that the importer's Zod
 * `z.coerce.date()` revives. The capture spec feeds this through the app's own
 * Import flow, so the fixture goes through the exact production validation —
 * a future schema change fails the capture loudly at seed time (desired).
 *
 * We deliberately do NOT import src/lib/db/dev-seed.ts: its sample array is a
 * module-local const and importing it instantiates Dexie. The 10 categories
 * below are the fixed-UUID DEFAULT_CATEGORIES literals from db/schema.ts.
 *
 * The task set is tuned for the guide's shots: a By Time estimate spread
 * (3×15min · 3×30min · 2×1hr · 1×2hrs · 1×4hrs+ · 1 no-estimate) plus a
 * 3-place "Vacuum bedroom" series, and a status spread (2 due-soon, 2 overdue,
 * 1 very-overdue, 1 never-completed) so every overdue tier is visible. Weekly
 * frequency → offsets: ~6d due-soon, 8–9d overdue, ≥12d very-overdue.
 */

const DAY_MS = 864e5;

interface FixtureTask {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  createdAt: string;
  lastCompletedAt: string | null;
  expectedFrequency?: { value: number; unit: 'day' | 'week' | 'month' | 'year' };
  timeCommitment?: '15min' | '30min' | '1hr' | '2hrs' | '4hrs+';
  isArchived: boolean;
  notes: string;
  instanceLabel?: string;
  seriesId?: string;
}

interface GuideBackup {
  app: 'how-long-since';
  schemaVersion: 2;
  exportedAt: string;
  data: {
    tasks: FixtureTask[];
    categories: Array<{
      id: string;
      name: string;
      color: string;
      icon: string;
      isDefault: boolean;
    }>;
    settings: {
      id: '1';
      lastBackupDate: string | null;
      currentView: 'quick' | 'category' | 'time';
      theme: 'light' | 'dark' | 'system';
      textSize: 'default' | 'large' | 'larger';
      highContrast: boolean;
      reducedMotion: boolean;
    };
  };
}

// Fixed-UUID default categories (db/schema.ts DEFAULT_CATEGORIES) — the same ids
// a fresh install seeds, so tasks reference real category rows.
const CATEGORIES: GuideBackup['data']['categories'] = [
  { id: '4a2c1e91-df59-40c8-af6c-ae499c468cdf', name: 'Kitchen', color: '#3B82F6', icon: 'utensils', isDefault: true },
  { id: '40083e10-3b59-4743-91ea-034333432a60', name: 'Bathroom', color: '#8B5CF6', icon: 'shower-head', isDefault: true },
  { id: 'cc0377a5-065a-44a5-b68f-6e63dabf116a', name: 'Bedroom', color: '#EC4899', icon: 'bed', isDefault: true },
  { id: '2f70cef1-7070-4083-abc3-0244e46d045b', name: 'Living Areas', color: '#10B981', icon: 'sofa', isDefault: true },
  { id: '9c9a1355-f236-4e08-899e-aafc9a45e1a8', name: 'Exterior', color: '#F59E0B', icon: 'house', isDefault: true },
  { id: '1fa47498-a3e0-4641-9537-d4b466212b41', name: 'Vehicles', color: '#EF4444', icon: 'car', isDefault: true },
  { id: 'a38ff5ad-bf4f-4071-8938-6121a0b16981', name: 'Digital/Tech', color: '#6366F1', icon: 'monitor', isDefault: true },
  { id: '1e16a7f7-3567-4ea1-b61a-42f5c12ce64c', name: 'Health', color: '#14B8A6', icon: 'heart-pulse', isDefault: true },
  { id: 'c12fa9a5-e338-45d8-87a8-7ac3fd04d58c', name: 'Pets', color: '#F97316', icon: 'paw-print', isDefault: true },
  { id: 'b1f8dd4c-1927-4f74-89dd-7a3600b14ca1', name: 'Garden/Plants', color: '#84CC16', icon: 'leaf', isDefault: true },
];

const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.name, c.id])) as Record<string, string>;

const SERIES_ID = 'd0000000-0000-4000-8000-000000000001';

/** Build the guide's seed backup, with all dates computed relative to `now`. */
export function buildGuideBackup(now: Date): GuideBackup {
  const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * DAY_MS).toISOString();
  const createdAt = iso(60);
  const weekly = { value: 1, unit: 'week' } as const;
  const monthly = { value: 1, unit: 'month' } as const;

  const tasks: FixtureTask[] = [
    // --- Quick (15 min) -----------------------------------------------------
    {
      id: 'c0000000-0000-4000-8000-000000000001',
      name: 'Descale coffee maker',
      description: '',
      categoryId: CAT.Kitchen,
      createdAt,
      lastCompletedAt: iso(6), // due-soon
      expectedFrequency: weekly,
      timeCommitment: '15min',
      isArchived: false,
      notes: '',
    },
    {
      id: 'c0000000-0000-4000-8000-000000000002',
      name: 'Wipe kitchen counters',
      description: '',
      categoryId: CAT.Kitchen,
      createdAt,
      lastCompletedAt: iso(8), // overdue
      expectedFrequency: weekly,
      timeCommitment: '15min',
      isArchived: false,
      notes: '',
    },
    {
      id: 'c0000000-0000-4000-8000-000000000003',
      name: 'Water the plants',
      description: '',
      categoryId: CAT['Living Areas'],
      createdAt,
      lastCompletedAt: null, // never completed — "New"
      expectedFrequency: weekly,
      timeCommitment: '15min',
      isArchived: false,
      notes: '',
    },
    // --- Short (30 min) -----------------------------------------------------
    {
      id: 'c0000000-0000-4000-8000-000000000004',
      name: 'Deep clean refrigerator',
      description: '',
      categoryId: CAT.Kitchen,
      createdAt,
      lastCompletedAt: iso(12), // very-overdue
      expectedFrequency: weekly,
      timeCommitment: '30min',
      isArchived: false,
      notes: '',
    },
    {
      id: 'c0000000-0000-4000-8000-000000000005',
      name: 'Change bed sheets',
      description: '',
      categoryId: CAT.Bedroom,
      createdAt,
      lastCompletedAt: iso(6), // due-soon
      expectedFrequency: weekly,
      timeCommitment: '30min',
      isArchived: false,
      notes: '',
    },
    {
      id: 'c0000000-0000-4000-8000-000000000006',
      name: 'Vacuum living room',
      description: '',
      categoryId: CAT['Living Areas'],
      createdAt,
      lastCompletedAt: iso(2), // not due
      expectedFrequency: weekly,
      timeCommitment: '30min',
      isArchived: false,
      notes: '',
    },
    // --- Medium (1 hr) ------------------------------------------------------
    {
      id: 'c0000000-0000-4000-8000-000000000007',
      name: 'Clean oven',
      description: '',
      categoryId: CAT.Kitchen,
      createdAt,
      lastCompletedAt: iso(3), // no frequency → never overdue
      timeCommitment: '1hr',
      isArchived: false,
      notes: '',
    },
    {
      id: 'c0000000-0000-4000-8000-000000000008',
      name: 'Clean shower grout',
      description: '',
      categoryId: CAT.Bathroom,
      createdAt,
      lastCompletedAt: iso(8), // overdue
      expectedFrequency: weekly,
      timeCommitment: '1hr',
      isArchived: false,
      notes: '',
    },
    // --- Longer (2 hrs) -----------------------------------------------------
    {
      id: 'c0000000-0000-4000-8000-000000000009',
      name: 'Wash the car',
      description: '',
      categoryId: CAT.Vehicles,
      createdAt,
      lastCompletedAt: iso(4), // not due (monthly)
      expectedFrequency: monthly,
      timeCommitment: '2hrs',
      isArchived: false,
      notes: '',
    },
    // --- Big projects (4+ hrs) ---------------------------------------------
    {
      id: 'c0000000-0000-4000-8000-000000000010',
      name: 'Organize the garage',
      description: '',
      categoryId: CAT.Exterior,
      createdAt,
      lastCompletedAt: iso(20), // not due (monthly)
      expectedFrequency: monthly,
      timeCommitment: '4hrs+',
      isArchived: false,
      notes: '',
    },
    // --- No time set --------------------------------------------------------
    {
      id: 'c0000000-0000-4000-8000-000000000011',
      name: 'Back up photos',
      description: '',
      categoryId: CAT['Digital/Tech'],
      createdAt,
      lastCompletedAt: iso(2), // not due
      expectedFrequency: weekly,
      isArchived: false,
      notes: '',
    },
    // --- "Vacuum bedroom" series (Phase 1.1): one task per place, shared id.
    // Status spread across the siblings shows the group's "x of n overdue".
    {
      id: 'c0000000-0000-4000-8000-000000000012',
      name: 'Vacuum bedroom',
      description: '',
      categoryId: CAT.Bedroom,
      createdAt,
      lastCompletedAt: iso(2), // not due
      expectedFrequency: weekly,
      timeCommitment: '30min',
      isArchived: false,
      notes: '',
      instanceLabel: 'Main bedroom',
      seriesId: SERIES_ID,
    },
    {
      id: 'c0000000-0000-4000-8000-000000000013',
      name: 'Vacuum bedroom',
      description: '',
      categoryId: CAT.Bedroom,
      createdAt,
      lastCompletedAt: iso(8), // overdue
      expectedFrequency: weekly,
      timeCommitment: '30min',
      isArchived: false,
      notes: '',
      instanceLabel: 'Guest room',
      seriesId: SERIES_ID,
    },
    {
      id: 'c0000000-0000-4000-8000-000000000014',
      name: 'Vacuum bedroom',
      description: '',
      categoryId: CAT.Bedroom,
      createdAt,
      lastCompletedAt: iso(12), // very-overdue
      expectedFrequency: weekly,
      timeCommitment: '30min',
      isArchived: false,
      notes: '',
      instanceLabel: "Kids' room",
      seriesId: SERIES_ID,
    },
  ];

  return {
    app: 'how-long-since',
    schemaVersion: 2,
    exportedAt: now.toISOString(),
    data: {
      tasks,
      categories: CATEGORIES,
      // lastBackupDate a day ago keeps the backup-reminder banner out of every
      // shot; 'system' theme + light OS emulation (capture config) → light UI.
      settings: {
        id: '1',
        lastBackupDate: iso(1),
        currentView: 'quick',
        theme: 'system',
        textSize: 'default',
        highContrast: false,
        reducedMotion: false,
      },
    },
  };
}
