import { create } from 'zustand';

/**
 * Transient, UI-only state. Persisted preferences (`currentView`, `theme`,
 * `textSize`, …) live in the Dexie `settings` singleton, NOT here — see
 * dev/phase1.md "Shared conventions". Task/category data is read straight from
 * Dexie via `useLiveQuery`; it never lives in Zustand.
 */
interface UIState {
  /** Whether the Add-Task modal is open (wired to open it in Step 7). */
  isAddTaskOpen: boolean;
  openAddTask: () => void;
  closeAddTask: () => void;

  /**
   * The pending "Just Done" undo. `previous` is the task's prior
   * `lastCompletedAt`, exactly as returned by `markTaskComplete` — a `Date`
   * for a re-completion or `null` for a first completion — so `undoComplete`
   * can restore it faithfully (Step 5 consumes this).
   */
  undoSnackbar: { taskId: string; previous: Date | null } | null;
  showUndo: (taskId: string, previous: Date | null) => void;
  dismissUndo: () => void;

  /**
   * The category chosen on the last task save, so the Add form can pre-select
   * it (Step 7). Session-only on purpose — a convenience default, not a
   * persisted preference, so it stays out of the Dexie settings singleton.
   */
  lastUsedCategoryId: string | null;
  setLastUsedCategory: (id: string) => void;

  /**
   * Whether the backup-reminder banner has been dismissed this session (Step 8).
   * Session-only: it resets on the next launch so the reminder returns until the
   * user actually takes a JSON backup (which clears it via `lastBackupDate`).
   */
  backupBannerDismissed: boolean;
  dismissBackupBanner: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAddTaskOpen: false,
  openAddTask: () => set({ isAddTaskOpen: true }),
  closeAddTask: () => set({ isAddTaskOpen: false }),

  undoSnackbar: null,
  showUndo: (taskId, previous) => set({ undoSnackbar: { taskId, previous } }),
  dismissUndo: () => set({ undoSnackbar: null }),

  lastUsedCategoryId: null,
  setLastUsedCategory: (id) => set({ lastUsedCategoryId: id }),

  backupBannerDismissed: false,
  dismissBackupBanner: () => set({ backupBannerDismissed: true }),
}));
