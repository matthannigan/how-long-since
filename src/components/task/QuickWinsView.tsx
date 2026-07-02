import { useLiveQuery } from 'dexie-react-hooks';

import { useFocusOnMount } from '@/hooks/use-focus-on-mount';
import { db } from '@/lib/db/schema';

import { QuickPick } from './QuickPick';
import { TaskListSkeleton } from './TaskListSkeleton';

/**
 * The Quick Wins view (the default, first tab): "I've got some time — what can I
 * knock out?". Wraps the {@link QuickPick} panel with the shared view shell —
 * one reactive read of tasks + categories, non-archived filtered in memory (the
 * isArchived boolean-index trap), an sr-only heading, and focus-on-mount so
 * switching views lands somewhere sensible (Req 4.7 intent; the full
 * focus-on-switch audit is Step 9). Mirrors ByTimeView.
 */
export function QuickWinsView() {
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);
  const categories = useLiveQuery(() => db.categories.toArray(), []);
  const regionRef = useFocusOnMount<HTMLElement>();

  if (tasks === undefined || categories === undefined) return <TaskListSkeleton />;

  const active = tasks.filter((t) => !t.isArchived);
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return (
    <section
      ref={regionRef}
      tabIndex={-1}
      aria-labelledby="quick-wins-heading"
      className="outline-none"
    >
      <h2 id="quick-wins-heading" className="sr-only">
        Quick Wins
      </h2>

      {active.length === 0 ? (
        <p className="px-1 py-10 text-center text-sm text-ink-meta-aa">
          No tasks yet. Tap + to add your first task.
        </p>
      ) : (
        <QuickPick tasks={active} categoryById={categoryById} />
      )}
    </section>
  );
}
