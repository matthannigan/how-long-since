import { z } from 'zod';

export const categorySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  color: z.string().optional(),
  icon: z.string().optional(),
  isDefault: z.boolean(),
});

export const createCategorySchema = categorySchema.omit({
  id: true,
  isDefault: true,
});
