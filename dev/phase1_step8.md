# Phase 1 · Step 8 — Settings + data import/export + backup reminder

> Read [`phase1.md`](phase1.md) first for shared conventions and the DoD.

## Objective

Complete the Settings page and the data-management features: JSON and CSV export,
validated import, the 2-week backup-reminder banner, and the "Clear all data"
danger zone. After this step the user can configure the app and safely back
up/restore their data.

## Prerequisites

- Steps 4 (settings provider, `AppSettings`, toast host, error boundary) and 7
  (Manage Categories surface). Uses `lib/export-import.ts` (new here) + the
  step-2 schemas for import validation.

## Context & references

- Settings composition: [`app-pages-prompts.md`](../docs/app-pages-prompts.md) §5
  (all sections, sample layout, danger zone, interactive/accessibility notes).
- Export tooling: [`tech.md`](../docs/architecture/tech.md) Data Layer
  (`dexie-export-import` for JSON; CSV via PapaParse or similar).
- Requirements: Req 7.3–7.10 (JSON + CSV export, validated import, 2-week backup
  reminder, quota handling, archive to manage size), Req 4.6 (default view),
  Req 8.10 (dark mode), Req 6 (a11y for controls).
- Copy: [`content-strategy-guide.md`](../docs/content-strategy-guide.md) §3.3
  (settings labels), §4.3 (import/export/storage errors), §3.5 ("No previous
  backups found."), §5.3 (data backup help).

## Scope / checklist

### Settings page — `routes/settings.tsx`
- [ ] **Appearance**: theme (Light / Dark / System), text size (Default / Large / Larger), accessibility toggles (High contrast, Reduced motion). All write to the `AppSettings` singleton (wired in step 4); reflect immediately.
- [ ] **Default view**: radio **Quick Wins (default) / By Category / By Time** (Req 4.6) → `AppSettings.currentView` (`'quick' | 'category' | 'time'`); helper "Choose your preferred starting view".
- [ ] **Notifications** — render as a **disabled / "Coming soon"** section (Phase 2; app-pages §5.3 marks it future). Do not implement toggles that do nothing silently.
- [ ] **Data management**: last-backup date display; Export (JSON full + CSV); Import; **Clear all data** (danger zone).
- [ ] **Categories**: "Manage Categories" link → the step-7 surface.
- [ ] **About & Help**: app version, User Guide / Send Feedback / About links (static is fine for v1).
- [ ] Section dividers, terracotta toggles, danger-zone styling per app-pages §5.

### `src/lib/export-import.ts`
- [x] **JSON export** — hand-rolled `{ app, schemaVersion, exportedAt, data }`
  envelope (see "Risks / decisions") → downloadable `.json` full backup; on success
  set `AppSettings.lastBackupDate = new Date()`.
- [x] **JSON import** — validate the file/structure with Zod, confirm before
  replacing, restore in one transaction (clear + `bulkPut`); friendly errors on bad
  files. **The only import path.**
- [x] **CSV export** — tasks to CSV via PapaParse; human-friendly columns (readable
  `categoryName` + `categoryId`, flattened frequency, ISO dates). Lives in
  `src/lib/csv-export.ts` so PapaParse loads only with the code-split Settings page.
- [ ] ~~**CSV import**~~ — **dropped (user decision).** JSON is the single, preferred
  import/restore path; CSV is export-only. See "Risks / decisions".
- [ ] **Backup reminder** — on load, if `now - lastBackupDate ≥ 14 days` (or never), show an in-app **banner** (not a push notification) prompting export; dismissible. (Req 7.7.)
- [ ] **Clear all data** — confirm dialog with explicit irreversibility copy; wipes all tables then re-runs `seedDatabase()` so defaults return.
- [ ] **Quota / write-failure handling** (Req 7.8–7.9) — catch Dexie quota errors on import/save and surface "Storage space is low. Consider removing old tasks."
- [x] Tests: JSON round-trip (export→import→identical, dates as real `Date`s),
  **v1→v2 stale-enum normalization on import**, CSV **export shape** incl. date
  fields, backup-reminder threshold, clear-all re-seeds, and
  **`AppSettings.currentView` round-trips all three values including `'quick'`**
  (the widened enum must not be rejected on import). (No CSV-import tests — CSV import
  was dropped.)

## Try it (manual)

1. Settings → change theme/text size/toggles → app updates live; reload persists.
2. Data → **Export JSON** → a `.json` downloads; last-backup date updates to today; the reminder banner (if shown) clears.
3. **Clear all data** (confirm) → app resets to the 10 default categories, no tasks.
4. **Import JSON** the file from step 2 → tasks/categories return exactly (dates intact).
5. **Export CSV**, open it (dates readable), then **Import CSV** → tasks round-trip; feed a malformed row → a clear row-level error, other rows still import.
6. Set `lastBackupDate` back >14 days (or fresh install) → the backup banner appears with export CTA.

## Explicitly out of scope

- Working notification toggles (Phase 2 — shown disabled here).
- PWA/offline verification, perf, and E2E of the round-trips → **step 9** (the
  E2E import/export round-trip test lives there).
- Onboarding/help content beyond static links → Phase 2.

## Acceptance criteria

- All settings persist to `AppSettings` and take effect immediately.
- JSON export/import round-trips losslessly (dates as real `Date`s after import).
- CSV export/import round-trips, **including dates**, with row-level validation and
  friendly errors; quota errors handled.
- Backup reminder fires at the 2-week threshold as an in-app banner.
- Clear-all-data confirms, wipes, and re-seeds defaults.
- New controls pass `vitest-axe`; keyboard-operable; confirmations for destructive actions.
- Meets the shared Definition of Done in [`phase1.md`](phase1.md).

## Risks / decisions

- **CSV import dropped (user decision, 2026-07-01).** JSON is the single, preferred
  import/restore path; CSV stays **export-only** (human-readable interchange /
  inspection). This deviates from the original scope above (CSV import + per-row
  Zod validation) and intentionally drops the "CSV round-trip" / "invalid-CSV-row"
  acceptance tests. The JSON path still gives lossless restore incl. real `Date`s.
- **CSV date format — DECIDED: full ISO-8601 UTC instant.** Dates are emitted with
  `Date.prototype.toISOString()` (e.g. `2026-06-15T14:30:00.000Z`); a null
  `lastCompletedAt` is the empty string. This is lossless (round-trips the exact
  instant, no off-by-a-day) and timezone-unambiguous. Since CSV is export-only there
  is no CSV parse path; `tasksToCsv` in `src/lib/csv-export.ts` is the format
  authority and is covered by `csv-export.test.ts`.
- **JSON tooling — hand-rolled, not `dexie-export-import`.** A plain
  `{ app, schemaVersion, exportedAt, data }` envelope is validated + date-revived +
  enum-normalized through Zod (`src/lib/export-import.ts`). This keeps per-record
  validation and the v1→v2 fix under our control (see next bullet) with zero new
  runtime deps for JSON.
- **v1→v2 on import — normalize explicitly, don't rely on `.upgrade()`.** Dexie only
  runs the v2 `.upgrade()` on a *version transition* of stored rows; a `bulkPut` of a
  v1-shaped export is NOT re-upgraded. `normalizeTimeCommitment` maps the retired
  `5hrs+`/`4hrs` → `4hrs+` during import (covered by a v1→v2 test), so stale values
  are rewritten rather than rejected.
- **Dexie is now at `version(2)`** with a `.upgrade()` migration (the
  `timeCommitment` enum consolidation `5hrs+`/`4hrs` → `4hrs+`, added post-Step-6).
  JSON restore must go **through Dexie** so the upgrade path runs — importing an
  older v1-shaped export should have its stale enum values rewritten, not rejected.
  Cover a v1→v2 import (stale `timeCommitment`) in the round-trip/validation tests,
  not just v2→v2.
- **Import safety** — confirm before overwriting; never partially apply a JSON
  restore without a clear success/failure result.
- **Clear-all must re-seed** or the app boots into a broken no-categories state.
