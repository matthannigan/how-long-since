import { createTaskSchema, updateTaskSchema } from '@/schemas/task';
import type { Task } from '@/types';

import { db } from './db/schema';

/** Create a task from validated input, filling the system-owned fields. */
export async function createTask(input: unknown): Promise<Task> {
  const data = createTaskSchema.parse(input); // throws ZodError on invalid input
  const task: Task = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    lastCompletedAt: null,
    isArchived: false,
  };
  await db.tasks.add(task);
  return task;
}

/** Patch the editable fields of a task (name, category, frequency, notes, …). */
export async function updateTask(id: string, patch: unknown): Promise<void> {
  const data = updateTaskSchema.parse(patch);
  await db.tasks.update(id, data);
}

/**
 * Mark a task complete and **return its prior `lastCompletedAt`**. Returning the
 * previous value (which may be `null`) is what lets `undoComplete` restore the
 * exact earlier state instead of nulling it. The read + write run in one
 * transaction so the captured value can't race a concurrent write.
 */
export async function markTaskComplete(id: string): Promise<Date | null> {
  return db.transaction('rw', db.tasks, async () => {
    const task = await db.tasks.get(id);
    if (!task) throw new Error(`Task not found: ${id}`);
    const previous = task.lastCompletedAt;
    await db.tasks.update(id, { lastCompletedAt: new Date() });
    return previous;
  });
}

/** Restore `lastCompletedAt` to the value captured by `markTaskComplete`. */
export async function undoComplete(id: string, previous: Date | null): Promise<void> {
  await db.tasks.update(id, { lastCompletedAt: previous });
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
