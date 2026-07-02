import { beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { db, DEFAULT_CATEGORIES } from '@/lib/db/schema';
import { renderWithRouter } from '@/test/router';
import type { Task } from '@/types';

import { TaskList } from './TaskList';

const KITCHEN = DEFAULT_CATEGORIES[0].id;
const BATHROOM = DEFAULT_CATEGORIES[1].id;

function makeTask(overrides: Partial<Task> & Pick<Task, 'id' | 'name'>): Task {
  return {
    description: '',
    categoryId: KITCHEN,
    createdAt: new Date('2026-01-01'),
    lastCompletedAt: null,
    isArchived: false,
    notes: '',
    ...overrides,
  };
}

describe('TaskList', () => {
  beforeEach(async () => {
    await db.tasks.clear();
    await db.categories.clear();
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  });

  it('renders a card per non-archived task and excludes archived ones', async () => {
    await db.tasks.bulkAdd([
      makeTask({ id: '11111111-1111-4111-8111-111111111111', name: 'Active one' }),
      makeTask({ id: '22222222-2222-4222-8222-222222222222', name: 'Active two' }),
      makeTask({
        id: '33333333-3333-4333-8333-333333333333',
        name: 'Archived one',
        isArchived: true,
      }),
    ]);

    const { findByText, queryByText } = renderWithRouter(<TaskList />);
    expect(await findByText('Active one')).toBeInTheDocument();
    expect(await findByText('Active two')).toBeInTheDocument();
    expect(queryByText('Archived one')).toBeNull();
  });

  it('shows the main empty state when there are no tasks', async () => {
    const { findByText } = renderWithRouter(<TaskList />);
    expect(await findByText('No tasks yet. Tap + to add your first task.')).toBeInTheDocument();
  });

  it('shows the category-scoped empty state when a category has no tasks', async () => {
    await db.tasks.add(
      makeTask({ id: '44444444-4444-4444-8444-444444444444', name: 'Kitchen task' }),
    );
    const { findByText } = renderWithRouter(<TaskList categoryId={BATHROOM} />);
    expect(await findByText('No tasks in this category. Add one?')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    await db.tasks.add(makeTask({ id: '55555555-5555-4555-8555-555555555555', name: 'A task' }));
    const { container, findByText } = renderWithRouter(<TaskList />);
    await findByText('A task');
    expect(await axe(container)).toHaveNoViolations();
  });
});
