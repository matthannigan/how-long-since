# Phase 1 (MVP) — Implementation Plan & Handoff Index

> **Status:** Pre-implementation. The repo is docs-only — no `package.json`, no
> `src/`. This document and its ten `phase1_step[N].md` companions break Phase 1
> into discrete, independently-executable steps.

## How to use these docs

Each `dev/phase1_step[N].md` is a **self-contained handoff prompt**. Give one to
a developer or an AI agent and it should be executable without re-reading the
whole planning corpus — it names its prerequisites, the exact source-doc sections
it implements, a concrete checklist, a manual "Try it" path, and its acceptance
criteria. This overview holds everything shared across steps: conventions, the
global Definition of Done, cross-cutting standards, and the decisions register.
**Read this file, then the step you're implementing.**

Do the steps **in order** (the dependency graph below allows 6 and 7 to run in
parallel). Don't start a step until its prerequisites are green.

## Source-of-truth documents

| Doc | What it governs |
|-----|-----------------|
| [`AGENTS.md`](../AGENTS.md) | Data models, overdue thresholds, category colors, content tone |
| [`docs/requirements.md`](../docs/requirements.md) | EARS functional requirements (Req 1–10) |
| [`docs/architecture/tech.md`](../docs/architecture/tech.md) | Locked stack + commands |
| [`docs/architecture/design.md`](../docs/architecture/design.md) | Data layer, code patterns, snippets |
| [`docs/architecture/structure.md`](../docs/architecture/structure.md) | Folder/file layout |
| [`docs/style-guide.md`](../docs/style-guide.md) | "Soft Daylight" tokens, typography, components |
| [`docs/content-strategy-guide.md`](../docs/content-strategy-guide.md) | Every user-visible string, tone, errors |
| [`docs/app-pages-prompts.md`](../docs/app-pages-prompts.md) | Page-by-page UI composition |

---

## Phase 1 scope

Create / Edit / Archive / Delete tasks · "Just Done" completion with a 5-second
undo · 3-tier overdue status · **By Category** + **By Time** views (+ a Quick Pick
panel) · human-readable elapsed time · category management (create / edit /
delete-with-reassignment) · Settings (theme, text size, high-contrast, reduced
motion, default view) · CSV + JSON import/export · 2-week backup reminder · full
WCAG 2.1 AA accessibility · installable PWA that works offline · **containerized
production deployment**.

### Explicitly NOT in Phase 1

Stated here so it isn't silently re-added:

- Onboarding tutorials / welcome flow (Req 8.1 mentions it; briefing puts it in Phase 2)
- Pre-built task templates
- Desktop-optimized multi-column dashboard
- Advanced filtering
- **Swipe / long-press gestures** (Req 5.3–5.4) — deferred to Phase 2; Phase 1
  ships the checkbox/button completion path only (see Decisions register)
- Cloud accounts, sync, shared households (Phase 3 / Dexie Cloud)
- Push notifications (backup reminder ships as an in-app banner instead)

---

## The 10-step map

| # | Step | Objective | Depends on |
|---|------|-----------|-----------|
| 1 | [Scaffolding & tooling](phase1_step1.md) | Project boots; all `pnpm` scripts green; preview panel wired | — |
| 2 | [Data layer](phase1_step2.md) | Dexie schema, types, Zod schemas, default-category + settings seeding | 1 |
| 3 | [Business logic](phase1_step3.md) | `lib/` tasks·categories·overdue·time-format, unit-tested | 2 |
| 4 | [App shell + shared infra](phase1_step4.md) | Shell, routing, theme/a11y providers, undo store, toast host, error boundary, skeletons, seed-on-boot | 1,2,3 |
| 5 | [Row + completion + By Category](phase1_step5.md) | Render + complete tasks; default view works | 3,4 |
| 6 | [By Time + Quick Pick](phase1_step6.md) | Second view: time-commitment sections + recommendations | 5 |
| 7 | [Task form + category mgmt](phase1_step7.md) | Full task CRUD + category CRUD | 4,5 |
| 8 | [Settings + import/export](phase1_step8.md) | Settings page, JSON/CSV round-trip, backup banner, clear-all | 4,7 |
| 9 | [A11y / PWA / perf / E2E](phase1_step9.md) | Holistic audit, installable PWA, Playwright E2E, perf budgets | all prior |
| 10 | [Docker deployment](phase1_step10.md) | Image + compose serving `dist/`, mirroring `galley` | 9 |

**Dependency graph**

```
1 → 2 → 3 → 4 → 5 → ┬→ 6 ─┐
                    └→ 7 → 8 → 9 → 10
```

6 (By Time) and 7 (Task form) both build on 5 and can proceed in parallel. 8 needs
7. 9 gates release. 10 ships it.

---

## Running & verifying locally

Three layers, all available from step 1 onward:

1. **Live in the browser** — `pnpm dev` starts Vite with HMR on `localhost`. The
   `.claude/launch.json` created in step 1 lets the Claude Code **preview panel**
   boot the dev server for click-through, screenshots, and console/network
   inspection. Every step doc has a **"Try it (manual)"** section: the exact
   things to do and what you should see.
   - A tiny **dev-only sample-task seed** (a handful of tasks spanning statuses)
     lands in step 5 so the views aren't empty before the Add-Task form (step 7)
     exists. It is guarded to `import.meta.env.DEV` and is **never** run in
     production.
2. **Automated** — `pnpm test` (Vitest: unit for `lib/`, component + `vitest-axe`
   for UI) is part of every step's Definition of Done. `pnpm e2e` (Playwright)
   drives a real browser for full flows and is exercised in step 9.
3. **Production-ish** — `pnpm build && pnpm preview` serves the built PWA over
   `localhost`, where the service worker and offline mode actually work (step 9).
   `docker compose up` (step 10) runs the real production container.

### Commands (from `tech.md`)

```bash
pnpm dev         # Vite dev server (HMR)
pnpm build       # production build → dist/
pnpm preview     # serve the production build locally
pnpm test        # Vitest (unit + component + axe)
pnpm typecheck   # tsc --noEmit (strict)
pnpm lint        # ESLint
pnpm format      # Prettier
pnpm e2e         # Playwright end-to-end
```

---

## Shared conventions

- **Imports:** `@/` alias for `src/` absolute imports. External libs first, then
  internal, grouped/sorted by ESLint.
- **Exports:** named exports preferred over default.
- **`lib/` = plain async functions, not classes.** No `Service` suffix, no
  `APIResponse<T>` envelope. Writes go through `lib/`; validation happens there
  via Zod at the one write boundary.
- **Errors are thrown** (`Error` / `ZodError`), caught at the call site (form
  submit handler) or by the root error boundary — not returned as status objects.
- **Reads via `useLiveQuery`** straight from Dexie. Components never hold task or
  category data in React state or Zustand.
- **Zustand is UI-only** (drawer/modal open, undo-snackbar visibility). Persisted
  preferences (`currentView`, `theme`, `textSize`, …) live in the Dexie `settings`
  singleton, not Zustand.
- **Tests co-located** with the module (`tasks.test.ts` next to `tasks.ts`,
  `TaskCard.test.tsx` next to `TaskCard.tsx`). Playwright specs in `e2e/`.
- **Design tokens, not hex.** Consume Tailwind v4 `@theme` variables from
  `styles/globals.css`; don't hard-code color literals in components.
- **Dates are `Date` objects** everywhere in the app and in Dexie (stored
  natively). The only place they become strings is CSV (see step 8 risk).

---

## Global Definition of Done (applies to every step)

```
[ ] pnpm typecheck — clean (TS strict; no stray `any`, no unjustified @ts-ignore)
[ ] pnpm lint + pnpm format — clean; import order enforced
[ ] pnpm test — all unit/component tests green; new code covered
[ ] pnpm build — succeeds; no new runtime console errors/warnings
[ ] Every component that renders UI ships a co-located passing vitest-axe test
[ ] Interactive elements: ≥44px targets, keyboard-operable, visible focus, correct roles/labels
[ ] Status/meaning never conveyed by color alone (icon + text accompaniment)
[ ] State changes that matter to AT are announced via aria-live where this step adds them
[ ] All user-visible strings sourced from content-strategy-guide.md (no invented copy)
[ ] Every lib/ write call has its rejection path handled with content-guide error copy
[ ] Colors come from style-guide.md @theme tokens, not hard-coded hex
[ ] Any animation respects prefers-reduced-motion AND the AppSettings override
[ ] No app data in Zustand (Dexie useLiveQuery is the single source of truth)
[ ] Files match structure.md paths/naming; no dead/placeholder files committed
[ ] The step's own acceptance criteria all pass
```

**Not in the per-step DoD** — these can only be validated on the assembled app and
are the deliverable of **step 9**: Playwright E2E, 200% reflow with no horizontal
scroll, focus management on view switch, full keyboard + screen-reader
walkthrough, and perf budgets (FCP < 1.5s, TTI < 3s).

---

## Cross-cutting standards (woven into every UI step)

Accessibility, content, and error-handling are **acceptance criteria in every step
that renders UI (4, 5, 6, 7, 8)**, not deferred to step 9. Step 9 is an *audit and
gap-closure* pass, not where these first appear.

- **Accessibility:** WCAG 2.1 AA. Use the AA-safe text tokens for small
  informational text (`#6E675E` meta, `#B2452F` overdue, `#8A5E15` due-soon — see
  style-guide §1.6); the soft grays `#9B948B`/`#ADA69C` are decorative/large-text
  only. shadcn/Radix primitives carry keyboard + focus-trap guarantees — use them
  rather than re-rolling. A co-located passing `vitest-axe` test is the
  enforcement mechanism.
- **Content:** every string traces to `content-strategy-guide.md` (it enumerates
  empty states §3.5, errors §4.3, success/undo §3.1, button labels, status text
  §3.4). No invented copy. No guilt/shame tone for overdue tasks. No "click here".
- **Error handling:** every `lib/` write's rejection path is handled with
  content-guide error copy (e.g. storage-quota → "Storage space is low…"). The
  root error boundary (step 4) is the backstop for uncaught throws.

---

## Decisions register

| Decision | Resolution | Source |
|----------|-----------|--------|
| Stack | Locked — Vite 6 + React 19 + TS strict, Tailwind v4 + shadcn, Dexie + `useLiveQuery`, Zustand (UI-only), Zod v4 + RHF, vite-plugin-pwa | `tech.md` |
| Overdue thresholds | none <80% ≤ due-soon <100% ≤ overdue <150% ≤ very-overdue; never overdue without frequency or without a first completion | `AGENTS.md`, Req 2.6–2.9 |
| IDs | `crypto.randomUUID()` | `design.md` |
| Date storage | Dexie stores `Date` natively — no ISO serialization in-app | step 2 |
| CSV dates | Strings only in CSV; canonical format + parse/format round-trip + timezone policy decided and documented in step 8 (**RISK**) | step 8 |
| Seeding | 10 default categories + `AppSettings` singleton (`id:'1'`); **idempotent**, called once at bootstrap | steps 2, 4 |
| Gestures | Swipe / long-press **deferred to Phase 2**; checkbox/button is the Phase 1 completion path (deviates from Req 5.3 — noted intentionally) | user decision |
| Navigation | Single-screen shell + top segmented toggle; terracotta FAB for Add Task; settings gear top-right. **No bottom nav.** `BottomNav.tsx` in `structure.md` is retired — do not scaffold it | `app-pages-prompts.md` Navigation Model |
| Default view | By Category; light theme default | `app-pages-prompts.md` |
| Dev workflow | Native pnpm (`dev`/`preview`/Vitest/Playwright); no Docker in the dev loop | user decision |
| Production | Docker image serving static `dist/`, mirroring `galley` conventions (node:22-alpine, non-root, `/health`, compose PORT/TZ/restart, Cloudflare-Tunnel-style auth). Stateless — no volume | user decision |

### Known doc conflict (not fixed here)

`structure.md` still lists `components/layout/BottomNav.tsx`, which
`app-pages-prompts.md` explicitly retired. Steps 4's doc calls this out so nobody
scaffolds it. Reconciling `structure.md` itself is a separate docs-fix task.

---

## File-path glossary (from `structure.md`)

```
src/
├── main.tsx                    # entry: mounts router + providers; calls seed-on-boot
├── routes/
│   ├── __root.tsx              # nav shell + providers
│   ├── index.tsx               # By Category (default)
│   ├── time.tsx                # By Time
│   ├── tasks.$taskId.tsx       # Add/Edit task (new vs existing id)
│   └── settings.tsx
├── components/
│   ├── ui/                     # shadcn primitives (owned, generated via CLI)
│   ├── task/                   # TaskCard, TaskForm, TaskList, TaskCompletionButton
│   ├── category/               # CategoryBadge, CategoryForm
│   └── layout/                 # AppShell (NO BottomNav)
├── lib/
│   ├── db/schema.ts            # Dexie class, table schema, versioning, seed fn
│   ├── tasks.ts                # createTask, markTaskComplete, undoComplete, archive…
│   ├── categories.ts           # createCategory, deleteCategory (reassignment)…
│   ├── overdue.ts              # pure calculateOverdueStatus(task, now)
│   ├── time-format.ts          # human-readable elapsed time
│   └── export-import.ts        # dexie-export-import (JSON) + CSV
├── schemas/                    # task.ts, category.ts, settings.ts (Zod v4)
├── stores/ui-store.ts          # Zustand — transient UI only
├── types/index.ts             # mostly z.infer<typeof schema>
├── styles/globals.css          # Tailwind v4 @theme tokens (Soft Daylight)
└── test/setup.ts               # fake-indexeddb/auto, RTL cleanup, vitest-axe matchers
e2e/                            # Playwright specs
```

---

## Requirements coverage matrix

Every README Phase 1 bullet and every `requirements.md` requirement maps to at
least one owning step. No orphans.

| README Phase 1 bullet | Owning step(s) |
|-----------------------|----------------|
| Create / Edit / Archive / Delete tasks | 2 (schema), 3 (logic), 7 (form + actions) |
| "Just Done" completion logic | 3 (lib + overdue/undo), 5 (UI + undo window) |
| Category and Time views | 5 (By Category), 6 (By Time) |
| Local data storage (IndexedDB) | 2 |
| CSV Import/Export | 8 (+ JSON) |
| Full accessibility compliance | 4·5·6·7·8 (per-step), 9 (audit) |

| Requirement | Owning step(s) |
|-------------|----------------|
| Req 1 — Task Management | 2, 3, 7 |
| Req 2 — Completion Tracking (elapsed, undo, 3-tier overdue) | 3, 5 |
| Req 3 — Category Organization | 2 (seed), 3 (logic + guard), 5 (grouping), 7 (mgmt) |
| Req 4 — Time-Based Views (+ remember preference 4.6) | 4 (remember view), 6 |
| Req 5 — Quick Completion Interface | 5 (checkbox/keyboard); 5.3–5.4 gestures → Phase 2 |
| Req 6 — Accessibility | 4·5·6·7·8 (per-step), 9 (holistic audit) |
| Req 7 — Data Persistence & Backup | 2 (IndexedDB), 8 (export/import, backup reminder, quota) |
| Req 8 — UX & Interface (8.1 onboarding → Phase 2) | 4, 5, 6, 7, 8 |
| Req 9 — Performance | 1 (build), 4 (code splitting), 9 (budgets, virtualization) |
| Req 10 — Content & Messaging | all (enforced per-step via content guide) |
```
