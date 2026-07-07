# Completions log — silent B6 groundwork, shipped inside 1.0.0

**Executed 2026-07-07, folded into the 1.0.0 release by explicit decision
(Matt), immediately after B0.** This takes the option in
[docs/ROADMAP.md](../../docs/ROADMAP.md) § B2's decision box — and takes it
*earlier* than B2: the release was still unpushed, and **completion history
cannot be backfilled after the fact** (only one synthetic row per task can
ever be reconstructed). Shipping the log inside 1.0.0 means the log is
complete from the very first real-world completion. **No UI ships** — that
remains Phase 2 B6, now UI-only.

## What shipped

- **`completions` store** `{id, taskId, completedAt}` — Dexie **v3**
  (`src/lib/db/schema.ts`), `taskId`/`completedAt` indexed now so the B6
  history UI needs no further bump; `.upgrade()` backfills one synthetic row
  per already-completed task.
- **Write path** (`src/lib/tasks.ts`): `markTaskComplete` appends in the same
  transaction and returns `{ previous, completionId }`; `undoComplete(id,
  previous, completionIds)` deletes the burst's rows and restores the date
  atomically; `createTask`/`createTaskSeries` synthesize a row for
  create-time "Last done" backfills.
- **Burst interlock** (`TaskCompletionButton.tsx` + `ui-store`): the burst
  ref and the store's undo slot accumulate `completionIds`; one Undo deletes
  them all. The sonner toast is replaced (stable id) per tap, so the newest
  closure always holds the full id list.
- **Export/import/clear** (`src/lib/export-import.ts`): envelope stamp → 3;
  `data.completions` round-trips; `applyBackup`/`clearAllData` clear the new
  table; `parseBackup` synthesizes bootstrap rows for pre-v3 backups.
- **Dev seed** mirrors production bootstrapping (14 rows for the 15 samples).
- **Docs**: AGENTS.md (+`Completion` model), ARCHITECTURE.md (v3 schema,
  new undo contract, envelope), DEVELOPER_GUIDE.md (four stores, envelope,
  new gotcha), ROADMAP.md (B2 box resolved, B6 → UI-only, schema table),
  CHANGELOG (1.0.0 § "Completion log groundwork").

## Decisions register

| # | Decision | Why |
|---|---|---|
| 1 | Ship inside 1.0.0, before first push | History can't be backfilled; the log must predate the first real completion to ever be complete |
| 2 | One row per `markTaskComplete`, bursts included; **one undo deletes all of the burst's rows** | Lib stays burst-unaware (bursts are a component concept); an asymmetric undo would silently corrupt history |
| 3 | `undoComplete` gains optional `completionIds` (default `[]`) | Backward-compatible for stray callers/tests; the ui-store undo slot now carries the ids so the store record is complete |
| 4 | Bootstrap synthesis everywhere a completed task can exist without rows: v3 `.upgrade()`, pre-v3 imports, dev seed, create-time "Last done" | One invariant — every completed task has ≥1 row — via one shared helper (`src/lib/completions.ts`) |
| 5 | Import rule: **absent `completions` key ⇒ synthesize; explicit `[]` ⇒ trust** | v3+ exports always carry the key (even empty), so absence reliably identifies pre-v3 backups — no version-gating needed |
| 6 | `taskId` + `completedAt` indexed **now** | Indexes require version bumps; paying it in the same bump spares B6 a second migration |
| 7 | Task **deletion keeps** its completion rows | Event-log semantics — the work still happened; rows die only via undo, import-replace, or Clear All Data |
| 8 | Manual `lastCompletedAt` edits (task form) do **not** log | They're corrections, not events; diffing against existing rows isn't worth the complexity (B6 may revisit) |
| 9 | `HowLongSinceDB` constructor gains an optional `name` param | Test seam so the migration test opens a real v2 DB under a scratch name and runs the *actual* upgrade chain |
| 10 | Envelope stamp 2 → 3, in lockstep with the Dexie version | The documented coupling rule (`DB_SCHEMA_VERSION` in export-import.ts) |

## Verification

- 253 unit/component tests green, including new coverage: real v2→v3 upgrade
  (scratch-name DB), burst undo (3 rows → 0), create-backfill synthesis,
  pre-v3-import synthesis vs explicit-`[]` trust, delete-keeps-rows,
  clearAllData, envelope round-trip; `pnpm lint` + `pnpm typecheck` clean.
- **Live in the dev app:** the browser's existing v2 DB upgraded to IDB v30
  with exactly 14 backfilled rows (15 seeded tasks − 1 never-completed);
  completing a task appended a row (14→15→16 across two runs) and the toast's
  Undo deleted it with the date restored **exactly**.
- Full `pnpm e2e` suite (17 specs, production build) green — the
  complete/undo specs exercise the new write path end-to-end.
