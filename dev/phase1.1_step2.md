# Phase 1.1 · Step 2 — Add-form fan-out, label suggestions, TaskCard label chip

> Read [`phase1.1.md`](phase1.1.md) first (decisions register), and
> [`phase1.md`](phase1.md) for shared conventions and the global DoD.

## Objective

One form submission can create a whole series: the Add Task form gains a
"Track in multiple places" chip input with category-scoped label suggestions;
the Edit form exposes `instanceLabel` as a plain text field; `TaskCard` shows
the label as a small chip everywhere. After this step the feature is usable
end-to-end — siblings simply render as N independent cards (grouping is
Step 3).

## Prerequisites

- Step 1 complete (`createTaskSeries`, `suggestLabels`, schema fields).

## Context & references

- Form patterns to mirror: `src/components/task/TaskForm.tsx` — the
  "Add details" disclosure (same pattern for the new disclosure), the char
  counter, RHF + `zodResolver`, RadioPills.
- Pill styling: `src/components/ui/radio-pills.tsx`; greige fill
  (`bg`-surface tokens) and AA-safe meta text per
  [`style-guide.md`](../docs/style-guide.md) §1.6, §3.
- Card meta line: `src/components/task/TaskCard.tsx` (flex-wrap `gap-2` meta
  row, `hasMeta` guard, `className` passthrough).
- Tone for new copy: [`content-strategy-guide.md`](../docs/content-strategy-guide.md)
  §1–2 (friendly-efficient, plain language). New strings for this feature are
  specified **here** (guide addendum lands in Step 4):
  - Disclosure button: **"Track in multiple places"**
  - Field label: **"Where — or who?"**
  - Field helper: **"Add each place or pet — one task is created for each."**
  - Suggestion row label: **"Suggestions"**
  - Success toast: **"{n} tasks added"** (n > 1; single chip or no chips keeps
    the existing "Task added").

## Scope / checklist

### `src/components/task/InstanceLabelsField.tsx` (NEW)

- [ ] Contract:
  ```ts
  interface InstanceLabelsFieldProps {
    labels: string[];                    // controlled chip list
    onChange: (labels: string[]) => void;
    suggestions: string[];               // already filtered/capped by caller
    inputId: string;                     // for <Label htmlFor>
  }
  ```
- [ ] Text input; **Enter or comma commits a chip** (trim; reject empty and
      case-insensitive dupes; 40-char limit with the form's counter pattern).
      `preventDefault()` on Enter so it never submits the enclosing form —
      explicit test required.
- [ ] Chips render as greige pills in a list; each has a remove button with
      `aria-label="Remove {label}"` and a ≥44px effective target
      (`min-h-11` row + generous hit padding).
- [ ] Suggestion row beneath (when non-empty): tappable `type="button"` chips
      (dashed/"+"-style, like the category "+ New" affordance); tapping
      appends the label and removes it from the row. Row is labeled
      "Suggestions". Focus stays in the input after any add — no live region
      needed.
- [ ] Fully controlled; no Dexie/RHF imports.

### `src/components/task/TaskForm.tsx`

- [ ] `taskFormSchema` gains `instanceLabel: z.string().trim().max(40)`
      (default `''`) — used by **edit** mode only.
- [ ] **Create mode:** disclosure button "Track in multiple places" (same
      classes/`aria-expanded` pattern as "Add details") revealing
      `InstanceLabelsField`. Chip list lives in **local `useState`, not RHF**
      (it never affects `isValid`; avoids Controller ceremony for an array).
      Suggestions: `useLiveQuery(() => db.tasks.toArray())` (create mode
      only) → `suggestLabels(tasks ?? [], watch('categoryId'), chips)` —
      recomputes live when the category changes.
- [ ] **Create submit:** `chips.length === 0` → existing `createTask` path,
      unchanged. Otherwise `createTaskSeries(input, chips)`; toast
      "{n} tasks added" when n > 1. Rejection path handled with the existing
      content-guide error copy.
- [ ] **Edit mode:** plain `Input` for `instanceLabel` (label "Where — or
      who?"), prefilled from `task.instanceLabel ?? ''`; submit maps `''` →
      an explicitly-present `instanceLabel: undefined` key so clearing works
      (semantics proven in Step 1). **No** chips, fan-out, or suggestions in
      edit mode.

### `src/components/task/TaskCard.tsx`

- [ ] Render `task.instanceLabel` as a chip in the meta line (after the
      very-overdue pill, before the category tag / time chip): greige fill +
      AA-safe meta text token, small rounded pill. Include `instanceLabel` in
      the `hasMeta` guard. Neutral label → no non-color-cue obligation.

## Test plan

- **InstanceLabelsField:** add via Enter and via comma; dupe rejected
  (case-insensitive); remove button works; suggestion tap adds + disappears
  from row; **Enter does not submit an enclosing form**; axe pass.
- **TaskForm create:** 0 chips → `createTask` called (spy), no seriesId;
  3 chips → `createTaskSeries` with those labels; disclosure toggles with
  `aria-expanded`; suggestions change when category changes (seed
  fake-indexeddb with labeled tasks in two categories); toast copy n>1.
- **TaskForm edit:** prefill; change; clear-to-empty → patch key present with
  `undefined`; no disclosure rendered.
- **TaskCard:** chip renders with label; absent when undefined; axe pass.

## Try it (manual)

1. `pnpm dev` (fresh DB with the Step 1 seed).
2. Add Task → name "Wipe sink", category Bathroom → open "Track in multiple
   places" → type "Upstairs" ⏎ "Downstairs" ⏎ → Save → toast "2 tasks added";
   two cards appear, each with its label chip.
3. Add another Bathroom task → open the chip field → "Upstairs" and
   "Downstairs" appear as suggestions; switch category to Kitchen →
   suggestions clear; back to Bathroom → they return.
4. Edit one seeded "Vacuum bedroom" task → change its label → chip updates;
   clear the label → chip disappears.
5. Keyboard-only: Tab into the chip input, commit with Enter (form does not
   submit), Tab to a chip's remove button, activate with Enter.

## Explicitly out of scope

Grouped rows in any view (siblings as N independent cards is the accepted
intermediate state) · fan-out in edit mode · "apply to all in series" ·
content-guide edits (Step 4).

## Acceptance criteria

- [ ] `pnpm typecheck && pnpm lint && pnpm test` green.
- [ ] Global DoD: axe tests co-located and passing for both touched/new
      components; 44px targets; visible focus; no color-only meaning; no hex
      literals; error paths use content-guide copy.
- [ ] Zero-chip Add Task is byte-for-byte the Phase 1 behavior.

## Risks / decisions

- Chip state outside RHF is deliberate — see decisions register.
- The `useLiveQuery` for suggestions loads all tasks; fine at personal scale
  and consistent with every view's existing fetch pattern.
