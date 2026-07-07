import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { createCategory } from '@/lib/categories';
import { db, DEFAULT_CATEGORIES } from '@/lib/db/schema';
import { createTask } from '@/lib/tasks';

import { ManageCategories } from './ManageCategories';

const { toastError, toastSuccess } = vi.hoisted(() => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { error: toastError, success: toastSuccess } }));

const KITCHEN = DEFAULT_CATEGORIES[0];
const LIVING = DEFAULT_CATEGORIES[3];

beforeEach(async () => {
  await Promise.all([db.tasks.clear(), db.categories.clear(), db.settings.clear()]);
  toastError.mockClear();
  toastSuccess.mockClear();
});

const seedDefaults = () => db.categories.bulkAdd(DEFAULT_CATEGORIES);

/** The <li> row for a category, found by its name. */
async function rowFor(name: string): Promise<HTMLElement> {
  const label = await screen.findByText(name);
  return label.closest('li') as HTMLElement;
}

describe('ManageCategories', () => {
  it('blocks deleting a default category that still has tasks', async () => {
    const user = userEvent.setup();
    await seedDefaults();
    await createTask({ name: 'Wash dishes', description: '', categoryId: KITCHEN.id, notes: '' });
    render(<ManageCategories />);

    const row = await rowFor('Kitchen');
    await user.click(within(row).getByRole('button', { name: 'Remove' }));

    expect(toastError).toHaveBeenCalledWith(
      "Can't remove a default category that still has tasks. Try editing it instead.",
    );
    expect(screen.queryByText('Reassign tasks first')).not.toBeInTheDocument();
    expect(await db.categories.get(KITCHEN.id)).toBeTruthy();
  });

  it('reassigns tasks then deletes a non-default category', async () => {
    const user = userEvent.setup();
    await seedDefaults();
    const custom = await createCategory({ name: 'Errands', color: '#F43F5E' });
    const task = await createTask({
      name: 'Post office',
      description: '',
      categoryId: custom.id,
      notes: '',
    });
    render(<ManageCategories />);

    const row = await rowFor('Errands');
    await user.click(within(row).getByRole('button', { name: 'Remove' }));

    const dialog = await screen.findByRole('dialog');
    await user.selectOptions(within(dialog).getByLabelText(/move tasks to/i), LIVING.id);
    await user.click(within(dialog).getByRole('button', { name: /reassign & remove/i }));

    await waitFor(async () => expect(await db.categories.get(custom.id)).toBeUndefined());
    expect((await db.tasks.get(task.id))?.categoryId).toBe(LIVING.id);
  });

  it('deletes an empty category after confirming', async () => {
    const user = userEvent.setup();
    await seedDefaults();
    const custom = await createCategory({ name: 'Temp', color: '#0EA5E9' });
    render(<ManageCategories />);

    const row = await rowFor('Temp');
    await user.click(within(row).getByRole('button', { name: 'Remove' }));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));

    await waitFor(async () => expect(await db.categories.get(custom.id)).toBeUndefined());
  });

  it('has no axe violations', async () => {
    await seedDefaults();
    const { container } = render(<ManageCategories />);
    await screen.findByText('Kitchen');
    expect(await axe(container)).toHaveNoViolations();
  });
});
