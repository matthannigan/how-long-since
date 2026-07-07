/**
 * Notifications. The B9 research spike (2026-07-07,
 * `dev/2026-07-07_notifications-research/register.md`) decided *against*
 * building OS notifications in Phase 2: cross-browser scheduled local
 * notifications don't exist (Notification Triggers is abandoned), and real push
 * needs a server + account — which breaks local-first and belongs in Phase 3
 * (Dexie Cloud). So this section stays visible and discoverable but honest:
 * plain copy explaining where reminders live and why phone push waits, with no
 * toggles that silently do nothing.
 */
export function NotificationsSection() {
  return (
    <section
      aria-labelledby="notifications-heading"
      className="space-y-3 border-t border-border-default pt-6"
    >
      <h2 id="notifications-heading" className="font-display text-lg font-semibold text-ink">
        Notifications
      </h2>
      <div className="space-y-3 text-sm text-ink-meta-aa">
        <p>
          How Long Since keeps everything on your device — no account, and
          nothing leaves your device. That&rsquo;s also why it can&rsquo;t send
          alerts to your phone or email: reaching you while the app is closed
          would take an always-on server and a sign-in.
        </p>
        <p>
          Your reminders live in the app instead. Open it any time to see
          what&rsquo;s due or overdue, and it&rsquo;ll remind you to back up your
          data every couple of weeks.
        </p>
        <p>
          Phone notifications may come in a later release, along with optional
          cloud sync — always your choice, and only if you sign in.
        </p>
      </div>
    </section>
  );
}
