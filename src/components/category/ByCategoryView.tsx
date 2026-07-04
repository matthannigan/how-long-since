import { Link } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { Tags } from 'lucide-react';

import { TaskCard } from '@/components/task/TaskCard';
import { TaskListSkeleton } from '@/components/task/TaskListSkeleton';
import { TaskSeriesGroup } from '@/components/task/TaskSeriesGroup';
import { useFocusOnMount } from '@/hooks/use-focus-on-mount';
import { sortCategoriesForDisplay } from '@/lib/category-order';
import { db } from '@/lib/db/schema';
import { groupSeriesForDisplay } from '@/lib/series';
import type { Task } from '@/types';

import { CategoryBadge } from './CategoryBadge';

/**
 * The default view (app-pages-prompts §3): non-archived tasks grouped under a
 * color-dot header per category. Categories with no tasks are omitted; when
 * there are no tasks at all, a single empty state stands in.
 *
 * Reads tasks + categories once and groups in memory — `isArchived` is a
 * boolean IndexedDB can't index, so it is filtered here rather than queried.
 */
export function ByCategoryView() {
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);
  const categories = useLiveQuery(() => db.categories.toArray(), []);
  const regionRef = useFocusOnMount<HTMLElement>();

  if (tasks === undefined || categories === undefined) return <TaskListSkeleton />;

  const active = tasks.filter((t) => !t.isArchived);

  if (active.length === 0) {
    return (
      <section
        ref={regionRef}
        tabIndex={-1}
        aria-labelledby="by-category-heading"
        className="outline-none"
      >
        <h2 id="by-category-heading" className="sr-only">
          By Category
        </h2>
        <p className="px-1 py-10 text-center text-sm text-ink-meta-aa">
          No tasks yet. Tap + to add your first task.
        </p>
      </section>
    );
  }

  const tasksByCategory = new Map<string, Task[]>();
  for (const task of active) {
    const list = tasksByCategory.get(task.categoryId);
    if (list) list.push(task);
    else tasksByCategory.set(task.categoryId, [task]);
  }

  const groups = sortCategoriesForDisplay(categories)
    .map((category) => ({ category, groupTasks: tasksByCategory.get(category.id) ?? [] }))
    .filter((group) => group.groupTasks.length > 0);

  return (
    <section
      ref={regionRef}
      tabIndex={-1}
      aria-labelledby="by-category-heading"
      className="outline-none"
    >
      <h2 id="by-category-heading" className="sr-only">
        By Category
      </h2>
      {groups.map(({ category, groupTasks }) => (
        <div key={category.id}>
          {/* Header count keeps task semantics; the series row carries "n places". */}
          <CategoryBadge category={category} count={groupTasks.length} />
          <div className="space-y-3">
            {groupSeriesForDisplay(groupTasks).map((item) =>
              item.kind === 'task' ? (
                <TaskCard
                  key={item.task.id}
                  task={item.task}
                  category={category}
                  variant="category"
                />
              ) : (
                <TaskSeriesGroup
                  key={item.group.seriesId}
                  group={item.group}
                  category={category}
                  variant="category"
                />
              ),
            )}
          </div>
        </div>
      ))}

      <div className="mt-6 flex justify-center">
        <Link
          to="/categories"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-input px-3 text-sm font-medium text-ink-meta-aa outline-none hover:text-accent-deep focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Tags className="size-4" aria-hidden="true" />
          Manage Categories
        </Link>
      </div>
    </section>
  );
}
