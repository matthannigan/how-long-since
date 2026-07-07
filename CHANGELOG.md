# Changelog

All notable changes to How Long Since are documented here. The format is based
on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project
aims to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-07-07

The first public release: a complete, installable, offline-capable PWA for
tracking how long it's been since you last did each recurring task. Built across
five chunks of work — the Phase 1 MVP, the Phase 1.1 instances & series feature,
and this release's user documentation, developer-docs consolidation, and release
engineering. It also ships the scoped Phase 2 roadmap and — pulled forward from
that roadmap's B6 — a silent completion log, so history accrues from the very
first real-world completion.

### MVP foundation

See [`dev/2026-07-01_phase1-mvp/phase1.md`](dev/2026-07-01_phase1-mvp/phase1.md).

- **Tasks** — create, edit, archive, and delete tasks with name, category,
  optional time estimate, expected frequency, and last-done date.
- **"Just Done" completion** — one-tap completion with a 5-second Undo that
  restores the exact previous date.
- **Overdue tracking** — due-soon / overdue / very-overdue tiers computed as a
  percentage of each task's own interval, so daily and yearly tasks are judged
  fairly. Never-completed tasks are never overdue.
- **Three views** — Quick Wins ("how much time do you have?"), By Category, and
  By Time; the app remembers your last view.
- **Categories** — ten built-in categories plus full create / edit / delete with
  reassignment rules.
- **Local-first storage** — all data in the browser via IndexedDB (Dexie); no
  account, nothing uploaded.
- **Backup & restore** — full JSON export/import (the restore path) plus a
  tasks-only CSV export, with a two-week backup reminder.
- **Accessibility** — WCAG 2.1 AA: keyboard navigation, screen-reader support,
  non-color status cues, high-contrast and reduced-motion modes, and adjustable
  text size.
- **PWA** — installable, works fully offline, updates silently.
- **Deployment** — a stateless, non-root Docker image served by a
  zero-dependency Node static server.

### Add instances & series

See [`dev/2026-07-03_grouped-tasks/phase1.1.md`](dev/2026-07-03_grouped-tasks/phase1.1.md).

- **Track one job in many places** — "Track in multiple places" fans a single
  Add Task out into one task per place or pet (e.g. five bedrooms, two dogs),
  each completing independently.
- **Category-scoped label suggestions** — reuse "where or who" labels already
  used in the selected category.
- **Series group rows** — siblings collapse into one expandable row in By
  Category and By Time, with a "{n} places" chip and a worst-of-siblings overdue
  summary; they rank independently in Quick Wins.

### User documentation

See [`dev/2026-07-07_user-guide/plan.md`](dev/2026-07-07_user-guide/plan.md).

- **User Guide** ([`docs/USER_GUIDE.md`](docs/USER_GUIDE.md)) — a friendly,
  screenshot-driven walkthrough of every major feature.
- **In-app guide** — an HTML version served at `/user-guide.html`, theme-aware
  and offline-capable, linked from Settings → About & Help.
- **Tooling** — a deterministic Playwright screenshot harness (`pnpm
  screenshots`) and a Markdown-to-HTML generator (`pnpm generate-user-guide`),
  both run manually with their outputs committed.

### Developer documentation & docs reorganization

- **Developer Guide** ([`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md)) —
  the pick-it-back-up entry point: commands and ports, repo map, architecture
  in 60 seconds, the generated-files regeneration matrix, conventions and
  gotchas, a documentation index, and "where we left off & what's next."
- **Docs consolidation** — the living reference docs moved back from the
  phase-1 archive into `docs/` with consistent names (`REQUIREMENTS.md`,
  `STYLE_GUIDE.md`, `CONTENT_STRATEGY_GUIDE.md`, `USER_PERSONAS.md`), and the
  three architecture planning docs merged into a single as-built
  [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Superseded planning material
  stays frozen under
  [`dev/2026-07-01_phase1-mvp/docs/`](dev/2026-07-01_phase1-mvp/docs/README.md).
- **Accuracy pass** — the migrated docs now describe the shipped app: a new
  instances-&-series requirement (Req 11), Phase 2 annotations on unshipped
  copy and criteria, self-hosted fonts, the hand-rolled JSON backup, and the
  data-layer gotchas worth remembering.
- **Housekeeping** — README and AGENTS.md statuses and links refreshed, and
  `package.json` aligned to 1.0.0 to match this changelog and the in-app
  About section.

### Phase 2 roadmap

- **Roadmap** ([`docs/ROADMAP.md`](docs/ROADMAP.md)) — Phase 2 scoped as ten
  independently shippable batches (B0–B9) ordered by daily-use value, with
  per-batch briefs grounded in the as-built code, a schema-change strategy, a
  cut line, and a parking lot. README, the Developer Guide, and AGENTS.md
  point to it, and a ready-to-run handoff prompt for the B9 notifications
  spike sits at
  [`dev/2026-07-07_notifications-research/prompt.md`](dev/2026-07-07_notifications-research/prompt.md).

### Release engineering (Phase 2, B0)

See [`dev/2026-07-07_b0-housekeeping/plan.md`](dev/2026-07-07_b0-housekeeping/plan.md).

- **Continuous integration** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml))
  — lint, typecheck, unit/component tests, and the Playwright e2e suite
  (built first, run against the production preview) on every push and pull
  request to `main`.
- **Bundle-size report** — each CI run publishes a per-asset size table
  (raw + gzipped) to the workflow summary, giving the "minimal bundle"
  requirement (Req 11.7) a tripwire before Phase 2 adds its first new
  runtime dependencies.
- **Version guard** — CI fails if `CHANGELOG.md` has no entry for the
  current `package.json` version.
- **`APP_VERSION` wired to package.json** — the About section's version is
  now injected at build time (`__APP_VERSION__` via Vite `define`); the
  version lives in two places (package.json + this changelog) instead of
  three.

### Completion log groundwork (Phase 2 B6, pulled forward)

See [`dev/2026-07-07_completions-log/plan.md`](dev/2026-07-07_completions-log/plan.md).

- **Silent, append-only `completions` store** (Dexie v3) — `markTaskComplete`
  logs one row per completion (bursts included) and the 5-second Undo deletes
  exactly the rows its burst appended. No UI yet — that arrives with Phase 2's
  insights batch; shipping the log first means no history is ever lost.
- **Bootstrap synthesis** — one synthetic row per already-completed task: on
  the v3 upgrade, on imports of pre-v3 backups, in the dev seed, and for
  create-time "Last done" backfills.
- **Backups carry history** — the JSON envelope (now `schemaVersion: 3`)
  includes `completions`; older backups import unchanged (bootstrap rows are
  synthesized), an explicit empty list is trusted as-is, and deleting a task
  deliberately keeps its log rows (event-log semantics).

### Notifications research (Phase 2, B9)

See [`dev/2026-07-07_notifications-research/register.md`](dev/2026-07-07_notifications-research/register.md).

- **Decision register** — a dated, sourced 2026 support snapshot (Web Push,
  Badging API, Notification Triggers, Periodic Background Sync) and the verdict:
  in-app "what's due" surfaces are the reminder, a permission-free desktop icon
  badge rides B4, and push waits for Phase 3. No feature was built.
- **Honest Settings copy** — the Notifications section drops the "Coming soon"
  chip and disabled toggles for plain copy: reminders live in the app; phone
  push would need an account and may come with cloud sync later.

[1.0.0]: https://github.com/matthannigan/how-long-since/releases/tag/v1.0.0
