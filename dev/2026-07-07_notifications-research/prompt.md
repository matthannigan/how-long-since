# Handoff prompt — B9: Notifications reality-check spike

> **Standalone execution prompt**, written 2026-07-07 when Phase 2 was scoped
> (see [docs/ROADMAP.md](../../docs/ROADMAP.md) § B9). Hand this file to a
> fresh session/agent to run the spike without any prior conversation context.
> **Time-box: about one day.** Hard constraint: this spike must be complete
> before any Phase 3 planning begins.

---

You are running **B9 — the notifications reality-check spike** for
**How Long Since**, a shipped 1.0.0 local-first household task PWA
(Vite + React 19 + TS, Dexie/IndexedDB, TanStack Router, Tailwind v4 +
shadcn/ui, vite-plugin-pwa). Everything lives on-device; there is **no
server, no account, and no network call on any critical path** — and no
Phase 2 feature is allowed to change that. Read
[docs/ROADMAP.md](../../docs/ROADMAP.md) (§ Guiding principles and § B9)
before starting; `AGENTS.md` gives the data model and tone rules.

## Why this spike exists

The README's Phase 2 list includes "Notifications," and Settings has shown a
disabled **"Coming soon"** stub since 1.0
(`src/components/settings/NotificationsSection.tsx`). When Phase 2 was
scoped, the owner (Matt) explicitly chose **research-then-decide over
build**: as of mid-2026, scheduled *local* notifications were not a
cross-browser reality (Notification Triggers stalled, Chrome-only) and real
push reminders require a server — which collides with local-first v2 and
belongs next to Phase 3's accounts/sync (Dexie Cloud). Your job is to turn
that "as of mid-2026" understanding into a **current, verified decision**.

## What to do

**This is a research spike — do not build notifications.** The only code
that ships is the Settings copy change (below).

1. **Research the current state with web search** — verify as of *your*
   execution date; do not trust this prompt's or your training data's
   support claims. Cover at least:
   - **Web Push** (Push API + VAPID): what a minimal server/relay actually
     requires; can it be deferred entirely to Phase 3's Dexie Cloud era?
   - **Apple/iOS**: Web Push for installed home-screen web apps, and
     **declarative web push** — current iOS/Safari status and constraints.
   - **Badging API** (`navigator.setAppBadge`): support matrix for installed
     PWAs on desktop Chromium, Android, iOS — and specifically **whether a
     badge can be set without push** on each platform. This was flagged as
     the likely "80% win" (a due-count on the app icon, no server).
   - **Notification Triggers / scheduled local notifications**: still dead?
   - **Periodic Background Sync**: support + whether it could refresh a
     badge; battery/permission reality.
   - Anything newer that changes the picture (the web platform moves).
2. **Build the options matrix** — for each option: what the user gets, what
   it costs (code, server, permissions UX), browser coverage, local-first /
   privacy fit, and tone fit (this app never nags — see
   `docs/CONTENT_STRATEGY_GUIDE.md`). Options to evaluate (add others you
   find):
   - A. Web Push + minimal server or push relay (likely Phase 3)
   - B. Badging API only — due-count on the installed icon
   - C. In-app "due today" surfaces only (no OS integration; pairs with
     ROADMAP B4's overview strip and B6's summary)
   - D. Defer everything to Phase 3
3. **Write the decision register** →
   `dev/2026-07-07_notifications-research/register.md` — the options matrix,
   a dated browser-support snapshot (with source links), the privacy/
   local-first stance, a clear **recommendation**, the **Phase 2-shippable
   subset** (if any), and what explicitly waits for Phase 3. Follow the
   register style of `dev/2026-07-03_grouped-tasks/phase1.1.md`.
4. **Ship the one code change:** rewrite the `NotificationsSection` stub
   copy to whatever is now *true* (e.g. what's coming, what isn't, and why —
   plain language, 8th-grade reading level, no guilt, no promises the
   register doesn't back). Keep the section disabled unless the register
   recommends shipping option B/C immediately — implementing anything beyond
   copy is **out of scope** for this spike.
5. **Propagate the copy change:**
   - `docs/USER_GUIDE.md` says "Notifications are noted as coming soon" —
     update that sentence to match, then run `pnpm generate-user-guide`
     (it smart-quotes itself) and commit the regenerated
     `public/user-guide.html` together with the Markdown. Only run
     `pnpm screenshots` first if the *visible* Settings UI changed.
   - Update `docs/ROADMAP.md`: mark B9 done in the at-a-glance table and B9
     section; add one-line feed-forward notes to B4 (overview strip) and B6
     (summary surface) reflecting the recommendation.
   - Add a `CHANGELOG.md` entry (Keep a Changelog style, under
     `[Unreleased]` unless told otherwise).

## Ship checklist (repo conventions — see docs/DEVELOPER_GUIDE.md)

- `pnpm test && pnpm lint && pnpm typecheck && pnpm e2e` green locally
  (CI also runs these on push).
- Conventional Commit, e.g.
  `docs: notifications decision register + honest Settings copy (Phase 2, B9)`.
- Do not touch the Workbox denylist block in `vite.config.ts`; never
  hand-edit `public/user-guide.html`.

## Done means

- `register.md` exists with a dated, sourced support snapshot and an
  unambiguous recommendation a future session can act on without re-research.
- Settings no longer promises something undecided — the copy tells the truth.
- ROADMAP B9 is marked done and B4/B6 carry the feed-forward notes.
- No notification feature was implemented.

## Key files

- `src/components/settings/NotificationsSection.tsx` — the stub to rewrite
- `docs/ROADMAP.md` — B9 brief, guiding principles, B4/B6 to annotate
- `docs/CONTENT_STRATEGY_GUIDE.md` — tone for the new copy
- `docs/USER_GUIDE.md` + `pnpm generate-user-guide` — user-facing line
- `docs/ARCHITECTURE.md` § "Phase 3: Turning On Sync" — the Dexie Cloud
  context that makes push a natural Phase 3 citizen
- `dev/2026-07-03_grouped-tasks/phase1.1.md` — register format example
