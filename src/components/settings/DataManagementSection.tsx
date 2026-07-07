import { Download, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { exportCsv } from '@/lib/csv-export';
import { clearAllData, exportJson, importJson, isQuotaError } from '@/lib/export-import';
import type { AppSettings } from '@/types';

const IMPORT_ERROR = 'Import failed. The file may be corrupted or in the wrong format.';
const EXPORT_ERROR = "Couldn't create backup. Please try again.";
const QUOTA_ERROR = 'Storage space is low. Consider removing old tasks.';

function formatBackupDate(date: Date | null): string {
  if (!date) return 'No previous backups found.';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Data management: last-backup date, JSON (full backup) + CSV (tasks) export,
 * JSON import behind a replace-confirm, and the Clear-all danger zone. JSON is
 * the only import path — CSV is export-only. Destructive/irreversible actions
 * always confirm first; write failures surface content-guide error copy.
 */
export function DataManagementSection({ settings }: { settings: AppSettings }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  const handleExportJson = async () => {
    try {
      await exportJson();
      toast.success('Backup saved');
    } catch (error) {
      toast.error(isQuotaError(error) ? QUOTA_ERROR : EXPORT_ERROR);
    }
  };

  const handleExportCsv = async () => {
    try {
      await exportCsv();
      toast.success('Tasks exported');
    } catch {
      toast.error(EXPORT_ERROR);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // let the same file be re-selected later
    if (!file) return;
    try {
      setPendingImport(await file.text());
    } catch {
      toast.error(IMPORT_ERROR);
    }
  };

  const confirmImport = async () => {
    if (pendingImport === null) return;
    try {
      await importJson(pendingImport);
      toast.success('Data restored');
    } catch (error) {
      toast.error(isQuotaError(error) ? QUOTA_ERROR : IMPORT_ERROR);
    } finally {
      setPendingImport(null);
    }
  };

  const confirmClear = async () => {
    try {
      await clearAllData();
      toast.success('All data cleared');
    } catch {
      toast.error("Changes couldn't be saved. Try again.");
    } finally {
      setClearOpen(false);
    }
  };

  return (
    <section
      aria-labelledby="data-heading"
      className="space-y-4 border-t border-border-default pt-6"
    >
      <h2 id="data-heading" className="font-display text-lg font-semibold text-ink">
        Data Management
      </h2>

      <div className="flex min-h-11 items-center justify-between gap-4">
        <span className="text-[0.9375rem] font-medium text-ink">Last backup</span>
        <span className="text-sm text-ink-meta-aa">
          {formatBackupDate(settings.lastBackupDate)}
        </span>
      </div>

      <p className="text-sm text-ink-meta-aa">
        We recommend backing up your data regularly. Backups are stored as files on your device and
        can be used to restore your tasks if needed.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void handleExportJson()}>
          <Download aria-hidden="true" /> Export data
        </Button>
        <Button type="button" variant="outline" onClick={() => void handleExportCsv()}>
          <Download aria-hidden="true" /> Export CSV
        </Button>
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload aria-hidden="true" /> Import data
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => void handleFileChange(e)}
      />

      <div className="rounded-card border border-overdue-border p-4">
        <h3 className="font-display text-sm font-semibold text-overdue-aa">Danger Zone</h3>
        <p className="mt-1 text-sm text-ink-meta-aa">
          Permanently delete all tasks and reset categories to the defaults.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="mt-3"
          onClick={() => setClearOpen(true)}
        >
          <Trash2 aria-hidden="true" /> Clear all data
        </Button>
      </div>

      <Dialog
        open={pendingImport !== null}
        onOpenChange={(open) => {
          if (!open) setPendingImport(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Import this backup?</DialogTitle>
            <DialogDescription>
              Importing replaces your current tasks, categories, and settings. This can&rsquo;t be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setPendingImport(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void confirmImport()}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Clear all data?</DialogTitle>
            <DialogDescription>
              This permanently deletes all tasks and resets categories. This can&rsquo;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setClearOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={() => void confirmClear()}>
              Clear all data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
