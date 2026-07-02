import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';

import { RemoveTaskSection } from '@/components/task/RemoveTaskSection';
import { TaskForm } from '@/components/task/TaskForm';
import { Button } from '@/components/ui/button';
import { sortCategoriesForDisplay } from '@/lib/category-order';
import { db } from '@/lib/db/schema';

export const Route = createFileRoute('/tasks/$taskId')({
  component: RouteComponent,
});

/**
 * Add/Edit task page. `taskId="new"` renders the create form (a deep-link
 * fallback — the FAB opens the modal instead); any other id loads that task and
 * renders the same form in edit mode plus the Remove Task actions.
 */
function RouteComponent() {
  const { taskId } = Route.useParams();
  const router = useRouter();
  const isNew = taskId === 'new';

  const categories = useLiveQuery(() => db.categories.toArray(), []);
  // A sentinel result lets us tell "loading" (undefined) from "not found".
  const result = useLiveQuery(async () => {
    if (isNew) return 'new' as const;
    return (await db.tasks.get(taskId)) ?? ('missing' as const);
  }, [taskId, isNew]);

  const goBack = () => {
    if (window.history.length > 1) router.history.back();
    else void router.navigate({ to: '/' });
  };

  if (!categories || result === undefined) return null;
  const sorted = sortCategoriesForDisplay(categories);

  if (result === 'missing') {
    return (
      <section aria-labelledby="task-form-heading">
        <h2 id="task-form-heading" className="font-display text-lg font-semibold text-ink">
          Task not found
        </h2>
        <p className="mt-2 text-sm text-ink-meta-aa">
          This task may have been removed. It might still be in your list.
        </p>
        <Button type="button" variant="outline" className="mt-4" onClick={goBack}>
          Go back
        </Button>
      </section>
    );
  }

  if (result === 'new') {
    return (
      <section aria-labelledby="task-form-heading">
        <h2 id="task-form-heading" className="font-display text-lg font-semibold text-ink">
          New Task
        </h2>
        <div className="mt-4">
          <TaskForm mode="create" categories={sorted} onDone={goBack} onCancel={goBack} />
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="task-form-heading">
      <h2 id="task-form-heading" className="font-display text-lg font-semibold text-ink">
        Edit Task
      </h2>
      <div className="mt-4">
        <TaskForm mode="edit" task={result} categories={sorted} onDone={goBack} onCancel={goBack} />
      </div>
      <RemoveTaskSection task={result} onRemoved={goBack} />
    </section>
  );
}
