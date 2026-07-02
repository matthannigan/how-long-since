import { useLiveQuery } from 'dexie-react-hooks';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { sortCategoriesForDisplay } from '@/lib/category-order';
import { db } from '@/lib/db/schema';
import { useUIStore } from '@/stores/ui-store';

import { TaskForm } from './TaskForm';

/**
 * The Add-Task modal (app-pages §2): opened by the FAB via `isAddTaskOpen`,
 * closed by save / Cancel / Esc / overlay. Radix Dialog supplies the focus
 * trap and focus restore. Lives in the shell so it overlays whichever view is
 * active. Edits use the full-page route instead — see `routes/tasks.$taskId`.
 */
export function AddTaskDialog() {
  const isOpen = useUIStore((s) => s.isAddTaskOpen);
  const close = useUIStore((s) => s.closeAddTask);
  const categories = useLiveQuery(() => db.categories.toArray(), []);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
          <DialogDescription className="sr-only">
            Add a task to track how long since you last did it.
          </DialogDescription>
        </DialogHeader>
        {categories && (
          <TaskForm
            mode="create"
            categories={sortCategoriesForDisplay(categories)}
            onDone={close}
            onCancel={close}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
