import { z } from 'zod';

export const taskSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(128),
  description: z.string().max(512),
  categoryId: z.uuid(),
  createdAt: z.date(),
  lastCompletedAt: z.date().nullable(),
  expectedFrequency: z
    .object({
      value: z.number().positive(),
      unit: z.enum(['day', 'week', 'month', 'year']),
    })
    .optional(),
  timeCommitment: z.enum(['15min', '30min', '1hr', '2hrs', '4hrs+']).optional(),
  isArchived: z.boolean(),
  notes: z.string().max(512),
});

// Create input: the lib fills the system-owned id / createdAt / isArchived.
// `lastCompletedAt` is normally system-owned (markTaskComplete), but the Add
// form's "Last done" control can backfill it, so it's accepted here — optional,
// defaulting to null (never completed).
export const createTaskSchema = taskSchema
  .omit({ id: true, createdAt: true, lastCompletedAt: true, isArchived: true })
  .extend({ lastCompletedAt: z.date().nullable().default(null) });

// Editable fields for `updateTask` patches — every field optional, and (unlike
// createTaskSchema) NO defaults, so an omitted field is left untouched rather
// than clobbered with a default value.
export const updateTaskSchema = taskSchema
  .pick({
    name: true,
    description: true,
    categoryId: true,
    expectedFrequency: true,
    timeCommitment: true,
    lastCompletedAt: true,
    notes: true,
  })
  .partial();
