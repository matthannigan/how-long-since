# Phase 1 · Step 9 — Accessibility hardening, PWA/offline, performance & E2E

> Read [`phase1.md`](phase1.md) first for shared conventions and the DoD.

## Objective

Turn the feature-complete app into a shippable one: close accessibility gaps that
can only be found on the assembled app, finalize the installable offline PWA,
prove the core flows with Playwright, and verify performance budgets. This is an
**audit + hardening** pass — a11y and content were already acceptance criteria in
every prior UI step; here we validate holistically and fix what surfaces.

## Prerequisites

- Steps 1–8 complete (the app is feature-complete and each component already
  ships a passing `vitest-axe` test).

## Context & references

- Accessibility: [`requirements.md`](../docs/requirements.md) Req 6 (all), Req
  4.7 (focus on view switch), Req 5.7–5.8 (targets/keyboard), Req 9 (performance).
- A11y implementation notes: [`style-guide.md`](../docs/style-guide.md) §1.6
  (AA reconciliation), §6 (accessibility guidelines); [`design.md`](../docs/architecture/design.md)
  "Accessibility Implementation".
- PWA config: [`design.md`](../docs/architecture/design.md) "PWA / Offline";
  [`tech.md`](../docs/architecture/tech.md) PWA/Testing.
- Performance targets: Req 9.1–9.10 (FCP < 1.5s, TTI < 3s, 60fps, 200ms view
  transitions, virtualization if needed).

## Scope / checklist

### Accessibility (holistic audit + fixes)
- [ ] Full **keyboard walkthrough**: create → complete → undo → edit → archive/delete → switch views → settings → import/export. Logical tab order, visible focus, no traps except the intended modal.
- [ ] **Focus management on view switch** (Req 4.7) — verify/finish the intent wired in the views (`QuickWinsView`/`ByTimeView` focus their region on mount); check all **three** switches (Quick Wins ↔ By Category ↔ By Time); focus lands somewhere sensible, not lost to `<body>`.
- [ ] **`aria-live`** announcements confirmed for: completion, undo, save/delete, import/export results, validation errors, backup reminder.
- [ ] **200% text zoom / resize** (Req 6.8) — no horizontal scrolling, no clipped controls, in both views and the modal.
- [ ] **Reduced motion** end-to-end (Req 6.9) — OS setting and the `AppSettings` toggle both suppress animation.
- [ ] **High-contrast mode** — swaps the warm text ramp for `--ink` + stronger borders (style-guide §1.6/§6); still AA+.
- [ ] **Contrast sweep** — small informational text uses the AA-safe tokens (`#6E675E`/`#B2452F`/`#8A5E15`), not the decorative soft grays.
- [ ] **Screen-reader pass** (VoiceOver + one of NVDA/Narrator): status tiers announce "Overdue"/"Very overdue"; category + count announced; controls labelled.
- [ ] App-wide `vitest-axe` gap-closure for any composite views not covered per-component.

### PWA / offline
- [ ] Finalize `vite-plugin-pwa`: complete **manifest** (name, short_name, `theme_color`, description, display standalone), **icons** (192 + 512, maskable), Workbox precache of the app shell.
- [ ] **Installable** (Chrome/Safari add-to-home-screen) and **works fully offline** — reads/writes hit IndexedDB with no network; the app shell is cached (self-hosted fonts or cached font requests).
- [ ] Auto-update prompt behaves (`registerType: 'autoUpdate'`).

### Performance
- [ ] Measure **FCP < 1.5s** and **TTI < 3s** (Lighthouse / Playwright trace) on a production build; confirm route-level code splitting (step 4) is effective.
- [ ] **View transitions < 200ms**; **60fps** while scrolling a large list — add list **virtualization** only **if** a large-task-count test shows jank (Req 9.4, 9.8).
- [ ] Loading states for any op > 100ms (Req 9.9) — skeletons already exist; confirm they show.

### End-to-end (Playwright, `e2e/`)
- [ ] **create → complete → undo → archive** happy path.
- [ ] **import/export round-trip** (JSON and CSV) — export, clear, re-import, assert data identical (pairs with step 8).
- [ ] **offline** — load, go offline, add/complete a task, reload → data persists.
- [ ] **view switch + remember-view** across reloads — cover all **three** views (Quick Wins / By Category / By Time); a reload restores the last-selected view, and a fresh install lands on **Quick Wins** (the default).
- [ ] **Quick Wins** spec — pick a time window (radio), assert the fitting tasks appear **capped at 8**, and complete + undo a task from the view.
- [ ] A basic **install/manifest** check.

## Try it (manual)

1. `pnpm build && pnpm preview` → Lighthouse: PWA installable, a11y ~100, FCP/TTI within budget.
2. Install to home screen; turn off Wi-Fi → app launches, add/complete tasks, reload → data intact.
3. Zoom text to 200% → no horizontal scroll; navigate the whole app with only the keyboard; run VoiceOver over a list of mixed-status tasks.
4. `pnpm e2e` → all specs green.

## Explicitly out of scope

- Docker image / production serving → **step 10**.
- New features — this step only hardens and verifies what steps 1–8 built.
- Phase 2/3 items (onboarding, templates, cloud, notifications).

## Acceptance criteria

- WCAG 2.1 AA verified holistically: keyboard, focus-on-switch, aria-live, 200%
  reflow, reduced motion, high contrast, contrast tokens, screen-reader pass.
- Installable PWA that works fully offline; auto-update works.
- FCP < 1.5s, TTI < 3s, view transitions < 200ms on a production build; no list jank.
- Playwright covers create/complete/undo/archive, import/export round-trip, offline,
  and remember-view; `pnpm e2e` green.
- Meets the shared Definition of Done in [`phase1.md`](phase1.md).

## Risks / decisions

- **Virtualization is conditional** — only add it if measurement shows jank; don't
  pre-optimize (it complicates focus/scroll restoration).
- **Offline fonts** — if fonts are CDN-loaded, they must be cached or self-hosted,
  or first offline paint loses the type system.
- **Screen-reader coverage** — automated axe won't catch announce-timing; the
  manual SR pass is required, not optional.
