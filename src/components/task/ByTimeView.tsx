import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef } from 'react';

import { db } from '@/lib/db/schema';
import { groupTasksByTime } from '@/lib/time-sections';

import { QuickPick } from './QuickPick';
import { TaskCard } from './TaskCard';
import { TaskListSkeleton } from './TaskListSkeleton';
import { TimeSectionHeader } from './TimeSectionHeader';

/**
 * The By Time view: a Quick Pick panel over tasks grouped by time commitment
 * (shortest→longest, then "No time set"). Mirrors ByCategoryView — one reactive
 * read of tasks + categories, non-archived filtered in memory (the isArchived
 * boolean-index trap), empty sections dropped. Rows use `TaskCard variant="time"`
 * so the category tag + elapsed stay visible without a per-category header
 * (Req 4.4–4.5).
 */
export function ByTimeView() {
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);
  const categories = useLiveQuery(() => db.categories.toArray(), []);
  const regionRef = useRef<HTMLElement>(null);

  // Move focus to the view region on mount so switching views lands somewhere
  // sensible (Req 4.7 intent; the full focus-on-switch audit is Step 9).
  useEffect(() => {
    regionRef.current?.focus();
  }, []);

  if (tasks === undefined || categories === undefined) return <TaskListSkeleton />;

  const active = tasks.filter((t) => !t.isArchived);
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const groups = groupTasksByTime(active);

  return (
    <section
      ref={regionRef}
      tabIndex={-1}
      aria-labelledby="by-time-heading"
      className="outline-none"
    >
      <h2 id="by-time-heading" className="sr-only">
        By Time
      </h2>

      {active.length === 0 ? (
        <p className="px-1 py-10 text-center text-sm text-ink-meta-aa">
          No tasks yet. Tap + to add your first task.
        </p>
      ) : (
        <>
          <QuickPick tasks={active} categoryById={categoryById} />
          {groups.map(({ section, tasks: groupTasks }) => (
            <div key={section.id}>
              <TimeSectionHeader section={section} count={groupTasks.length} />
              <div className="space-y-3">
                {groupTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={categoryById.get(task.categoryId)}
                    variant="time"
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
