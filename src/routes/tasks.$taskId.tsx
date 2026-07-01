import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tasks/$taskId')({
  component: RouteComponent,
});

/**
 * Placeholder for the Add/Edit task form — the real form lands in Step 7. The
 * FAB routes here with `taskId="new"`; any other id is an edit.
 */
function RouteComponent() {
  const { taskId } = Route.useParams();
  const isNew = taskId === 'new';
  return (
    <section aria-labelledby="task-form-heading">
      <h2 id="task-form-heading" className="font-display text-lg font-semibold text-ink">
        {isNew ? 'New Task' : 'Edit Task'}
      </h2>
      <p className="mt-2 text-ink-meta-aa">The task form will appear here.</p>
    </section>
  );
}
