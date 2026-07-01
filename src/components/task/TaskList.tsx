import { useLiveQuery } from 'dexie-react-hooks';

import { db } from '@/lib/db/schema';

import { TaskCard } from './TaskCard';
import { TaskListSkeleton } from './TaskListSkeleton';

interface TaskListProps {
  /** Restrict to one category; when set, the empty copy is category-scoped. */
  categoryId?: string;
  /** Passed through to every `TaskCard` (Step 6 uses `time`). */
  variant?: 'category' | 'time';
}

/**
 * Reactive flat list of non-archived tasks (design.md "Reactive Reads"). Built
 * here for Step 6's By Time view; the By Category view does its own grouping.
 *
 * NOTE: `isArchived` is a boolean, which IndexedDB cannot index — a
 * `where('isArchived')` query silently returns nothing (see the Step 2 notes).
 * So we read the table and filter archived/category in memory.
 */
export function TaskList({ categoryId, variant = 'category' }: TaskListProps) {
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);
  const categories = useLiveQuery(() => db.categories.toArray(), []);

  if (tasks === undefined || categories === undefined) return <TaskListSkeleton />;

  const active = tasks.filter(
    (t) => !t.isArchived && (categoryId ? t.categoryId === categoryId : true),
  );

  if (active.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-ink-meta-aa">
        {categoryId
          ? 'No tasks in this category. Add one?'
          : 'No tasks yet. Tap + to add your first task.'}
      </p>
    );
  }

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="space-y-3">
      {active.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          category={categoryById.get(task.categoryId)}
          variant={variant}
        />
      ))}
    </div>
  );
}
