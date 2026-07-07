# B9 — Notifications reality-check (research spike) — Decision Register

> **Status: complete (2026-07-07).** This was a *research-then-decide* spike, not
> a build. The only code that shipped is the Settings copy rewrite
> (`src/components/settings/NotificationsSection.tsx`); **no notification
> feature was implemented.** Read the [ROADMAP B9 brief](../../docs/ROADMAP.md#b9--notifications-reality-check-spike-s--run-early)
> and the [handoff prompt](prompt.md) for why this exists; this file is the
> durable answer a future session can act on **without re-researching**.

## Why this spike exists

The README's Phase 2 list includes "Notifications," and Settings has shown a
disabled **"Coming soon"** stub since 1.0. When Phase 2 was scoped, the owner
chose research over build: as of mid-2026 the working understanding was that
*scheduled local* notifications weren't a cross-browser reality and real *push*
reminders need a server — which collides with the app's absolute
[local-first principle](../../docs/ROADMAP.md#guiding-principles) and sits more
naturally next to Phase 3's accounts/sync (Dexie Cloud). This spike turns that
"as of mid-2026" hunch into a **current, verified decision** with a dated,
sourced support snapshot.

---

## TL;DR — the recommendation

**Do not build OS notifications in Phase 2.** The reminder value the feature was
reaching for is delivered better, for everyone, with no server and no
permission, by surfaces the app already plans to build.

1. **Primary (Phase 2): in-app "what's due" surfaces — Option C.** Already
   scoped as **B4**'s overview strip (overdue / due-soon / done-this-week) and
   **B6**'s gentle monthly summary. Universal across every browser, zero
   permissions, zero server, perfectly on-tone. *This is the reminder.*
2. **Progressive enhancement (Phase 2, small, rides B4): a due-count app-icon
   badge — Option B, scoped to permission-free installed desktop Chromium
   only.** One feature-detected `navigator.setAppBadge(dueCount)` call, no
   permission prompt anywhere, silent no-op on every platform that can't do it
   for free. Genuinely local-first; a nice ambient touch on desktop, not a
   headline feature.
3. **Deferred to Phase 3: Web Push — Option A.** Real "reach me while the app is
   closed" reminders require a server (VAPID sender + scheduler + subscription
   store) and, on iOS, an installed home-screen app + a notification-permission
   grant. That breaks local-first, so it belongs where the backend already
   exists — the Dexie Cloud era. It becomes a *bounded add-on* there, not a
   rearchitecture.
4. **Rejected outright: scheduled local notifications (Notification Triggers).**
   The one API that would let a closed PWA remind you with no server is dead —
   never shipped to stable, development formally ended, no non-Chromium
   interest. Do not build on it.

**Settings copy:** the two disabled toggles ("Overdue task reminders", "Backup
reminders") and the "Coming soon" chip are replaced with honest static copy —
reminders live in the app; the app stays account-free and on-device; phone push
may come later with optional cloud sync. No working toggle ships in this spike.

---

## Browser-support snapshot — verified 2026-07-07

Compiled from live first-party sources (WebKit blog, Chrome for Developers,
chromestatus, MDN, caniuse) accessed 2026-07-07. Current browser lines at access
time: Chrome/Edge 150, Firefox 155, Safari 26 (iOS 26 / macOS 26). Full source
list at the end. Legend: ✅ shipped/usable · ⚠️ works with a material caveat ·
❌ unsupported.

### 1. Scheduled local notifications — `showTrigger` / `TimestampTrigger`

| Engine | Status |
|---|---|
| Chromium (Chrome/Edge/Android) | ❌ **Never shipped.** Two origin trials (M80–83, M86–88), both ended. Flag-only (`#enable-experimental-web-platform-features`). Chrome's own doc now carries a banner: *"development … has ended … wasn't clear that we could provide consistent and reliable experiences across platforms."* |
| Firefox | ❌ "No signal." No implementation, no spec on the standards track. |
| Safari / WebKit | ❌ "No signal." No spec, no plans. |

**Verdict: dead.** The only API for a *no-server, fires-while-closed* local
reminder is not a cross-browser reality and never became one. Unusable in
production.

### 2. Web Push — Push API + VAPID

| Platform | `PushManager.subscribe` | Notes |
|---|---|---|
| Chrome/Edge desktop | ✅ (Chrome 42 / Edge 17) | server required to *send* |
| Firefox desktop | ✅ (44) | |
| Chrome/Firefox Android | ✅ | supported since Chrome-Android 42 (caniuse shows only the *current* line — not a minimum) |
| Safari macOS | ✅ (16.1) | works in an ordinary tab — no install needed |
| Safari iOS / iPadOS | ⚠️ (16.4+) | **only for a home-screen–installed web app**; no push in a plain tab, on any iOS version incl. 26 |

- Baseline **"widely available" since March 2023**; ~95% of tracked users.
- **Sending a push always needs a server.** The client can *subscribe* with no
  backend, but delivering a message requires something holding the **VAPID
  private key** to POST a signed request to the subscription's push endpoint —
  and a *reminder* app additionally needs a **subscription store** and a
  **scheduler** ("task X is overdue → fire now"). There is no client-only path.
- **Declarative Web Push** (iOS 18.4 / macOS 15.5 / Safari 26, 2025) makes
  delivery more *reliable* (the notification renders even if the service worker
  was evicted) but is **Apple-only in production** and **still server-sent** — it
  changes the payload, not the need for a backend.
- **iOS permission** must be requested from a user gesture inside the installed
  app; a denied user can only re-enable in iOS Settings.

**Verdict: universally supported, structurally server-bound.** Great coverage,
but it cannot be a no-server feature.

### 3. Badging API — `navigator.setAppBadge()` *(the pivot)*

| Platform (installed PWA) | Supported | Needs notif. permission | Settable with **no** push | Persists when closed | Min ver |
|---|---|---|---|---|---|
| Chrome/Edge desktop — Windows/macOS | ✅ | **No** | ✅ foreground; SW via Periodic Sync | ✅ | 81 (Apr 2020) |
| Chrome desktop — Linux | ⚠️ API present, OS doesn't draw it | — | — | — | — |
| **Chrome — Android** | ❌ **not implemented** | — | — | — | — |
| Safari — iOS / iPadOS | ⚠️ | **Yes** | ⚠️ foreground / push-handler only; **no background refresh without a server push** | ✅ | 16.4 (Mar 2023) |
| Safari — macOS (Dock) | ⚠️ real but under-documented | Yes | ⚠️ foreground only | ✅ | 17 (2023) |
| Firefox / Samsung Internet | ❌ | — | — | — | — |

- ~42% global usage. **Every platform requires the app to be installed** — a
  plain tab gets no icon badge.
- **The clean, permission-free, no-server win is installed desktop Chrome/Edge
  only.** There a single `setAppBadge(dueCount)` on app open needs no
  permission, persists on the taskbar/Dock icon, and can even refresh in the
  background via Periodic Background Sync.
- **iOS is only a partial win:** the badge renders **only after a notification
  permission grant**, and — because iOS has no background JS/Periodic Sync — it
  freezes at the value from the last time the app was opened. Since this app's
  "overdue" status changes purely with *elapsed time* (no user action), an iOS
  badge goes stale between opens and can't be kept live without a server push.
  Asking for notification permission *just to draw a badge we then can't keep
  current* is off-tone (see [stance](#privacy--local-first--tone-stance)), so we
  don't.
- Calling `setAppBadge()` never itself prompts for permission (only
  `Notification.requestPermission()` does); on platforms that need permission it
  silently no-ops / throws `NotAllowedError` (catchable). So a guarded
  `navigator.setAppBadge(n).catch(() => {})` renders on desktop Chromium and is a
  harmless no-op everywhere else — **no permission is ever requested.**

**Verdict: a real but *partial* progressive enhancement**, not the "80% win" the
hypothesis hoped for. Clean on desktop Chromium; permissioned + stale on iOS;
absent on Android Chrome and Firefox.

### 4. Periodic Background Sync — `periodicSync`

| Platform | Supported | Notes |
|---|---|---|
| Chrome/Edge desktop, Chrome Android, Opera, Samsung | ✅ (Chromium 80) | installed PWA + site-engagement score; **best-effort ~12–36 h**, only on a previously-used network |
| Firefox | ❌ | Mozilla position: the spec is *"harmful."* |
| Safari macOS / iOS | ❌ | WebKit bug 204117 **RESOLVED / WONTFIX** — *"We oppose this feature and will not implement it."* |

- The **only** server-free way to refresh a badge while the app is closed — and
  it works on **installed desktop Chromium only** (Android Chrome has the sync
  but not the Badging API; iOS/Firefox have neither).

**Verdict: Chromium-only and throttled.** Fine as an optional desktop
badge-refresh later; not a cross-platform reminder mechanism.

---

## The options matrix

| Option | What the user gets | Cost (code · server · permission) | Browser coverage | Local-first / privacy fit | Tone fit | Verdict |
|---|---|---|---|---|---|---|
| **A. Web Push + minimal server/relay** | Reminders that reach the phone/desktop while the app is closed | Server or serverless sender (VAPID key + subscription store + scheduler); iOS needs install + permission; relays route data through a 3rd party | ~95% where installed & permitted; iOS needs home-screen install | ❌ needs a backend + identity; relays leak data | ⚠️ interruptive — must be strictly opt-in & gentle | **Phase 3** (fold into Dexie Cloud) |
| **B. Badging API only** | A due-count number on the installed app icon | A few feature-detected lines; **no server**; no permission on desktop Chromium; iOS needs permission & goes stale | ✅ desktop Chrome/Edge · ⚠️ iOS Safari · ❌ Android Chrome, Firefox; **install required** | ✅ fully on-device, nothing sent | ✅ ambient, non-nagging (desktop); ❌ don't prompt iOS permission for it | **Phase 2, scoped** to permission-free desktop badge-on-open (rides B4) |
| **C. In-app "due today" surfaces** | "What's due / overdue" the moment the app opens; a gentle monthly recap | Pure UI over existing `useLiveQuery` reads; no permission, no server, no new deps | ✅ every browser, every platform | ✅ perfect | ✅ user opened the app → not a nag; no guilt | **Phase 2 — the primary reminder** (B4 + B6) |
| **D. Defer everything to Phase 3** | Nothing new in Phase 2 | none | — | ✅ | ✅ | ❌ leaves the free universal win (C) and free desktop badge (B) on the table; only push (A) actually needs deferring |

---

## Privacy / local-first / tone stance

The app's core promise is absolute: **all data on-device, no account, no server,
no network call on any critical path** — and no Phase 2 feature may weaken it
([ROADMAP guiding principles](../../docs/ROADMAP.md#guiding-principles)).

- **Web Push structurally violates the promise.** It requires an always-on
  server, a device subscription registered with a push service (Google/Mozilla/
  Apple), and — to be useful — a user identity to route reminders. Hosted relays
  (OneSignal, Pusher, FCM, Novu) additionally funnel users' task data through a
  third party. So push can't be a Phase 2 feature without breaking the thing
  that makes this app what it is. In **Phase 3** cloud is an explicit, opt-in
  choice the user makes by signing in — the honest home for push.
- **Badging and in-app surfaces keep the promise fully.** Nothing leaves the
  device; the badge asks the OS to draw a number and sends no data anywhere.
- **Tone: the app never nags** ([CONTENT_STRATEGY_GUIDE §2.3](../../docs/CONTENT_STRATEGY_GUIDE.md)).
  In-app surfaces are seen only when the user *chose* to open the app. A passive
  icon badge is ambient, not interruptive. Real push *interrupts* — so if/when it
  ships in Phase 3 it must be strictly opt-in, quiet, and free of guilt language
  ("Vacuuming is overdue," never "You still haven't…"). And we do **not** request
  a notification permission in Phase 2 for any purpose, because nothing in Phase
  2 sends a notification — asking would be a dark pattern.

---

## Decisions register (locked 2026-07-07)

| Decision | Resolution | Why |
|---|---|---|
| Build vs. research | **Spike only** — research, decide, ship copy | Cross-browser scheduled local notifications don't exist; push needs a server, which breaks local-first |
| Scheduled local notifications (Notification Triggers) | **Rejected — do not build** | Abandoned/flag-only; never shipped to stable; no non-Chromium interest |
| Web Push | **Deferred to Phase 3** | Needs a server (VAPID sender + scheduler + subscription store) + identity; a bounded add-on once Dexie Cloud exists |
| Primary Phase 2 reminder | **In-app due surfaces** (B4 overview strip + B6 monthly summary) | Universal, permission-free, zero server, on-tone; the value push was chasing, delivered for everyone |
| Badging API | **Phase 2, scoped**: set the due count on app open, installed **desktop Chromium only**, permission-free, feature-detected, silent no-op elsewhere | The one clean no-permission/no-server badge case; rides B4's already-computed count |
| iOS badge | **Not in Phase 2** | Requires a notification permission it can't otherwise use *and* goes stale between opens; off-tone to prompt |
| Background badge refresh (Periodic Sync) | **Parked** — optional desktop-only polish, anytime | Chromium-desktop-only and throttled; low value while it can't cover phones |
| Hosted push relays (OneSignal, etc.) | **Rejected** | Route users' task data through a third party — violates the privacy stance. If push is built, self-own the sender (e.g. a Cloudflare Worker) or use Dexie Cloud's own infrastructure |
| Notification permission prompt | **Not requested anywhere in Phase 2** | Nothing in Phase 2 sends a notification; asking would nag/dark-pattern |
| Settings section | **Keep visible, replace toggles with honest copy**; no working toggle in this spike | The section must be discoverable but must not promise something undecided; a real toggle ("Show due count on app icon") can land with B4's badge |

---

## The Phase 2-shippable subset

Nothing here is built by this spike; these are the commitments the recommendation
hands to other batches.

- **B4 — Desktop at home:** the overview strip is the primary "what's due"
  surface. When it computes the overdue/due-soon counts it already has, add a
  guarded `navigator.setAppBadge(overdueOrDueCount)` (and `clearAppBadge()` at
  zero) — feature-detected, no permission, desktop-Chromium effectively the only
  place it renders. Optionally host a single **"Show due count on the app icon"**
  toggle in the (now honest) Settings → Notifications section. Decide the exact
  count semantics (overdue-only vs. overdue+due-soon) and default (on vs. opt-in)
  in the B4 register.
- **B6 — Insights & history:** the gentle monthly summary is the second in-app
  "reminder" surface; keep it encouragement-only (no streaks/shame), consistent
  with this stance.

## Explicitly Phase 3 (waits for the backend)

- **Web Push reminders** — overdue nudges and backup nudges delivered while the
  app is closed. Fold into the Dexie Cloud era, where an always-on server, user
  auth, and a synced subscription store already exist; add a VAPID key pair, a
  scheduled job, and a sender (a Worker/function or Dexie Cloud web hooks). Use
  **Declarative Web Push** on Apple platforms for reliability. Strictly opt-in.
  See [ARCHITECTURE — Phase 3: Turning On Sync](../../docs/ARCHITECTURE.md#phase-3-turning-on-sync).
- This register is the input the [Phase 3 horizon](../../docs/ROADMAP.md#phase-3-horizon)
  note already points at.

---

## Sources (accessed 2026-07-07)

**Scheduled local notifications**
- Chrome for Developers — Notification Triggers API (carries the "development has
  ended" banner): https://developer.chrome.com/docs/web-platform/notification-triggers
- chromestatus — Notification Triggers (feature 5133150283890688; OT M80–83 /
  M86–88; Firefox & Safari "No signal"): https://chromestatus.com/feature/5133150283890688

**Web Push + VAPID**
- MDN — Push API (Baseline "widely available" since March 2023): https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- caniuse — Push API: https://caniuse.com/push-api
- WebKit — Web Push for Web Apps on iOS and iPadOS (2023-02-16; home-screen
  requirement, user-gesture permission): https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- WebKit — Meet Declarative Web Push (2025-03-27): https://webkit.org/blog/16535/meet-declarative-web-push/
- WebKit — WebKit Features in Safari 26.0 (2025-09-15; "zero installability
  requirements," silent on push mechanics): https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- RFC 8292 — VAPID for Web Push: https://datatracker.ietf.org/doc/html/rfc8292
- web.dev — The Web Push Protocol (why the server, not the browser, sends): https://web.dev/articles/push-notifications-web-push-protocol
- web-push (npm) — https://www.npmjs.com/package/web-push · PushForge / edge
  senders — https://github.com/block65/webcrypto-web-push
- Dexie discussion #1648 — Dexie Cloud stores subscriptions, does **not** send
  push (Fahlander, 2023): https://github.com/dexie/Dexie.js/discussions/1648

**Badging API**
- caniuse — Navigator.setAppBadge (Chrome/Edge 81, Safari macOS 17, Safari iOS
  16.4; Firefox / Chrome-Android / Samsung = No): https://caniuse.com/mdn-api_navigator_setappbadge
- MDN — Navigator.setAppBadge (last modified 2026-05-21; "Limited availability /
  not Baseline"; `NotAllowedError`): https://developer.mozilla.org/en-US/docs/Web/API/Navigator/setAppBadge
- WebKit — Badging for Home Screen Web Apps (2023-04-25; install + notification
  permission required; push ≠ auto-badge): https://webkit.org/blog/14112/badging-for-home-screen-web-apps/
- Chrome for Developers — Badging for app icons (foreground works; Periodic Sync
  refresh without push; Android unsupported): https://developer.chrome.com/docs/capabilities/web-apis/badging-api

**Periodic Background Sync**
- MDN — Web Periodic Background Synchronization API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API
- caniuse — Periodic Background Sync: https://caniuse.com/wf-periodic-background-sync
- WebKit bug 204117 — Periodic Background Sync **RESOLVED / WONTFIX**: https://bugs.webkit.org/show_bug.cgi?id=204117
- Chrome for Developers — Periodic Background Sync (install + engagement gating,
  ~12 h floor): https://developer.chrome.com/docs/capabilities/periodic-background-sync

**Source caveats flagged during research** (see the spike's research notes): the
EU "no web push" claim repeated by some 2026 vendor blogs is **stale** — Apple
reversed the DMA-era removal of home-screen web apps in March 2024, so web push
works in the EU on installed web apps. MDN's PWA prose guide still says macOS
Safari desktop lacks Badging, which **contradicts** MDN's own BCD data and
caniuse (Safari 17 = supported) plus hands-on reports; treat macOS-Safari
badging as real-but-secondary. Several Chrome-doc pages show stale 2018–2019
timestamps but their individual facts are corroborated elsewhere.
