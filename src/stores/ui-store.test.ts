import { beforeEach, describe, expect, it } from 'vitest';

import { useUIStore } from './ui-store';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({ isAddTaskOpen: false, undoSnackbar: null });
  });

  it('opens and closes the Add-Task modal', () => {
    useUIStore.getState().openAddTask();
    expect(useUIStore.getState().isAddTaskOpen).toBe(true);
    useUIStore.getState().closeAddTask();
    expect(useUIStore.getState().isAddTaskOpen).toBe(false);
  });

  it('shows an undo snackbar carrying the prior Date and the logged row ids', () => {
    const previous = new Date('2026-06-01T12:00:00Z');
    useUIStore.getState().showUndo('task-1', previous, ['c-1']);
    expect(useUIStore.getState().undoSnackbar).toEqual({
      taskId: 'task-1',
      previous,
      completionIds: ['c-1'],
    });
  });

  it('round-trips a null previous (first completion) without coercing it', () => {
    useUIStore.getState().showUndo('task-2', null, ['c-2']);
    expect(useUIStore.getState().undoSnackbar).toEqual({
      taskId: 'task-2',
      previous: null,
      completionIds: ['c-2'],
    });
  });

  it('dismisses the undo snackbar', () => {
    useUIStore.getState().showUndo('task-3', null, []);
    useUIStore.getState().dismissUndo();
    expect(useUIStore.getState().undoSnackbar).toBeNull();
  });
});
