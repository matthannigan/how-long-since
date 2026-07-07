# Plan: User Guide — docs/USER_GUIDE.md + screenshots + served HTML

## Context

"How Long Since" (Phase 1 + 1.1 shipped) has no user-facing documentation, and
Settings → About & Help shows a disabled "User Guide — Coming soon" placeholder
([AboutSection.tsx](src/components/settings/AboutSection.tsx), explicitly a
Phase-2 stub). Goal: a user guide explaining the app's intent and all major
functionality — adding tasks (single and grouped/series), the three views
(Quick Wins / By Category / By Time), completing tasks and overdue states,
managing categories, settings, and backup — published as repo markdown with
screenshots, plus an HTML version served by the app at `/user-guide.html` and
linked from that Settings row.

## Decisions (user-confirmed 2026-07-07)

- **Screenshots**: mobile viewport 390×844 @2x, **light theme only**, captured
  by a deterministic Playwright spec; PNGs committed.
- **HTML**: generated from the MD by a script (new devDep `marked`) that is
  **run manually and committed** (`public/user-guide.html`) — `build`/`dev`
  scripts and Docker stay untouched (mirrors the `generate-pwa-assets`
  convention of standalone scripts).
- Implementation calls: single committed image copy in
  `public/images/user-guide/` (the MD references
  `../public/images/user-guide/x.png`, which GitHub renders; the generator
  rewrites those to root-relative `images/user-guide/x.png` for the HTML).
  Settings link = raw `<a target="_blank" rel="noopener">` (first raw `<a>` in
  src/ — intentional; the guide is a static page, not a TanStack route). The
  guide page honors the app's saved theme by embedding the same pre-paint
  `hls-prefs` script as `index.html:16-29`. Workbox excludes guide assets from
  the precache (keeps installs lean) with an SWR runtime-cache so the guide
  works offline after first view.

## Steps (~5 commits)

### 1. Screenshot harness + captured PNGs

- New **`playwright.screenshots.config.ts`** (separate config, NOT a project in
  the main one — `testDir: './e2e'` is recursive and a second project would
  pollute `pnpm e2e`): testDir `./e2e/screenshots`, chromium, `workers: 1`,
  `retries: 0`, use `{ baseURL: 'http://localhost:4173', viewport: {width: 390,
  height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  colorScheme: 'light', reducedMotion: 'reduce' }`, same webServer block as
  [playwright.config.ts](playwright.config.ts) (`pnpm build && pnpm preview
  --port 4173 --strictPort`, reuseExistingServer).
- [playwright.config.ts](playwright.config.ts): add `testIgnore:
  'screenshots/**'`.
- New **`e2e/screenshots/fixture.ts`**: `buildGuideBackup(now: Date)` returning
  the real backup envelope `{ app: 'how-long-since', schemaVersion: 2,
  exportedAt, data: { tasks, categories, settings } }` (shape verified in
  [export-import.ts](src/lib/export-import.ts); ISO date strings are revived by
  its Zod `z.coerce.date()`). **Do NOT import
  [dev-seed.ts](src/lib/db/dev-seed.ts)** — its sample array is a local const
  and the module instantiates Dexie at import. Instead: 10 default categories
  as literals (fixed UUIDs from `DEFAULT_CATEGORIES` in
  [schema.ts](src/lib/db/schema.ts)); ~14 tasks modeled on dev-seed with an
  estimate spread for By Time (3×15min, 3×30min, 2×1hr, 1×2hrs, 1×4hrs+, 1
  no-estimate) plus the 3×30min "Vacuum bedroom" series (Main bedroom / Guest
  room / Kids' room, shared seriesId); status spread 2 due-soon / 2 overdue /
  1 very-overdue / 1 never-completed (weekly-task offsets: ~6d = due soon,
  8–9d = overdue, ≥12d = very overdue); dates computed relative to `now`;
  settings `{ id: '1', lastBackupDate: daysAgo(1) (keeps the backup banner out
  of every shot), currentView: 'quick', theme: 'system', textSize: 'default',
  highContrast: false, reducedMotion: false }`.
- New **`e2e/screenshots/user-guide.spec.ts`**: one test; seeds once via the
  app's own import flow — reuse the proven pattern from
  [import-export.spec.ts](e2e/import-export.spec.ts):
  `page.getByRole('region', { name: 'Data Management' }).locator('input[type="file"]')
  .setInputFiles({ name, mimeType: 'application/json', buffer })` → confirm
  "Import this backup?" → "Import" → toast "Data restored" → `page.reload()`
  (clears the toast). Then capture 12 shots into `public/images/user-guide/`
  via `page.screenshot({ path, animations: 'disabled' })`:

  | file | content | nav |
  |---|---|---|
  | quick-wins.png | time-filter chips + ranked list | `/` |
  | add-task.png | Add Task dialog, filled (e.g. "Descale coffee maker", Kitchen, 15 min, every 1 week, Last done: Today) | FAB |
  | add-task-places.png | "Track in multiple places" open, 2–3 chips + suggestions | same dialog, Esc after |
  | by-category.png | color-dot headers + collapsed "3 places" series row | `/category` |
  | series-expanded.png | series row expanded, per-place cards | click row |
  | overdue-states.png | element shot of a section stacking due-soon/overdue/very-overdue | `/category` |
  | by-time.png | time buckets + tinted category tags | `/time` |
  | edit-task.png | edit page incl. label field + Remove Task zone | tap a card |
  | categories.png | Manage Categories list | `/categories` |
  | settings.png | Appearance + Default View | `/settings` |
  | settings-data.png | Data Management section | scroll |
  | complete-undo.png | **captured last** — "Nice work!" toast + Undo | `/`, click circle |

- [package.json](package.json): `"screenshots": "playwright test
  --config=playwright.screenshots.config.ts"`;
  [tsconfig.node.json](tsconfig.node.json) include += the new config.
- Run `pnpm screenshots`; commit PNGs.

### 2. Write docs/USER_GUIDE.md

~1,800–2,500 words, 12 h2 sections (h2s become the HTML TOC). Tone per
[content-strategy-guide.md](docs/content-strategy-guide.md) §2: friendly but
efficient, contractions, second person, 8th-grade reading level, **no guilt
about overdue**. Reuse §5.3 "Time Elapsed Help" + "Data Backup Help" copy and
§11 Instances & Series copy; **do NOT copy the §5.3 swipe-gestures block** (the
shipped app has no swipe gestures). Be honest about limitations: archive has
**no unarchive UI** (restoring means importing a backup that contains the
task), no sharing yet (Phase 3), notifications "coming soon". Don't cite a
version number (avoids a third copy of the 1.0.0/0.1.0 mismatch).

Outline (screenshot per section):
1. **What How Long Since is** — tracks *when you last did* recurring tasks,
   not a to-do list; local-first, no accounts, data stays on-device.
2. **Add your first task** → add-task.png — FAB, name ("What needs to be
   done?", ≤128), category pills + inline "+ New", optional time estimate
   (15 min–4+ hrs), "Should happen every…", "Last done"
   (Today/Yesterday/Pick date; default "Not done yet"), collapsed "Add details".
3. **Track one job in many places** → add-task-places.png — "Track in multiple
   places" chips (Enter/comma, suggestions from the category), one task per
   place sharing a series; each completes independently; editing one never
   changes the others.
4. **Three ways to see your tasks** — Quick Wins ("How much time do you
   have?" cumulative 15/30/1h/2h filter; **only tasks with an estimate ≤2 hrs
   appear**; urgency-ranked; max 8) → quick-wins.png; By Category (color-dot
   headers; series collapse into "{n} places" rows) → by-category.png +
   series-expanded.png; By Time (Quick/Short/Medium/Longer tasks/Big
   projects/No time set) → by-time.png. The app remembers your last view.
5. **Mark it done (and undo)** → complete-undo.png — circle button, "Nice
   work!" toast, 5-second Undo restores the exact previous date; elapsed chips
   New/Today/Yest./{n} d/wk/mo/yr.
6. **Overdue, without the guilt** → overdue-states.png — needs BOTH a
   frequency and a last-done date; clock = due soon (≥80%), "!" + red border =
   overdue (≥100%), "Very overdue" pill (≥150%); "New" tasks are never overdue.
7. **Edit, archive, or delete** → edit-task.png — tap a card to edit; Archive
   hides everywhere (restore = backup import); Delete confirms and is permanent.
8. **Organize with categories** → categories.png — 10 starter categories
   (editable), 12 colors, 15 icons; empty → confirm delete; non-empty →
   "Reassign tasks first"; defaults with tasks can't be deleted.
9. **Make it yours (Settings)** → settings.png — Light/Dark/System, text size,
   high contrast, reduced motion, default view; Notifications coming soon.
10. **Back up and restore** → settings-data.png — Export Data = full JSON
    backup (the only restore format; stamps "Last backup"); Export CSV =
    tasks-only spreadsheet copy; Import **replaces everything** after a
    confirm; reminder banner after 14 days; Clear All Data wipes + reseeds
    defaults.
11. **Install it and use it offline** — browser-native install (Add to Home
    Screen / Install), works fully offline, updates silently.
12. **FAQ** — from §5.2: how overdue is calculated; "Can I share with my
    household?" (not yet — export/import is the workaround); how to back up;
    what happens if you clear browser data (why backups matter).

Image refs: `![meaningful alt](../public/images/user-guide/x.png)`. Top-of-file
HTML comment: after editing, run `pnpm generate-user-guide` (and
`pnpm screenshots` if the UI changed) and commit the regenerated outputs.

### 3. Generator + PWA config

- Add devDep **`marked`**. New **`scripts/generate-user-guide.mjs`** (node
  built-ins + marked only): read `docs/USER_GUIDE.md` → emit
  `public/user-guide.html`.
  - marked `gfm: true`; custom heading renderer adding slugified ids; TOC built
    from `marked.lexer()` depth-2 headings; image-src rewrite
    `../public/images/user-guide/` → `images/user-guide/`.
  - Template: doctype; `<title>How Long Since — User Guide</title>`;
    theme-color meta; ~90-line inline `<style>` — Soft Daylight token subset
    from [globals.css](src/styles/globals.css) (page/card surfaces, ink ramp,
    accent, border, status colors), dark overrides under **both**
    `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) … }`
    and `[data-theme='dark'], .dark`; system-ui font stack (**don't** copy
    @fontsource woff2 — subset/axis fiddliness isn't worth it for a doc page;
    note as later nicety); max-width ~42rem; `img { max-width: 100%; border;
    radius }`; the `index.html:16-29` pre-paint `hls-prefs` script verbatim
    (comment pointing at index.html as source of truth); header with
    `<a href="/">← Back to How Long Since</a>`; `<nav aria-label="Contents">`
    TOC; `<main>` content; footer. Embed a `<!-- Generated from
    docs/USER_GUIDE.md — do not edit; run pnpm generate-user-guide -->` banner.
  - Failure modes: missing MD → exit 1; any referenced image missing in
    `public/images/user-guide/` → list them, exit 1; relative `.md` links →
    warn (planning docs aren't shipped).
- [package.json](package.json): `"generate-user-guide": "node
  scripts/generate-user-guide.mjs"` — **not** wired into build/dev (user
  decision; pnpm ignores pre-hooks anyway).
- [vite.config.ts](vite.config.ts) workbox block: add
  `globIgnores: ['user-guide.html', 'images/user-guide/**']`,
  `navigateFallbackDenylist: [/^\/user-guide/]` (without this, the installed
  app's SW NavigationRoute would render the SPA shell instead of the guide),
  and a `runtimeCaching` StaleWhileRevalidate rule (cacheName `user-guide`)
  matching `/user-guide.html` + `/images/user-guide/` so the guide works
  offline after first view.
- [eslint.config.mjs](eslint.config.mjs): widen the server Node-globals block
  files to `['server/**/*.mjs', 'scripts/**/*.mjs']`.
- Run `pnpm generate-user-guide`; commit script + `public/user-guide.html` +
  configs.

### 4. Settings link + tests

- [AboutSection.tsx](src/components/settings/AboutSection.tsx): replace the
  disabled User Guide row with a real link, keep Send Feedback placeholder,
  update the header comment:
  ```tsx
  <a href="/user-guide.html" target="_blank" rel="noopener"
     className="flex min-h-11 items-center justify-between gap-4 …focus-visible…">
    <span className="text-[0.9375rem] font-medium text-ink">User Guide</span>
    <ExternalLink className="size-4 text-ink-secondary" aria-hidden="true" />
  </a>
  ```
  (ExternalLink from lucide-react — new-tab affordance, not ChevronRight's
  drill-in.)
- [SettingsView.test.tsx](src/components/settings/SettingsView.test.tsx):
  assert `link` role named "User Guide" with the right href (no existing test
  asserts the "Coming soon" chips — verified).
- New **`e2e/user-guide.spec.ts`** (default project): (a)
  `request.get('/user-guide.html')` → 200 + `<title>How Long Since — User
  Guide`; (b) **SW-hijack guard**: `goto('/')`, `waitForServiceWorker(page)`
  (from [helpers.ts](e2e/helpers.ts)), then `goto('/user-guide.html')` and
  expect the guide h1 — the real regression test for the denylist; (c)
  `/settings` shows the link. (Bonus: this spec 404-guards the committed
  artifact's existence.)

### 5. README + full verification

- [README.md](README.md): standalone `[User Guide](docs/USER_GUIDE.md)` line
  under "Planning Documentation", noting how to regenerate HTML/screenshots.
- Create a `CHANGELOG.md` file documenting the official 1.0.0 release with these achieved: 
  - `dev/2026-07-01_phase1-mvp/phase1.md`
  - `dev/2026-07-03_grouped-tasks/phase1.1.md`
  - `dev/2026-07-07_user-guide/plan.md`

## Verification

1. `pnpm screenshots` → 12 PNGs in `public/images/user-guide/`; spot-check:
   light theme, no toast/banner bleed, framing.
2. `pnpm generate-user-guide` → idempotent; temporarily delete a referenced
   PNG → exits 1 listing it (restore).
3. `pnpm build` → `grep user-guide dist/sw.js`: appears only in
   denylist/runtimeCaching code, **not** in the precache manifest array;
   `dist/user-guide.html` + `dist/images/user-guide/` exist.
4. `pnpm preview` manual: guide renders, TOC anchors jump, images load; set app
   theme to Dark in Settings → reload guide tab → dark (same-origin
   localStorage mirror); OS-dark + "System" → dark via media query.
5. `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm e2e` (existing + new spec).
6. Installed-PWA check: Settings → User Guide opens the real page (not the app
   shell); after one visit, still loads offline (SWR cache).

## Gotchas

- Existing installs need one silent autoUpdate SW cycle before the denylist
  applies.
- Committed-artifact drift: mitigated by the generator's fail-on-missing-image,
  the "do not edit" banner, the MD header note, and the e2e existence check.
  No CI exists (verified — no .github/workflows), so no freshness gate; fine.
- The screenshots webServer builds before capture, so `dist/` holds *old*
  guide images during a capture run — irrelevant (we photograph the app, not
  the guide).
- Fixture goes through the real Zod import validation — future schema changes
  fail the capture spec loudly at seed time (desired).
- e2e TS files aren't typechecked by `tsc -b` (tsconfig.node.json includes only
  the two config files) — eslint still covers them; add the new playwright
  config to tsconfig.node.json since configs *are* typechecked.

## Critical files

- **New**: `docs/USER_GUIDE.md`, `scripts/generate-user-guide.mjs`,
  `playwright.screenshots.config.ts`, `e2e/screenshots/fixture.ts`,
  `e2e/screenshots/user-guide.spec.ts`, `e2e/user-guide.spec.ts`,
  `public/user-guide.html` (generated, committed),
  `public/images/user-guide/*.png` (captured, committed).
- **Modified**: `src/components/settings/AboutSection.tsx`,
  `src/components/settings/SettingsView.test.tsx`, `vite.config.ts`,
  `playwright.config.ts`, `package.json`, `tsconfig.node.json`,
  `eslint.config.mjs`, `README.md`.

## Appendix — verified feature facts the guide's copy must match

- Add task = modal via terracotta FAB ("Add task"); fields: name ≤128 ("What
  needs to be done?"), category pills + inline "+ New", time-estimate pills
  15 min/30 min/1 hr/2 hrs/4+ hrs (optional, "Clear"), "Should happen every"
  n + Days/Weeks/Months/Years, "Last done" Today/Yesterday/Pick date (default
  "Not done yet"; backfill supported), collapsed "Add details" (description
  ≤512, notes ≤512). Save = "Save task"/"Save changes".
- Fan-out (create only): "Track in multiple places" → "Where — or who?" chips
  (Enter/comma/blur commit, case-insensitive dedupe, ≤40 chars), dashed
  suggestion chips (labels already used in the selected category, ≤8) → one
  task per label with shared seriesId; toast "{n} tasks added". Edit mode =
  single label field; editing one sibling never touches others.
- Quick Wins: "How much time do you have?" 15/30/1h/2h cumulative; only tasks
  WITH an estimate ≤2 hrs (no-estimate and 4+ hrs never appear); ranked
  very-overdue → overdue → due-soon → none, tie = longest since done; cap 8;
  series siblings independent. Empty states: "No tasks yet. Tap + to add your
  first task." / "No tasks match this time filter."
- By Category: color-dot headers, defaults-first order; series = collapsed
  disclosure rows ("{n} places" chip, shared time chip when uniform, "x of n
  overdue", expand → per-sibling cards). Footer "Manage Categories".
- By Time: "Quick tasks" (15 min) / "Short tasks" (30 min) / "Medium tasks"
  (1 hr) / "Longer tasks" (2 hrs) / "Big projects" (4+ hrs) / "No time set";
  tinted category tags on cards.
- View toggle persists `currentView`; root redirects to remembered view once
  per session.
- Completion: circle button ("Mark {name} complete"), toast "Nice work!
  Updated {name}" + Undo (5 s, restores exact prior date incl. null). Elapsed
  compact: New / Today / Yest. / {n} d / wk / mo / yr.
- Overdue tiers: due-soon 80–100% (clock), overdue 100–150% ("!" badge, red
  border), very-overdue ≥150% (+ "Very overdue" pill); requires BOTH
  expectedFrequency AND lastCompletedAt; never-completed = "New", never
  overdue.
- Edit page: "Remove Task" — Archive ("Task archived", no confirm, hidden
  everywhere, NO unarchive UI) vs Delete (confirm "This can't be undone.
  Archive it instead to keep a copy.").
- Categories: /categories from Settings or By Category footer; 10 defaults
  (editable; deletable only when empty), 12 colors, None + 15 icons; delete
  rules: empty → confirm; non-empty non-default → "Reassign tasks first" →
  "Reassign & remove"; non-empty default → blocked toast.
- Settings: Appearance (Light/Dark/System, text size ×3, high contrast,
  reduced motion), Default View, Categories link, Notifications = "Coming
  soon", Data Management ("Last backup" row, "Export Data" JSON stamps
  lastBackupDate, "Export CSV" tasks-only, "Import Data" full REPLACE with
  confirm "Importing replaces your current tasks and categories.", Danger Zone
  "Clear All Data" wipes + reseeds), About & Help.
- Backup banner: never backed up OR ≥14 days; "It's been a while since your
  last backup."; dismiss is session-only.
- PWA: silent autoUpdate, browser-native install only, no offline indicator;
  first run = 10 default categories, 0 tasks.
- Backup envelope: `{ app: 'how-long-since', schemaVersion: 2, exportedAt,
  data: { tasks, categories, settings } }`; settings requires all 7 fields.
