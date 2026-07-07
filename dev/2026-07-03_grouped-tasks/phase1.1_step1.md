# Phase 1.1 · Step 1 — Data layer: instance & series fields, fan-out write, pure series logic

> Read [`phase1.1.md`](phase1.1.md) first (decisions register), and
> [`phase1.md`](phase1.md) for shared conventions and the global DoD.

## Objective

Land all persistence, validation, export/import, and pure grouping logic for
instances & series, fully unit-tested, with **zero UI change** — the app looks
and behaves identically after this step. Everything later steps need
(`createTaskSeries`, `lib/series.ts`, the dev-seed sample series) exists and
is proven here.

## Prerequisites

- Phase 1 complete (merged `main`); branch `phase1.1-instances-series`.

## Context & references

- Decisions register: [`phase1.1.md`](phase1.1.md) — schema/no-index,
  backup-version, mutability, and grouping-rule decisions are **locked**.
- Current schema variants: `src/schemas/task.ts` (`taskSchema`,
  `createTaskSchema` omit-and-extend, `updateTaskSchema` pick-and-partial).
- Write boundary pattern: `src/lib/tasks.ts` (plain async fns, Zod at the
  boundary, `crypto.randomUUID()`, `markTaskComplete` transaction style).
- Pure-module style to mirror: `src/lib/time-sections.ts` (no Dexie import,
  takes arrays, exhaustive unit tests).
- Export/import: `src/lib/export-import.ts` (BackupEnvelope,
  `DB_SCHEMA_VERSION = 2`, `taskImportSchema` date coercion +
  `normalizeTimeCommitment`), `src/lib/csv-export.ts` (`CSV_COLUMNS`).
- Dev seed: `src/lib/db/dev-seed.ts` (DEV-only, create-if-absent).

## Scope / checklist

### `src/schemas/task.ts`

- [ ] `taskSchema` gains:
  ```ts
  instanceLabel: z.string().trim().min(1).max(40).optional(),
  seriesId: z.uuid().optional(),
  ```
- [ ] `createTaskSchema` inherits both automatically (they are **not** added
      to the `.omit()` list) — `createTask` accepting an explicit `seriesId`
      is what lets `createTaskSeries` reuse the schema.
- [ ] `updateTaskSchema`: add `instanceLabel: true` to the `.pick()`.
      Do **not** add `seriesId` (system-owned).

### `src/lib/tasks.ts`

- [ ] New `createTaskSeries(baseInput: unknown, labels: string[]): Promise<Task[]>`:
      parse `baseInput` once with `createTaskSchema`; trim labels, drop
      empties, dedupe case-insensitively; **throw** if none survive cleanup
      (callers use plain `createTask` for the zero-chip path); generate one
      shared `seriesId = crypto.randomUUID()`; build N tasks (each its own
      `id`/`createdAt`, `isArchived: false`, its `instanceLabel`, the shared
      `seriesId`); insert atomically via
      `db.transaction('rw', db.tasks, () => db.tasks.bulkAdd(tasks))`.
- [ ] **Label-clearing semantics (risk retirement):** prove by unit test that
      `updateTask(id, { instanceLabel: undefined })` removes the label — i.e.
      Zod v4 `.partial()` keeps an explicitly-`undefined` key and Dexie
      `update` deletes the property. If either assumption fails, add an
      explicit clear path in `lib/tasks.ts` **in this step**, before any UI
      depends on it, and record the outcome in the phase decisions register.

### `src/lib/series.ts` (NEW — pure, no Dexie import)

The **single grouping entry point** shared by By Time and By Category, so the
two views cannot drift:

- [ ] ```ts
      export interface SeriesGroup { seriesId: string; name: string; tasks: Task[] } // tasks label-sorted
      export type SeriesDisplayItem =
        | { kind: 'task'; task: Task }
        | { kind: 'series'; group: SeriesGroup };

      export function groupSeriesForDisplay(tasks: Task[]): SeriesDisplayItem[];
      export function worstStatus(tasks: Task[], now?: Date): OverdueStatus;
      export function seriesSummary(tasks: Task[], now?: Date): {
        worst: OverdueStatus; overdueCount: number; total: number };
      export function suggestLabels(tasks: Task[], categoryId: string, exclude: string[]): string[];
      ```
- [ ] `groupSeriesForDisplay`: preserves input order; a series' group row sits
      at its **first member's position**; series with **<2 members in the
      given list** emit plain `{kind:'task'}` items (the ≥2-in-same-bucket
      rule); tasks without `seriesId` always pass through ungrouped. Group
      `tasks` are sorted alphabetically by `instanceLabel` (locale compare,
      unlabeled last); `name` is the first member's `name`.
- [ ] `seriesSummary`: `overdueCount` counts status ∈ {`overdue`,
      `very-overdue`} only; `worst` via the shared rank (below).
- [ ] `suggestLabels`: distinct `instanceLabel`s of **non-archived** tasks
      with `categoryId`, minus `exclude` (case-insensitive), ordered
      most-frequent-then-alphabetical, capped at 8.

### `src/lib/overdue.ts` + `src/lib/time-sections.ts`

- [ ] Export `OVERDUE_STATUS_RANK: Record<OverdueStatus, number>` from
      `overdue.ts`; delete the private `STATUS_RANK` in `time-sections.ts`
      and import the shared one. Pure refactor — existing time-sections tests
      must pass unchanged.

### Export / import

- [ ] `src/lib/csv-export.ts`: append `instanceLabel`, `seriesId` to the
      **end** of `CSV_COLUMNS` (after `notes`), mapped as `?? ''` — appending
      keeps positional consumers of old exports working.
- [ ] `src/lib/export-import.ts`: no structural change — both fields ride
      through `taskSchema`/`taskImportSchema` as optionals. Verify the import
      schema doesn't strip unknown-to-it keys; add the fields explicitly if
      it does.

### Dev seed — `src/lib/db/dev-seed.ts`

- [ ] Add a 3-task **"Vacuum bedroom"** series in the Bedroom category: fixed
      UUIDs (continue the existing pattern), one shared fixed `seriesId`,
      labels **"Main bedroom" / "Guest room" / "Kids' room"**, statuses
      spanning tiers (one not-due, one overdue, one very overdue), all
      `timeCommitment: '30min'` so the Step 3 By Time collapse is visible in
      dev. Seed stays create-if-absent (note: clear IndexedDB to see it in an
      existing dev DB).

## Test plan

- **Schema:** both fields optional; label trimmed; empty-after-trim rejected;
  41 chars rejected; `updateTaskSchema` strips/rejects `seriesId` (assert
  absent from parsed output).
- **`createTaskSeries`:** N rows share one `seriesId`, distinct `id`s, labels
  applied; trims/dedupes/drops empties; throws on empty-after-cleanup;
  atomicity (inject a duplicate id → no partial insert).
- **Label clearing:** the risk-retirement test described above.
- **`series.ts`:** group-at-first-position ordering; n=1 passthrough;
  no-seriesId passthrough; two interleaved series; worst-of ranking;
  "2 of 5" counting excludes `due-soon`; `suggestLabels` case-insensitive
  dedupe/exclusion, frequency-then-alpha order, cap 8, archived excluded,
  other-category excluded.
- **Export/import:** JSON round-trip preserves both fields; **a literal
  pre-1.1 backup fixture** (captured from current `main`'s export shape)
  imports cleanly with fields `undefined`; CSV has the two new trailing
  columns and old columns in unchanged order.

## Try it (manual)

1. `pnpm dev`, clear IndexedDB (DevTools → Application), reload.
2. The app looks **identical** to before — the three seeded "Vacuum bedroom"
   tasks appear as three separate cards (no chips, no grouping yet).
3. Settings → Export JSON: the file contains `instanceLabel`/`seriesId` on
   those three tasks. Export CSV: two new trailing columns.
4. Import a pre-1.1 JSON backup: restores without error.

## Explicitly out of scope

Any UI change (forms, cards, views) · any Dexie `.version()` change · content
guide edits.

## Acceptance criteria

- [ ] `pnpm typecheck && pnpm lint && pnpm test` green; new modules covered.
- [ ] App renders identically to `main` (manual check).
- [ ] Pre-1.1 backup fixture imports cleanly (unit-tested).
- [ ] Label-clearing semantics proven and documented.
- [ ] Global DoD items that apply (no UI ships in this step).

## Risks / decisions

- **Zod v4 explicit-`undefined` handling** is the one real unknown; it is
  retired here by test, not discovered in Step 2.
- No index on `seriesId` is deliberate — see the decisions register. Revisit
  only if a profiled problem appears (not expected at personal-data scale).
