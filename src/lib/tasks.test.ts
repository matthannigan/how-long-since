import { beforeEach, describe, expect, it } from 'vitest';
import { ZodError } from 'zod';

import { db } from '@/lib/db/schema';

import {
  archiveTask,
  createTask,
  createTaskSeries,
  deleteTask,
  markTaskComplete,
  unarchiveTask,
  undoComplete,
  updateTask,
} from './tasks';

// The fake-indexeddb singleton persists across cases — clear it per test.
beforeEach(async () => {
  await Promise.all([
    db.tasks.clear(),
    db.categories.clear(),
    db.settings.clear(),
    db.completions.clear(),
  ]);
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
    expect(await db.completions.count()).toBe(0); // never completed → nothing logged
  });

  it('bootstraps a completion row when "Last done" is backfilled at create time', async () => {
    const lastDone = new Date('2026-06-20T09:00:00.000Z');
    const task = await createTask({ ...baseInput, lastCompletedAt: lastDone });

    const rows = await db.completions.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].taskId).toBe(task.id);
    expect(rows[0].completedAt.getTime()).toBe(lastDone.getTime());
  });

  it('rejects a name longer than 128 characters with a ZodError', async () => {
    await expect(createTask({ ...baseInput, name: 'a'.repeat(129) })).rejects.toBeInstanceOf(
      ZodError,
    );
  });
});

describe('createTaskSeries', () => {
  it('creates one task per label sharing a seriesId, with distinct ids', async () => {
    const tasks = await createTaskSeries(baseInput, ['Main bedroom', 'Guest room', "Kids' room"]);

    expect(tasks).toHaveLength(3);
    const seriesIds = new Set(tasks.map((t) => t.seriesId));
    expect(seriesIds.size).toBe(1);
    expect([...seriesIds][0]).toMatch(/[0-9a-f-]{36}/);
    expect(new Set(tasks.map((t) => t.id)).size).toBe(3);
    expect(tasks.map((t) => t.instanceLabel)).toEqual(['Main bedroom', 'Guest room', "Kids' room"]);

    expect(await db.tasks.count()).toBe(3);
  });

  it('trims labels, drops empties, and dedupes case-insensitively', async () => {
    const tasks = await createTaskSeries(baseInput, ['  Luna ', '', 'luna', 'Biscuit', '   ']);
    expect(tasks.map((t) => t.instanceLabel)).toEqual(['Luna', 'Biscuit']);
  });

  it('bootstraps one completion row per sibling when "Last done" is backfilled', async () => {
    const lastDone = new Date('2026-06-20T09:00:00.000Z');
    const tasks = await createTaskSeries({ ...baseInput, lastCompletedAt: lastDone }, ['A', 'B']);

    const rows = await db.completions.toArray();
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map((r) => r.taskId))).toEqual(new Set(tasks.map((t) => t.id)));
  });

  it('throws when no labels survive cleanup, without writing anything', async () => {
    await expect(createTaskSeries(baseInput, ['', '  '])).rejects.toThrow(/at least one label/);
    expect(await db.tasks.count()).toBe(0);
  });

  it('inserts atomically — a duplicate id rolls back the whole batch', async () => {
    const existing = await createTask(baseInput);
    // Force a bulkAdd collision by pre-inserting a row whose id will collide:
    // stub randomUUID so the second generated task id duplicates `existing.id`.
    const original = crypto.randomUUID.bind(crypto);
    let calls = 0;
    crypto.randomUUID = (() => {
      calls += 1;
      // call 1 = seriesId, call 2 = first task id, call 3 = second task id
      return calls === 3 ? existing.id : original();
    }) as typeof crypto.randomUUID;
    try {
      await expect(createTaskSeries(baseInput, ['A', 'B'])).rejects.toThrow();
    } finally {
      crypto.randomUUID = original;
    }
    expect(await db.tasks.count()).toBe(1); // only the pre-existing task
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

  it('sets and clears instanceLabel (explicit undefined deletes the property)', async () => {
    const task = await createTask(baseInput);

    await updateTask(task.id, { instanceLabel: 'Guest room' });
    expect((await db.tasks.get(task.id))?.instanceLabel).toBe('Guest room');

    // The Phase 1.1 risk-retirement check: an explicitly-undefined key must
    // survive Zod and make Dexie delete the stored property.
    await updateTask(task.id, { instanceLabel: undefined });
    const cleared = await db.tasks.get(task.id);
    expect(cleared).toBeDefined();
    expect(cleared?.instanceLabel).toBeUndefined();
    expect(Object.keys(cleared ?? {})).not.toContain('instanceLabel');
  });

  it('does not allow seriesId to be patched (system-owned)', async () => {
    const [task] = await createTaskSeries(baseInput, ['Main bedroom', 'Guest room']);
    await updateTask(task.id, { seriesId: crypto.randomUUID(), name: 'Renamed' });

    const stored = await db.tasks.get(task.id);
    expect(stored?.name).toBe('Renamed');
    expect(stored?.seriesId).toBe(task.seriesId); // unchanged
  });
});

describe('markTaskComplete / undoComplete', () => {
  it('sets a fresh completion date, logs a row, and returns the prior null', async () => {
    const task = await createTask(baseInput);

    const { previous, completionId } = await markTaskComplete(task.id);
    expect(previous).toBeNull();

    const stored = await db.tasks.get(task.id);
    expect(stored?.lastCompletedAt).toBeInstanceOf(Date);

    // The log row matches the stamped date exactly.
    const logged = await db.completions.get(completionId);
    expect(logged?.taskId).toBe(task.id);
    expect(logged?.completedAt.getTime()).toBe(stored?.lastCompletedAt?.getTime());
  });

  it('returns the prior completion date on a subsequent completion', async () => {
    const task = await createTask(baseInput);
    await markTaskComplete(task.id);
    const firstDate = (await db.tasks.get(task.id))!.lastCompletedAt!;

    const { previous } = await markTaskComplete(task.id);
    expect(previous?.getTime()).toBe(firstDate.getTime());
  });

  it('undo restores a null prior and deletes the logged row', async () => {
    const task = await createTask(baseInput);
    const { previous, completionId } = await markTaskComplete(task.id);

    await undoComplete(task.id, previous, [completionId]);
    expect((await db.tasks.get(task.id))?.lastCompletedAt).toBeNull();
    expect(await db.completions.count()).toBe(0);
  });

  it('undo restores the exact prior completion date', async () => {
    const task = await createTask(baseInput);
    const earlier = new Date(2020, 0, 1, 8, 0, 0);
    await db.tasks.update(task.id, { lastCompletedAt: earlier });

    const { previous, completionId } = await markTaskComplete(task.id);
    await undoComplete(task.id, previous, [completionId]);

    expect((await db.tasks.get(task.id))?.lastCompletedAt?.getTime()).toBe(earlier.getTime());
  });

  it('one undo reverses a whole burst: N completions → N rows → 0 rows', async () => {
    const task = await createTask(baseInput);

    const first = await markTaskComplete(task.id);
    const second = await markTaskComplete(task.id);
    const third = await markTaskComplete(task.id);
    expect(await db.completions.count()).toBe(3);

    // The component accumulates a burst's ids and undoes with all of them.
    await undoComplete(task.id, first.previous, [
      first.completionId,
      second.completionId,
      third.completionId,
    ]);

    expect((await db.tasks.get(task.id))?.lastCompletedAt).toBeNull();
    expect(await db.completions.count()).toBe(0);
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

  it('keeps completion history when a task is deleted (append-only log)', async () => {
    const task = await createTask(baseInput);
    const { completionId } = await markTaskComplete(task.id);

    await deleteTask(task.id);

    expect(await db.tasks.get(task.id)).toBeUndefined();
    expect(await db.completions.get(completionId)).toBeDefined();
  });
});
