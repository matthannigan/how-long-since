# How Long Since — Developer Guide

> **Start here when returning to this project.** This guide is written so you
> can pick the work back up after a month away: run everything, find
> everything, remember the conventions, and know what the natural next step
> is. It summarizes and indexes; the linked docs carry the depth.

## What this is

"How Long Since" is a local-first household task tracker — a PWA that answers
*"how long has it been since I last did this?"* instead of managing due dates.
All data lives in the browser's IndexedDB; there is no server, no account, and
nothing uploaded. What it does and how it behaves, with screenshots:
[USER_GUIDE.md](USER_GUIDE.md).

**Status: 1.0.0, shipped 2026-07-07.** Three chunks of work are done and on
`main` — the Phase 1 MVP, Phase 1.1 (instances & series), and the user
guide — each detailed in [CHANGELOG.md](../CHANGELOG.md). Phase 2 is scoped
as ordered batches in [ROADMAP.md](ROADMAP.md) (not started); Phase 3 remains
unscoped — see [Where we left off](#where-we-left-off--whats-next).

## Run it

Prereqs: **Node ≥ 22** ([.nvmrc](../.nvmrc) says `22`) and **pnpm** — the
repo pins `pnpm@10.33.0` via `packageManager`, so `corepack enable` is enough.
Then `pnpm install`.

| Command | What it does |
|---|---|
| `pnpm dev` | Vite dev server on **:5173** (strictPort; `PORT` env overrides). DEV builds also seed 15 sample tasks — see [seeding](#data--schema-essentials). |
| `pnpm build` | `tsc -b` (typecheck) then production build to `dist/` |
| `pnpm preview` | Serve the built `dist/` locally |
| `pnpm test` / `pnpm test:watch` | Vitest unit/component tests (once / watch) |
| `pnpm typecheck` | Type-only project-references build |
| `pnpm lint` / `pnpm format` | ESLint / Prettier |
| `pnpm e2e` | Playwright suite — **builds first**, runs against `vite preview` on **:4173** |
| `pnpm screenshots` | Recaptures the 12 user-guide PNGs (separate Playwright config, also :4173) |
| `pnpm generate-user-guide` | Renders `docs/USER_GUIDE.md` → `public/user-guide.html` |
| `pnpm curly-quotes` | Straight→curly quotes in `docs/USER_GUIDE.md`, in place |
| `pnpm generate-pwa-assets` | Regenerates PWA icons from `public/favicon.svg` |

Ports: **5173** dev · **4173** e2e/screenshots preview · **3000** Docker.
The Claude Code preview panel uses [.claude/launch.json](../.claude/launch.json)
(`dev` configuration).

CI ([.github/workflows/ci.yml](../.github/workflows/ci.yml)) runs
`pnpm lint && pnpm typecheck && pnpm test && pnpm e2e` on every push and PR to
`main`, plus a bundle-size report (workflow step summary) and a check that
CHANGELOG.md mentions the package.json version. Still run the suite locally
before pushing — CI is the net, not the workflow.

## Repo map

| Path | What lives there |
|---|---|
| `src/routes/` | TanStack Router file routes: `/` Quick Wins (default) · `/category` · `/time` · `/categories` · `/tasks/$taskId` · `/settings` |
| `src/components/` | `task/`, `category/`, `layout/`, `settings/`, and owned shadcn primitives in `ui/` |
| `src/lib/` | All business logic as plain async functions; `lib/db/` holds the Dexie schema + seeding |
| `src/schemas/` → `src/types/` | Zod v4 schemas are the source of truth; types are `z.infer` derivations |
| `src/stores/` | `ui-store.ts` — Zustand, transient UI state only |
| `src/styles/globals.css` | Every Soft Daylight design token (Tailwind v4 `@theme`) |
| `e2e/` | Playwright specs; `e2e/screenshots/` is the user-guide capture harness |
| `scripts/` | Standalone generators (user-guide HTML, curly quotes) — never wired into `build` |
| `server/` + `Dockerfile` | Zero-dependency static server + multi-stage image |
| `docs/` | Living documentation (this file and everything in [the index](#where-the-documentation-lives)) |
| `dev/` | Dated per-batch planning archives — plans, step prompts, decision registers |

Full tree and naming/import conventions: [ARCHITECTURE.md](ARCHITECTURE.md)
§"Project Structure".

## Architecture in 60 seconds

- **Reads** — components call `useLiveQuery` against Dexie directly; results
  re-render on any data change. No fetch layer, no cache to invalidate.
- **Writes** — plain async functions in `src/lib/` (`createTask`,
  `markTaskComplete`, …) that Zod-parse input and hit Dexie. No service
  classes, no response envelopes; errors throw.
- **Zustand** holds only transient UI state (open modals, undo snackbar).
  Anything persistent — including `currentView` and theme — lives in the
  Dexie `settings` table so it could sync in Phase 3.
- `src/routeTree.gen.ts` is **generated** by the router plugin; never edit it.

Why it's built this way (and the Phase 3 Dexie Cloud sync plan that motivated
the stack): [ARCHITECTURE.md](ARCHITECTURE.md).

## Data & schema essentials

- Database `HowLongSinceDB`, four stores (`tasks`, `categories`, `settings`,
  `completions`), currently **schema version 3** (v2 migrated the
  `timeCommitment` enum; v3 added the silent, append-only `completions` log —
  Phase 2 B6 groundwork shipped inside 1.0.0, backfilled with one synthetic
  row per already-completed task). Defined in
  [src/lib/db/schema.ts](../src/lib/db/schema.ts).
- **Boolean-index trap:** IndexedDB can't index booleans, so
  `where('isArchived')` silently returns nothing. Views read whole tables and
  filter archived tasks **in memory**. Don't "optimize" this back into a
  `where`.
- Phase 1.1's `instanceLabel`/`seriesId` were added **without** a version bump
  or index, on purpose — grouping runs in memory (`src/lib/series.ts`) and
  pre-1.1 backups still import.
- **Two seed paths:** `seedDatabase()` runs on every boot and idempotently
  creates the 10 fixed-UUID default categories + the settings singleton
  (`id: '1'`); `seedSampleTasks()` (15 tasks incl. a 3-task series) runs in
  **`pnpm dev` only** — preview, e2e, and production always start clean.
- **Backup envelope:** `{ app: 'how-long-since', schemaVersion: 3, exportedAt,
  data: { tasks, categories, settings, completions } }` — Zod-validated on
  import; JSON is the only restore format; import **replaces** everything.
  Pre-v3 backups (no `completions` key) import fine — one bootstrap row is
  synthesized per completed task; an explicit `[]` is trusted as-is.
- Dexie Cloud wiring for Phase 3 sits commented out at the bottom of the
  schema constructor.

## Generated files — what regenerates what

| Committed artifact | Regenerate with | Notes |
|---|---|---|
| `src/routeTree.gen.ts` | `pnpm dev` (router plugin) | Never edit; regenerates on route-file changes |
| `public/images/user-guide/*.png` (12) | `pnpm screenshots` | Deterministic capture: mobile 390×844@2x, light theme, seeded via the app's own import flow (`e2e/screenshots/fixture.ts`) |
| `public/user-guide.html` | `pnpm generate-user-guide` | Never hand-edit (it carries a do-not-edit banner). Its pre-paint theme script is copied from `index.html` — that's the source of truth |
| PWA icons in `public/` | `pnpm generate-pwa-assets` | From `public/favicon.svg` |

**Order matters after a UI change:** `pnpm screenshots` **first**, then
`pnpm generate-user-guide` — the generator exits 1 if the Markdown references
an image that isn't on disk. After editing `docs/USER_GUIDE.md` prose, run
`pnpm generate-user-guide` (it curls quotes itself) and commit both files.
Never run `scripts/curly-quotes-html.mjs` against the generated HTML.

## Testing

- **Unit/component (Vitest)** — colocated `*.test.ts(x)` next to source.
  Config lives in the `test:` block of [vite.config.ts](../vite.config.ts);
  `src/test/setup.ts` wires `fake-indexeddb/auto` (real in-memory IndexedDB
  for Dexie — nothing to mock), RTL cleanup, and `vitest-axe` matchers.
- **E2E (Playwright)** — 9 specs in `e2e/`: smoke, quick-wins,
  create-complete-undo-archive, view-switch-remember, import-export, series,
  offline, install-manifest, user-guide. Shared helpers in `e2e/helpers.ts`.
  Runs against the **production preview build** (`:4173`), so the service
  worker registers and no dev seed runs — every test starts from a clean DB.
- **Screenshot harness** — `playwright.screenshots.config.ts` is a separate
  config, *not* a project in the main one: the main config's `testDir` is
  recursive, and merging them would make every `pnpm e2e` re-capture
  screenshots. The main config ignores `screenshots/**`.

## Deployment

Stateless static PWA: a multi-stage `node:22-alpine` image builds with pnpm,
then the runtime stage runs [server/index.mjs](../server/index.mjs) — a
zero-dependency Node server (health endpoint, PWA-aware cache headers,
SPA fallback) — as a non-root user with no runtime `node_modules`.
`docker compose up --build`, then http://localhost:3000. Full instructions,
env vars, and the network-layer security stance:
[README.md](../README.md#deployment).

## Conventions & gotchas

- **Commits:** Conventional Commits, with a `(Phase X, Step N)` suffix during
  phase work. Features have gone to `main` via GitHub PRs.
- **Route files export only `Route`** — anything else breaks the router
  plugin's automatic code-splitting. Shared code goes in `components/`/`lib/`.
- **`CategoryForm` renders a `<div>`, not a `<form>`** — it's mounted inside
  the task form's DOM tree, and nested forms submit the parent. Don't "fix"
  it back to a form element.
- **Zod `.optional()` fields and updates:** `updateTask` treats an explicit
  `undefined` for `instanceLabel` as "clear the label" — omit the key to
  leave it unchanged. (Locked decision; see the Phase 1.1 register.)
- **The completions log rides every complete/undo:** `markTaskComplete`
  returns `{ previous, completionId }`, and one undo must delete **all** rows
  a tap-burst appended (the ui-store undo slot carries `completionIds`).
  Deleting a task deliberately keeps its log rows; manual `lastCompletedAt`
  edits do NOT log. See `dev/2026-07-07_completions-log/plan.md`.
- **Instance-label chips commit on blur** as well as Enter/comma — tests and
  future edits should preserve that.
- **The version lives in two places:** `package.json` and
  [CHANGELOG.md](../CHANGELOG.md) — bump both on release. The About section
  reads `__APP_VERSION__`, injected from package.json at build time
  (`define` in [vite.config.ts](../vite.config.ts)); CI fails if the
  CHANGELOG doesn't mention the current version.
- **Workbox denylist:** `/user-guide.html` and its images are excluded from
  the precache and SPA navigation fallback (otherwise the installed app's SW
  would serve the app shell instead of the guide) and cached
  StaleWhileRevalidate at runtime. Keep that block intact in
  `vite.config.ts` if you touch PWA config.
- Archived tasks have **no unarchive UI** — `lib/tasks.ts` ships an unused
  `unarchiveTask()`; today users restore by importing a backup that contains
  the task. A candidate small feature.

## Where the documentation lives

Living references, all in `docs/`:

| Doc | Source of truth for |
|---|---|
| [USER_GUIDE.md](USER_GUIDE.md) | User-facing behavior, with screenshots (also served in-app at `/user-guide.html`) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack rationale, data layer, patterns, project structure, Phase 3 sync plan |
| [ROADMAP.md](ROADMAP.md) | Phase 2 scope: ordered feature batches, schema strategy, the cut line |
| [REQUIREMENTS.md](REQUIREMENTS.md) | EARS functional requirements (Req 1–11, annotated for what's Phase 2) |
| [STYLE_GUIDE.md](STYLE_GUIDE.md) | Soft Daylight tokens (§1 — `globals.css` traces to it), typography, component specs, AA reconciliation |
| [CONTENT_STRATEGY_GUIDE.md](CONTENT_STRATEGY_GUIDE.md) | Tone and every user-visible string, incl. §11 instances-&-series copy |
| [USER_PERSONAS.md](USER_PERSONAS.md) | Illustrative example users (explicitly not a targeting mechanism) |
| [../CHANGELOG.md](../CHANGELOG.md) | What shipped, when |

[`AGENTS.md`](../AGENTS.md) (symlinked as `CLAUDE.md`) is the AI-assistant
context file: data models, thresholds, token quick-reference. **Keep it
updated** when the data model or conventions change — assistants read it
before anything else.

**The `dev/` archive** is the project's memory. Each work batch gets a dated
folder — `dev/2026-07-01_phase1-mvp/`, `dev/2026-07-03_grouped-tasks/`,
`dev/2026-07-07_user-guide/` — containing a plan (`phase1.md` / `phase1.1.md`
/ `plan.md`) that doubles as a **decisions register**, plus per-step execution
prompts (`*_stepN.md`). When you wonder *why* something is built the way it
is, read the decisions table in the relevant register first — e.g. the
instances-&-series design rationale (no new table, no index, in-memory
grouping) is all in
[phase1.1.md](../dev/2026-07-03_grouped-tasks/phase1.1.md). The phase-1
folder also holds the frozen planning docs that predate this guide
([what moved where](../dev/2026-07-01_phase1-mvp/docs/README.md)).

## Where we left off & what's next

**Last work (2026-07-07):** shipped 1.0.0 — the user guide
([plan](../dev/2026-07-07_user-guide/plan.md)), the developer-docs
consolidation, Phase 2 scoping ([ROADMAP.md](ROADMAP.md)), and B0
(CI + `APP_VERSION` wiring,
[plan](../dev/2026-07-07_b0-housekeeping/plan.md)).

**Stubs already in the code, waiting for Phase 2/3:**

- Settings → Notifications: disabled "Coming soon"
  ([NotificationsSection.tsx](../src/components/settings/NotificationsSection.tsx))
- Settings → About: "Send Feedback" placeholder
  ([AboutSection.tsx](../src/components/settings/AboutSection.tsx))
- Dexie Cloud config, commented out in
  [schema.ts](../src/lib/db/schema.ts) — the Phase 3 on-ramp, with the full
  plan in [ARCHITECTURE.md](ARCHITECTURE.md#phase-3-turning-on-sync)

**Roadmap** ([ROADMAP.md](ROADMAP.md) is canonical for Phase 2; the
[README](../README.md#roadmap) keeps the phase-level summary):

- **Phase 2 — Enhanced Experience:** scoped 2026-07-07 as ten independently
  shippable batches (B0–B9) ordered by daily-use value — start from the
  at-a-glance table in [ROADMAP.md](ROADMAP.md). B0 (CI + version wiring)
  shipped with 1.0.0; B1 (find & focus) is next, and the B9 notifications
  spike can run anytime
  ([handoff prompt](../dev/2026-07-07_notifications-research/prompt.md)).
- **Phase 3 — Cloud & Community:** accounts, sync, shared households
  ("Partner A sees when Partner B completed a task") — via Dexie Cloud, per
  the ARCHITECTURE plan. Unscoped; gated on B9's findings.

**Smaller known gaps**: no unarchive UI (see gotchas; scheduled as ROADMAP
B1), and notifications unbuilt (B9 — a ready-to-run handoff prompt sits at
[dev/2026-07-07_notifications-research/prompt.md](../dev/2026-07-07_notifications-research/prompt.md)).
CI and `APP_VERSION` wiring shipped with 1.0.0 (B0).

**How to start the next batch** (the working convention so far):

1. Create `dev/YYYY-MM-DD_slug/plan.md` — context, user-confirmed decisions,
   steps, verification; keep a decisions register as you go.
2. Work the steps; keep unit/e2e green (`pnpm test && pnpm lint &&
   pnpm typecheck && pnpm e2e`).
3. On ship: update [CHANGELOG.md](../CHANGELOG.md) and the README status/
   roadmap; update [AGENTS.md](../AGENTS.md) if the data model or conventions
   changed; if the UI changed, recapture `pnpm screenshots` and regenerate
   `pnpm generate-user-guide`; bump the version in all three places.
