import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { createCategory } from '@/lib/categories';
import { db } from '@/lib/db/schema';
import type { Category } from '@/types';

import { CategoryForm } from './CategoryForm';

beforeEach(async () => {
  await Promise.all([db.tasks.clear(), db.categories.clear(), db.settings.clear()]);
});

describe('CategoryForm', () => {
  it('creates a category and returns it to onSaved', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(<CategoryForm mode="create" onSaved={onSaved} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/category name/i), 'Child-Related');
    await user.click(screen.getByRole('button', { name: 'Add category' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    const created = onSaved.mock.calls[0][0] as Category;
    expect(created.name).toBe('Child-Related');
    expect(created.isDefault).toBe(false);
    expect(await db.categories.get(created.id)).toBeTruthy();
  });

  it('requires a name', async () => {
    const user = userEvent.setup();
    render(<CategoryForm mode="create" onSaved={vi.fn()} onCancel={vi.fn()} />);
    await user.type(screen.getByLabelText(/category name/i), 'x');
    await user.clear(screen.getByLabelText(/category name/i));
    expect(await screen.findByText('Please add a category name.')).toBeInTheDocument();
  });

  it('edits an existing category', async () => {
    const user = userEvent.setup();
    const category = await createCategory({ name: 'Errands', color: '#3B82F6' });
    const onSaved = vi.fn();
    render(<CategoryForm mode="edit" category={category} onSaved={onSaved} onCancel={vi.fn()} />);

    const name = screen.getByLabelText(/category name/i);
    await user.clear(name);
    await user.type(name, 'Errands & Chores');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(null));
    expect((await db.categories.get(category.id))?.name).toBe('Errands & Chores');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <CategoryForm mode="create" onSaved={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
