import type { Completion, Task } from '@/types';

/**
 * Bootstrap rows for the completions log (Phase 2 B6 groundwork, shipped
 * silently in 1.0.0): one synthetic completion per already-completed task,
 * stamped at its `lastCompletedAt`. Real history can never be reconstructed
 * after the fact — this single row per task is the one that CAN be — so the
 * same helper runs everywhere a completed task can exist without log rows:
 * the Dexie v3 upgrade, imports of pre-v3 backups, dev seeding, and
 * create-time "Last done" backfills.
 */
export function synthesizeCompletions(
  tasks: ReadonlyArray<Pick<Task, 'id' | 'lastCompletedAt'>>,
): Completion[] {
  return tasks
    .filter((task) => task.lastCompletedAt !== null)
    .map((task) => ({
      id: crypto.randomUUID(),
      taskId: task.id,
      completedAt: task.lastCompletedAt!,
    }));
}
