# Phase 1 · Step 4 — App shell + providers + shared UI infrastructure

> Read [`phase1.md`](phase1.md) first for shared conventions and the DoD.

## Objective

Build the navigable app shell and the shared UI infrastructure that every later
UI step consumes: routing across all four routes, the theme/accessibility
provider driven by `AppSettings`, the Zustand UI store, the toast/snackbar host,
a root error boundary, loading skeletons, and the seed-on-bootstrap call. After
this step you can navigate the empty views, switch theme/text-size, and the
"plumbing" for undo and errors exists — with no task rendering yet.

## Prerequisites

- Steps 1–3 complete (toolchain, `db` + `seedDatabase()`, `lib/` logic).

## Context & references

- Navigation model + shell composition: [`app-pages-prompts.md`](../docs/app-pages-prompts.md)
  "Navigation Model", §1 (App Shell & header/toggle), §5 (Settings surfaces).
- Shell/toggle/FAB specs: [`style-guide.md`](../docs/style-guide.md) §3.1 (buttons,
  FAB), §3.4 (view toggle), §3.8, §6 (theming, responsive, dark mode).
- Providers/state: [`design.md`](../docs/architecture/design.md) "Client (UI-only)
  State" (Zustand `ui-store` shape), "Data Validation & Error Handling".
- Settings model: [`AGENTS.md`](../AGENTS.md) `AppSettings`; Req 4.6 (remember view),
  Req 6.9 (reduced motion), Req 8.10 (dark mode).

## Scope / checklist

### Shell & routing
- [ ] `routes/__root.tsx` — providers + `AppShell`; `<Outlet/>` for pages. Route-level **code splitting** (lazy routes) to protect FCP (Req 9.1).
- [ ] `components/layout/AppShell.tsx` — header: app title "How Long Since" (Bricolage 600 22px) left, **settings gear** in a 36px greige circle right (≥44px hit area, links to `/settings`).
- [ ] **View toggle** (segmented "By Category" / "By Time") below the header — a shared control; wire it to navigate between `/` and `/time` and reflect the active route. shadcn/Radix or a custom segmented control per style-guide §3.4.
- [ ] **FAB** (`components/layout/…` or within AppShell) — terracotta 56px squircle, lower-right, `aria-label="Add task"`, **safe-area insets** (`env(safe-area-inset-*)`). For now it navigates to `/tasks/new` (form is step 7); hidden when a modal is open.
- [ ] Page placeholders for `index`, `time`, `settings`, `tasks.$taskId` (real content in steps 5–8).
- [ ] **`BottomNav` is retired — do NOT create `components/layout/BottomNav.tsx`** (structure.md lists it in error; see phase1.md Decisions).

### Providers & persisted preferences
- [ ] Theme/a11y provider reading the `AppSettings` singleton via `useLiveQuery`: applies `theme` (light/dark/system → `[data-theme]`), `textSize`, `highContrast`, `reducedMotion` to the document root. Writes go through a `lib/settings.ts` updater (add it here if not present).
- [ ] **Theme-flash-on-load guard** — a tiny inline pre-hydration script in `index.html` that reads the persisted/system theme and sets `[data-theme]` before first paint (avoid light→dark flash).
- [ ] **`prefers-reduced-motion`** honored at the CSS layer *and* overridable by `AppSettings.reducedMotion`.
- [ ] **"Remember last view"** (Req 4.6): persist `currentView` to the `settings` singleton on toggle; on load, redirect `/` → the remembered view if it's `time`. (Persisted state lives in Dexie, **not** Zustand.)

### Shared UI infrastructure
- [ ] `stores/ui-store.ts` (Zustand) exactly per design.md: `isAddTaskOpen`, `openAddTask`/`closeAddTask`, `undoSnackbar` (`{ taskId, previous }` — note `previous: Date | null` to pair with step 3's `undoComplete`), `showUndo`/`dismissUndo`.
- [ ] **Toast/snackbar host** — a single app-level host (shadcn `sonner`/`toast`) rendering `aria-live` announcements; the vehicle for the undo snackbar (step 5) and save/delete confirmations (steps 7–8). 5-second auto-dismiss with an "Undo" action slot.
- [ ] **Root error boundary** — catches thrown `ZodError`/Dexie errors, shows a friendly recovery UI (content-guide §4.3 "Something went wrong…"). Wrap the router outlet.
- [ ] **Loading skeletons** — `components/task/TaskListSkeleton.tsx` (referenced in design.md) + a generic skeleton; used by `useLiveQuery`'s `undefined` state in steps 5–6.

### Bootstrap
- [ ] `main.tsx` — mount router + providers and **call `seedDatabase()` once** before/at first render (the step 2→4 handshake). Guard so HMR/reloads don't re-run destructively (seed is already idempotent).
- [ ] shadcn primitives needed now (e.g. `button`, `sonner`/`toast`, `skeleton`) added via the CLI into `components/ui/`.

## Try it (manual)

1. `pnpm dev` → shell shows title + gear + the segmented toggle + FAB.
2. Toggle "By Category" / "By Time" → URL switches `/ ↔ /time`; active segment styled; reload keeps you on the last view (remember-view).
3. Open `/settings` placeholder → change theme to Dark → whole app recolors with **no flash** on the next reload; set text size Larger → type scales.
4. Tap the FAB → routes to `/tasks/new` placeholder. Reduce motion in OS → transitions suppressed.
5. Trigger a thrown error (temporarily) → error boundary shows the friendly recovery screen, not a white page.

## Explicitly out of scope

- Rendering real tasks / completion / status → **step 5**.
- The Quick Pick panel and time sections → **step 6**.
- The actual Add/Edit form inside the modal + settings controls' full behavior →
  **steps 7–8** (this step ships the shell, provider, store, host, boundary).
- PWA manifest/icons/offline verification → step 9.

## Acceptance criteria

- All four routes reachable; toggle + gear + FAB work and meet 44px/keyboard/focus.
- Theme, text size, high-contrast, reduced-motion all read from and write to the
  `AppSettings` singleton; no theme flash on load.
- `ui-store`, toast host (with `aria-live`), error boundary, and skeletons exist
  and are importable by later steps.
- `seedDatabase()` runs once at bootstrap; app data is never held in Zustand.
- Meets the shared Definition of Done in [`phase1.md`](phase1.md).

## Risks / decisions

- **`BottomNav` conflict** — see Decisions register; do not scaffold it.
- **Toast host is shared infra** — build it here so step 5 (undo) and steps 7–8
  (confirmations) consume one host, not three.
- **`undoSnackbar.previous` type** must be `Date | null` to round-trip step 3's
  `markTaskComplete`/`undoComplete` contract.
- **Remember-view redirect** should not fight the toggle (avoid redirect loops);
  redirect only on initial load of `/`.
