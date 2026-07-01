import { createFileRoute } from '@tanstack/react-router';

// Placeholder — the Add/Edit task form is built in Step 7.
export const Route = createFileRoute('/tasks/$taskId')({
  component: () => null,
});
