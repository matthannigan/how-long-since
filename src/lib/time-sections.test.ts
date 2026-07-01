import { describe, expect, it } from 'vitest';

import type { Task } from '@/types';

import {
  filterForQuickPick,
  groupTasksByTime,
  QUICK_PICK_FILTERS,
  QUICK_PICK_LIMIT,
  TIME_SECTIONS,
} from './time-sections';

const NOW = new Date('2026-07-01T12:00:00');
const DAY_MS = 864e5;
const daysAgo = (n: number) => new Date(NOW.getTime() - n * DAY_MS);
const WEEKLY = { value: 1, unit: 'week' } as const;

function task(id: string, overrides: Partial<Task> = {}): Task {
  return {
    id,
    name: id,
    description: '',
    categoryId: 'cat',
    createdAt: daysAgo(60),
    lastCompletedAt: null,
    isArchived: false,
    notes: '',
    ...overrides,
  };
}

describe('TIME_SECTIONS', () => {
  it('has six sections ending in "No time set"', () => {
    expect(TIME_SECTIONS).toHaveLength(6);
    expect(TIME_SECTIONS.map((s) => s.title)).toEqual([
      'Quick tasks',
      'Short tasks',
      'Medium tasks',
      'Longer tasks',
      'Big projects',
      'No time set',
    ]);
  });
});

describe('groupTasksByTime', () => {
  it('orders sections shortest→longest with "No time set" last', () => {
    const tasks = [
      task('a', { timeCommitment: '1hr' }),
      task('b', { timeCommitment: '15min' }),
      task('c'), // no estimate
      task('d', { timeCommitment: '30min' }),
    ];
    expect(groupTasksByTime(tasks).map((g) => g.section.title)).toEqual([
      'Quick tasks',
      'Short tasks',
      'Medium tasks',
      'No time set',
    ]);
  });

  it('merges 4hrs and 5hrs+ into "Big projects", 4hrs first', () => {
    const groups = groupTasksByTime([
      task('five', { timeCommitment: '5hrs+' }),
      task('four', { timeCommitment: '4hrs' }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].section.title).toBe('Big projects');
    expect(groups[0].tasks.map((t) => t.id)).toEqual(['four', 'five']);
  });

  it('drops empty sections and returns [] for no tasks', () => {
    expect(groupTasksByTime([task('a', { timeCommitment: '15min' })]).map((g) => g.section.id)).toEqual([
      'quick',
    ]);
    expect(groupTasksByTime([])).toEqual([]);
  });
});

describe('QUICK_PICK_FILTERS', () => {
  it('offers the available-time windows with cumulative buckets', () => {
    expect(QUICK_PICK_FILTERS.map((f) => f.label)).toEqual(['15 min', '30 min', '1 hour', '2 hours']);
    expect(QUICK_PICK_FILTERS.find((f) => f.id === '30')?.buckets).toEqual(['15min', '30min']);
    expect(QUICK_PICK_FILTERS.find((f) => f.id === '120')?.buckets).toEqual([
      '15min',
      '30min',
      '1hr',
      '2hrs',
    ]);
  });

  it('never offers the Big projects (4hrs/5hrs+) buckets — quick wins only', () => {
    const offered = new Set(QUICK_PICK_FILTERS.flatMap((f) => f.buckets));
    expect(offered.has('4hrs')).toBe(false);
    expect(offered.has('5hrs+')).toBe(false);
  });
});

describe('filterForQuickPick', () => {
  it('keeps only fitting buckets and excludes archived tasks', () => {
    const ids = filterForQuickPick(
      [
        task('t15', { timeCommitment: '15min' }),
        task('t30', { timeCommitment: '30min' }),
        task('t15-archived', { timeCommitment: '15min', isArchived: true }),
        task('t1hr', { timeCommitment: '1hr' }),
      ],
      '30',
      NOW,
    ).map((t) => t.id);
    expect(ids).toEqual(expect.arrayContaining(['t15', 't30']));
    expect(ids).not.toContain('t15-archived');
    expect(ids).not.toContain('t1hr');
  });

  it('sorts most-overdue first', () => {
    const ids = filterForQuickPick(
      [
        task('fresh', { timeCommitment: '15min', lastCompletedAt: daysAgo(1), expectedFrequency: WEEKLY }),
        task('veryOverdue', { timeCommitment: '15min', lastCompletedAt: daysAgo(40), expectedFrequency: WEEKLY }),
        task('overdue', { timeCommitment: '15min', lastCompletedAt: daysAgo(9), expectedFrequency: WEEKLY }),
      ],
      '15',
      NOW,
    ).map((t) => t.id);
    expect(ids).toEqual(['veryOverdue', 'overdue', 'fresh']);
  });

  it('caps the list at QUICK_PICK_LIMIT', () => {
    const many = Array.from({ length: QUICK_PICK_LIMIT + 3 }, (_, i) =>
      task(`t${i}`, { timeCommitment: '15min' }),
    );
    expect(filterForQuickPick(many, '15', NOW)).toHaveLength(QUICK_PICK_LIMIT);
  });

  it('excludes Big projects and untimed tasks even at the widest window', () => {
    const ids = filterForQuickPick(
      [
        task('t2hr', { timeCommitment: '2hrs' }),
        task('t4hr', { timeCommitment: '4hrs' }),
        task('t5hr', { timeCommitment: '5hrs+' }),
        task('tnone'), // no estimate
      ],
      '120',
      NOW,
    ).map((t) => t.id);
    expect(ids).toEqual(['t2hr']);
  });

  it('returns [] for an unknown filter id', () => {
    expect(filterForQuickPick([task('a', { timeCommitment: '15min' })], 'nope', NOW)).toEqual([]);
  });
});
