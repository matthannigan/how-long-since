import { describe, expect, it } from 'vitest';

import type { Category, Task } from '@/types';

import { tasksToCsv } from './csv-export';

const sampleCategory: Category = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Kitchen',
  color: '#3B82F6',
  icon: 'utensils',
  isDefault: false,
};

const sampleTask: Task = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Clean oven',
  description: 'A deep clean',
  categoryId: sampleCategory.id,
  createdAt: new Date('2026-06-01T10:00:00.000Z'),
  lastCompletedAt: new Date('2026-06-15T14:30:00.000Z'),
  expectedFrequency: { value: 3, unit: 'month' },
  timeCommitment: '1hr',
  isArchived: false,
  notes: 'note',
};

describe('lib/csv-export', () => {
  it('emits the expected header and one row per task with ISO dates', () => {
    const csv = tasksToCsv([sampleTask], [sampleCategory]);
    const rows = csv.trim().split(/\r?\n/);

    expect(rows[0]).toBe(
      'id,name,description,categoryId,categoryName,createdAt,lastCompletedAt,frequencyValue,frequencyUnit,timeCommitment,isArchived,notes,instanceLabel,seriesId',
    );
    expect(rows).toHaveLength(2);
    expect(csv).toContain(sampleTask.createdAt.toISOString());
    expect(csv).toContain('Kitchen');
    expect(csv).toContain('3,month');
  });

  it('always emits a header even with no tasks', () => {
    const csv = tasksToCsv([], []);
    expect(csv.trim().split(/\r?\n/)).toHaveLength(1);
  });

  it('emits instanceLabel and seriesId in the trailing columns, blank when absent', () => {
    const seriesId = '55555555-5555-4555-8555-555555555555';
    const csv = tasksToCsv(
      [
        sampleTask,
        {
          ...sampleTask,
          id: '33333333-3333-4333-8333-333333333333',
          instanceLabel: 'Guest room',
          seriesId,
        },
      ],
      [sampleCategory],
    );
    const rows = csv.trim().split(/\r?\n/);
    expect(rows[1].endsWith(',,')).toBe(true); // pre-1.1 task: both blank
    expect(rows[2].endsWith(`,Guest room,${seriesId}`)).toBe(true);
  });
});
