import { createCategorySchema, updateCategorySchema } from '@/schemas/category';
import type { Category } from '@/types';

import { db } from './db/schema';

/** Create a user category (`isDefault: false`) from validated input. */
export async function createCategory(input: unknown): Promise<Category> {
  const data = createCategorySchema.parse(input); // throws ZodError on invalid input
  const category: Category = {
    ...data,
    id: crypto.randomUUID(),
    isDefault: false,
  };
  await db.categories.add(category);
  return category;
}

/** Patch a category's name/color/icon. */
export async function updateCategory(id: string, patch: unknown): Promise<void> {
  const data = updateCategorySchema.parse(patch);
  await db.categories.update(id, data);
}

/**
 * Delete a category, enforcing the reassignment rules (Req 3.6–3.7):
 * - An empty category is deleted outright.
 * - A category with tasks needs a `reassignToId`; without one the delete is
 *   rejected so tasks can't be orphaned.
 * - A **default** category that still has tasks is never deletable — its tasks
 *   must be moved/emptied first (which then hits the empty-category branch).
 *
 * The reassignment + delete run in one transaction, so a mid-flight failure
 * can't leave tasks pointing at a category that no longer exists.
 */
export async function deleteCategory(id: string, opts?: { reassignToId?: string }): Promise<void> {
  const taskCount = await db.tasks.where('categoryId').equals(id).count();
  if (taskCount === 0) {
    await db.categories.delete(id);
    return;
  }

  const category = await db.categories.get(id);
  if (category?.isDefault) {
    throw new Error(`Cannot delete a default category with tasks: ${id}`);
  }

  const reassignToId = opts?.reassignToId;
  if (!reassignToId) {
    throw new Error(`Category has tasks; a reassignment target is required: ${id}`);
  }
  if (reassignToId === id) {
    throw new Error('Cannot reassign a category to itself');
  }

  await db.transaction('rw', db.tasks, db.categories, async () => {
    const target = await db.categories.get(reassignToId);
    if (!target) {
      throw new Error(`Reassignment target not found: ${reassignToId}`);
    }
    await db.tasks.where('categoryId').equals(id).modify({ categoryId: reassignToId });
    await db.categories.delete(id);
  });
}
