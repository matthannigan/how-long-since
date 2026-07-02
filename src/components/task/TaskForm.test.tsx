import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { db, DEFAULT_CATEGORIES } from '@/lib/db/schema';
import { createTask } from '@/lib/tasks';
import { useUIStore } from '@/stores/ui-store';

import { TaskForm } from './TaskForm';

const NOW = new Date('2026-07-01T12:00:00');
const CATS = [DEFAULT_CATEGORIES[0], DEFAULT_CATEGORIES[1]];

beforeEach(async () => {
  await Promise.all([db.tasks.clear(), db.categories.clear(), db.settings.clear()]);
  useUIStore.setState({ lastUsedCategoryId: null, isAddTaskOpen: false, undoSnackbar: null });
});

function renderForm(props: Partial<ComponentProps<typeof TaskForm>> = {}) {
  return render(
    <TaskForm
      mode="create"
      categories={CATS}
      onDone={vi.fn()}
      onCancel={vi.fn()}
      now={NOW}
      {...props}
    />,
  );
}

describe('TaskForm', () => {
  it('shows the required-field error once the name is cleared', async () => {
    const user = userEvent.setup();
    renderForm();
    const name = screen.getByLabelText(/task name/i);
    await user.type(name, 'x');
    await user.clear(name);
    expect(await screen.findByText('Please add a task name.')).toBeInTheDocument();
  });

  it('flags a name longer than 128 characters', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/task name/i), 'a'.repeat(129));
    expect(
      await screen.findByText('Task name is too long. Max 128 characters.'),
    ).toBeInTheDocument();
  });

  it('disables Save until valid, then creates the task', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    renderForm({ onDone });

    const save = screen.getByRole('button', { name: 'Save task' });
    expect(save).toBeDisabled();

    await user.type(screen.getByLabelText(/task name/i), 'Descale coffee maker');
    await waitFor(() => expect(save).toBeEnabled());

    await user.click(save);
    await waitFor(() => expect(onDone).toHaveBeenCalled());

    const stored = await db.tasks.toArray();
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Descale coffee maker');
    expect(stored[0].categoryId).toBe(CATS[0].id);
    // The chosen category becomes the session's last-used default.
    expect(useUIStore.getState().lastUsedCategoryId).toBe(CATS[0].id);
  });

  it('updates an existing task in edit mode', async () => {
    const user = userEvent.setup();
    const task = await createTask({
      name: 'Old name',
      description: '',
      categoryId: CATS[0].id,
      notes: '',
    });
    const onDone = vi.fn();
    render(
      <TaskForm
        mode="edit"
        task={task}
        categories={CATS}
        onDone={onDone}
        onCancel={vi.fn()}
        now={NOW}
      />,
    );

    const name = screen.getByLabelText(/task name/i);
    await user.clear(name);
    await user.type(name, 'New name');

    const save = screen.getByRole('button', { name: 'Save changes' });
    await waitFor(() => expect(save).toBeEnabled());
    await user.click(save);

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect((await db.tasks.get(task.id))?.name).toBe('New name');
  });

  it('has no axe violations', async () => {
    const { container } = renderForm();
    expect(await axe(container)).toHaveNoViolations();
  });
});
