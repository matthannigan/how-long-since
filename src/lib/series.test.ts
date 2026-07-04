import { describe, expect, it } from 'vitest';

import type { Task } from '@/types';

import { groupSeriesForDisplay, seriesSummary, suggestLabels, worstStatus } from './series';

const DAY_MS = 864e5;
const now = new Date('2026-07-03T12:00:00.000Z');
const daysAgo = (n: number) => new Date(now.getTime() - n * DAY_MS);
const weekly = { value: 1, unit: 'week' } as const;

let counter = 0;
function makeTask(overrides: Partial<Task> = {}): Task {
  counter += 1;
  return {
    id: `00000000-0000-4000-8000-${String(counter).padStart(12, '0')}`,
    name: 'Vacuum bedroom',
    description: '',
    categoryId: '11111111-1111-4111-8111-111111111111',
    createdAt: daysAgo(60),
    lastCompletedAt: null,
    isArchived: false,
    notes: '',
    ...overrides,
  };
}

const SERIES_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const SERIES_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

describe('groupSeriesForDisplay', () => {
  it('passes tasks without a seriesId through in order', () => {
    const tasks = [makeTask({ name: 'One' }), makeTask({ name: 'Two' })];
    expect(groupSeriesForDisplay(tasks)).toEqual([
      { kind: 'task', task: tasks[0] },
      { kind: 'task', task: tasks[1] },
    ]);
  });

  it('collapses ≥2 siblings into one group at the first member’s position', () => {
    const single = makeTask({ name: 'Single' });
    const a1 = makeTask({ seriesId: SERIES_A, instanceLabel: 'Main bedroom' });
    const between = makeTask({ name: 'Between' });
    const a2 = makeTask({ seriesId: SERIES_A, instanceLabel: 'Guest room' });

    const items = groupSeriesForDisplay([single, a1, between, a2]);
    expect(items.map((i) => i.kind)).toEqual(['task', 'series', 'task']);
    const group = items[1];
    if (group.kind !== 'series') throw new Error('expected series');
    expect(group.group.seriesId).toBe(SERIES_A);
    expect(group.group.name).toBe(a1.name);
  });

  it('sorts group members alphabetically by label, unlabeled last', () => {
    const items = groupSeriesForDisplay([
      makeTask({ seriesId: SERIES_A, instanceLabel: 'guest room' }),
      makeTask({ seriesId: SERIES_A }),
      makeTask({ seriesId: SERIES_A, instanceLabel: 'Attic' }),
    ]);
    if (items[0].kind !== 'series') throw new Error('expected series');
    expect(items[0].group.tasks.map((t) => t.instanceLabel)).toEqual([
      'Attic',
      'guest room',
      undefined,
    ]);
  });

  it('renders a lone sibling in this list as a plain task (≥2-in-bucket rule)', () => {
    const lone = makeTask({ seriesId: SERIES_A, instanceLabel: 'Main bedroom' });
    expect(groupSeriesForDisplay([lone])).toEqual([{ kind: 'task', task: lone }]);
  });

  it('handles two interleaved series independently', () => {
    const a1 = makeTask({ seriesId: SERIES_A, instanceLabel: 'A1' });
    const b1 = makeTask({ seriesId: SERIES_B, name: 'Wipe sink', instanceLabel: 'B1' });
    const a2 = makeTask({ seriesId: SERIES_A, instanceLabel: 'A2' });
    const b2 = makeTask({ seriesId: SERIES_B, name: 'Wipe sink', instanceLabel: 'B2' });

    const items = groupSeriesForDisplay([a1, b1, a2, b2]);
    expect(items).toHaveLength(2);
    expect(items.map((i) => (i.kind === 'series' ? i.group.seriesId : null))).toEqual([
      SERIES_A,
      SERIES_B,
    ]);
  });
});

describe('worstStatus / seriesSummary', () => {
  const notDue = makeTask({ lastCompletedAt: daysAgo(2), expectedFrequency: weekly });
  const dueSoon = makeTask({ lastCompletedAt: daysAgo(6), expectedFrequency: weekly });
  const overdue = makeTask({ lastCompletedAt: daysAgo(8), expectedFrequency: weekly });
  const veryOverdue = makeTask({ lastCompletedAt: daysAgo(12), expectedFrequency: weekly });

  it('picks the most urgent status across siblings', () => {
    expect(worstStatus([notDue, dueSoon], now)).toBe('due-soon');
    expect(worstStatus([notDue, overdue], now)).toBe('overdue');
    expect(worstStatus([dueSoon, veryOverdue, overdue], now)).toBe('very-overdue');
    expect(worstStatus([], now)).toBe('none');
  });

  it('counts only overdue + very-overdue in overdueCount', () => {
    const summary = seriesSummary([notDue, dueSoon, overdue, veryOverdue], now);
    expect(summary).toEqual({ worst: 'very-overdue', overdueCount: 2, total: 4 });
  });

  it('a due-soon sibling colors worst but not the count', () => {
    const summary = seriesSummary([notDue, dueSoon], now);
    expect(summary).toEqual({ worst: 'due-soon', overdueCount: 0, total: 2 });
  });
});

describe('suggestLabels', () => {
  const bedroom = '11111111-1111-4111-8111-111111111111';
  const kitchen = '99999999-9999-4999-8999-999999999999';

  it('returns distinct labels for the category, most frequent first then alpha', () => {
    const tasks = [
      makeTask({ instanceLabel: 'Guest room' }),
      makeTask({ instanceLabel: 'Guest room' }),
      makeTask({ instanceLabel: 'Attic' }),
      makeTask({ instanceLabel: 'Main bedroom' }),
      makeTask({ categoryId: kitchen, instanceLabel: 'Pantry' }),
    ];
    expect(suggestLabels(tasks, bedroom, [])).toEqual(['Guest room', 'Attic', 'Main bedroom']);
  });

  it('dedupes and excludes case-insensitively', () => {
    const tasks = [
      makeTask({ instanceLabel: 'Guest room' }),
      makeTask({ instanceLabel: 'guest ROOM' }),
      makeTask({ instanceLabel: 'Attic' }),
    ];
    expect(suggestLabels(tasks, bedroom, ['attic'])).toEqual(['Guest room']);
  });

  it('ignores archived tasks and unlabeled tasks', () => {
    const tasks = [
      makeTask({ instanceLabel: 'Guest room', isArchived: true }),
      makeTask({}), // no label
    ];
    expect(suggestLabels(tasks, bedroom, [])).toEqual([]);
  });

  it('caps at 8 suggestions', () => {
    const tasks = Array.from({ length: 12 }, (_, i) =>
      makeTask({ instanceLabel: `Room ${String.fromCharCode(65 + i)}` }),
    );
    expect(suggestLabels(tasks, bedroom, [])).toHaveLength(8);
  });
});
