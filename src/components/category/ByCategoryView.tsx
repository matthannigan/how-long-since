import { useLiveQuery } from 'dexie-react-hooks';

import { TaskCard } from '@/components/task/TaskCard';
import { TaskListSkeleton } from '@/components/task/TaskListSkeleton';
import { db, DEFAULT_CATEGORIES } from '@/lib/db/schema';
import type { Task } from '@/types';

import { CategoryBadge } from './CategoryBadge';

/** DEFAULT_CATEGORIES order, for sorting default groups before user-created ones. */
const DEFAULT_ORDER = new Map(DEFAULT_CATEGORIES.map((c, i) => [c.id, i]));

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

  if (tasks === undefined || categories === undefined) return <TaskListSkeleton />;

  const active = tasks.filter((t) => !t.isArchived);

  if (active.length === 0) {
    return (
      <section aria-labelledby="by-category-heading">
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

  const groups = [...categories]
    .sort((a, b) => {
      const ai = DEFAULT_ORDER.get(a.id);
      const bi = DEFAULT_ORDER.get(b.id);
      if (ai !== undefined && bi !== undefined) return ai - bi;
      if (ai !== undefined) return -1; // default categories first
      if (bi !== undefined) return 1;
      return a.name.localeCompare(b.name); // then user categories, alphabetically
    })
    .map((category) => ({ category, groupTasks: tasksByCategory.get(category.id) ?? [] }))
    .filter((group) => group.groupTasks.length > 0);

  return (
    <section aria-labelledby="by-category-heading">
      <h2 id="by-category-heading" className="sr-only">
        By Category
      </h2>
      {groups.map(({ category, groupTasks }) => (
        <div key={category.id}>
          <CategoryBadge category={category} count={groupTasks.length} />
          <div className="space-y-3">
            {groupTasks.map((task) => (
              <TaskCard key={task.id} task={task} category={category} variant="category" />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
