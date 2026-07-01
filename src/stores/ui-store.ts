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
}

export const useUIStore = create<UIState>((set) => ({
  isAddTaskOpen: false,
  openAddTask: () => set({ isAddTaskOpen: true }),
  closeAddTask: () => set({ isAddTaskOpen: false }),

  undoSnackbar: null,
  showUndo: (taskId, previous) => set({ undoSnackbar: { taskId, previous } }),
  dismissUndo: () => set({ undoSnackbar: null }),
}));
