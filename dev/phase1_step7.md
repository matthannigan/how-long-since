# Phase 1 · Step 7 — Add/Edit task form + category create & management

> Read [`phase1.md`](phase1.md) first for shared conventions and the DoD.
>
> This step has **two separable halves** — **7a (task form + task actions)** and
> **7b (category create + management)**. Keep them as distinct checklists; if the
> step runs long it can be split at execution time.

## Objective

Deliver full task CRUD and category CRUD. Build the `TaskForm` (add + edit) with
all five field controls, wire it into the FAB modal (`/tasks/new`) and the edit
route (`/tasks/$taskId`), add archive/delete actions, and implement category
creation (inline "+ New") plus management (edit, delete-with-reassignment) in
Settings. After this step the app is a complete single-user utility.

## Prerequisites

- Steps 4 (modal store, toast host, error boundary) and 5 (views, TaskCard).
- Uses `lib/tasks.ts` + `lib/categories.ts` (step 3) and `createTaskSchema` /
  `createCategorySchema` (step 2).

## Context & references

- Form composition + field controls: [`app-pages-prompts.md`](../docs/app-pages-prompts.md)
  §2 (Add New Task modal, Field Controls, Form Fields, Button Design, Validation).
- Control styling: [`style-guide.md`](../docs/style-guide.md) §3.5 (segmented
  pickers), §3.6 (form elements, category chip picker, last-done control).
- Copy: [`content-strategy-guide.md`](../docs/content-strategy-guide.md) §3.1
  (add/edit/complete labels, "Remove Task"), §4.3 (validation + "Cannot delete
  the default category…"), field labels/placeholders/helpers.
- Requirements: Req 1.1–1.10 (fields, validation, edit, archive/delete), Req
  2.5 (undo), Req 3.2–3.7 (category create/edit/delete/reassign), Req 8.6 (errors).

## Scope / checklist

### 7a — Task form + actions
- [ ] `components/task/TaskForm.tsx` with **react-hook-form + Zod** (`createTaskSchema`), one component for add and edit:
  - [ ] **Task name** (required) — text input, 128-char limit, **character counter**, placeholder "What needs to be done?", error "Please add a task name".
  - [ ] **Category** (required) — wrapping **color-chip picker** (not a dropdown), each chip a color dot + name; selected chip tinted + colored border; trailing dashed **"+ New"** chip (opens the 7b create flow); default to the last-used category.
  - [ ] **Time estimate** (optional) — segmented control `● 15m · ●● 30m · ●●● 1h · 2h+ …` mapping to the `timeCommitment` enum; selected = white pill.
  - [ ] **Expected frequency** (optional) — big numeral (Bricolage 24) + segmented unit picker **Days / Weeks / Months** (plus **Years**, which the data model allows), selected unit pill terracotta; helper "We'll gently flag it once this much time has passed."
  - [ ] **Last done** (optional → `lastCompletedAt`) — pills Today / Yesterday / "Pick date ▾"; active pill styled; sub-line confirms resolved date ("Set to Apr 2, 2026 · 3 months ago").
  - [ ] **Description** + **Notes** (optional, 512 each, counters) — collapsed under an expandable "Add details" section so the default form stays short.
- [ ] **Add** flow: FAB → open modal (Radix `Dialog` via shadcn = focus trap + Esc-to-close free) at `/tasks/new`; `isAddTaskOpen` from `ui-store`; FAB hidden while open. Save → `createTask` → toast "Task added" → close.
- [ ] **Edit** flow: `routes/tasks.$taskId.tsx` loads the task, pre-populates the same form; Save → `updateTask` → "Task updated". Save button disabled-styled until valid, then terracotta ("Save task" / "Save changes"). Cancel = top-bar text button.
- [ ] **Archive / Delete actions** (Req 1.9–1.10) — from the edit view (and/or a card overflow menu): "Remove Task" → choose Archive (hide, restorable) or Delete (permanent, confirm dialog). Uses `archiveTask` / `deleteTask`.
- [ ] **Validation + errors**: inline real-time messages (content §4.3); Enter-to-save / Esc-to-cancel; **handle rejected Dexie writes** ("Changes couldn't be saved. Try again." / quota copy) via the toast host.
- [ ] Co-located tests incl. `vitest-axe`: required-field error, char-limit error, add creates a task, edit updates it, invalid-then-valid enables Save.

### 7b — Category create + management
- [ ] `components/category/CategoryForm.tsx` (RHF + `createCategorySchema`): name + **color picker** (base hues incl. the reserved custom hues from style-guide §1.4) + optional **icon** picker (Lucide names, style-guide §4).
- [ ] **Inline "+ New"** from the task form's chip picker → create a category → it becomes selected without losing form state.
- [ ] **Manage Categories** surface (linked from Settings §5.5 / step 8): list categories; **edit** name/color/icon; **delete** enforcing Req 3.6–3.7 via `deleteCategory` — if the category has tasks, prompt to **reassign** to another category first; **block** deleting a default that still has tasks with copy "Cannot delete the default category. Try editing it instead."
- [ ] Tests: create, edit, delete-blocked-with-tasks, reassign-then-delete, default-guard; `vitest-axe` on the form.

## Try it (manual)

1. Tap the FAB → modal opens, focus is trapped, Esc closes. Save is disabled until a name + category are set.
2. Add "Descale coffee maker", Kitchen, 15 min, every 2 weeks, last done Yesterday → Save → toast "Task added"; it appears in both views with the right elapsed time and (after 2 weeks) status.
3. Open the task → edit the name → "Save changes" → "Task updated".
4. From the chip picker, tap **"+ New"** → create "Child-Related" (rose) → it's selected immediately.
5. Settings → Manage Categories → try to delete Kitchen while it has tasks → blocked/reassign prompt; reassign to Living Areas → delete succeeds; try to delete a default with no tasks vs one with tasks.
6. Archive a task → it leaves the active views; Delete another → confirm dialog → gone.
7. Enter a 129-char name → inline "too long" error; clear the name → "Please add a task name".

## Explicitly out of scope

- Settings page shell + import/export + backup reminder → **step 8** (this step
  provides the Manage-Categories surface that Settings links to).
- Swipe-to-edit / long-press quick menu → **Phase 2** (use the card tap + overflow
  button instead).
- Reordering categories, per-category icons in headers → Phase 2 enhancements.

## Acceptance criteria

- Add and edit share one `TaskForm`; all five controls behave per app-pages §2;
  counters + inline validation + content-guide copy present.
- Modal uses Radix Dialog (focus trap, Esc, restore focus on close).
- Archive vs delete both work (delete confirmed); rejected writes surface friendly copy.
- Category create (incl. inline "+ New") + edit + delete-with-reassignment enforce
  Req 3.6–3.7.
- New components pass `vitest-axe`; keyboard-operable; 44px targets.
- Meets the shared Definition of Done in [`phase1.md`](phase1.md).

## Risks / decisions

- **"Last used category" default** — decide where it lives (a small `ui-store`
  field or derived from most-recent task); flagged in step 4. Keep it out of Dexie
  unless it should persist across sessions.
- **Frequency "Years"** — the mock shows Days/Weeks/Months but the data model
  includes `year`; include Years so yearly tasks are expressible.
- **Chip picker, not dropdown** — required by the design; ensure it's fully
  keyboard-navigable (roving tabindex / radio semantics).
- **Delete is destructive** — always confirm; archive is the reversible default.
