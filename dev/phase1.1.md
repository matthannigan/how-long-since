# Phase 1.1 (Instances & Series) — Implementation Plan & Handoff Index

> **Status: implemented** (2026-07-03, all four steps green on
> `phase1.1-instances-series`). Approved and built the same day. Read
> [`phase1.md`](phase1.md) for the shared conventions, cross-cutting
> standards, and the global Definition of Done — **all of it still applies**.
> This file holds only what is new in 1.1.

## Why this phase exists

First real-world use of the MVP surfaced one gap above all others: the same
activity often happens in **multiple places or for multiple subjects** — five
bedrooms to vacuum, three bathrooms to clean, two pets to flea-treat. Entering
each as a separate task works but is slow, and the resulting near-duplicate
rows clutter every view.

Phase 1.1 answers this with **instances and series**:

- Tasks stay fully independent rows — completion, undo, and overdue logic are
  untouched. Two **optional** fields are added to `Task`:
  - `instanceLabel` — a short label for the place or subject ("Guest room",
    "Luna"). UI copy asks **"Where — or who?"** so it works for pets as well
    as rooms.
  - `seriesId` — a UUID shared by tasks spawned together, so views can group
    siblings.
- The Add Task form gains a **fan-out**: a "Track in multiple places" chip
  input; entering N labels creates N tasks from one form submission, sharing a
  freshly generated `seriesId`.
- A **tiny recommendation engine**: the chip input suggests distinct
  `instanceLabel`s already used by tasks in the selected category (derived by
  query — no new table). Add "Vacuum" to Bedroom and it offers the bedroom
  names you listed for another Bedroom task.
- **View treatments** (user-decided):
  - **Quick Wins** — *no grouping.* Siblings rank and cap independently; the
    existing worst-first ranking naturally puts the most overdue bedroom on
    top while the rest sit lower or fall off the cap of 8.
  - **By Time** and **By Category** — siblings sharing a `seriesId` collapse
    into **one expandable group row** (worst-of-siblings status, "2 of 5
    overdue"); tapping expands inline to ordinary task cards, each with its
    own Just Done.

## How to use these docs

Same handoff model as Phase 1: each `dev/phase1.1_step[N].md` is a
self-contained prompt — prerequisites, exact scope checklist, a manual "Try
it" path, and acceptance criteria. Do the steps **in order**; each ends with
green quality gates (`pnpm typecheck && pnpm lint && pnpm test`) and a commit.

## The 4-step map

| # | Step | Objective | Depends on |
|---|------|-----------|-----------|
| 1 | [Data layer](phase1.1_step1.md) | Schema fields, `createTaskSeries`, pure `lib/series.ts`, CSV/JSON export-import, dev seed — **zero UI change** | Phase 1 |
| 2 | [Form fan-out + label chip](phase1.1_step2.md) | Chip input with category-scoped suggestions in Add Task; `instanceLabel` field in Edit; label chip on `TaskCard` | 1 |
| 3 | [Grouped views](phase1.1_step3.md) | `TaskSeriesGroup` expandable row in By Time and By Category; Quick Wins regression-locked unchanged | 2 |
| 4 | [E2E + closeout](phase1.1_step4.md) | Playwright series specs, pre-1.1 backup compat fixture, keyboard pass, doc/content-guide closeout | 3 |

**Dependency graph:** `1 → 2 → 3 → 4` (strictly linear).

After Step 2 the feature is already usable end-to-end (siblings simply render
as N independent cards); Step 3 adds the collapse; Step 4 proves it.

## Decisions register (locked at approval, 2026-07-03)

| Decision | Resolution | Why |
|----------|-----------|-----|
| Data shape | Two optional `Task` fields (`instanceLabel`, `seriesId`); **no new table, no parent/child entity** | Keeps every existing code path (completion, undo, overdue, export) untouched; "light touch" was an explicit constraint |
| Dexie schema | **No version bump, no index on `seriesId`** | `schema.ts` declares only indexed fields; Dexie stores undeclared fields fine. Views already fetch all tasks and filter in memory (the boolean-index pattern), so grouping runs on already-fetched arrays |
| Backup `DB_SCHEMA_VERSION` | Stays `2` | Both fields are optional in `taskSchema`; pre-1.1 backups parse unchanged. Bumping would falsely imply a Dexie migration exists |
| `seriesId` mutability | **Not** in `updateTaskSchema` — system-owned, like `id`/`createdAt` | Series membership editing is future scope; immutability keeps invariants trivial |
| Grouping key | No `seriesId` → never grouped. **No name-based heuristics** | Deterministic, zero false positives; pre-1.1 tasks are permanent singles |
| Group rendering rule | Group row only when **≥2 siblings land in the same render bucket** (same category group / same time section); otherwise plain cards | Handles series-of-1 and siblings that diverge (user edits one sibling's category or time) with no special cases |
| Quick Wins | Untouched — siblings rank independently against the cap of 8 | User decision; ranking already surfaces the most overdue sibling |
| Group row UX | Expand **inline** (disclosure); children are stock `TaskCard`s with their own Just Done | User decision; reusing TaskCard means undo/detail-nav come for free and no nested-interactive a11y traps |
| Sibling order in expanded group | Alphabetical by `instanceLabel` (locale compare, unlabeled last) | Stable spatial memory; the header already carries the urgency signal |
| "n of m overdue" count | Counts `overdue` + `very-overdue` only | Matches the word "overdue"; `due-soon` affects only the worst-of color/icon |
| Suggestions UI | Tappable suggestion-chip row below the input, **not** `<datalist>` | `<datalist>` is broken/inconsistent on iOS Safari (this is a mobile-first PWA); chips reuse the pill visual language, 44px targets, RTL-testable |
| Suggestions source | Distinct labels of non-archived tasks in the **selected category**, most-frequent-then-alpha, cap 8 | The "tiny recommendation engine" the user asked for, with zero new storage |
| Edit semantics | Per-task only; `instanceLabel` editable as a plain text field. **No fan-out in edit mode** | User decision; "apply to all in series" deferred |
| `instanceLabel` limit | Trimmed, 1–40 chars when present | It's a chip; keeps the TaskCard meta line sane at 375px |
| New microcopy | Specified in these step docs (tone rules of `content-strategy-guide.md` apply); the guide itself gets an append-only 1.1 addendum in Step 4 | The guide predates this feature; step docs are the interim source of truth |
| Chip input commits on blur too *(learned in Step 2)* | A pending typed label becomes a chip when the input loses focus, not only on Enter/comma | Without it, "type one label → tap Save" silently created an unlabeled single task |
| Completion name includes the label *(learned in Step 3)* | `TaskCompletionButton` aria-label and toast read "{name} — {label}" when a label exists | Same-named siblings were indistinguishable to screen readers ("Mark Vacuum bedroom complete" ×3) and in toasts |
| Zod v4 explicit-`undefined` *(verified in Step 1)* | `updateTask(id, { instanceLabel: undefined })` deletes the stored property — Zod keeps the key, Dexie removes it | The label-clear risk was retired by unit test; no fallback path needed |

## Explicitly NOT in Phase 1.1

Stated here so it isn't silently re-added:

- "Apply to all in series" bulk editing
- Adding/removing an existing task to/from a series; regrouping
- Group rows in Quick Wins, task detail, or Settings surfaces
- Group-level "complete all" action
- Persisting a group's expanded/collapsed state across navigation or reloads
- Name-based (heuristic) grouping of tasks without a `seriesId`
- Any Dexie `.version()` bump or index change
- Locations/subcategories as a first-class entity (a possible future promotion
  of `instanceLabel`; nothing in 1.1 forecloses it)

## New-surface inventory

```
src/lib/series.ts                          # NEW — pure grouping/status/suggestions (single entry point)
src/components/task/InstanceLabelsField.tsx # NEW — chip input + suggestion row
src/components/task/TaskSeriesGroup.tsx     # NEW — expandable group row (By Time + By Category)
e2e/series.spec.ts                          # NEW — end-to-end series flows
```

Modified: `schemas/task.ts`, `lib/tasks.ts`, `lib/overdue.ts`,
`lib/time-sections.ts`, `lib/csv-export.ts`, dev seed, `TaskForm.tsx`,
`TaskCard.tsx`, `ByTimeView.tsx`, `ByCategoryView.tsx`,
`e2e/import-export.spec.ts` — details in each step doc.
