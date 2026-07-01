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

Pre-implementation. This is a docs-only, back-burner personal project — there's no code, no package.json, nothing built yet. The architecture is decided (see below); implementation hasn't started.

## Planning Documentation

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
- Multiple UI themes
- Pre-built task templates
- Desktop-optimized dashboard
- Onboarding tutorials
- Advanced filtering

### Phase 3: Cloud & Community
- User accounts/authentication
- Cloud synchronization
- Shared households

## License

Released under the [MIT License](LICENSE).
