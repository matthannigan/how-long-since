import { Skeleton } from '@/components/ui/skeleton';

/**
 * Placeholder shown while the first `useLiveQuery` resolves (its `undefined`
 * state) in the By Category / By Time views (Steps 5–6). Mirrors the task-row
 * silhouette: checkbox circle · name + meta · right-aligned elapsed value.
 */
export function TaskListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true" data-testid="task-list-skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-card bg-surface-card px-[14px] py-[13px] shadow-[0_2px_10px_-6px_rgba(70,62,55,0.18)]"
        >
          <Skeleton className="size-[30px] shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-10 shrink-0" />
        </div>
      ))}
    </div>
  );
}
