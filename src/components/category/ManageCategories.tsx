import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteCategory } from '@/lib/categories';
import { sortCategoriesForDisplay } from '@/lib/category-order';
import { db } from '@/lib/db/schema';
import type { Category } from '@/types';

import { CategoryForm } from './CategoryForm';
import { CategoryIcon } from './CategoryIcon';

/**
 * Manage Categories (Step 7b): list every category, create/edit via the shared
 * CategoryForm, and delete enforcing Req 3.6–3.7 — reassign a non-empty
 * category's tasks first, and block deleting a default that still has tasks.
 * Reached at `/categories`; Settings (Step 8) links here.
 */
export function ManageCategories() {
  const categories = useLiveQuery(() => db.categories.toArray(), []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [removing, setRemoving] = useState<Category | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState('');

  if (!categories || !tasks) return null;

  const sorted = sortCategoriesForDisplay(categories);
  const counts = new Map<string, number>();
  for (const t of tasks) counts.set(t.categoryId, (counts.get(t.categoryId) ?? 0) + 1);

  const removingCount = removing ? (counts.get(removing.id) ?? 0) : 0;
  const reassignTargets = removing ? sorted.filter((c) => c.id !== removing.id) : [];

  const handleRemoveClick = (category: Category) => {
    const count = counts.get(category.id) ?? 0;
    if (category.isDefault && count > 0) {
      toast.error('Cannot delete the default category. Try editing it instead.');
      return;
    }
    setReassignTargetId('');
    setRemoving(category);
  };

  const closeRemove = () => {
    setRemoving(null);
    setReassignTargetId('');
  };

  const handleConfirmRemove = async () => {
    if (!removing) return;
    try {
      await deleteCategory(
        removing.id,
        removingCount > 0 ? { reassignToId: reassignTargetId } : undefined,
      );
      toast.success('Category removed');
      closeRemove();
    } catch {
      toast.error("Changes couldn't be saved. Try again.");
    }
  };

  return (
    <section aria-labelledby="manage-categories-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="manage-categories-heading" className="font-display text-lg font-semibold text-ink">
          Categories
        </h2>
        <Button type="button" size="sm" onClick={() => setCreating(true)}>
          New Category
        </Button>
      </div>

      <ul className="divide-y divide-border-default rounded-card border border-border-default bg-surface-card">
        {sorted.map((category) => {
          const count = counts.get(category.id) ?? 0;
          return (
            <li key={category.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: category.color
                    ? `${category.color}1a`
                    : 'color-mix(in srgb, var(--color-ink-secondary) 10%, transparent)',
                }}
              >
                {category.icon ? (
                  <CategoryIcon name={category.icon} className="size-4" />
                ) : (
                  <span
                    className="size-[11px] rounded-full"
                    style={{ backgroundColor: category.color ?? 'var(--color-ink-secondary)' }}
                    aria-hidden="true"
                  />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.9375rem] font-semibold text-ink">{category.name}</p>
                <p className="text-xs text-ink-meta-aa">
                  {count} {count === 1 ? 'task' : 'tasks'}
                  {category.isDefault && ' · Default'}
                </p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(category)}>
                Edit
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveClick(category)}
              >
                Remove
              </Button>
            </li>
          );
        })}
      </ul>

      {/* Create */}
      <Dialog open={creating} onOpenChange={(o) => !o && setCreating(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Category</DialogTitle>
            <DialogDescription className="sr-only">Create a new task category.</DialogDescription>
          </DialogHeader>
          <CategoryForm
            mode="create"
            autoFocusName
            onSaved={() => setCreating(false)}
            onCancel={() => setCreating(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription className="sr-only">
              Edit this category&rsquo;s name, color, or icon.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <CategoryForm
              mode="edit"
              category={editing}
              onSaved={() => setEditing(null)}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Remove (reassign or confirm) */}
      <Dialog open={!!removing} onOpenChange={(o) => !o && closeRemove()}>
        <DialogContent className="max-w-sm">
          {removingCount > 0 ? (
            <>
              <DialogHeader>
                <DialogTitle>Reassign tasks first</DialogTitle>
                <DialogDescription>
                  &ldquo;{removing?.name}&rdquo; has {removingCount}{' '}
                  {removingCount === 1 ? 'task' : 'tasks'}. Move{' '}
                  {removingCount === 1 ? 'it' : 'them'} to another category, then remove this one.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-1.5">
                <label
                  htmlFor="reassign-target"
                  className="text-[0.6875rem] font-bold tracking-[0.05em] text-ink-secondary uppercase"
                >
                  Move tasks to
                </label>
                <select
                  id="reassign-target"
                  value={reassignTargetId}
                  onChange={(e) => setReassignTargetId(e.target.value)}
                  className="min-h-11 w-full rounded-input border-[1.5px] border-border-default bg-surface-card px-3 text-base text-ink outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <option value="">Choose a category…</option>
                  {reassignTargets.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={closeRemove}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!reassignTargetId}
                  onClick={handleConfirmRemove}
                >
                  Reassign &amp; remove
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Remove this category?</DialogTitle>
                <DialogDescription>
                  &ldquo;{removing?.name}&rdquo; has no tasks. This can&rsquo;t be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={closeRemove}>
                  Cancel
                </Button>
                <Button type="button" variant="destructive" onClick={handleConfirmRemove}>
                  Remove
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
