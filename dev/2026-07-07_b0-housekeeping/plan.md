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
  *(Update: first run went green 2026-07-07 — ~2 min total, 17 e2e specs
  serial, zero retries.)*

## Bundle-size baseline — 1.0.0

Recorded 2026-07-07 from a local production build at commit `7851257`
(byte-identical sources to the first green CI run at `5a470fd` — only
docs/CI-config commits in between). Gzip figures via zlib level 6, matching
CI's `gzip -c` to within header bytes. CI regenerates this table on every
run in the workflow **Summary** tab; this copy is the canonical Req 11.7
reference point.

| Asset | Raw | Gzipped |
|---|---:|---:|
| `index-Cd8QV2iR.js` | 658,885 (643K) | 206,664 (202K) |
| `index-CnUa6_lv.css` | 43,456 (42K) | 8,640 (8.4K) |
| `bricolage-grotesque-latin-wght-normal-DLoelf7F.woff2` | 41,344 (40K) | 41,377 (40K) |
| `dm-sans-latin-wght-normal-Xz1IZZA0.woff2` | 36,932 (36K) | 36,852 (36K) |
| `settings-CV_bvjyW.js` | 35,448 (35K) | 12,267 (12K) |
| `bricolage-grotesque-latin-ext-wght-normal-CcLUaPy7.woff2` | 18,668 (18K) | 18,696 (18K) |
| `dm-sans-latin-ext-wght-normal-BOFOeGcA.woff2` | 18,228 (18K) | 18,256 (18K) |
| `bricolage-grotesque-vietnamese-wght-normal-BUzh504Q.woff2` | 8,608 (8.4K) | 8,631 (8.4K) |
| `TaskListSkeleton-CWHLBmm2.js` | 7,557 (7.4K) | 2,895 (2.8K) |
| `categories-DjEgduGs.js` | 4,402 (4.3K) | 1,696 (1.7K) |
| `tasks._taskId-DcoMI8T9.js` | 2,798 (2.7K) | 1,061 (1.0K) |
| `category-P8NcKRzO.js` | 2,737 (2.7K) | 1,255 (1.2K) |
| `TaskSeriesGroup-5CsLryz0.js` | 2,600 (2.5K) | 1,101 (1.1K) |
| `index-CFgwV7GH.js` | 1,757 (1.7K) | 890 (890) |
| `time-DauwwltP.js` | 1,446 (1.4K) | 760 (760) |
| `radio-group-HFXuWxmF.js` | 1,035 (1.0K) | 573 (573) |
| **Total (js+css+woff2)** | **885,901 (865K)** | **361,614 (353K)** |

- **Service-worker precache: 27 entries, 879.69 KiB** — the effective cost
  of each app update on installed clients (the user guide and its
  screenshots are deliberately excluded from the precache).
- Total `dist/` on disk: 2,437,676 bytes (2.3M) — includes the non-precached
  user-guide page and its screenshots.
- The `.woff2` rows gzip *larger* than raw: fonts are already compressed, so
  their raw size **is** their wire size. Notable because the zero-dependency
  production server sends everything uncompressed — the gzipped column only
  becomes the wire cost behind a compressing front (Cloudflare/nginx/Caddy),
  which the README already recommends.
- `settings-*.js` at 35K is the PapaParse isolation working — it never joins
  the entry chunk.

**How to read future runs (the Req 11.7 tripwire):**

- `index-*.js` should stay flat through B1 (no new dependencies planned).
- B5's dnd-kit must appear as growth in the `categories-*.js` chunk, and
  B7's driver.js as its own lazy chunk — growth in `index-*.js` instead
  means the bundle discipline failed.
- When Phase 2's first runtime dep lands, consider giving this baseline
  teeth: a CI step that fails if `index-*.js` exceeds a margin over this
  record (e.g. ~700K raw), or if the precache total passes ~1 MiB.
