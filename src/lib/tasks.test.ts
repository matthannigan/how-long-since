import { beforeEach, describe, expect, it } from 'vitest';
import { ZodError } from 'zod';

import { db } from '@/lib/db/schema';

import {
  archiveTask,
  createTask,
  deleteTask,
  markTaskComplete,
  unarchiveTask,
  undoComplete,
  updateTask,
} from './tasks';

// The fake-indexeddb singleton persists across cases — clear it per test.
beforeEach(async () => {
  await Promise.all([db.tasks.clear(), db.categories.clear(), db.settings.clear()]);
});

const baseInput = {
  name: 'Water the plants',
  description: '',
  categoryId: crypto.randomUUID(),
  notes: '',
};

describe('createTask', () => {
  it('fills the system-owned fields and persists the task', async () => {
    const task = await createTask(baseInput);

    expect(task.id).toMatch(/[0-9a-f-]{36}/);
    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.lastCompletedAt).toBeNull();
    expect(task.isArchived).toBe(false);

    const stored = await db.tasks.get(task.id);
    expect(stored?.name).toBe('Water the plants');
  });

  it('rejects a name longer than 128 characters with a ZodError', async () => {
    await expect(createTask({ ...baseInput, name: 'a'.repeat(129) })).rejects.toBeInstanceOf(
      ZodError,
    );
  });
});

describe('updateTask', () => {
  it('patches editable fields', async () => {
    const task = await createTask(baseInput);
    await updateTask(task.id, { name: 'Water the ferns', notes: 'back porch' });

    const stored = await db.tasks.get(task.id);
    expect(stored?.name).toBe('Water the ferns');
    expect(stored?.notes).toBe('back porch');
  });
});

describe('markTaskComplete / undoComplete', () => {
  it('sets a fresh completion date and returns the prior null', async () => {
    const task = await createTask(baseInput);

    const prior = await markTaskComplete(task.id);
    expect(prior).toBeNull();

    const stored = await db.tasks.get(task.id);
    expect(stored?.lastCompletedAt).toBeInstanceOf(Date);
  });

  it('returns the prior completion date on a subsequent completion', async () => {
    const task = await createTask(baseInput);
    await markTaskComplete(task.id);
    const firstDate = (await db.tasks.get(task.id))!.lastCompletedAt!;

    const prior = await markTaskComplete(task.id);
    expect(prior?.getTime()).toBe(firstDate.getTime());
  });

  it('undo restores a null prior (never nulls a real earlier value by mistake)', async () => {
    const task = await createTask(baseInput);
    const prior = await markTaskComplete(task.id);

    await undoComplete(task.id, prior);
    expect((await db.tasks.get(task.id))?.lastCompletedAt).toBeNull();
  });

  it('undo restores the exact prior completion date', async () => {
    const task = await createTask(baseInput);
    const earlier = new Date(2020, 0, 1, 8, 0, 0);
    await db.tasks.update(task.id, { lastCompletedAt: earlier });

    const prior = await markTaskComplete(task.id);
    await undoComplete(task.id, prior);

    expect((await db.tasks.get(task.id))?.lastCompletedAt?.getTime()).toBe(earlier.getTime());
  });

  it('throws when completing a task that does not exist', async () => {
    await expect(markTaskComplete(crypto.randomUUID())).rejects.toThrow();
  });
});

describe('archiveTask / unarchiveTask / deleteTask', () => {
  it('archives and unarchives', async () => {
    const task = await createTask(baseInput);

    await archiveTask(task.id);
    expect((await db.tasks.get(task.id))?.isArchived).toBe(true);

    await unarchiveTask(task.id);
    expect((await db.tasks.get(task.id))?.isArchived).toBe(false);
  });

  it('hard-deletes a task', async () => {
    const task = await createTask(baseInput);
    await deleteTask(task.id);
    expect(await db.tasks.get(task.id)).toBeUndefined();
  });
});
