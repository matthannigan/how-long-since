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
  timeCommitment: z.enum(['15min', '30min', '1hr', '2hrs', '4hrs', '5hrs+']).optional(),
  isArchived: z.boolean(),
  notes: z.string().max(512),
});

export const createTaskSchema = taskSchema.omit({
  id: true,
  createdAt: true,
  lastCompletedAt: true,
  isArchived: true,
});
