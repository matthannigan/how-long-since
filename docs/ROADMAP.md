# How Long Since — Phase 2 Roadmap

> **Scoped 2026-07-07, on top of the shipped 1.0.0. Nothing here is started.**
> This document turns the README's Phase 2 ("Enhanced Experience") bullets into
> an ordered plan of **independently shippable batches**, sized against the
> as-built code and researched against the locked stack. The
> [README](../README.md#roadmap) keeps the phase-level summary; this file is
> canonical for *what Phase 2 contains and in what order*;
> [CHANGELOG.md](../CHANGELOG.md) records what actually ships.
>
> **How to read it:** ★ marks proposals beyond the original README list
> (brainstormed and adopted 2026-07-07). Effort is relative to Phase 1 steps —
> **S** ≈ hours, **M** ≈ a focused day or two (a typical Phase 1 step),
> **L** ≈ a multi-step mini-phase. Batch IDs (B0–B9) are stable labels; the
> ordering is a recommendation, and the [cut line](#the-cut-line) says what
> survives if Phase 2 halves. Each batch, when started, gets its own dated
> `dev/YYYY-MM-DD_slug/` plan + decisions register per the
> [Developer Guide](DEVELOPER_GUIDE.md#where-we-left-off--whats-next)
> convention, and `main` stays releasable between batches.

## Guiding principles

- **Local-first stays absolute** — no Phase 2 feature may require a server,
  an account, or a network call on any critical path.
- **WCAG 2.1 AA on every new surface** — ≥44 px targets, 4.5:1 text, non-color
  status cues, keyboard paths for every gesture, and JS-driven motion must
  self-gate on `[data-reduced-motion]` (the CSS kill-switch in `globals.css`
  cannot catch JS transforms).
- **No-guilt tone everywhere** — new copy (snooze, filters, stats, tours)
  follows [CONTENT_STRATEGY_GUIDE.md](CONTENT_STRATEGY_GUIDE.md); stats
  encourage, never shame.
- **Bundle discipline** — new dependencies ride route chunks or lazy imports
  (the PapaParse precedent), never the root chunk. Phase 2 adds at most two
  small runtime deps: dnd-kit (B5) and driver.js (B7).
- **Schema changes follow one rule** — see the
  [schema strategy](#schema-strategy) table. Only one real Dexie migration in
  the whole phase (B6's `completions` table).

## At a glance

| # | Batch | Ships | Daily-use value | Effort | Schema | New deps |
|---|-------|-------|-----------------|--------|--------|----------|
| [B0](#b0--housekeeping-before-features--sm) | Housekeeping ★ — **✅ shipped in 1.0.0** | CI, `APP_VERSION` wiring, bundle report | — (safety net) | S–M | none | dev-only |
| [B1](#b1--find--focus-m) | Find & focus | text search ★, unarchive ★, "Done today" ★; facet filters + sort as stretch | **High** | M | none | none |
| [B2](#b2--swipe--snooze-m) | Swipe & snooze | swipe-to-complete, swipe-to-snooze ★ | **High** | M | field-only | none |
| [B3](#b3--data-peace-of-mind--s) | Data peace of mind ★ | `storage.persist()`, usage readout, Web Share backups | Med (durability) | S | none | none |
| [B4](#b4--desktop-at-home-m) | Desktop at home | responsive dashboard, keyboard shortcuts ★, PWA shortcuts ★, install CTA ★ | Med–High | M | none | none |
| [B5](#b5--categories-your-order-sm) | Categories, your order | drag-and-drop category reorder | Med (set & forget) | S–M | field-only | **dnd-kit** |
| [B6](#b6--insights--history--m) | Insights & history ★ | completion log, per-task history, gentle monthly summary | Med | M | **Dexie v3** | none |
| [B7](#b7--welcome-kit-m) | Welcome kit | template packs, guided empty states, optional tour | Low (owner) / High (new users) | M | field-only | **driver.js** |
| [B8](#b8--make-it-yours-ml) | Make it yours | two additional color palettes | Low (delight) | M–L | field-only | none |
| [B9](#b9--notifications-reality-check-spike-s--run-early) | Notifications spike ★ | decision register + honest Settings copy | — (informs B4/B6 & Phase 3) | S | none | none |

> **B9 doesn't wait its turn** — run it early, in parallel with B1–B3. Its
> likely answer ("an in-app due-today surface and maybe an icon badge, not
> push") shapes B4's stat chips and B6's summary. Hard trigger: it must be
> done before any Phase 3 planning starts.

---

## B0 — Housekeeping before features ★ (S–M)

> **✅ Shipped in 1.0.0 (2026-07-07)** —
> [dev/2026-07-07_b0-housekeeping/plan.md](../dev/2026-07-07_b0-housekeeping/plan.md).

A multi-batch phase needs regression safety before feature one; before B0,
nothing ran `pnpm e2e` unless someone remembered to.

- **CI (GitHub Actions):** `pnpm test && lint && typecheck && e2e` on PRs —
  pnpm + Node 22 caching, `playwright install --with-deps`, and e2e must
  **build first** then run against `vite preview` on :4173 (the specs assume a
  production build and clean DB). Keep `pnpm screenshots` out of CI (separate
  config by design). Add a bundle-size report per PR — Phase 2 adds the first
  new runtime deps since 1.0 and [REQUIREMENTS.md](REQUIREMENTS.md) Req 11.7
  currently has no tripwire — and a cheap assert that `CHANGELOG.md` mentions
  the `package.json` version.
- **`APP_VERSION` from package.json:** one Vite `define` (the hardcoded
  constant in `src/components/settings/AboutSection.tsx` already carries a
  comment admitting this is the plan). Cuts the "version lives in three
  places" chore to two.
- **Done means:** a PR that breaks a test cannot merge quietly; About shows
  the package.json version; CI is documented in the Developer Guide.

## B1 — Find & focus (M)

The highest-frequency need: *"where is that task, and what deserves attention
right now?"* Everything here is in-memory over `useLiveQuery` reads — the
established pattern (the boolean-index trap already forces whole-table reads)
— so there is no schema change and no new dependency.

- **★ Text search** across name, description, notes, and place label. Plain
  case-insensitive `.includes()` — at a few hundred tasks a search dependency
  is unjustifiable.
- **★ Unarchive UI** — closes the #1 known 1.0 gap. A "Show archived" surface
  listing archived tasks with a **Restore** action wired to the existing,
  currently-unused `unarchiveTask()` (`src/lib/tasks.ts`). Archived rows need
  their own treatment (no completion button, no overdue styling). Note:
  `src/components/task/TaskList.tsx` is **dead code** (zero importers) —
  either revive it as this surface or delete it; don't leave it ambiguous.
- **★ "Done today"** — a small collapsed section of tasks completed today.
  Completed tasks currently vanish to the bottom of sorted lists instantly;
  a day-scoped "✓ Done today (3)" group gives closure feedback. Purely
  derived from `lastCompletedAt`, no storage.
- **Stretch (ship last, or defer):** facet filters (category, time
  commitment, overdue status, place label) and sort controls (name,
  longest-since, most-overdue — reuse `OVERDUE_STATUS_RANK` from
  `src/lib/overdue.ts`). The status facet partially duplicates what card
  badges already communicate, which is why it's stretch, not core.
- **Approach:** pure predicates in a new `src/lib/task-filter.ts` (unit-test
  like `overdue.ts`); a `FilterBar` scoped to **By Category and By Time
  only** — Quick Wins already *is* a filter (`filterForQuickPick`, its own
  radio state, cap of 8) and gets search at most. Filter/search state lives in
  the Zustand `ui-store` and is **session-transient by design** (persisting it
  would need a settings field — deliberate non-goal for now). Series groups
  degrade gracefully for free: `src/lib/series.ts` only groups when ≥2
  siblings are in the rendered list, so a lone matching sibling renders flat.
- **A11y / tone:** labeled controls, `aria-live` result counts, ≥44 px chips;
  empty-result copy stays neutral ("Nothing matches these filters" — never a
  guilt spin).
- **Done means:** search + unarchive + "Done today" live in both grouped
  views; axe clean; e2e covers search-and-restore; filters/sort explicitly
  shipped or explicitly deferred in the batch register.

## B2 — Swipe & snooze (M)

The single highest daily-use win in the phase — one thumb, done — deliberately
unchained from any migration. Also the README's "Swipe gestures" item
([REQUIREMENTS.md](REQUIREMENTS.md) Req 5.3).

- **Gesture:** a hand-rolled `SwipeableRow` wrapper (Pointer Events) used
  *inside* `TaskCard` — one call site covers all four render contexts
  (By Category, By Time, Quick Wins, expanded series). **Swipe right =
  Complete; swipe left = Snooze.** (Swipe-to-edit would be redundant — the
  whole card body is already an edit `<Link>`.) Research verdict: no gesture
  library; Motion's drag support (~27 kB gz) was rejected, `react-swipeable`
  (~2 kB) is the fallback if pointer-event edge cases bite.
- **Landmines (all verified in code, plan for them):** suppress the Link's
  click after a horizontal drag (pointer capture + threshold), or a tap still
  navigates on release; `touch-action: pan-y` so vertical scroll survives;
  resolve the visual fight with the Link's `active:scale-[0.99]`; **no swipe
  on series-group disclosure rows** (ambiguous target — expanded siblings get
  swipe for free as stock TaskCards); reduced-motion skips the slide animation
  but keeps the revealed actions.
- **Refactor first:** extract the complete/undo/burst logic out of
  `TaskCompletionButton.tsx` into a shared `useCompleteTask` hook — swipe must
  reuse the burst-safe toast + exact-undo contract, not copy it.
- **★ Snooze ("Not now"):** `Task.snoozedUntil?: Date` — Zod-optional,
  un-indexed, **no Dexie bump** (the Phase 1.1 `instanceLabel` precedent).
  `calculateOverdueStatus` returns `'none'` while `now < snoozedUntil` (~3
  lines in `src/lib/overdue.ts`, automatically consistent across Quick Wins
  ranking, series worst-of, and card styling); `markTaskComplete` clears it; a
  non-color "Snoozed" chip marks the state; also reachable as a visible button
  (gesture-free path). CSV export appends the column **last** (pinned-header
  test, `instanceLabel` precedent). Copy is gentle: "Not now — remind me
  later," never "skipped."
- **Decision box — the silent log option:** B6 wants a `completions` table,
  and history **cannot be backfilled later** (only one synthetic row per task
  can ever be reconstructed). Since this batch already extracts
  `useCompleteTask`, appending silently to a `completions` store here is
  small. Taking it pulls the phase's only Dexie bump into B2; skipping it
  keeps B2 migration-free. Decide in the batch register.
- **Testing:** Playwright `page.mouse` drags against the preview build; unit
  tests for the snooze branch of `overdue.ts`; axe pass on revealed actions.
- **Done means:** complete and snooze reachable by swipe on touch *and* by
  visible buttons; undo still exact (including bursts); scroll unharmed;
  reduced-motion honored; e2e swipe spec green.

## B3 — Data peace of mind ★ (S)

Backups are the app's only safety net, and the browser is allowed to evict
IndexedDB under storage pressure. Two cheap durability wins, both in Settings
→ Data Management:

- **`navigator.storage.persist()`** request + a storage-usage readout
  (`storage.estimate()`). Nothing in the codebase requests persistence today;
  for a local-first app under Safari/Chrome eviction policies this is the
  cheapest real protection available. Show the granted/denied state honestly.
- **Web Share for backups:** `navigator.share({ files })` alongside the
  existing download — `downloadBlob` is awkward inside an installed iOS PWA,
  and anything that lowers backup friction protects real data. Falls back to
  the current download path where unsupported.
- **Done means:** persistence requested and surfaced; a backup can be shared
  to Files/Drive/AirDrop on a phone; the backup-reminder banner flow is
  unchanged.

## B4 — Desktop at home (M)

The README's "Desktop-optimized dashboard," scoped as a **responsive
enhancement of the existing views — no new routes**. Lands before the
migration-bearing batches while the schema is still boring.

- **Layout:** widen `AppShell` (`max-w-2xl` → `lg:max-w-5xl`-ish) with an
  `lg:` sidebar (view switcher, category jump links, Add button); By Category
  / By Time flow into multi-column CSS grid/columns with DOM order preserved
  (a11y). An overview strip (overdue / due soon / done this week) computes
  from the already-loaded `useLiveQuery` arrays — richer once B6 exists, and
  informed by B9's findings.
- **★ Keyboard shortcuts:** `n` new task, `/` focus search (B1), `1/2/3`
  switch views, `?` help dialog. One small hook in AppShell; **no-op when
  `event.target` is input/textarea/contenteditable or a dialog is open**
  (`ui-store.isAddTaskOpen` / Radix scroll lock).
- **★ PWA manifest `shortcuts`** ("Add task", "Quick Wins") in the `VitePWA`
  block — workbox config untouched. The add-task deep link (e.g. `/?new=1`)
  must **bypass the remember-last-view redirect** in `src/routes/index.tsx`
  (module-level flag) and open the add sheet.
- **★ Install CTA:** capture `beforeinstallprompt` → an "Install app" row in
  Settings (with iOS "Add to Home Screen" instructions in the user guide).
  The app is installable today but never invites it.
- **Testing:** add a Playwright **desktop project** rather than modifying the
  mobile-viewport specs; axe on the new nav landmarks.
- **Done means:** the app is pleasant at 1280 px (no tunnel of whitespace);
  shortcuts work and are discoverable via `?`; installed-app shortcut jumps
  straight to a new task; user guide gains a short desktop note if visuals
  changed (screenshots regen rule applies).

## B5 — Categories, your order (S–M)

The README's touch drag-and-drop reorder — rare-use (set-and-forget) but a
long-standing ask, and cheaper than originally guessed: **no Dexie migration
needed.**

- **UI:** dnd-kit sortable list on the existing Manage Categories screen
  (`/categories` — the dependency rides that route's chunk, never the root
  bundle). A dedicated ≥44 px **drag handle** per row (rows already contain
  Edit/Remove buttons — whole-row dragging would fight them), touch sensor
  with an activation delay so the page still scrolls, keyboard sensor with
  announcements worded per the tone guide ("Kitchen moved to position 2").
  Build-time choice, recorded in the batch register: classic
  `@dnd-kit/core`+`sortable` (battle-tested) vs the new `@dnd-kit/react`
  rewrite (cleaner API, 0.x).
- **Data:** optional `Category.order?: number` — no index (≤ ~30 rows sort in
  memory), hence **no version bump**. On first drag, materialize `order` for
  *all* categories in one transaction (avoids mixed ordered/unordered
  comparator states). `sortCategoriesForDisplay()` (`src/lib/category-order.ts`)
  gains an order-first comparator with today's heuristic as fallback — it's
  the single choke point, so By Category, Manage Categories, and the task-form
  pickers all follow automatically. Import schema gains the optional field;
  the backup envelope is unchanged and old backups import as before.
- **Done means:** drag works with touch, mouse, and keyboard (announced to
  screen readers); order survives reload and export/import round-trips; a
  fresh install still shows the familiar default order.

## B6 — Insights & history ★ (M)

The phase's one true migration, taken deliberately late (or pulled into B2 via
the decision box there). Answers "how often do I *really* do this?" — data the
app quietly throws away today.

- **Data:** new `completions` store `{id, taskId, completedAt}` — Dexie
  `version(3).stores({ completions: 'id, taskId, completedAt' })`, and the
  export stamp bumps to 3 in lockstep (`DB_SCHEMA_VERSION` in
  `src/lib/export-import.ts` deliberately mirrors the Dexie version).
  Backfill on upgrade: synthesize one completion per task from
  `lastCompletedAt` — otherwise every stat reads zero for months.
- **The undo interlock (the subtle part):** `markTaskComplete` widens its
  transaction to append a completion and returns `{previous, completionId}`;
  **burst taps create N rows and the single undo must delete all of them**
  (the burst ref accumulates ids). An asymmetric undo would silently corrupt
  history. `applyBackup` and `clearAllData` must include and clear the new
  table — restoring a pre-B6 backup legitimately wipes history; say so in the
  import confirm copy.
- **Envelope:** `data.completions` is optional with default `[]` — every
  older backup keeps importing.
- **UI:** a completion history list on the task edit page; a gentle monthly
  summary ("12 things done this month — nice.") surfaced per B9's findings
  (Settings card or a Quick Wins footer). **No streaks, no chains, no broken
  anything** — encouragement only, per the content guide.
- **Done means:** every completion is logged exactly once (bursts included);
  undo leaves no orphan rows; old backups import; history renders on the edit
  page; the summary reads as a pat on the back, not a scoreboard.

## B7 — Welcome kit (M)

Templates + onboarding, grouped because templates give onboarding its payoff:
"start from a template" beats staring at an empty list. Serves future users
more than the current owner — which is exactly why it sits here and not
earlier.

- **Template packs:** static JSON behind a dynamic `import()` (the PapaParse
  precedent keeps them out of the root chunk). Packs: **New Homeowner
  Starter** (named in the original product briefing), Apartment Basics, Pet
  Care, Vehicle, Digital Hygiene, Health & Self, Garden. Entries carry name,
  suggested frequency, time commitment, and a **default-category UUID**
  (stable since seeding) — with a recreate-or-remap fallback, because empty
  default categories *can* be deleted. Case-insensitive dedupe by
  name+category; picker sheet → per-task checkboxes → `bulkAdd`. **Content
  curation is most of this batch's effort** — every task name and frequency
  follows the tone guide.
- **Onboarding** ([REQUIREMENTS.md](REQUIREMENTS.md) Req 8.1) — empty states
  first, tour second (the research consensus; long tours get skipped):
  - A shared `EmptyState` component replacing the four bare `<p>` strings
    (Quick Wins, By Category, By Time, task list) — first-run version offers
    "Add your first task" and "Start from a template."
  - An optional ~3-step driver.js spotlight tour (views → add button →
    completion circle), lazy-imported so it never enters the main chunk,
    replayable from Settings → About & Help, `animate: false` under reduced
    motion, and **auto-shown only when `!hasSeenTour && tasks.length === 0`**
    so a backup restore never re-triggers it.
- **Data:** `settings.hasSeenTour` — Zod `.default(false)`, no bump.
- **Done means:** a brand-new install can go from zero to a seeded, sensible
  task list in under a minute; the tour is skippable, replayable, axe-clean;
  no pack creates duplicates on re-import.

## B8 — Make it yours (M–L)

Multiple UI themes — last among the majors on purpose: zero functional gain
for the daily user, the highest design cost in the phase, and a standing tax
(every future component must honor N palettes). Freely swappable with B7 by
mood; both sit below the daily-use line.

- **Scope cap: two new palettes** alongside Soft Daylight, each specified
  light + dark with a full AA reconciliation (the [STYLE_GUIDE.md](STYLE_GUIDE.md)
  §1.6 exercise re-litigated per palette — including category colors and tag
  tints against the new surfaces).
- **Design decision (locked here): palette ⊥ light/dark.** A palette swaps
  surface/ink/accent values but preserves the light|dark axis — so the
  existing `theme` setting, the sonner `ThemedToaster` mapping, and the
  pre-paint logic stay one-dimensional. New `settings.colorTheme` (Zod
  `.default('soft-daylight')`, no bump).
- **Honest cost accounting (verified in code):** ~4 CSS blocks per palette in
  `globals.css` (light + the *two* dark declarations + the separately-themed
  `.quick-pick-panel`) × the AA matrix (palette × light/dark ×
  high-contrast). Runtime sync points: settings schema → Dexie →
  `hls-prefs` localStorage mirror (atomic with the write, per the existing
  `updateSettings` flow) → the pre-paint guard in `index.html` →
  `PreferencesProvider` → **regenerate `public/user-guide.html`** (it embeds a
  verbatim copy of the guard script; never hand-edit). Update
  `<meta name="theme-color">` at runtime; the installed-app chrome
  (manifest `theme_color`) stays Soft Daylight — accepted limitation, note it
  in the guide.
- **Docs:** STYLE_GUIDE gains per-palette token tables; user-guide screenshots
  stay Soft-Daylight-canonical.
- **Done means:** two new palettes selectable in Appearance with non-color
  labels; no flash of wrong palette on cold load; AA verified across the full
  matrix; dark mode and high contrast behave in every palette.

## B9 — Notifications reality-check ★spike (S — run early)

The README lists notifications and Settings has shown "Coming soon" since 1.0.
The honest research answer so far: **scheduled local notifications are not a
cross-browser reality** (Notification Triggers stalled, Chrome-only), and real
push reminders need a server — which collides with local-first v2 and belongs
next to Phase 3's accounts. So: a time-boxed spike, not a build.

- **Deliverable:** a decision register in `dev/` — options matrix (Web Push +
  minimal server · **Badging API**: a due-count on the installed icon, no push
  needed on desktop Chromium — likely the 80% win · in-app "due today"
  surfaces · defer entirely to Phase 3/Dexie Cloud), a late-2026
  browser-support snapshot, the privacy/local-first stance, and a
  recommendation with a Phase 2-shippable subset.
- **Plus one code touch:** rewrite the `NotificationsSection` "Coming soon"
  copy to whatever is true.
- **Scheduling:** parallel with B1–B3; **must complete before any Phase 3
  planning.** Its findings feed B4's overview strip and B6's summary surface.
- **Done means:** the register exists with a clear recommendation; Settings
  no longer promises something undecided.
- **Ready to run:** a standalone handoff prompt for this spike lives at
  [dev/2026-07-07_notifications-research/prompt.md](../dev/2026-07-07_notifications-research/prompt.md).

---

## Cross-cutting engineering notes

### Schema strategy

Dexie object stores are schemaless — a version bump is only *required* to add
or change **stores or indexes**. The import validator is deliberately tolerant
(`schemaVersion: z.number()`, never range-compared — verified), so every older
backup imports forever; Zod strips unknown fields, so a *newer* backup imported
into an *older* app silently drops the new data (accepted; eventually note it
in the import confirm copy).

| Change | Dexie bump? | Zod strategy | Backup envelope |
|---|---|---|---|
| `Category.order` (B5) | **No** — no index; materialize on first drag | `.optional()`, heuristic fallback | unchanged |
| `Task.snoozedUntil` (B2) | **No** — filtered in memory | `.optional()`; import `z.coerce.date().optional()`; CSV column appended last | unchanged |
| `completions` table (B6) | **Yes — the phase's only bump** (`version(3)`) | new `completionSchema`; `data.completions` optional, default `[]` | stamp → 3 (lockstep `DB_SCHEMA_VERSION`) |
| `settings.colorTheme` (B8) | No | `.default('soft-daylight')` | unchanged |
| `settings.hasSeenTour` (B7) | No | `.default(false)` + tasks-empty gate | unchanged |

**The rule:** new store/index ⇒ Dexie version bump + envelope stamp bump (in
lockstep with `DB_SCHEMA_VERSION` in `src/lib/export-import.ts`) + a migration
unit test. Optional per-row field with a safe default ⇒ Zod-only, no bump —
the proven Phase 1.1 pattern. If B2's silent-log option is taken, the one bump
moves there and B6 becomes UI-only.

### Every batch, before it ships

The [Developer Guide](DEVELOPER_GUIDE.md#where-we-left-off--whats-next)
checklist applies each time: dated `dev/` plan + decisions register;
`pnpm test && pnpm lint && pnpm typecheck && pnpm e2e` green; CHANGELOG +
README status updated; [AGENTS.md](../AGENTS.md) updated if the data model
changed; `pnpm screenshots` + `pnpm generate-user-guide` if the UI changed;
version bumped. Plus, standing for Phase 2:

- **A11y:** axe + keyboard pass on every new surface; ≥44 px targets;
  non-color indicators; JS animation self-gates on reduced motion.
- **Bundle:** new deps ride route chunks (dnd-kit → `/categories`, driver.js →
  lazy first-run); nothing joins the root chunk; watch B0's size report.
- **Tests:** new routes register in `renderWithRouter`
  (`src/test/router.tsx`); every Dexie bump gets a migration unit test.
- Update **this file** — mark the batch shipped and re-order what remains if
  priorities moved.

## The cut line

If Phase 2 had to halve, keep: **B0** (CI), **B1 slimmed** (search +
unarchive), **B2** (swipe + snooze — and smuggle in the silent completions log
if the hook extraction happens anyway, since history can't be backfilled
later), and **B9** (a day, and it gates Phase 3). Everything else defers:
reorder is rare-use (the ten defaults already have a sane order), and
desktop / history UI / welcome kit / themes are either not-daily or
design-heavy.

## Parking lot

Considered for Phase 2 and deliberately deferred:

| Idea | Why it waits |
|---|---|
| Bulk actions / multi-select | Real scope (selection mode, a11y); no daily pain yet |
| Duplicate task | Nice-to-have; templates (B7) cover the main case |
| Pause seasonal tasks | A far-future `snoozedUntil` (B2) may already cover it — revisit after B2 |
| CSV *import* | JSON remains the only restore path by design |
| Markdown in notes | Rendering + sanitizing cost outweighs 512-char notes |
| Per-category default frequency | Speculative; no evidence it saves real taps |
| Confetti / celebration moments | Tone risk + reduced-motion complexity; the "Nice work!" toast already lands |
| File System Access auto-backup | Chromium-only; B3's share path covers the need |
| Home-screen widgets | Not a web-platform capability |
| Notification *implementation* | Pending B9's verdict → likely Phase 3 |

## Phase 3 horizon

Accounts, sync, and shared households via Dexie Cloud, exactly as planned in
[ARCHITECTURE.md](ARCHITECTURE.md#phase-3-turning-on-sync) — nothing in Phase
2 may preempt it, and two things feed it: **B9's decision register** (push
notifications become natural once a server exists) and **B6's `completions`
table** (which syncs like any other store). Scope it only when it's real work.
