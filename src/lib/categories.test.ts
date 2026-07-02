import { beforeEach, describe, expect, it } from 'vitest';

import { db, DEFAULT_CATEGORIES } from '@/lib/db/schema';

import { createCategory, deleteCategory } from './categories';
import { createTask } from './tasks';

beforeEach(async () => {
  await Promise.all([db.tasks.clear(), db.categories.clear(), db.settings.clear()]);
});

function taskInputFor(categoryId: string) {
  return { name: 'Clean the sink', description: '', categoryId, notes: '' };
}

describe('deleteCategory', () => {
  it('deletes a category that has no tasks', async () => {
    const category = await createCategory({ name: 'Hobbies' });

    await deleteCategory(category.id);

    expect(await db.categories.get(category.id)).toBeUndefined();
  });

  it('refuses to delete a category with tasks when no reassignment target is given', async () => {
    const category = await createCategory({ name: 'Hobbies' });
    await createTask(taskInputFor(category.id));

    await expect(deleteCategory(category.id)).rejects.toThrow();

    // Nothing was removed.
    expect(await db.categories.get(category.id)).toBeDefined();
    expect(await db.tasks.where('categoryId').equals(category.id).count()).toBe(1);
  });

  it('reassigns tasks then deletes the category, atomically', async () => {
    const from = await createCategory({ name: 'Hobbies' });
    const to = await createCategory({ name: 'Leisure' });
    const task = await createTask(taskInputFor(from.id));

    await deleteCategory(from.id, { reassignToId: to.id });

    expect(await db.categories.get(from.id)).toBeUndefined();
    expect((await db.tasks.get(task.id))?.categoryId).toBe(to.id);
  });

  it('throws when the reassignment target does not exist', async () => {
    const from = await createCategory({ name: 'Hobbies' });
    await createTask(taskInputFor(from.id));

    await expect(deleteCategory(from.id, { reassignToId: crypto.randomUUID() })).rejects.toThrow();

    // The failed transaction left the source category and its task untouched.
    expect(await db.categories.get(from.id)).toBeDefined();
    expect(await db.tasks.where('categoryId').equals(from.id).count()).toBe(1);
  });

  it('never deletes a default category that still has tasks (even with a target)', async () => {
    const defaultCategory = DEFAULT_CATEGORIES[0];
    await db.categories.add(defaultCategory);
    const fallback = await createCategory({ name: 'Leisure' });
    await createTask(taskInputFor(defaultCategory.id));

    await expect(
      deleteCategory(defaultCategory.id, { reassignToId: fallback.id }),
    ).rejects.toThrow();

    expect(await db.categories.get(defaultCategory.id)).toBeDefined();
  });
});
