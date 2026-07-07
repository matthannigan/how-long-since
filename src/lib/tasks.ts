import { createTaskSchema, updateTaskSchema } from '@/schemas/task';
import type { Task } from '@/types';

import { synthesizeCompletions } from './completions';
import { db } from './db/schema';

/** Create a task from validated input, filling the system-owned fields. */
export async function createTask(input: unknown): Promise<Task> {
  const data = createTaskSchema.parse(input); // throws ZodError on invalid input
  const task: Task = {
    ...data, // includes lastCompletedAt (null unless backfilled via "Last done")
    id: crypto.randomUUID(),
    createdAt: new Date(),
    isArchived: false,
  };
  // A backfilled "Last done" bootstraps the completion log too, keeping the
  // invariant that every completed task has at least one logged row.
  await db.transaction('rw', db.tasks, db.completions, async () => {
    await db.tasks.add(task);
    await db.completions.bulkAdd(synthesizeCompletions([task]));
  });
  return task;
}

/**
 * Create one task per instance label from a single base input, all sharing a
 * freshly generated `seriesId` (Phase 1.1 fan-out — "five bedrooms to vacuum").
 * Labels are trimmed, empties dropped, and duplicates removed
 * case-insensitively; the insert is atomic. Callers with zero labels should
 * use `createTask` — an empty list after cleanup throws.
 */
export async function createTaskSeries(baseInput: unknown, labels: string[]): Promise<Task[]> {
  const data = createTaskSchema.parse(baseInput);

  const seen = new Set<string>();
  const cleaned = labels
    .map((label) => label.trim())
    .filter((label) => {
      if (!label || seen.has(label.toLowerCase())) return false;
      seen.add(label.toLowerCase());
      return true;
    });
  if (cleaned.length === 0) throw new Error('createTaskSeries requires at least one label');

  const seriesId = crypto.randomUUID();
  const createdAt = new Date();
  const tasks: Task[] = cleaned.map((instanceLabel) => ({
    ...data,
    id: crypto.randomUUID(),
    createdAt,
    isArchived: false,
    instanceLabel,
    seriesId,
  }));

  await db.transaction('rw', db.tasks, db.completions, async () => {
    await db.tasks.bulkAdd(tasks);
    await db.completions.bulkAdd(synthesizeCompletions(tasks)); // "Last done" backfill
  });
  return tasks;
}

/** Patch the editable fields of a task (name, category, frequency, notes, …). */
export async function updateTask(id: string, patch: unknown): Promise<void> {
  const data = updateTaskSchema.parse(patch);
  await db.tasks.update(id, data);
}

/** What `markTaskComplete` hands back so the 5-second Undo can reverse it exactly. */
export interface CompleteResult {
  /** The prior `lastCompletedAt` (may be `null`) — restored by `undoComplete`. */
  previous: Date | null;
  /** The appended completion-log row's id — deleted again on undo. */
  completionId: string;
}

/**
 * Mark a task complete: stamp a fresh `lastCompletedAt` **and append a row to
 * the completions log** (Phase 2 B6 groundwork — the log ships silently so
 * history accrues from the first real completion). Returns the prior date
 * (which may be `null`) so `undoComplete` can restore the exact earlier state,
 * plus the new log row's id so undo can delete it — restoring the date while
 * leaving the row would silently corrupt history. The read + both writes run
 * in one transaction so the captured value can't race a concurrent write.
 */
export async function markTaskComplete(id: string): Promise<CompleteResult> {
  return db.transaction('rw', db.tasks, db.completions, async () => {
    const task = await db.tasks.get(id);
    if (!task) throw new Error(`Task not found: ${id}`);
    const previous = task.lastCompletedAt;
    const now = new Date();
    const completionId = crypto.randomUUID();
    await db.completions.add({ id: completionId, taskId: id, completedAt: now });
    await db.tasks.update(id, { lastCompletedAt: now });
    return { previous, completionId };
  });
}

/**
 * Restore `lastCompletedAt` to the value captured by `markTaskComplete` and
 * delete the log rows that completion (or completion burst) appended.
 */
export async function undoComplete(
  id: string,
  previous: Date | null,
  completionIds: string[] = [],
): Promise<void> {
  await db.transaction('rw', db.tasks, db.completions, async () => {
    if (completionIds.length > 0) await db.completions.bulkDelete(completionIds);
    await db.tasks.update(id, { lastCompletedAt: previous });
  });
}

export async function archiveTask(id: string): Promise<void> {
  await db.tasks.update(id, { isArchived: true });
}

export async function unarchiveTask(id: string): Promise<void> {
  await db.tasks.update(id, { isArchived: false });
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id);
}
