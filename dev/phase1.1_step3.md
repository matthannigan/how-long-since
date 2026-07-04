# Phase 1.1 · Step 3 — Grouped series rows in By Time and By Category

> Read [`phase1.1.md`](phase1.1.md) first (decisions register), and
> [`phase1.md`](phase1.md) for shared conventions and the global DoD.

## Objective

Siblings sharing a `seriesId` collapse into **one expandable group row**
within a time section (By Time) and within a category group (By Category):
series name, worst-of-siblings status with non-color cues, "2 of 5 overdue",
"5 places"; tapping expands inline to ordinary `TaskCard`s with their own
Just Done. **Quick Wins is intentionally untouched** and regression-locked.

## Prerequisites

- Step 2 complete (label chips on cards; series creatable via the form;
  Step 1's `groupSeriesForDisplay`/`seriesSummary` ready).

## Context & references

- Grouping/status logic: `src/lib/series.ts` — views consume it; **no view
  re-implements grouping**.
- Row visuals to match: `src/components/task/TaskCard.tsx` (card tokens,
  overdue border treatment, `!` badge + clock glyph + sr-only status text).
- View integration points: `src/components/task/ByTimeView.tsx` (post-
  `groupTasksByTime` render loop), `src/components/category/ByCategoryView.tsx`
  (post category-Map render loop).
- Disclosure a11y: WAI-ARIA disclosure pattern — `<button aria-expanded
  aria-controls>`; focus stays on the trigger across toggle.
- Copy (specified here; guide addendum in Step 4):
  - Count chip: **"{n} places"**
  - Status summary: **"{x} of {n} overdue"** (only when x > 0)
  - sr-only status: reuse TaskCard's "Overdue" / "Very overdue" / "Due soon"

## Scope / checklist

### `src/components/task/TaskSeriesGroup.tsx` (NEW)

- [ ] Contract:
  ```ts
  interface TaskSeriesGroupProps {
    group: SeriesGroup;            // from groupSeriesForDisplay; tasks pre-sorted
    variant: 'category' | 'time';  // forwarded to child TaskCards
    category?: Category;           // pass the first task's category
    now?: Date;                    // injectable clock, as TaskCard
  }
  ```
- [ ] **Collapsed row = a single card-styled `<button type="button">`** —
      no checkbox, no detail link inside (avoids nested-interactive a11y
      violations). Card tokens match TaskCard, including the overdue border
      treatment when `worst` ∈ {overdue, very-overdue}.
- [ ] Visible content: chevron (rotates when open, `aria-hidden`), series
      name, "{n} places" chip, and — when applicable — "{x} of {n} overdue"
      in the AA status color **plus** the `!` badge glyph (or clock icon for
      a worst of due-soon) with sr-only status text. Nothing overdue and
      nothing due-soon → "{n} places" only.
- [ ] `aria-expanded={open}` + `aria-controls={listId}` (`useId()`), where
      the sibling container is `<div id={listId} role="group"
      aria-label="{name} instances">`.
- [ ] Expanded children: one stock `TaskCard` per sibling (pre-sorted by
      label), inset via the existing `className` passthrough (`ml-4`);
      Just Done + undo work unchanged (id-based, global toast).
- [ ] Open state: local `useState(false)`; parent keys the component by
      `group.seriesId` so `useLiveQuery` re-renders (e.g. after Just Done)
      preserve it. Chevron rotation respects reduced-motion.
- [ ] Focus stays on the button across expand/collapse — no focus stealing.

### View integration (identical shape in both)

- [ ] `ByTimeView`: per section, render
      `groupSeriesForDisplay(sectionTasks)` → `{kind:'task'}` as `TaskCard`,
      `{kind:'series'}` as `<TaskSeriesGroup key={item.group.seriesId} …>`.
- [ ] `ByCategoryView`: same, inside each category group.
- [ ] Section/category header counts keep **task** semantics ("15 min · 5"
      still means 5 tasks; the group row's "n places" carries the collapse
      info).
- [ ] Because grouping runs **after** bucketing, siblings split across
      buckets (edited time/category) automatically render as smaller groups
      or singles — no special code.

### Quick Wins — zero source change

- [ ] Add regression tests only: two overdue siblings both appear as
      individual rows; 9 siblings → cap of 8 respected.

## Test plan

- **TaskSeriesGroup:** collapsed shows name + "n places" (+ "x of n overdue"
  when x > 0); `aria-expanded`/`aria-controls` wired to the labeled group
  container; expand renders one TaskCard per sibling, label-alphabetized;
  worst-of color + glyph + sr-only text for each worst tier; axe pass
  **collapsed and expanded**; complete-then-undo inside an expanded group
  restores the prior date (fake-indexeddb; reuse completion test patterns).
- **ByTimeView / ByCategoryView:** mixed data — singles + a 3-series in one
  bucket + a 2-series split across buckets → correct rows; group renders at
  first member's position; header counts unchanged.
- **Quick Wins regression:** as above.

## Try it (manual)

1. `pnpm dev` with the Step 1 seed (clear IndexedDB if needed).
2. **By Time** → the 30 min section shows one "Vacuum bedroom" row: "3
   places", "2 of 3 overdue", overdue border. Tap → three labeled cards
   slide in, inset; tap again → collapse; focus never leaves the row button.
3. **By Category** → Bedroom shows the same collapsed row.
4. Expand → Just Done on "Guest room" → header updates to "1 of 3 overdue"
   live; Undo from the toast → back to "2 of 3".
5. **Quick Wins** → set "30 min" → the vacuum siblings appear as separate
   rows, most overdue first.
6. Keyboard: Tab to the group row, Enter/Space toggles, Tab reaches the
   children's checkboxes; 200% text size → no horizontal scroll.

## Explicitly out of scope

Group rows in Quick Wins · persisting expansion across navigation ·
group-level "complete all" · any change to `filterForQuickPick` or ranking.

## Acceptance criteria

- [ ] `pnpm typecheck && pnpm lint && pnpm test` green.
- [ ] Global DoD: axe both states; ≥44px targets; keyboard-operable; status
      never color-only; tokens not hex; reduced-motion respected.
- [ ] Quick Wins snapshot of behavior identical to `main` (regression tests
      prove it).

## Risks / decisions

- The group row is a **new component wrapping stock TaskCards**, not a
  TaskCard variant — decided to keep TaskCard's contract untouched.
- Undo from inside a group is the unchanged global code path; the RTL test
  including collapse-before-undo guards it.
