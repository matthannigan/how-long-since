import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/time')({
  // Placeholder for the By Time view — real rendering lands in Step 6.
  component: () => (
    <section aria-labelledby="by-time-heading">
      <h2 id="by-time-heading" className="font-display text-lg font-semibold text-ink">
        By Time
      </h2>
      <p className="mt-2 text-ink-meta-aa">Tasks grouped by time needed will appear here.</p>
    </section>
  ),
});
