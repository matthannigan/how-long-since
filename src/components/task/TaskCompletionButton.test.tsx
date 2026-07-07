import { fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { db, DEFAULT_CATEGORIES } from '@/lib/db/schema';
import { undoComplete } from '@/lib/tasks';
import { useUIStore } from '@/stores/ui-store';
import type { Task } from '@/types';

import { TaskCompletionButton } from './TaskCompletionButton';

const PRIOR = new Date('2026-06-01T09:00:00');

function makeTask(): Task {
  return {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'Descale coffee maker',
    description: '',
    categoryId: DEFAULT_CATEGORIES[0].id,
    createdAt: new Date('2026-01-01'),
    lastCompletedAt: PRIOR,
    isArchived: false,
    notes: '',
  };
}

describe('TaskCompletionButton', () => {
  beforeEach(async () => {
    await db.tasks.clear();
    await db.completions.clear();
    await db.tasks.add(makeTask());
  });

  afterEach(() => {
    useUIStore.setState({ undoSnackbar: null });
  });

  it('exposes an accessible label naming the task', () => {
    const { getByRole } = render(<TaskCompletionButton task={makeTask()} />);
    expect(getByRole('button', { name: 'Mark Descale coffee maker complete' })).toBeInTheDocument();
  });

  it('marks the task complete and captures the prior date for undo', async () => {
    const task = makeTask();
    const { getByRole } = render(<TaskCompletionButton task={task} />);

    fireEvent.click(getByRole('button'));

    // lastCompletedAt advances to ~now...
    await waitFor(async () => {
      const stored = await db.tasks.get(task.id);
      expect(stored?.lastCompletedAt?.getTime()).toBeGreaterThan(PRIOR.getTime());
    });

    // ...and the prior date plus the appended log row are stashed for undo.
    const undo = useUIStore.getState().undoSnackbar;
    expect(undo).toMatchObject({ taskId: task.id, previous: PRIOR });
    expect(undo!.completionIds).toHaveLength(1);
    expect(await db.completions.count()).toBe(1);

    // Restoring with the captured values returns the exact prior date and
    // removes the log row.
    await undoComplete(undo!.taskId, undo!.previous, undo!.completionIds);
    expect((await db.tasks.get(task.id))?.lastCompletedAt?.getTime()).toBe(PRIOR.getTime());
    expect(await db.completions.count()).toBe(0);
  });

  it('collapses a rapid double-click so one undo returns to the true original', async () => {
    const task = makeTask();
    const { getByRole } = render(<TaskCompletionButton task={task} />);

    // Two taps in the same tick (accidental double-click).
    fireEvent.click(getByRole('button'));
    fireEvent.click(getByRole('button'));

    // Both writes land (lastCompletedAt advances past the seeded date)...
    await waitFor(async () => {
      const stored = await db.tasks.get(task.id);
      expect(stored?.lastCompletedAt?.getTime()).toBeGreaterThan(PRIOR.getTime());
    });

    // ...but the captured undo target stays the ORIGINAL date, not the
    // intermediate "just now" written by the first tap.
    await waitFor(() => {
      expect(useUIStore.getState().undoSnackbar?.previous).toEqual(PRIOR);
    });

    // Both taps' log rows are accumulated on the single undo record.
    await waitFor(() => {
      expect(useUIStore.getState().undoSnackbar?.completionIds).toHaveLength(2);
    });
    expect(await db.completions.count()).toBe(2);

    // A single undo therefore restores the true original and clears both rows.
    const undo = useUIStore.getState().undoSnackbar!;
    await undoComplete(undo.taskId, undo.previous, undo.completionIds);
    expect((await db.tasks.get(task.id))?.lastCompletedAt).toEqual(PRIOR);
    expect(await db.completions.count()).toBe(0);
  });

  it('has no axe violations', async () => {
    const { container } = render(<TaskCompletionButton task={makeTask()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
