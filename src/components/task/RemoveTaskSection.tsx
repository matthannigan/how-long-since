import { useState } from 'react';
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
import { archiveTask, deleteTask } from '@/lib/tasks';
import type { Task } from '@/types';

interface RemoveTaskSectionProps {
  task: Task;
  /** Called after the task is archived or deleted (parent navigates away). */
  onRemoved: () => void;
}

/**
 * "Remove Task" (Req 1.9–1.10): Archive is the reversible default (hidden but
 * restorable); Delete is permanent and always behind a confirm dialog. Rejected
 * writes surface the content-guide "Changes couldn't be saved" copy.
 */
export function RemoveTaskSection({ task, onRemoved }: RemoveTaskSectionProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleArchive = async () => {
    try {
      await archiveTask(task.id);
      toast.success('Task archived');
      onRemoved();
    } catch {
      toast.error("Changes couldn't be saved. Try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      toast.success('Task removed');
      onRemoved();
    } catch {
      toast.error("Changes couldn't be saved. Try again.");
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <section
      aria-labelledby="remove-task-heading"
      className="mt-8 border-t border-border-default pt-6"
    >
      <h3 id="remove-task-heading" className="font-display text-sm font-semibold text-ink">
        Remove Task
      </h3>
      <p className="mt-1 text-xs text-ink-meta-aa">
        Archive keeps it (hidden, restorable). Delete removes it permanently.
      </p>
      <div className="mt-3 flex gap-2">
        <Button type="button" variant="outline" onClick={handleArchive}>
          Archive
        </Button>
        <Button type="button" variant="destructive" onClick={() => setConfirmOpen(true)}>
          Delete
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this task?</DialogTitle>
            <DialogDescription>
              This can&rsquo;t be undone. Archive it instead to keep a copy.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
