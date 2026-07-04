import { fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { db, DEFAULT_CATEGORIES } from '@/lib/db/schema';
import type { SeriesGroup } from '@/lib/series';
import { undoComplete } from '@/lib/tasks';
import { renderWithRouter } from '@/test/router';
import type { Task } from '@/types';

import { TaskSeriesGroup } from './TaskSeriesGroup';

const NOW = new Date('2026-07-01T12:00:00');
const DAY_MS = 864e5;
const daysAgo = (n: number) => new Date(NOW.getTime() - n * DAY_MS);
const WEEKLY = { value: 1, unit: 'week' } as const;
const SERIES_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const BEDROOM = DEFAULT_CATEGORIES[2];

let counter = 0;
function sibling(instanceLabel: string, overrides: Partial<Task> = {}): Task {
  counter += 1;
  return {
    id: `00000000-0000-4000-8000-${String(counter).padStart(12, '0')}`,
    name: 'Vacuum bedroom',
    description: '',
    categoryId: BEDROOM.id,
    createdAt: daysAgo(60),
    lastCompletedAt: null,
    isArchived: false,
    notes: '',
    instanceLabel,
    seriesId: SERIES_ID,
    ...overrides,
  };
}

/** Label-sorted, like groupSeriesForDisplay emits. */
function makeGroup(tasks: Task[]): SeriesGroup {
  return { seriesId: SERIES_ID, name: 'Vacuum bedroom', tasks };
}

const MIXED = [
  sibling('Guest room', {
    lastCompletedAt: daysAgo(8),
    expectedFrequency: WEEKLY,
    timeCommitment: '30min',
  }), // overdue
  sibling("Kids' room", {
    lastCompletedAt: daysAgo(12),
    expectedFrequency: WEEKLY,
    timeCommitment: '30min',
  }), // very-overdue
  sibling('Main bedroom', {
    lastCompletedAt: daysAgo(2),
    expectedFrequency: WEEKLY,
    timeCommitment: '30min',
  }), // none
];

describe('TaskSeriesGroup', () => {
  beforeEach(async () => {
    await db.tasks.clear();
  });

  it('collapsed: shows name, places count, worst-of summary, and wired disclosure', async () => {
    const { findByRole, getByRole, getByText } = renderWithRouter(
      <TaskSeriesGroup group={makeGroup(MIXED)} variant="category" category={BEDROOM} now={NOW} />,
    );

    const button = await findByRole('button', { expanded: false });
    expect(button).toHaveTextContent('Vacuum bedroom');
    expect(getByText('3 places')).toBeInTheDocument();
    expect(getByText('2 of 3 overdue')).toBeInTheDocument();
    expect(getByText('Very overdue')).toBeInTheDocument(); // sr-only worst tier
    expect(getByText('!')).toBeInTheDocument(); // non-color cue

    const listId = button.getAttribute('aria-controls');
    expect(listId).toBeTruthy();
    const list = getByRole('group', { name: 'Vacuum bedroom instances' });
    expect(list.id).toBe(listId);
    expect(list).toBeEmptyDOMElement(); // collapsed
  });

  it('shows the shared time-commitment chip on the collapsed row', async () => {
    const { findByText } = renderWithRouter(
      <TaskSeriesGroup group={makeGroup(MIXED)} variant="category" category={BEDROOM} now={NOW} />,
    );
    expect(await findByText('30 min')).toBeInTheDocument();
  });

  it('omits the time chip when siblings no longer share one estimate', async () => {
    const group = makeGroup([
      sibling('A', { timeCommitment: '15min' }),
      sibling('B', { timeCommitment: '1hr' }),
    ]);
    const { findByText, queryByText } = renderWithRouter(
      <TaskSeriesGroup group={group} variant="category" category={BEDROOM} now={NOW} />,
    );
    await findByText('2 places');
    expect(queryByText('15 min')).toBeNull();
    expect(queryByText('1 hr')).toBeNull();
  });

  it('expands to one TaskCard per sibling in label order, and collapses back', async () => {
    const { findByRole, findAllByRole, queryAllByRole } = renderWithRouter(
      <TaskSeriesGroup group={makeGroup(MIXED)} variant="category" category={BEDROOM} now={NOW} />,
    );

    const button = await findByRole('button', { expanded: false });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    const links = await findAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links.map((l) => l.textContent)).toEqual([
      expect.stringContaining('Guest room'),
      expect.stringContaining("Kids' room"),
      expect.stringContaining('Main bedroom'),
    ]);

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(queryAllByRole('link')).toHaveLength(0);
  });

  it('shows a due-soon clock cue without an overdue count when nothing is overdue', async () => {
    const group = makeGroup([
      sibling('A', { lastCompletedAt: daysAgo(6), expectedFrequency: WEEKLY }), // due-soon
      sibling('B', { lastCompletedAt: daysAgo(2), expectedFrequency: WEEKLY }), // none
    ]);
    const { findByText, getByText, queryByText } = renderWithRouter(
      <TaskSeriesGroup group={group} variant="time" category={BEDROOM} now={NOW} />,
    );
    expect(await findByText('Due soon')).toBeInTheDocument(); // sr-only
    expect(queryByText(/overdue/i)).toBeNull();
    expect(getByText('2 places')).toBeInTheDocument();
  });

  it('complete + undo on an expanded sibling restores the prior date', async () => {
    const tasks = MIXED.map((t) => ({ ...t }));
    await db.tasks.bulkAdd(tasks);
    const guest = tasks[0];
    const prior = guest.lastCompletedAt;

    const { findByRole } = renderWithRouter(
      <TaskSeriesGroup group={makeGroup(tasks)} variant="category" category={BEDROOM} now={NOW} />,
    );
    fireEvent.click(await findByRole('button', { expanded: false }));

    fireEvent.click(
      await findByRole('button', { name: 'Mark Vacuum bedroom — Guest room complete' }),
    );
    await waitFor(async () => {
      const stored = await db.tasks.get(guest.id);
      expect(stored?.lastCompletedAt?.getTime()).toBeGreaterThan(NOW.getTime() - 1000);
    });

    // The toast's Undo action calls undoComplete(id, prior) — id-based, so it
    // works regardless of the group's collapsed state.
    await undoComplete(guest.id, prior);
    expect((await db.tasks.get(guest.id))?.lastCompletedAt?.getTime()).toBe(prior?.getTime());
  });

  it('has no axe violations collapsed and expanded', async () => {
    const { container, findByRole, findAllByRole } = renderWithRouter(
      <TaskSeriesGroup group={makeGroup(MIXED)} variant="category" category={BEDROOM} now={NOW} />,
    );
    const button = await findByRole('button', { expanded: false });
    expect(await axe(container)).toHaveNoViolations();

    fireEvent.click(button);
    await findAllByRole('link');
    expect(await axe(container)).toHaveNoViolations();
  });
});
