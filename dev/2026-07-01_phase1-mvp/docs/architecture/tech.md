# Technology Stack

> **Confirmed architecture, locked in June 2026.** Evaluated against two
> Next.js-based alternatives (a hand-rolled IndexedDB service layer on
> Tailwind/shadcn, and Mantine + Dexie with no sync story) before settling
> here — this stack won on two grounds: it's the right tool for a client-only
> app with no server in v1, and Dexie Cloud gives the roadmap's Phase 3
> (cloud sync + shared households) a real, low-effort implementation path.
> See `design.md` for the full design, including the Phase 3 sync plan.

## Core Framework
- **Vite 6** + **React 19** with TypeScript — no Next.js. This app is 100%
  client-side with no account required in v1 (`docs/requirements.md`); Next.js's
  headline features (SSR, RSC, Server Actions) need a server this app doesn't have.
  Vite is the purpose-built toolchain for a client-only PWA: faster dev server,
  smaller production bundles, and no static-export workarounds.
- **TanStack Router** for client-side routing (file-based, type-safe params) across
  the app's ~5 routes (Home/Category view, Time view, Add/Edit task, Settings).
  React Router v7 in library mode is a perfectly fine simpler alternative if the
  extra type-safety isn't worth a new dependency for a route count this small.

## UI & Styling
- **Tailwind CSS v4** — CSS-first `@theme` tokens declared directly in CSS, no
  separate `tailwind.config.js`; OKLCH colors; `tw-animate-css` for animations.
- **shadcn/ui** — components are copied into the repo, not installed as a
  dependency: no library upgrade path to manage, full ownership of every
  file. Suits a project where Claude is doing a lot of the implementation
  work directly on the component files. Vite is an officially supported
  target (not just Next.js).

## Data Layer
- **Dexie.js** — wraps IndexedDB, eliminating the raw `indexedDB.open()`/
  transaction boilerplate a hand-rolled wrapper would require.
- **`dexie-react-hooks`** (`useLiveQuery`) — components subscribe directly to
  live Dexie queries, so there's no custom `useTasks` hook or service-class
  CRUD wrapper to write and maintain.
- **`dexie-cloud-addon`** (Phase 3 only, not installed in v1) — official Dexie
  addon adding accounts, multi-device sync, and shared "realms." This is the
  concrete implementation path for the roadmap's Phase 3 ("user
  accounts/authentication, cloud synchronization, shared households"). See
  `design.md` for the opt-in details.
- **`dexie-export-import`** — official Dexie addon for the JSON backup/restore
  requirement (`docs/requirements.md` Req 7.3–7.6), streaming-capable so it doesn't
  load the whole DB into RAM.

## State, Forms & Validation
- **Zustand** — transient UI-only state with no persistence need (drawer/modal open,
  undo-snackbar visibility). Task/category data stays in Dexie via `useLiveQuery` as
  the single source of truth — Zustand never holds app data, only ephemeral UI state.
- **Zod v4** — runtime validation. Top-level validators
  (`z.email()`/`z.uuid()` instead of chained string methods), `.issues`
  instead of `.errors`, ~6.5x faster parsing than v3, smaller bundle.
- **react-hook-form** — the standard default for this level of form
  complexity. TanStack Form is the alternative, better suited to heavier
  async/cross-field validation this app's task/category forms don't need.

## PWA / Offline
- **`vite-plugin-pwa`** — manifest generation, service worker (Workbox under the
  hood), auto-update prompts, dev-mode PWA testing. The standard, well-documented
  way to add offline support to a Vite app.

## Testing
- **Vitest** — Vite-native test runner, Jest-compatible API, faster than Jest.
- **React Testing Library** + **axe-core** (via `vitest-axe`) for accessibility testing.
- **Playwright** — end-to-end tests.

## Development Tools
- **TypeScript** — strict mode
- **ESLint** + **Prettier**
- **pnpm** as package manager

## Common Commands

### Development
```bash
pnpm dev          # Start Vite dev server
pnpm build        # Production build
pnpm preview       # Preview the production build locally
```

### Testing
```bash
pnpm test         # Run Vitest
pnpm test:watch   # Vitest watch mode
pnpm typecheck    # TypeScript type checking
pnpm e2e          # Playwright end-to-end tests
```

### Code Quality
```bash
pnpm lint         # ESLint
pnpm format       # Prettier
```

## Architecture Patterns
- **Local-first** — IndexedDB (via Dexie) as the source of truth; no network call is
  ever on the critical path for reads or writes in v1.
- **Reactive queries over a service layer** — `useLiveQuery` reads directly from
  Dexie; plain async functions (not classes, not `APIResponse<T>` envelopes) handle
  writes and business logic like overdue calculation.
- **Config-flag cloud, not a rewrite** — Dexie Cloud is designed to be added to an
  existing Dexie schema without changing how components query data.
- **Accessibility-first** — WCAG AA compliance built into shadcn/Radix primitives.
