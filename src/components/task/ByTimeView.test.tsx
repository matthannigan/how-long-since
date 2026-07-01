import { beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { db, DEFAULT_CATEGORIES } from '@/lib/db/schema';
import { renderWithRouter } from '@/test/router';
import type { Task } from '@/types';

import { ByTimeView } from './ByTimeView';

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

describe('ByTimeView', () => {
  beforeEach(async () => {
    await db.tasks.clear();
    await db.categories.clear();
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  });

  it('groups tasks into time sections shortest→longest with "No time set" last', async () => {
    await db.tasks.bulkAdd([
      makeTask({ id: '11111111-1111-4111-8111-111111111111', name: 'Hour task', timeCommitment: '1hr' }),
      makeTask({ id: '22222222-2222-4222-8222-222222222222', name: 'Quick task', timeCommitment: '15min' }),
      makeTask({ id: '33333333-3333-4333-8333-333333333333', name: 'Untimed task' }),
    ]);

    const { findByRole, getAllByRole } = renderWithRouter(<ByTimeView />);
    await findByRole('heading', { level: 3, name: 'Quick tasks' });

    const titles = getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles).toContain('Quick tasks');
    expect(titles).toContain('Medium tasks');
    expect(titles).toContain('No time set');
    // No 30-min task → no "Short tasks" section.
    expect(titles).not.toContain('Short tasks');
    expect(titles.indexOf('Quick tasks')).toBeLessThan(titles.indexOf('Medium tasks'));
    expect(titles.indexOf('Medium tasks')).toBeLessThan(titles.indexOf('No time set'));
  });

  it('places a task with no estimate under "No time set"', async () => {
    await db.tasks.add(makeTask({ id: '44444444-4444-4444-8444-444444444444', name: 'Untimed task' }));
    const { findByText } = renderWithRouter(<ByTimeView />);
    expect(await findByText('No time set')).toBeInTheDocument();
    expect(await findByText('Untimed task')).toBeInTheDocument();
  });

  it('shows the empty state when there are no tasks', async () => {
    const { findByText } = renderWithRouter(<ByTimeView />);
    expect(await findByText('No tasks yet. Tap + to add your first task.')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    await db.tasks.add(
      makeTask({ id: '55555555-5555-4555-8555-555555555555', name: 'A task', timeCommitment: '1hr' }),
    );
    const { container, findByText } = renderWithRouter(<ByTimeView />);
    await findByText('A task');
    expect(await axe(container)).toHaveNoViolations();
  });
});
