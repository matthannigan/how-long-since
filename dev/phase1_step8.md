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
- [ ] **Default view**: radio By Category / By Time (Req 4.6) → `AppSettings.currentView`; helper "Choose your preferred starting view".
- [ ] **Notifications** — render as a **disabled / "Coming soon"** section (Phase 2; app-pages §5.3 marks it future). Do not implement toggles that do nothing silently.
- [ ] **Data management**: last-backup date display; Export (JSON full + CSV); Import; **Clear all data** (danger zone).
- [ ] **Categories**: "Manage Categories" link → the step-7 surface.
- [ ] **About & Help**: app version, User Guide / Send Feedback / About links (static is fine for v1).
- [ ] Section dividers, terracotta toggles, danger-zone styling per app-pages §5.

### `src/lib/export-import.ts`
- [ ] **JSON export** — `dexie-export-import` (streaming) → downloadable `.json` full backup; on success set `AppSettings.lastBackupDate = new Date()`.
- [ ] **JSON import** — validate the file/structure, confirm before replacing, restore via `dexie-export-import`; clear friendly errors on bad files.
- [ ] **CSV export** — tasks (and categories) to CSV via PapaParse; human-friendly columns.
- [ ] **CSV import** — parse, **validate each row against the Zod schemas**, report row-level errors; skip/report invalid rows rather than failing silently.
- [ ] **Backup reminder** — on load, if `now - lastBackupDate ≥ 14 days` (or never), show an in-app **banner** (not a push notification) prompting export; dismissible. (Req 7.7.)
- [ ] **Clear all data** — confirm dialog with explicit irreversibility copy; wipes all tables then re-runs `seedDatabase()` so defaults return.
- [ ] **Quota / write-failure handling** (Req 7.8–7.9) — catch Dexie quota errors on import/save and surface "Storage space is low. Consider removing old tasks."
- [ ] Tests: JSON round-trip (export→import→identical), CSV round-trip incl. **date fields**, invalid-CSV-row reporting, backup-reminder threshold, clear-all re-seeds.

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

- **CSV date round-tripping is the sleeper risk.** CSV is strings; decide and
  **document in this file** the canonical format (recommend ISO-8601 `YYYY-MM-DD`
  or full ISO-8601 with offset), the exact parse/format functions, and the
  timezone policy (store/emit UTC vs local). Cover it explicitly in tests — a
  silent off-by-a-day or NaN date here is the likeliest data-integrity bug in the
  whole app. JSON (via dexie-export-import) preserves `Date` natively and is the
  safer full backup; CSV is the interchange/inspection format.
- **Import safety** — confirm before overwriting; never partially apply a JSON
  restore without a clear success/failure result.
- **Clear-all must re-seed** or the app boots into a broken no-categories state.
