# Phase 1 · Step 5 — Task row + completion/undo + By Category view

> Read [`phase1.md`](phase1.md) first for shared conventions and the DoD.

## Objective

Make tasks visible and completable. Build the shared `TaskCard` (row anatomy,
three-tier overdue indicators, elapsed-time anchor), the "Just Done" completion
control with the 5-second undo, the reactive `TaskList`, and the **By Category**
default view (color-dot group headers). After this step the app's core loop —
see a task, mark it done, undo — works.

## Prerequisites

- Steps 3 (overdue/format/complete/undo logic) and 4 (shell, `ui-store`, toast
  host, skeletons) complete.

## Context & references

- Row anatomy + status tiers: [`app-pages-prompts.md`](../docs/app-pages-prompts.md)
  §1 (Task Row, Time Commitment Indicators, Task Status Indicators, Row anatomy),
  §3 (By Category view, sample layout, empty state).
- Component specs: [`style-guide.md`](../docs/style-guide.md) §3.2 (task rows),
  §3.3 (checkbox), §3.8 (section markers), §5 (visual indicators, three tiers).
- Reactive read pattern: [`design.md`](../docs/architecture/design.md) "Reactive
  Reads — `useLiveQuery`".
- Copy: [`content-strategy-guide.md`](../docs/content-strategy-guide.md) §3.1
  ("Just Done", "Nice work! Updated [task]", "Undo"), §3.4 (status text), §3.5
  (empty states).
- Requirements: Req 2.1–2.6, Req 3.8–3.9, Req 5.1–5.2, 5.5–5.8.

## Scope / checklist

### `components/task/TaskCard.tsx`
- [ ] Row: white card, radius 16, padding `13px 14px`, soft shadow, no default border. Left→right: checkbox · body (name + meta line) · elapsed-time anchor.
- [ ] **Task name** DM Sans 600 15px; entire card (outside the checkbox) is the tap target for the future detail/edit (routes to `/tasks/$id`).
- [ ] **Elapsed time** right-aligned, Bricolage 600 15px, via `formatElapsedCompact` (step 3), colored by status.
- [ ] **Three-tier status** from `calculateOverdueStatus` (step 3), each with a **non-color** cue:
      - due-soon → amber-gold text (`#8A5E15` AA) + clock glyph
      - overdue → terracotta text (`#B2452F` AA) + "!" badge + soft terracotta **card border** (`1.5px #EFCDBF`)
      - very-overdue → same as overdue **plus** an uppercase "Very overdue" pill in the meta line
      - Screen-reader text: "Overdue" / "Very overdue".
- [ ] **Meta line — `variant` prop**: `category` view → greige **time-estimate chip** (`● 15 min`); `time` view → tinted **category tag** + muted `● 15 min` (used by step 6). Time-commitment circles are neutral/greige with a text label always paired.
- [ ] Co-located `TaskCard.test.tsx` incl. `vitest-axe`; a status test per tier.

### `components/task/TaskCompletionButton.tsx`
- [ ] 30px circle visible / **≥44px tap target**; empty vs checked (terracotta fill + white check); keyboard Space/Enter; `aria-label` ("Mark [task] complete").
- [ ] On activate: call `markTaskComplete(id)` (returns prior date) → `showUndo(id, prior)` → toast "Nice work! Updated [name]" with an **Undo** action; `aria-live` announces completion. Undo (within 5s) calls `undoComplete(id, prior)` + `dismissUndo()`.

### `components/task/TaskList.tsx`
- [ ] `useLiveQuery` reading non-archived tasks (per design.md snippet). `undefined` → `<TaskListSkeleton/>` (step 4). Renders `TaskCard`s.

### By Category view — `routes/index.tsx`
- [ ] `components/category/CategoryBadge.tsx` — 12px solid color dot + name (Bricolage 700 14px) + count (AA-safe `#6E675E`).
- [ ] Group non-archived tasks by category; header per category; rows use `TaskCard` `variant="category"` (greige time chip, no category tag).
- [ ] **Empty states** (all three strings from content §3.5): no tasks at all ("No tasks yet. Tap + to add your first task."), empty category ("No tasks in this category. Add one?"), and a category with zero tasks handled gracefully.
- [ ] Overdue rows keep the soft terracotta border + badge.

### Dev sample seed
- [ ] A **dev-only** helper (guarded by `import.meta.env.DEV`) that seeds a handful of tasks spanning statuses/categories so the view isn't empty before step 7's form exists. Must never run in production and must be idempotent.

## Try it (manual)

1. `pnpm dev` on `/` → By Category view shows the dev sample tasks grouped under color-dot headers, each with an elapsed-time anchor.
2. A task past its frequency shows the "!" badge + soft terracotta border; a very-overdue one adds the "Very overdue" pill; a due-soon one shows the amber clock.
3. Tap a checkbox → it fills terracotta, elapsed resets to "Just now"/"Today", a toast says "Nice work! Updated …" with **Undo**.
4. Click **Undo** within 5s → the task returns to its previous elapsed value.
5. Tab to a checkbox and press Space → same behavior. Screen reader announces completion.
6. Empty a category (or clear the seed) → the correct empty-state copy appears.

## Explicitly out of scope

- **By Time view + Quick Pick** → **step 6** (this step ships the `time` meta
  variant on TaskCard for 6 to reuse, but not the view).
- **Creating/editing** tasks, archive/delete actions, category management →
  **step 7** (card tap can route to the placeholder `/tasks/$id` for now).
- Swipe/long-press gestures → **Phase 2** (checkbox/button is the only path).
- Settings/import/export → step 8.

## Acceptance criteria

- Tasks render grouped by category; elapsed time and all three status tiers are
  correct and each carries a non-color indicator + SR text.
- Completion updates instantly (Req 5.5–5.6), shows encouraging copy, and the
  5-second undo restores the *prior* completion date.
- `TaskCard` and completion control pass `vitest-axe`, are keyboard-operable, and
  meet 44px targets.
- Dev sample seed is `DEV`-only and idempotent.
- Meets the shared Definition of Done in [`phase1.md`](phase1.md).

## Risks / decisions

- **Undo restores prior state, not null** — wire `showUndo(id, prior)` from
  `markTaskComplete`'s return value; don't recompute.
- **One `TaskCard`, two meta variants** — design the `variant` prop now so step 6
  reuses the same component (avoid a second card).
- **Sample seed hygiene** — a stray production seed would violate the local-first
  "empty until the user adds" contract; gate it hard on `import.meta.env.DEV`.
