# Changelog

All notable changes to How Long Since are documented here. The format is based
on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project
aims to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-07-07

The first public release: a complete, installable, offline-capable PWA for
tracking how long it's been since you last did each recurring task. Built across
three chunks of work — the Phase 1 MVP, the Phase 1.1 instances & series feature,
and this release's user documentation.

### Phase 1 — MVP foundation

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

### Phase 1.1 — Instances & series

See [`dev/2026-07-03_grouped-tasks/phase1.1.md`](dev/2026-07-03_grouped-tasks/phase1.1.md).

- **Track one job in many places** — "Track in multiple places" fans a single
  Add Task out into one task per place or pet (e.g. five bedrooms, two dogs),
  each completing independently.
- **Category-scoped label suggestions** — reuse "where or who" labels already
  used in the selected category.
- **Series group rows** — siblings collapse into one expandable row in By
  Category and By Time, with a "{n} places" chip and a worst-of-siblings overdue
  summary; they rank independently in Quick Wins.

### This release — user documentation

See [`dev/2026-07-07_user-guide/plan.md`](dev/2026-07-07_user-guide/plan.md).

- **User Guide** ([`docs/USER_GUIDE.md`](docs/USER_GUIDE.md)) — a friendly,
  screenshot-driven walkthrough of every major feature.
- **In-app guide** — an HTML version served at `/user-guide.html`, theme-aware
  and offline-capable, linked from Settings → About & Help.
- **Tooling** — a deterministic Playwright screenshot harness (`pnpm
  screenshots`) and a Markdown-to-HTML generator (`pnpm generate-user-guide`),
  both run manually with their outputs committed.

[1.0.0]: https://github.com/matthannigan/how-long-since/releases/tag/v1.0.0
