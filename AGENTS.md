# AGENTS.md - Project Context for AI Assistants

## Project Overview

"How Long Since" is a household task management PWA that tracks when tasks were last completed. Local-First philosophy: all data on-device, no account required to start.

## Project Status

**Shipped: 1.0.0 (2026-07-07).** Phase 1 (MVP), Phase 1.1 (Instances &
Series), and the User Guide are implemented, merged to `main`, and deployable
via Docker — see [CHANGELOG.md](CHANGELOG.md) for what each chunk delivered.
Phase 2 is scoped as ordered feature batches in
[docs/ROADMAP.md](docs/ROADMAP.md) (not started); Phase 3 remains unscoped.
For commands, the repo map, conventions/gotchas, and what's next, start with
[docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md).

**The architecture is decided** (locked in June 2026, after evaluating and
rejecting two Next.js-based alternatives) **and built**: Vite + React 19 +
TypeScript, Tailwind v4 + shadcn/ui, Dexie.js with `useLiveQuery` for reactive
local storage, Zustand for transient UI state, Zod v4 + react-hook-form for
validation. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full
as-built design — stack, data layer, folder conventions, and the Phase 3
cloud-sync plan.

## Technology Stack

- **Framework**: Vite + React 19 + TypeScript (no Next.js — this app is
  client-only with no server in v1)
- **Routing**: TanStack Router
- **UI**: Tailwind CSS v4 + shadcn/ui (components owned in-repo, not a dependency)
- **Data**: Dexie.js (IndexedDB) + `dexie-react-hooks` (`useLiveQuery`) for
  reactive reads; plain async functions in `lib/` for writes — no service
  classes. `dexie-cloud-addon` is the opt-in Phase 3 path to accounts, sync,
  and shared households, not installed in v1.
- **State**: Zustand, for transient UI-only state (task/category data always
  comes from Dexie via `useLiveQuery`)
- **Validation/forms**: Zod v4 + react-hook-form
- **PWA/offline**: `vite-plugin-pwa`
- **Testing**: Vitest + React Testing Library + `vitest-axe` + Playwright

## Planning Documentation

### Essential Reading

| Document | Purpose |
|----------|---------|
| [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) | Entry point: commands, repo map, conventions, generated-file matrix, what's next |
| [docs/USER_GUIDE.md](docs/USER_GUIDE.md) | User-facing behavior of every feature, with screenshots |
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | Full EARS-format functional requirements (reflects shipped 1.0.0) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | The as-built architecture: stack, data layer, structure, Phase 3 sync plan |

### Design & Content

| Document | Purpose |
|----------|---------|
| [docs/USER_PERSONAS.md](docs/USER_PERSONAS.md) | Illustrative example users (Alex, Jordan, Pat) — not the exclusive audience; see the disclaimer at the top of that file |
| [docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md) | Colors, typography, components, accessibility |
| [docs/CONTENT_STRATEGY_GUIDE.md](docs/CONTENT_STRATEGY_GUIDE.md) | Tone, microcopy, error messages |

Historical planning material (product briefing, page-by-page UI prompts, and
the per-phase plans/decision registers) lives in dated `dev/` folders — see
[dev/2026-07-01_phase1-mvp/docs/README.md](dev/2026-07-01_phase1-mvp/docs/README.md).

## Core Data Models

This is the settled data model for the app, stable regardless of implementation detail. `AppSettings` was formalized here in June 2026; earlier drafts had independently invented shapes for it, including a `personaPreference` field for persona-mode-switching that was never built — that idea has since been explicitly cut, see `docs/USER_PERSONAS.md` and `docs/STYLE_GUIDE.md`.

### Task
```typescript
interface Task {
  id: string;
  name: string;                    // 128 char max
  description: string;             // 512 char max
  categoryId: string;
  createdAt: Date;
  lastCompletedAt: Date | null;
  expectedFrequency?: { value: number; unit: 'day' | 'week' | 'month' | 'year' };
  timeCommitment?: '15min' | '30min' | '1hr' | '2hrs' | '4hrs+';
  isArchived: boolean;
  notes: string;                   // 512 char max
  instanceLabel?: string;          // Phase 1.1 — "where or who" (40 char max, trimmed)
  seriesId?: string;               // Phase 1.1 — shared by tasks fanned out together; system-owned
}
```

Instances & series (Phase 1.1, July 2026): tasks stay independent rows;
siblings sharing a `seriesId` collapse into an expandable group row in
By Time and By Category (never in Quick Wins, where siblings rank
independently). No Dexie index on these fields — grouping runs in memory.
See `dev/2026-07-03_grouped-tasks/phase1.1.md` for the decisions register.

### Category
```typescript
interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  isDefault: boolean;
}
```

### AppSettings

Singleton row, `id` always `'1'`. No `personaPreference` field — persona-mode-switching was considered and explicitly cut (see `docs/STYLE_GUIDE.md`); personas remain illustrative examples only, not a targeting mechanism.

```typescript
interface AppSettings {
  id: string;
  lastBackupDate: Date | null;
  currentView: 'quick' | 'category' | 'time';   // default 'quick' (Quick Wins)
  theme: 'light' | 'dark' | 'system';
  textSize: 'default' | 'large' | 'larger';
  highContrast: boolean;
  reducedMotion: boolean;
}
```

## Accessibility Requirements

- WCAG 2.1 Level AA compliance
- Minimum touch targets: 44px (48px preferred)
- Color contrast: 4.5:1 minimum
- Non-color indicators for all status (icons + text)
- Screen reader support
- Keyboard navigation

## Design Tokens

Design system: **Soft Daylight (warm white & greige)** — warm-neutral surfaces,
Bricolage Grotesque + DM Sans type, single terracotta accent. `docs/STYLE_GUIDE.md`
§1 is the source of truth (full token set, dark mode, and the WCAG AA
reconciliation); the values below are the quick reference.

### Fonts
- Display / numerals: Bricolage Grotesque
- Body / UI: DM Sans

### Colors (light)
- Surfaces: Page #FAF8F4, Card #FFFFFF, Greige fill #EFEBE3, Border #E4E0D8
- Ink (text): #3A3330; secondary #9B948B (decorative); AA-safe meta #6E675E
- Accent (terracotta): #D98C63 (button), #C0794C (markers)
- Overdue: #C6533C (AA-safe text #B2452F), badge/pill tint #F6E0D9, card border #EFCDBF
- Due soon (amber-gold): #C08A2E (AA-safe text #8A5E15)
- Success (sage): #5B9E86

Dark mode: charcoal-brown surfaces #24211D / #2E2A25, warm off-white text
#F3EEE7, terracotta kept as the accent (see `docs/STYLE_GUIDE.md` §1.5).

> The soft grays #9B948B / #ADA69C fall below 4.5:1 on the warm-white page —
> decorative/large text only; use #6E675E for small informational text. See
> `docs/STYLE_GUIDE.md` §1.6.

### Category Colors
All 10 default categories (see `docs/REQUIREMENTS.md` Req 3.1), matching `docs/STYLE_GUIDE.md`:
- Kitchen: #3B82F6, Bathroom: #8B5CF6, Bedroom: #EC4899
- Living Areas: #10B981, Exterior: #F59E0B, Vehicles: #EF4444
- Digital/Tech: #6366F1, Health: #14B8A6
- Pets: #F97316, Garden/Plants: #84CC16

## Overdue Status Thresholds

Three tiers, computed only once a task has `lastCompletedAt` set and an `expectedFrequency` — a task that's never been completed is never overdue, regardless of how long ago it was created (see `docs/REQUIREMENTS.md` Req 2.7–2.8). Thresholds are a percentage of the expected interval elapsed since `lastCompletedAt`, so they scale with tasks from daily to yearly instead of using a fixed day count:

- **Not due**: elapsed < 80% of interval
- **Due soon**: 80% ≤ elapsed < 100% of interval (amber-gold #C08A2E / AA-safe #8A5E15, clock glyph)
- **Overdue**: 100% ≤ elapsed < 150% of interval (terracotta #C6533C / AA-safe #B2452F, "!" badge + soft card border)
- **Very overdue**: elapsed ≥ 150% of interval (same terracotta, plus an explicit "Very overdue" pill/text label — see `docs/STYLE_GUIDE.md` and `docs/CONTENT_STRATEGY_GUIDE.md`)

## Content Tone

- Friendly but efficient
- Encouraging without judgment
- Direct, action-oriented
- Plain language (8th-grade reading level)
- No guilt/shame for overdue tasks
