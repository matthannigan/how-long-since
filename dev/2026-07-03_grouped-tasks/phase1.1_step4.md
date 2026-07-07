# Phase 1.1 · Step 4 — E2E proof, keyboard pass, doc & content closeout

> Read [`phase1.1.md`](phase1.1.md) first (decisions register), and
> [`phase1.md`](phase1.md) for shared conventions and the global DoD.

## Objective

Prove the whole loop end-to-end against the production build (Playwright),
lock backward compatibility with a checked-in pre-1.1 backup fixture, run the
keyboard-only pass, and close out the docs: content-guide addendum and phase
status updates.

## Prerequisites

- Steps 1–3 complete and committed; all unit/component tests green.

## Context & references

- E2E harness: `playwright.config.ts` (runs against
  `pnpm build && pnpm preview --port 4173` — production build, service worker
  active, **dev seed does not run**, tests start from a clean DB and drive the
  real form); helpers in `e2e/helpers.ts` (`addTask`, `waitForCurrentView`).
- Existing specs to mirror: `e2e/create-complete-undo-archive.spec.ts`,
  `e2e/quick-wins.spec.ts`, `e2e/import-export.spec.ts`.

## Scope / checklist

### `e2e/series.spec.ts` (NEW)

Drive the real UI (no seeding shortcuts unless a helper already exists):

- [ ] **Fan-out:** Add Task → name "Vacuum", category Bedroom, time 30 min →
      "Track in multiple places" → chips "Main", "Guest", "Kids" (Enter-
      commit) → Save → toast "3 tasks added"; By Category shows one "Vacuum"
      group row with "3 places"; expand → 3 cards, each with its label chip.
- [ ] **Suggestions:** start a second Bedroom task → chip field suggests
      "Main"/"Guest"/"Kids"; switching category to Kitchen empties the row.
- [ ] **Complete + undo in group:** expand, Just Done on "Guest" → header
      count/status updates live; Undo from the toast restores it.
- [ ] **View split:** By Time 30 min section shows the group row; Quick Wins
      ("30 min") lists the siblings individually.
- [ ] **Keyboard-only pass:** Tab to the group row button, Enter and Space
      both toggle (`aria-expanded` asserted), Tab reaches the children's
      completion checkboxes.

### `e2e/import-export.spec.ts` (extend)

- [ ] Round-trip: export JSON containing a series → clear all data → import →
      group row intact with labels.
- [ ] **Pre-1.1 compat:** import a checked-in literal fixture string captured
      from Phase 1's export shape → succeeds; tasks appear as plain singles.

### Docs & content closeout

- [ ] Append a Phase 1.1 microcopy addendum to
      [`content-strategy-guide.md`](../docs/content-strategy-guide.md)
      (append-only section): "Track in multiple places", "Where — or who?",
      helper text, "Suggestions", "{n} tasks added", "{n} places",
      "{x} of {n} overdue", sr-only strings.
- [ ] Update [`phase1.1.md`](phase1.1.md): status → implemented; record any
      decisions changed/learned during Steps 1–3 in the register.
- [ ] Update `README.md` Project Status/roadmap line to mention instance
      labels & series (one sentence — keep it light).
- [ ] Update `AGENTS.md` Core Data Models: add the two optional fields to the
      `Task` interface snippet.

## Try it (manual)

1. `pnpm build && pnpm preview` → walk scenario 1–4 above by hand once.
2. `docker compose up --build` (optional) → same walk; confirms nothing in
   the static-server path cares about the new fields.

## Explicitly out of scope

New features of any kind; performance work; Phase 2 items.

## Acceptance criteria

- [ ] Full gate green: `pnpm typecheck && pnpm lint && pnpm test &&
      pnpm build && pnpm e2e`.
- [ ] Pre-1.1 fixture import passes at both unit (Step 1) and e2e layers.
- [ ] Docs updated (content addendum, phase status, README, AGENTS.md).

## Risks / decisions

- E2E runs against the production build — remember the dev seed is absent;
  every spec creates its own data through the form (existing convention).
- If suggestion chips prove flaky under Playwright (IndexedDB latency),
  assert via `await expect(...).toBeVisible()` polling, not fixed waits —
  same lesson as the Step 9 `waitForCurrentView` race fix.
