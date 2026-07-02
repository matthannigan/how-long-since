import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const COMING_SOON = 'rounded-chip bg-surface-sunk px-2 py-0.5 text-xs font-medium text-ink-meta-aa';

/**
 * Notifications are a Phase 2 feature (app-pages §5.3). Shown here disabled with
 * a "Coming soon" marker rather than hidden, so the surface is discoverable —
 * and never renders toggles that silently do nothing.
 */
export function NotificationsSection() {
  return (
    <section
      aria-labelledby="notifications-heading"
      className="space-y-3 border-t border-border-default pt-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="notifications-heading" className="font-display text-lg font-semibold text-ink">
          Notifications
        </h2>
        <span className={COMING_SOON}>Coming soon</span>
      </div>
      <div className="flex min-h-11 items-center justify-between gap-4 opacity-60">
        <Label htmlFor="notif-overdue">Overdue task reminders</Label>
        <Switch id="notif-overdue" checked={false} disabled />
      </div>
      <div className="flex min-h-11 items-center justify-between gap-4 opacity-60">
        <Label htmlFor="notif-backup">Backup reminders</Label>
        <Switch id="notif-backup" checked={false} disabled />
      </div>
    </section>
  );
}
