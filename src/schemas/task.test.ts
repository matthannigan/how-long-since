import { describe, expect, it } from 'vitest';

import { createTaskSchema, taskSchema, updateTaskSchema } from './task';

const validTask = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Vacuum bedroom',
  description: '',
  categoryId: '11111111-1111-4111-8111-111111111111',
  createdAt: new Date(),
  lastCompletedAt: null,
  isArchived: false,
  notes: '',
};

describe('taskSchema — instanceLabel + seriesId (Phase 1.1)', () => {
  it('accepts a task without either field (pre-1.1 shape)', () => {
    const parsed = taskSchema.parse(validTask);
    expect(parsed.instanceLabel).toBeUndefined();
    expect(parsed.seriesId).toBeUndefined();
  });

  it('accepts and trims an instanceLabel', () => {
    const parsed = taskSchema.parse({
      ...validTask,
      instanceLabel: '  Guest room  ',
      seriesId: '33333333-3333-4333-8333-333333333333',
    });
    expect(parsed.instanceLabel).toBe('Guest room');
    expect(parsed.seriesId).toBe('33333333-3333-4333-8333-333333333333');
  });

  it('rejects an empty-after-trim label and one over 40 chars', () => {
    expect(() => taskSchema.parse({ ...validTask, instanceLabel: '   ' })).toThrow();
    expect(() => taskSchema.parse({ ...validTask, instanceLabel: 'a'.repeat(41) })).toThrow();
  });

  it('rejects a non-UUID seriesId', () => {
    expect(() => taskSchema.parse({ ...validTask, seriesId: 'not-a-uuid' })).toThrow();
  });
});

describe('createTaskSchema', () => {
  it('accepts instanceLabel and seriesId (used by createTaskSeries)', () => {
    const parsed = createTaskSchema.parse({
      name: 'Vacuum bedroom',
      description: '',
      categoryId: validTask.categoryId,
      notes: '',
      instanceLabel: 'Main bedroom',
      seriesId: '33333333-3333-4333-8333-333333333333',
    });
    expect(parsed.instanceLabel).toBe('Main bedroom');
    expect(parsed.seriesId).toBe('33333333-3333-4333-8333-333333333333');
  });
});

describe('updateTaskSchema', () => {
  it('allows patching instanceLabel but strips seriesId (system-owned)', () => {
    const parsed = updateTaskSchema.parse({
      instanceLabel: 'Guest room',
      seriesId: '33333333-3333-4333-8333-333333333333',
    });
    expect(parsed.instanceLabel).toBe('Guest room');
    expect('seriesId' in parsed).toBe(false);
  });

  it('keeps an explicitly-undefined instanceLabel key (the clear path)', () => {
    const parsed = updateTaskSchema.parse({ instanceLabel: undefined });
    expect('instanceLabel' in parsed).toBe(true);
    expect(parsed.instanceLabel).toBeUndefined();
  });
});
