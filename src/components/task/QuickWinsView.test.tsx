import { beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { db, DEFAULT_CATEGORIES } from '@/lib/db/schema';
import { renderWithRouter } from '@/test/router';
import type { Task } from '@/types';

import { QuickWinsView } from './QuickWinsView';

const KITCHEN = DEFAULT_CATEGORIES[0].id;
const DAY_MS = 864e5;

function makeTask(overrides: Partial<Task> & Pick<Task, 'id' | 'name'>): Task {
  return {
    description: '',
    categoryId: KITCHEN,
    createdAt: new Date('2026-01-01'),
    lastCompletedAt: new Date(Date.now() - 2 * DAY_MS),
    isArchived: false,
    notes: '',
    ...overrides,
  };
}

describe('QuickWinsView', () => {
  beforeEach(async () => {
    await db.tasks.clear();
    await db.categories.clear();
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  });

  it('leads with the time prompt and lists a fitting task', async () => {
    await db.tasks.add(
      makeTask({
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Quick task',
        timeCommitment: '15min',
      }),
    );

    const { findByText } = renderWithRouter(<QuickWinsView />);
    expect(await findByText('How much time do you have?')).toBeInTheDocument();
    expect(await findByText('Quick task')).toBeInTheDocument();
  });

  it('exposes a labeled Quick Wins region for focus management', async () => {
    await db.tasks.add(
      makeTask({
        id: '22222222-2222-4222-8222-222222222222',
        name: 'Quick task',
        timeCommitment: '15min',
      }),
    );

    const { findByRole } = renderWithRouter(<QuickWinsView />);
    expect(await findByRole('region', { name: 'Quick Wins' })).toBeInTheDocument();
  });

  it('shows the empty state when there are no tasks', async () => {
    const { findByText } = renderWithRouter(<QuickWinsView />);
    expect(await findByText('No tasks yet. Tap + to add your first task.')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    await db.tasks.add(
      makeTask({
        id: '33333333-3333-4333-8333-333333333333',
        name: 'A task',
        timeCommitment: '15min',
      }),
    );
    const { container, findByText } = renderWithRouter(<QuickWinsView />);
    await findByText('A task');
    expect(await axe(container)).toHaveNoViolations();
  });
});
