import { beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { db, DEFAULT_CATEGORIES } from '@/lib/db/schema';
import { renderWithRouter } from '@/test/router';
import type { Task } from '@/types';

import { ByCategoryView } from './ByCategoryView';

const KITCHEN = DEFAULT_CATEGORIES[0].id;
const BATHROOM = DEFAULT_CATEGORIES[1].id;
const DAY_MS = 864e5;

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

describe('ByCategoryView', () => {
  beforeEach(async () => {
    await db.tasks.clear();
    await db.categories.clear();
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  });

  it('groups tasks under their category header and omits empty categories', async () => {
    await db.tasks.bulkAdd([
      makeTask({ id: '11111111-1111-4111-8111-111111111111', name: 'Clean oven' }),
      makeTask({
        id: '22222222-2222-4222-8222-222222222222',
        name: 'Restock toiletries',
        categoryId: BATHROOM,
      }),
    ]);

    const { findByRole, getByText, queryByRole } = renderWithRouter(<ByCategoryView />);

    expect(await findByRole('heading', { name: 'Kitchen', level: 3 })).toBeInTheDocument();
    expect(getByText('Clean oven')).toBeInTheDocument();
    expect(getByText('Restock toiletries')).toBeInTheDocument();
    // A category with no tasks gets no header.
    expect(queryByRole('heading', { name: 'Garden/Plants' })).toBeNull();
  });

  it('shows the empty state when there are no tasks', async () => {
    const { findByText } = renderWithRouter(<ByCategoryView />);
    expect(await findByText('No tasks yet. Tap + to add your first task.')).toBeInTheDocument();
  });

  it('marks an overdue row with its screen-reader status', async () => {
    await db.tasks.add(
      makeTask({
        id: '33333333-3333-4333-8333-333333333333',
        name: 'Deep clean refrigerator',
        lastCompletedAt: new Date(Date.now() - 9 * DAY_MS),
        expectedFrequency: { value: 1, unit: 'week' },
      }),
    );
    const { findByText } = renderWithRouter(<ByCategoryView />);
    expect(await findByText('Overdue')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    await db.tasks.add(makeTask({ id: '44444444-4444-4444-8444-444444444444', name: 'A task' }));
    const { container, findByText } = renderWithRouter(<ByCategoryView />);
    await findByText('A task');
    expect(await axe(container)).toHaveNoViolations();
  });
});
