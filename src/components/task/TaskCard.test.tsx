import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { DEFAULT_CATEGORIES } from '@/lib/db/schema';
import { renderWithRouter } from '@/test/router';
import type { Task } from '@/types';

import { TaskCard } from './TaskCard';

const NOW = new Date('2026-07-01T12:00:00');
const DAY_MS = 864e5;
const daysAgo = (n: number) => new Date(NOW.getTime() - n * DAY_MS);
const WEEKLY = { value: 1, unit: 'week' } as const;

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'Test task',
    description: '',
    categoryId: DEFAULT_CATEGORIES[0].id,
    createdAt: daysAgo(60),
    lastCompletedAt: null,
    isArchived: false,
    notes: '',
    ...overrides,
  };
}

describe('TaskCard', () => {
  it('shows "New" and links the body to the task detail route', async () => {
    const { findByRole } = renderWithRouter(<TaskCard task={makeTask()} now={NOW} />);
    expect(await findByRole('link')).toHaveAttribute(
      'href',
      expect.stringContaining('/tasks/f47ac10b-58cc-4372-a567-0e02b2c3d479'),
    );
  });

  it('renders the due-soon tier with a clock cue + SR text', async () => {
    const { findByText, getByText } = renderWithRouter(
      <TaskCard task={makeTask({ lastCompletedAt: daysAgo(6), expectedFrequency: WEEKLY })} now={NOW} />,
    );
    expect(await findByText('6 d')).toBeInTheDocument();
    expect(getByText('Due soon')).toBeInTheDocument();
  });

  it('renders the overdue tier with a "!" badge + SR text', async () => {
    const { findByText, getByText } = renderWithRouter(
      <TaskCard task={makeTask({ lastCompletedAt: daysAgo(9), expectedFrequency: WEEKLY })} now={NOW} />,
    );
    expect(await findByText('1 wk')).toBeInTheDocument();
    expect(getByText('Overdue')).toBeInTheDocument();
    expect(getByText('!')).toBeInTheDocument();
  });

  it('renders the very-overdue tier with a "Very overdue" pill', async () => {
    const { findByText, getByText } = renderWithRouter(
      <TaskCard task={makeTask({ lastCompletedAt: daysAgo(40), expectedFrequency: WEEKLY })} now={NOW} />,
    );
    expect(await findByText('1 mo')).toBeInTheDocument();
    expect(getByText('Very overdue')).toBeInTheDocument();
    expect(getByText('!')).toBeInTheDocument();
  });

  it('renders the greige time-estimate chip in the category variant', async () => {
    const { findByText } = renderWithRouter(
      <TaskCard task={makeTask({ timeCommitment: '15min' })} now={NOW} />,
    );
    expect(await findByText(/15 min/)).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container, findByRole } = renderWithRouter(
      <TaskCard task={makeTask({ lastCompletedAt: daysAgo(9), expectedFrequency: WEEKLY })} now={NOW} />,
    );
    await findByRole('link');
    expect(await axe(container)).toHaveNoViolations();
  });
});
