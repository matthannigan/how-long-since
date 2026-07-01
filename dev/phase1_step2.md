# Phase 1 · Step 2 — Data layer

> Read [`phase1.md`](phase1.md) first for shared conventions and the DoD.

## Objective

Establish the persistent data foundation: TypeScript types, Zod v4 schemas, the
Dexie/IndexedDB database with its v1 schema, and idempotent seeding of the 10
default categories and the `AppSettings` singleton. After this step the database
opens, seeds itself once, and is fully unit-tested against `fake-indexeddb` — with
no UI yet.

## Prerequisites

- Step 1 complete (toolchain, `@/` alias, Vitest + `fake-indexeddb` setup).

## Context & references

- Data models: [`AGENTS.md`](../AGENTS.md) "Core Data Models" (Task, Category,
  AppSettings) — the authoritative shapes.
- Dexie schema + Zod snippets: [`design.md`](../docs/architecture/design.md)
  "Dexie Schema", "Validation — Zod v4".
- Requirements: [`requirements.md`](../docs/requirements.md) Req 1.1–1.6 (fields +
  limits), Req 3.1 (the 10 default categories), Req 7.1 (IndexedDB storage).
- Category colors + default set: [`style-guide.md`](../docs/style-guide.md) §1.4;
  [`AGENTS.md`](../AGENTS.md) "Category Colors".
- File paths: [`structure.md`](../docs/architecture/structure.md) (`lib/db/`,
  `schemas/`, `types/`).

## Scope / checklist

- [ ] **`src/schemas/task.ts`** — `taskSchema` (Zod v4): `id z.uuid()`, `name z.string().min(1).max(128)`, `description z.string().max(512)`, `categoryId z.uuid()`, `createdAt z.date()`, `lastCompletedAt z.date().nullable()`, `expectedFrequency` optional `{ value: z.number().positive(), unit: z.enum(['day','week','month','year']) }`, `timeCommitment` optional enum `['15min','30min','1hr','2hrs','4hrs','5hrs+']`, `isArchived z.boolean()`, `notes z.string().max(512)`. Plus `createTaskSchema = taskSchema.omit({ id, createdAt, lastCompletedAt, isArchived })`.
- [ ] **`src/schemas/category.ts`** — `categorySchema`: `id z.uuid()`, `name z.string().min(1)`, `color?`, `icon?`, `isDefault z.boolean()`; `createCategorySchema` omitting `id`/`isDefault`.
- [ ] **`src/schemas/settings.ts`** — `appSettingsSchema`: `id` (const `'1'`), `lastBackupDate z.date().nullable()`, `currentView z.enum(['category','time'])`, `theme z.enum(['light','dark','system'])`, `textSize z.enum(['default','large','larger'])`, `highContrast z.boolean()`, `reducedMotion z.boolean()`.
- [ ] **`src/types/index.ts`** — export `Task`, `Category`, `AppSettings`, `OverdueStatus`, `TimeCommitment`, frequency unit types, mostly as `z.infer<typeof …>`.
- [ ] **`src/lib/db/schema.ts`** — `HowLongSinceDB extends Dexie` with typed `EntityTable`s and v1 stores exactly per design.md:
      `tasks: 'id, categoryId, lastCompletedAt, isArchived'`, `categories: 'id, isDefault'`, `settings: 'id'`. Export `const db`. Leave the Dexie-Cloud lines commented (Phase 3).
- [ ] **Default-category seed** — the 10 defaults (Kitchen, Bathroom, Bedroom, Living Areas, Exterior, Vehicles, Digital/Tech, Health, Pets, Garden/Plants) with their base `color` (style-guide §1.4) and `icon` name (style-guide §4 Lucide names), `isDefault: true`, stable ids.
- [ ] **`AppSettings` singleton** — upsert row `id:'1'` with defaults: `currentView:'category'`, `theme:'system'`, `textSize:'default'`, `highContrast:false`, `reducedMotion:false`, `lastBackupDate:null`.
- [ ] **`seedDatabase()`** — an **idempotent** async function: seeds categories only if the table is empty (or by checking each default id), and upserts the settings singleton. Safe to call on every boot. Exported for step 4 to call at bootstrap. (Consider Dexie `populate`/`on('ready')`, but an explicit idempotent function is simplest to unit-test.)
- [ ] **Unit tests** (`schema.test.ts`) with `fake-indexeddb`: DB opens; `seedDatabase()` creates exactly 10 categories + 1 settings row; calling it twice does **not** duplicate; a stored `Date` round-trips as a `Date` (not a string); Zod rejects a 129-char name and an empty name.

## Try it (manual)

Headless step — verify via tests:

1. `pnpm test src/lib/db` → seeding + idempotency + Date round-trip tests pass.
2. (Optional) in a scratch route or the browser console after step 4, `await db.categories.count()` → `10`.

## Explicitly out of scope

- All business logic (create/complete/archive/delete, overdue calc) → **step 3**.
- Calling `seedDatabase()` at app bootstrap → **step 4** (this step only exports it).
- Any UI or `useLiveQuery` reads → steps 4–6.
- Export/import and schema migrations beyond v1 → step 8 / later phases.

## Acceptance criteria

- `db` opens under `fake-indexeddb` and in the browser; stores match design.md.
- IDs are generated with `crypto.randomUUID()` (used by step 3's `createTask`; the
  schemas validate `z.uuid()`).
- Seeding is idempotent and produces exactly 10 categories + 1 settings singleton.
- Dates are stored and read as native `Date` objects — **no ISO-string
  serialization** anywhere in the data layer.
- Meets the shared Definition of Done in [`phase1.md`](phase1.md).

## Risks / decisions

- **Native Date storage:** Dexie/IndexedDB stores `Date` objects natively. Do not
  `.toISOString()` on write — downstream code (overdue calc, elapsed formatting)
  assumes real `Date`s. (CSV is the *only* place dates become strings — step 8.)
- **Seed idempotency:** guard against double-seeding on reload/HMR; the DoD test
  enforces "call twice → still 10".
- **Stable default-category ids:** use fixed ids for defaults so re-seeding and
  future reassignment logic (step 3) are deterministic.
- **Settings singleton is always `id:'1'`** — treat as upsert, never insert-only.
