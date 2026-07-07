import { useLiveQuery } from 'dexie-react-hooks';
import { DatabaseBackup, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { exportJson, isBackupDue, isQuotaError } from '@/lib/export-import';
import { getSettings } from '@/lib/settings';
import { useUIStore } from '@/stores/ui-store';

/**
 * A dismissible in-app reminder shown when no JSON backup has been taken in the
 * last two weeks (Req 7.7). Exporting refreshes `lastBackupDate`, which — via
 * `useLiveQuery` — hides the banner automatically. Dismiss is session-only, so
 * the reminder returns on the next launch until a backup is actually taken.
 */
export function BackupReminderBanner() {
  const settings = useLiveQuery(() => getSettings());
  const dismissed = useUIStore((s) => s.backupBannerDismissed);
  const dismissBanner = useUIStore((s) => s.dismissBackupBanner);

  if (!settings || dismissed || !isBackupDue(settings.lastBackupDate)) return null;

  const handleExport = async () => {
    try {
      await exportJson();
      toast.success('Backup saved');
    } catch (error) {
      toast.error(
        isQuotaError(error)
          ? 'Storage space is low. Consider removing old tasks.'
          : "Couldn't create backup. Please try again.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pt-3">
      <div
        role="region"
        aria-label="Backup reminder"
        className="flex flex-wrap items-center gap-2 rounded-card border border-border-default bg-surface-card p-3 shadow-[0_2px_8px_-6px_rgba(70,62,55,0.3)]"
      >
        <DatabaseBackup className="size-5 shrink-0 text-accent-deep" aria-hidden="true" />
        {/* No min-w-0: keep the text from collapsing to zero next to the button at
            large text sizes; flex-wrap lets the actions drop below instead (Req 6.8). */}
        <p className="flex-1 basis-40 text-sm text-ink">
          It&rsquo;s been a while since your last backup.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" onClick={() => void handleExport()}>
            Export data
          </Button>
          <button
            type="button"
            onClick={dismissBanner}
            aria-label="Dismiss"
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink-secondary outline-none hover:bg-surface-sunk hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
