import { describe, expect, it } from 'vitest';

import type { FrequencyUnit, Task } from '@/types';

import { calculateOverdueStatus } from './overdue';

const UNIT_MS: Record<FrequencyUnit, number> = {
  day: 864e5,
  week: 6048e5,
  month: 2592e6,
  year: 31536e6,
};

const UNITS: FrequencyUnit[] = ['day', 'week', 'month', 'year'];

// Fixed reference point so every case is deterministic.
const NOW = new Date(2026, 5, 15, 12, 0, 0);

function taskWith(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    name: 'A task',
    description: '',
    categoryId: crypto.randomUUID(),
    createdAt: new Date(2020, 0, 1),
    lastCompletedAt: null,
    isArchived: false,
    notes: '',
    ...overrides,
  };
}

/** A task whose last completion sits at `pct` of one `unit` interval ago. */
function taskAt(unit: FrequencyUnit, pct: number): Task {
  const elapsedMs = Math.round(pct * UNIT_MS[unit]);
  return taskWith({
    expectedFrequency: { value: 1, unit },
    lastCompletedAt: new Date(NOW.getTime() - elapsedMs),
  });
}

describe('calculateOverdueStatus', () => {
  it('returns "none" when there is no expected frequency', () => {
    expect(calculateOverdueStatus(taskWith({ lastCompletedAt: new Date(2000, 0, 1) }), NOW)).toBe(
      'none',
    );
  });

  it('returns "none" when the task has never been completed', () => {
    expect(
      calculateOverdueStatus(
        taskWith({ expectedFrequency: { value: 1, unit: 'week' }, lastCompletedAt: null }),
        NOW,
      ),
    ).toBe('none');
  });

  it('defaults `now` to the current time', () => {
    expect(calculateOverdueStatus(taskWith())).toBe('none');
  });

  // The boundary matrix — the same percentages must land identically for every unit.
  const boundaries: Array<[number, ReturnType<typeof calculateOverdueStatus>]> = [
    [0.79, 'none'],
    [0.8, 'due-soon'],
    [0.99, 'due-soon'],
    [1.0, 'overdue'],
    [1.49, 'overdue'],
    [1.5, 'very-overdue'],
  ];

  for (const unit of UNITS) {
    for (const [pct, expected] of boundaries) {
      it(`${unit}: ${pct} of interval → ${expected}`, () => {
        expect(calculateOverdueStatus(taskAt(unit, pct), NOW)).toBe(expected);
      });
    }
  }

  it('scales with the frequency value (a 2-week task done 1 week ago is not due)', () => {
    const task = taskWith({
      expectedFrequency: { value: 2, unit: 'week' },
      lastCompletedAt: new Date(NOW.getTime() - UNIT_MS.week),
    });
    expect(calculateOverdueStatus(task, NOW)).toBe('none');
  });
});
