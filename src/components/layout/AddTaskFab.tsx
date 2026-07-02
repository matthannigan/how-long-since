import { Plus } from 'lucide-react';

import { useUIStore } from '@/stores/ui-store';

/**
 * Floating action button for Add Task (style-guide §3.1): a 56px terracotta
 * squircle fixed lower-right, above the safe-area insets. Opens the Add-Task
 * modal (`AddTaskDialog`) via the UI store, and hides itself while that modal
 * is open so it doesn't sit over the overlay.
 */
export function AddTaskFab() {
  const isAddTaskOpen = useUIStore((s) => s.isAddTaskOpen);
  const openAddTask = useUIStore((s) => s.openAddTask);
  if (isAddTaskOpen) return null;

  return (
    <button
      type="button"
      onClick={openAddTask}
      aria-label="Add task"
      className="fixed z-40 flex size-[56px] items-center justify-center rounded-[18px] bg-accent text-white shadow-[0_8px_20px_-8px_rgba(217,140,99,0.7)] transition-[filter,transform] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page focus-visible:outline-none active:scale-95"
      style={{
        right: 'calc(env(safe-area-inset-right, 0px) + 1.25rem)',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)',
      }}
    >
      <Plus className="size-7" aria-hidden="true" />
    </button>
  );
}
