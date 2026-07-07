# B3 — Data peace of mind: storage persistence + Web Share backups

> **Pre-batch research note, written 2026-07-07** — the day B3 was evaluated
> for, and deliberately held out of, the 1.0.0 release. This is the
> pick-it-back-up input: findings, verified platform behavior, integration
> points, and the decisions the batch register will need. When work starts,
> create the usual dated `dev/YYYY-MM-DD_slug/plan.md`
> ([DEVELOPER_GUIDE](../docs/DEVELOPER_GUIDE.md) convention) and treat this
> file as its research appendix. Scope of record:
> [docs/ROADMAP.md § B3](../docs/ROADMAP.md#b3--data-peace-of-mind--s).

## Why it waited (decision, 2026-07-07)

- **No ratchet.** Unlike the completions log (which had to predate the first
  real completion — history can't be backfilled), `persist()` protects
  equally well from whenever it's called. Nothing is retroactively lost by
  shipping it a week after 1.0.0; the eviction risk in that gap for a
  daily-used origin is near zero.
- **It's visible UI**, so it pays the full repo toll: USER_GUIDE prose,
  `settings-data.png` recapture, regenerated `user-guide.html`, e2e, axe.
- **The Web Share path can't be honestly verified in this harness.** Its
  entire point is iOS-in-standalone, and neither Vitest nor Playwright can
  drive a native share sheet — it needs a real iPhone in hand.
- **Release discipline.** 1.0.0 had already absorbed three same-day additions
  (B0, the completions log, B9); B3 would have been the first without a
  now-or-never justification.
- Recorded recommendation: ship as a fast-follow (1.0.1-scale). If a slice
  had gone into 1.0.0, the defensible cut was persist()+readout only.

## Feature 1 — Storage persistence

**What:** one `navigator.storage.persist()` call flips the origin's storage
from *best-effort* (evictable under disk pressure, LRU-first) to
*persistent*; `navigator.storage.persisted()` reads the current state and
`navigator.storage.estimate()` returns fuzzy `{usage, quota}` numbers. A
"storage protection" row in Settings → Data Management shows the honest
state.

**Why:** all user data is irreplaceable IndexedDB with no sync until
Phase 3; backups are the only safety net. Nothing in the codebase requests
persistence today — the only quota-aware code is `isQuotaError` in
`src/lib/export-import.ts`, which *reacts* to storage failures
("Storage space is low…") but never *prevents* them. This is the prevention
half, at the cost of ~a dozen lines.

**Honest framing (important for copy):**

- **Chromium** auto-grants silently via heuristics — an **installed PWA is
  essentially always granted**; no prompt ever.
- **Firefox** shows a **user-facing permission prompt** → never request on
  boot; request in context.
- **Safari** (fully supported since 17) auto-decides, no prompt. **But
  `persist()` does NOT exempt a site from WebKit's 7-day rule** — script-
  writable storage (IndexedDB included) is deleted after seven days of
  browser use with no interaction with the site. The exemption is **adding
  the app to the home screen / dock**, not persistence. So for the scariest
  loss scenario (casual iPhone-Safari user who never installs), the install
  CTA (B4) is the fix; `persist()` covers pressure-eviction on
  Chromium/Firefox.
- `estimate()` is deliberately imprecise (privacy) and includes SW caches;
  this app's real usage is KB-scale. The readout is reassurance + a
  persisted-state indicator, not a meter to obsess over.

## Feature 2 — Web Share for backups

**What:** a feature-detected Share button beside Export Data that hands the
JSON backup to the native share sheet via
`navigator.share({ files: [new File([json], backupFilename('json'), { type: 'application/json' })] })`,
guarded by `navigator.canShare({ files })`.

**Why:** `downloadBlob` (`src/lib/download.ts`) is the classic `a[download]`
trick — exactly the pattern that's unreliable inside an installed iOS PWA
(standalone mode has no real Downloads affordance). The share sheet → Files /
iCloud / AirDrop is the native path, and lowering backup friction is data
protection: backups are the app's only restore mechanism.

**Support reality:** iOS/Android and Safari-on-macOS share files fine;
**desktop Firefox has no file sharing and no plans**; desktop Chromium is
partial by platform. Hence: always an *additional* button, never a
replacement for Export Data, rendered only where `canShare` passes.

**Contract detail that must not be missed:** `exportJson()` stamps
`lastBackupDate` (which clears the backup-reminder banner). The share path
must stamp **only when `share()` resolves** — a canceled sheet rejects with
`AbortError`, and a canceled share is *not* a backup; the banner must not
clear.

## Platform snapshot (verified 2026-07-07 — RE-VERIFY at execution)

| | `persist()` | Web Share with files |
|---|---|---|
| Chromium | Auto-granted by heuristics; installed PWA ⇒ effectively always | Mobile yes; desktop partial by platform |
| Firefox | **User-facing prompt**; denial remembered | **No files on desktop, no plans** |
| Safari | Fully supported since 17; auto-decides | Yes, incl. macOS |

Safari 7-day eviction: exempted by home-screen install, **not** by
`persist()`.

Sources: [WebKit — Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/) ·
[MDN — Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) ·
[caniuse — Web Share API](https://caniuse.com/web-share) ·
[MDN — navigator.share()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)

## Codebase integration points (read 2026-07-07)

- **`src/components/settings/DataManagementSection.tsx`** — the natural home.
  Already has a "Last backup" label/value row to pattern-match for a
  "Storage protection" row, a button row for the Share button, and the error
  copy constants (`QUOTA_ERROR` etc.) to extend.
- **`src/lib/download.ts`** — `downloadBlob` (the `a[download]` mechanism the
  share path routes around) and `backupFilename('json')` (reuse for the
  shared `File`'s name).
- **`src/lib/export-import.ts`** — `buildBackup`/`serializeBackup` are
  already separated from the download side effect, so a `shareJson()` sibling
  of `exportJson()` composes cleanly; stamp via the existing
  `updateSettings({ lastBackupDate })` flow, resolve-only.
- **Backup reminder banner** (`isBackupDue`, ui-store dismissal) — flow must
  be unchanged except that a successful share counts as a backup.

## Decisions the batch register must make

1. **When to request `persist()`** — never on boot (Firefox prompts).
   Candidates: piggyback on the first successful backup, an explicit
   "Protect data on this device" affordance, or auto-attempt only when
   already installed (Chromium grants silently there). Pick one; record it.
2. **Denied/unsupported copy** — factual, zero alarm (tone guide): the data
   isn't *at risk*, it's just not *pinned*; backups remain the real answer.
3. **Which exports get Share** — JSON only, or CSV too? (Leaning JSON-only:
   CSV is a convenience export, not a safety net.)
4. **Readout format** — persisted state prominent; usage/quota secondary or
   omitted (fuzzy, KB-scale, potentially confusing).
5. Whether the backup banner mentions protection state, or stays
   single-purpose.

## Implementation sketch (effort S, unchanged)

- New small lib module (e.g. `src/lib/storage-persistence.ts`):
  `getStorageStatus()` → `{ supported, persisted, usage, quota }` and
  `requestPersistence()` — thin wrappers, unit-tested with a mocked
  `navigator.storage` (jsdom has none; define it per-test).
- `shareJson()` in `export-import.ts` + conditional button in
  `DataManagementSection` (mock `navigator.share`/`canShare` in Vitest;
  assert stamp-on-resolve and no-stamp-on-`AbortError`).
- e2e can only assert feature-detected rendering/fallback. **Manual
  device checklist is part of "done":** on a real iPhone, installed
  standalone — share a backup to Files; cancel a share (banner must not
  clear); confirm the downloaded-vs-shared file round-trips through Import.
- A11y: ≥44 px targets, labeled state row, axe pass.
- Ship toll: USER_GUIDE "Back up and restore" section + `settings-data.png`
  recapture (**screenshots before `generate-user-guide`**), CHANGELOG under a
  new post-1.0.0 heading, ROADMAP B3 marked shipped, version bump (two
  places since B0).

## Carry-forward note for B4

`persist()` auto-grant (Chromium) and the 7-day exemption (Safari) both key
off **installation** — which quietly makes B4's install CTA the single
highest-leverage data-durability action a user can take. B3 and B4 are two
halves of one durability story; B4's register should say so.
