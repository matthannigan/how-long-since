# B0 — Housekeeping before features (Phase 2, batch 0)

**Executed 2026-07-07, same day Phase 2 was scoped — and folded into the
1.0.0 release by explicit decision (Matt):** B0 is release engineering, not a
feature, and 1.0.0 had not yet been pushed or tagged. Scope per
[docs/ROADMAP.md](../../docs/ROADMAP.md) § B0.

## What shipped

- **CI** ([.github/workflows/ci.yml](../../.github/workflows/ci.yml)) — one
  sequential job on push/PR to `main`: install → lint → typecheck → unit
  tests → CHANGELOG version guard → Playwright e2e (chromium; `pnpm e2e`
  builds via the Playwright `webServer`) → bundle-size report to the step
  summary; Playwright HTML report uploaded as an artifact on failure.
- **`APP_VERSION` from package.json** — Vite `define` injects
  `__APP_VERSION__` (declared in `src/vite-env.d.ts`), consumed by
  `AboutSection.tsx`; `resolveJsonModule` added to `tsconfig.node.json` for
  the config's JSON import.
- **Docs** — DEVELOPER_GUIDE (CI documented, version gotcha now "two
  places", known-gaps updated), ROADMAP (B0 marked shipped, B9 prompt
  pointer), CHANGELOG (1.0.0 gains "Release engineering"; `[Unreleased]`
  folded in).

## Decisions register

| # | Decision | Why |
|---|---|---|
| 1 | Single sequential CI job, cheapest steps first | Project scale doesn't justify a job matrix; e2e last because it's slowest |
| 2 | Chromium only in CI | Mirrors `playwright.config.ts` projects (Desktop Chrome is the only project) |
| 3 | No Playwright browser cache in v1 | ~90 s install is acceptable; `--with-deps` system packages aren't cacheable anyway; revisit if CI time hurts |
| 4 | Bundle report is a step-summary table, not an enforced budget | A tripwire needs eyes before it needs teeth; add a hard budget once Phase 2's first runtime deps land |
| 5 | Version via `import pkg from './package.json'` + `define`, not `process.env.npm_package_version` | The env var only exists when Vite is launched through pnpm scripts; the JSON import works for any invocation |
| 6 | B0 and the Phase 2 roadmap entry recorded under CHANGELOG **1.0.0**; `[Unreleased]` removed | Matt's call to include B0 in 1.0.0; nothing is pushed/tagged yet, and an `[Unreleased]` section containing work *older* than release content would misorder the log |
| 7 | Only first-party actions (`checkout`, `setup-node`, `pnpm/action-setup`, `upload-artifact`), pinned to major | Smallest trusted surface; `pnpm/action-setup` reads the pinned version from `packageManager` |

## Verification

- `pnpm test && pnpm lint && pnpm typecheck` and the full `pnpm e2e` suite
  green locally after the change.
- About section still renders “v1.0.0” — now sourced from package.json.
- CI itself proves out on the first push to GitHub (nothing pushed at time of
  writing) — check the Actions tab after pushing `main`.
