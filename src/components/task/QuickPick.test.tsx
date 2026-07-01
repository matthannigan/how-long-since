import { fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { DEFAULT_CATEGORIES } from '@/lib/db/schema';
import { renderWithRouter } from '@/test/router';
import type { Category, Task } from '@/types';

import { QuickPick } from './QuickPick';

const NOW = new Date('2026-07-01T12:00:00');
const DAY_MS = 864e5;
const daysAgo = (n: number) => new Date(NOW.getTime() - n * DAY_MS);
const KITCHEN = DEFAULT_CATEGORIES[0];
const categoryById = new Map<string, Category>(DEFAULT_CATEGORIES.map((c) => [c.id, c]));

function task(id: string, name: string, overrides: Partial<Task> = {}): Task {
  return {
    id,
    name,
    description: '',
    categoryId: KITCHEN.id,
    createdAt: daysAgo(60),
    lastCompletedAt: daysAgo(2),
    isArchived: false,
    notes: '',
    ...overrides,
  };
}

const TASKS = [
  task('11111111-1111-4111-8111-111111111111', 'Quick fifteen', { timeCommitment: '15min' }),
  task('22222222-2222-4222-8222-222222222222', 'Half hour job', { timeCommitment: '30min' }),
  task('33333333-3333-4333-8333-333333333333', 'Big project', { timeCommitment: '5hrs+' }),
];

describe('QuickPick', () => {
  it('defaults to "15 min or less" and lists only matching tasks', async () => {
    const { findByText, queryByText } = renderWithRouter(
      <QuickPick tasks={TASKS} categoryById={categoryById} now={NOW} />,
    );
    expect(await findByText('Quick fifteen')).toBeInTheDocument();
    expect(queryByText('Half hour job')).toBeNull();
  });

  it('widens the list when a longer window is chosen', async () => {
    const { findByRole, findByText } = renderWithRouter(
      <QuickPick tasks={TASKS} categoryById={categoryById} now={NOW} />,
    );
    fireEvent.click(await findByRole('radio', { name: '30 min' }));
    expect(await findByText('Half hour job')).toBeInTheDocument();
    expect(await findByText('Quick fifteen')).toBeInTheDocument();
  });

  it('shows the no-match copy when nothing fits the window', async () => {
    const onlyBig = [
      task('44444444-4444-4444-8444-444444444444', 'Only big', { timeCommitment: '5hrs+' }),
    ];
    const { findByText } = renderWithRouter(
      <QuickPick tasks={onlyBig} categoryById={categoryById} now={NOW} />,
    );
    expect(await findByText('No tasks match this time filter.')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container, findByText } = renderWithRouter(
      <QuickPick tasks={TASKS} categoryById={categoryById} now={NOW} />,
    );
    await findByText('Quick fifteen');
    expect(await axe(container)).toHaveNoViolations();
  });
});
