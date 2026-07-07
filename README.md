# How Long Since

A household and personal task management application that tracks *when* tasks were last completed rather than managing traditional to-do lists. The app helps users identify suitable tasks based on available time windows and provides visual indicators for overdue items.

## Overview

"How Long Since" answers the nagging question "How long has it been since...?" for various responsibilities. Built with a Local-First philosophy, all data stays on the user's device with no account required to start.

### Key Differentiators

- **Time-Elapsed Tracking** - Focus on intervals since last completion rather than arbitrary due dates
- **Context-Aware** - Tasks organized by Category (what it is) and Time Commitment (how long it takes)
- **Privacy-Centric** - All data lives on user's device; no account creation required
- **Accessibility First** - Built for diverse abilities (screen readers, high contrast, motor impairments)
- **Instant Feedback** - Rapid entry and "Just Done" checking

## Project Status

Phase 1 (MVP) is implemented: a Vite + React 19 + TypeScript PWA with local IndexedDB storage (Dexie), task and category CRUD, "Just Done" completion with undo, the three views (Quick Wins / By Category / By Time), Settings with JSON/CSV import-export, WCAG 2.1 AA accessibility, and an installable, offline-capable service worker. It also ships a containerized production deployment — see [Deployment](#deployment). Phase 1.1 (Instances & Series) adds multi-location tracking: one "Add task" can fan out into a task per place or pet (five bedrooms, two dogs), with per-category label suggestions and collapsible series rows in the By Category and By Time views. Phases 2–3 (see the [Roadmap](#roadmap)) are still to come; the architecture is described below.

## Planning Documentation

New here? The **[User Guide](docs/USER_GUIDE.md)** explains what the app does and
how to use every feature, with screenshots. It's also served in-app at
`/user-guide.html` (linked from Settings → About & Help). The served HTML and its
screenshots are generated and committed — regenerate them with
`pnpm generate-user-guide` (after editing the Markdown) and `pnpm screenshots`
(after UI changes).

### Vision & Requirements

Stack-agnostic — settled, independent of implementation details.

| Document | Description |
|----------|-------------|
| [Product Briefing](docs/product-briefing.md) | Core product overview, key differentiators, user story, functionality, platform capabilities, accessibility commitment, roadmap, design principles |
| [Requirements](docs/requirements.md) | Full EARS-format functional requirements: task management, completion tracking, categories, time views, accessibility, data persistence, performance, content |
| [User Personas](docs/user-personas.md) | Detailed personas for Alex (busy parent), Jordan (new homeowner), and Pat (active retiree) — example use cases, not the only intended users |

### Design & Content

Also stack-agnostic.

| Document | Description |
|----------|-------------|
| [Style Guide](docs/style-guide.md) | Color palette, typography, UI component patterns, iconography, visual indicators, accessibility implementation guidelines |
| [Content Strategy Guide](docs/content-strategy-guide.md) | Tone and voice guidelines, microcopy, error message standards, help text, need-based content patterns |
| [App Pages Prompts](docs/app-pages-prompts.md) | Page-by-page UI/mockup specifications (Homepage, Add/Edit Task, Category View, Time View, Settings) — useful as prompts for AI design tools |

### Architecture

Confirmed June 2026: Vite + React 19 + TypeScript, Tailwind v4 + shadcn/ui,
Dexie.js for local IndexedDB storage with `useLiveQuery` for reactive reads,
Zustand for transient UI state, Zod v4 + react-hook-form for validation —
with a Dexie Cloud path to Phase 3 cloud sync and shared households that
doesn't require building or hosting a custom backend.

| Document | Description |
|----------|-------------|
| [Tech Stack](docs/architecture/tech.md) | Full stack summary, tooling, common commands |
| [Design](docs/architecture/design.md) | Architecture, data layer, component patterns, Phase 3 sync plan |
| [Structure](docs/architecture/structure.md) | Folder/file layout conventions |

## Target Users

The app serves diverse users with different needs:

1. **Busy Parents** - Managing work and household responsibilities with limited time windows
2. **First-time Homeowners** - Learning home maintenance rhythms and building good habits
3. **Active Retirees** - Tracking social connections, hobbies, and maintaining variety in retirement

## Roadmap

### Phase 1: Foundation (MVP)
- Create, Edit, Archive, Delete tasks
- "Just Done" completion logic
- Category and Time views
- Local data storage (IndexedDB)
- CSV Import/Export
- Full accessibility compliance

### Phase 2: Enhanced Experience
- Swipe gestures
- Reorder categories with touch drag-and-drop sorting
- Multiple UI themes
- Pre-built task templates
- Desktop-optimized dashboard
- Onboarding tutorials
- Advanced filtering

### Phase 3: Cloud & Community
- User accounts/authentication
- Cloud synchronization
- Shared households

## Deployment

The app is a **stateless static PWA** — all user data lives in the browser's IndexedDB, and the container holds no server-side state. It's served by a tiny zero-dependency Node static server (`server/index.mjs`) that adds a `/health` endpoint, PWA-aware cache headers, and SPA-fallback routing so client routes deep-link correctly.

### Docker

```bash
docker build -t how-long-since .
docker run -p 3000:3000 how-long-since
```

Or with Docker Compose:

```bash
docker compose up --build
```

Then open http://localhost:3000. To publish on a different host port:

```bash
PORT=8080 docker compose up      # http://localhost:8080
```

The image is a multi-stage build on `node:22-alpine`: the first stage builds the PWA with pnpm; the runtime stage copies only `dist/` and the server, runs as a dedicated **non-root** `app` user, has **no runtime dependencies** and no mounted volume, and exposes a `HEALTHCHECK` that polls `/health`.

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Host port to publish (Docker Compose). The container always listens on `3000` internally. |
| `TZ` | `UTC` | Container timezone — a [tz database name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), e.g. `America/New_York`. |

### Security

The app has **no built-in authentication** — this is deliberate. Access control is your responsibility at the network layer. **Restrict access before exposing it to any untrusted network.** Recommended approaches:

- **Cloudflare Tunnel / Gateway** — zero-trust, identity-based access
- **Reverse proxy with auth** — nginx / Caddy / Traefik with OAuth2 Proxy, HTTP Basic Auth, or mutual TLS
- **VPN / firewall** — restrict access to a trusted network segment

The container runs **non-root** and stores **no data** — all state is the user's own browser IndexedDB, and backups are the app's in-app JSON/CSV export (there is nothing server-side to back up).

## License

Released under the [MIT License](LICENSE).
