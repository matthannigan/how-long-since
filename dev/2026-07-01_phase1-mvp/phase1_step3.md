# Phase 1 · Step 3 — Business logic (`lib/`)

> Read [`phase1.md`](phase1.md) first for shared conventions and the DoD.

## Objective

Implement all headless business logic as plain, unit-tested async/pure functions
in `lib/`: task writes, category writes (with the delete-reassignment guard), the
pure overdue calculation, and human-readable elapsed-time formatting. After this
step every rule the UI depends on exists and is proven correct without any
rendering.

## Prerequisites

- Step 2 complete (`db`, schemas, types, seeding).

## Context & references

- Function shapes + snippets: [`design.md`](../docs/architecture/design.md)
  "Business Logic — Plain Functions", "Overdue Status — Three Tiers".
- Overdue thresholds: [`AGENTS.md`](../AGENTS.md) "Overdue Status Thresholds";
  [`requirements.md`](../docs/requirements.md) Req 2.6–2.9.
- Completion + undo: Req 2.1–2.5; undo store shape in
  [`design.md`](../docs/architecture/design.md) "Client (UI-only) State".
- Category delete rules: Req 3.6–3.7.
- Elapsed-time strings: [`content-strategy-guide.md`](../docs/content-strategy-guide.md)
  §3.4 "Time Elapsed"; compact forms in [`style-guide.md`](../docs/style-guide.md) §5.

## Scope / checklist

### `src/lib/tasks.ts`
- [ ] `createTask(input): Promise<Task>` — `createTaskSchema.parse(input)`, then add `{ ...data, id: crypto.randomUUID(), createdAt: new Date(), lastCompletedAt: null, isArchived: false }`.
- [ ] `updateTask(id, patch): Promise<void>` — validate the patch (partial task schema); `db.tasks.update`.
- [ ] `markTaskComplete(id): Promise<Date | null>` — capture and **return the prior `lastCompletedAt`**, then set it to `new Date()`. (Returning the prior value is what makes undo restore state rather than null it.)
- [ ] `undoComplete(id, previous: Date | null): Promise<void>` — restore `lastCompletedAt` to `previous`.
- [ ] `archiveTask(id)` / `unarchiveTask(id)` — toggle `isArchived`.
- [ ] `deleteTask(id)` — hard delete.

### `src/lib/categories.ts`
- [ ] `createCategory(input): Promise<Category>` — validate; `isDefault:false`; uuid.
- [ ] `updateCategory(id, patch)` — name/color/icon.
- [ ] `deleteCategory(id, opts?: { reassignToId?: string })` — enforce Req 3.6–3.7:
      **reject** if tasks are assigned and no `reassignToId` given; if `reassignToId` provided, move those tasks then delete; **never** delete a default category that still has tasks. Do the reassignment + delete in one `db.transaction`.

### `src/lib/overdue.ts`
- [ ] `type OverdueStatus = 'none' | 'due-soon' | 'overdue' | 'very-overdue'`.
- [ ] Pure `calculateOverdueStatus(task, now = new Date()): OverdueStatus` per design.md: `none` if no `expectedFrequency` or no `lastCompletedAt`; else pct-elapsed thresholds `<0.8 none`, `<1 due-soon`, `<1.5 overdue`, `≥1.5 very-overdue`. `UNIT_MS = { day:864e5, week:6048e5, month:2592e6, year:31536e6 }`.

### `src/lib/time-format.ts`
- [ ] `formatElapsed(from: Date | null, now = new Date()): string` — full content-guide ladder: `null → "Not done yet"`; "Just now", "Today", "Yesterday", "X days/weeks/months/years ago".
- [ ] `formatElapsedCompact(...)` — the row anchor forms from style-guide §5: `"3 d"`, `"1 wk"`, `"2 wk"`, `"3 mo"`, `"Yest."`. (TaskCard uses the compact form; longer prose is for detail/aria.)

### Tests (co-located)
- [ ] `overdue.test.ts` — **boundary cases** at 0.79/0.80/0.99/1.00/1.49/1.50 of the interval for each unit; null-frequency and null-lastCompleted → `none`; a fixed `now`.
- [ ] `time-format.test.ts` — every rung of the ladder incl. `null` and singular/plural.
- [ ] `tasks.test.ts` (fake-indexeddb) — create validates + rejects over-long name; complete sets a date and **returns the prior value**; undo restores exactly that prior value (incl. `null`); archive/delete behave.
- [ ] `categories.test.ts` — delete blocked when tasks assigned & no reassign; reassign-then-delete moves tasks; default-with-tasks cannot be deleted.

## Try it (manual)

Headless — verify via tests:

1. `pnpm test src/lib` → all green, including the overdue boundary matrix.
2. Sanity-check one boundary by hand: a weekly task completed 6 days ago →
   `due-soon` (6/7 ≈ 0.857); 8 days ago → `overdue`.

## Explicitly out of scope

- The 5-second undo **window/UI** (Zustand store + toast host) → **step 4/5**;
  this step only provides `markTaskComplete` (returns prior) + `undoComplete`.
- Any `useLiveQuery` reads or components → steps 5–6.
- Export/import logic → step 8.
- Rendering the status colors/badges → step 5 (this step returns the *status*, not styling).

## Acceptance criteria

- `calculateOverdueStatus` is pure (no Dexie import) and passes the full boundary matrix.
- `markTaskComplete` returns the prior `lastCompletedAt`; `undoComplete` restores it exactly.
- `deleteCategory` enforces Req 3.6–3.7 within a transaction.
- All `lib/` functions validate input via the step-2 Zod schemas at the write boundary.
- Meets the shared Definition of Done in [`phase1.md`](phase1.md).

## Risks / decisions

- **Undo correctness** is the subtle one: nulling `lastCompletedAt` on undo would
  be wrong for a task completed before. The return-prior-value contract is
  mandatory and tested.
- **Month/year as fixed ms** (per design.md `2592e6`/`31536e6`) is an intentional
  approximation for threshold math — keep it; don't switch to calendar math.
- **Reassignment atomicity:** wrap move+delete in `db.transaction('rw', …)` so a
  failure can't orphan tasks.
