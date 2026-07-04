import { useLiveQuery } from 'dexie-react-hooks';

import { useFocusOnMount } from '@/hooks/use-focus-on-mount';
import { db } from '@/lib/db/schema';
import { groupSeriesForDisplay } from '@/lib/series';
import { groupTasksByTime } from '@/lib/time-sections';

import { TaskCard } from './TaskCard';
import { TaskListSkeleton } from './TaskListSkeleton';
import { TaskSeriesGroup } from './TaskSeriesGroup';
import { TimeSectionHeader } from './TimeSectionHeader';

/**
 * The By Time view: tasks grouped by time commitment (shortest→longest, then
 * "No time set"). Mirrors ByCategoryView — one reactive read of tasks +
 * categories, non-archived filtered in memory (the isArchived boolean-index
 * trap), empty sections dropped. Rows use `TaskCard variant="time"` so the
 * category tag + elapsed stay visible without a per-category header (Req 4.4–4.5).
 * (Quick Pick was promoted to its own Quick Wins view — see QuickWinsView.)
 */
export function ByTimeView() {
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);
  const categories = useLiveQuery(() => db.categories.toArray(), []);
  const regionRef = useFocusOnMount<HTMLElement>();

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
          {groups.map(({ section, tasks: groupTasks }) => (
            <div key={section.id}>
              {/* Header count keeps task semantics; the series row carries "n places". */}
              <TimeSectionHeader section={section} count={groupTasks.length} />
              <div className="space-y-3">
                {groupSeriesForDisplay(groupTasks).map((item) =>
                  item.kind === 'task' ? (
                    <TaskCard
                      key={item.task.id}
                      task={item.task}
                      category={categoryById.get(item.task.categoryId)}
                      variant="time"
                    />
                  ) : (
                    <TaskSeriesGroup
                      key={item.group.seriesId}
                      group={item.group}
                      category={categoryById.get(item.group.tasks[0].categoryId)}
                      variant="time"
                    />
                  ),
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
