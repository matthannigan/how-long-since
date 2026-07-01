# Phase 1 · Step 6 — By Time view + Quick Pick

> Read [`phase1.md`](phase1.md) first for shared conventions and the DoD.

## Objective

Add the second primary view: tasks grouped by time commitment (shortest →
longest, with a "No time set" group), fronted by a **Quick Pick** panel that
surfaces tasks fitting a stated available time. Reuses `TaskCard` in its `time`
meta variant. After this step both views work and the toggle switches between
them.

## Prerequisites

- Step 5 complete (`TaskCard` with the `time` meta variant, `TaskList`,
  completion/undo, empty states; the view toggle from step 4).

## Context & references

- View spec + sample layout: [`app-pages-prompts.md`](../docs/app-pages-prompts.md)
  §4 (By Time view, Time Commitment Sections, Quick Pick Panel, Task Row in this view).
- Section markers + Quick Pick styling: [`style-guide.md`](../docs/style-guide.md)
  §3.7 (Quick Pick panel), §3.8 (section markers), §1.4 (category tags), §5.
- Category-tag tints (light + dark): [`style-guide.md`](../docs/style-guide.md) §1.4–1.5.
- Copy: [`content-strategy-guide.md`](../docs/content-strategy-guide.md) §3.2
  (time filters), §3.5 ("No tasks match this time filter."), §6.2 (Quick Pick voice).
- Requirements: Req 4.1–4.8 (ordering, "Time Unknown" group, keep category +
  elapsed visible, remember preference, focus on switch, active-view indication).

## Scope / checklist

### By Time view — `routes/time.tsx`
- [ ] Group non-archived tasks by `timeCommitment` in fixed order: 15min → 30min → 1hr → 2hrs → 4hrs+; tasks with **no** estimate go in a trailing **"No time set"** group (Req 4.3).
- [ ] **Section markers** (style-guide §3.8): 22px greige circle with `●/●●/●●●…` glyph + section title (DM Sans 700 13px) + count ("15 min · 3", AA-safe `#6E675E`). Section titles per app-pages §4: Quick tasks / Short tasks / Medium tasks / Longer tasks / Big projects / No time set.
- [ ] Rows use `TaskCard` **`variant="time"`** → tinted **category tag** + muted `● 15 min` in the meta line (category stays visible without a group header, Req 4.4); elapsed time stays prominent (Req 4.5).
- [ ] Empty state when no tasks and when a section is empty; "No tasks match this time filter." for the Quick Pick no-match case.

### Quick Pick panel — `components/task/QuickPick.tsx` (or in the route)
- [ ] Gradient container per style-guide §3.7 (radius 20, sun glyph + "Quick pick" in `#C0794C`, subline "You've got 20 minutes — here's what fits:").
- [ ] An **"I have X minutes"** control (Req 4 filtering; app-pages §4 "I have X minutes"): maps the chosen window to the time-commitment buckets that fit (e.g. 20 min → 15min tasks; 45 min → 15/30 min) and lists 2–5 matching non-archived tasks as standard rows (tighter radius 15, lighter shadow).
- [ ] Rows in the panel behave like any `TaskCard` (complete/undo works).

### Cross-view behavior
- [ ] The step-4 view toggle marks By Time active here; **remember-view** (Req 4.6) persists the choice to `AppSettings.currentView`.
- [ ] **Focus management on switch** (Req 4.7): moving between views keeps a sensible focus position (finish the holistic verification in step 9, but wire the intent here).

## Try it (manual)

1. `pnpm dev`, toggle to **By Time** → tasks grouped shortest→longest; a task with no estimate appears under "No time set".
2. Category tags are visible on each row (tinted), and elapsed time still anchors the right edge.
3. In **Quick Pick**, set "I have 20 minutes" → only ≤15-min tasks are listed; set 45 → 15- and 30-min tasks; a window matching nothing shows "No tasks match this time filter."
4. Complete a task from the Quick Pick panel → undo works identically.
5. Reload → the app stays on By Time (remember-view).

## Explicitly out of scope

- Creating/editing tasks or setting a task's time estimate → **step 7**.
- Advanced time insights/combinations (app-pages "Time-Based Insights") → Phase 2.
- Full focus-on-switch + keyboard walkthrough **audit** → **step 9** (wire intent
  here; verify holistically there).

## Acceptance criteria

- Both views render the same tasks correctly; ordering and the "No time set" group
  match Req 4.2–4.3.
- `TaskCard` is reused via `variant="time"` (no duplicate card component).
- Quick Pick filters to the stated available time and handles the empty match.
- Active view is clearly indicated; preference persists.
- New components pass `vitest-axe`; keyboard-operable.
- Meets the shared Definition of Done in [`phase1.md`](phase1.md).

## Risks / decisions

- **Available-time → bucket mapping** is a small policy: document the mapping
  (which windows include which buckets) in the component so it's testable.
- **Don't fork `TaskCard`** — if the time variant needs new data, extend the prop,
  don't copy the component.
