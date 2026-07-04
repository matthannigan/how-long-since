import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useId, useState } from 'react';

import { type SeriesGroup, seriesSummary } from '@/lib/series';
import { cn } from '@/lib/utils';
import type { Category, OverdueStatus } from '@/types';

import { TaskCard } from './TaskCard';

/** Right-anchor text color per worst-of status (AA-safe alert tokens). */
const SUMMARY_COLOR: Record<OverdueStatus, string> = {
  none: 'text-ink-meta-aa',
  'due-soon': 'text-due-soon-aa',
  overdue: 'text-overdue-aa',
  'very-overdue': 'text-overdue-aa',
};

interface TaskSeriesGroupProps {
  /** From `groupSeriesForDisplay` — tasks arrive pre-sorted by instance label. */
  group: SeriesGroup;
  /** Forwarded to the expanded child TaskCards. */
  variant: 'category' | 'time';
  /** The siblings' category (pass the first task's — they share it unless edited apart). */
  category?: Category;
  /** Injectable clock so status is deterministic in tests. */
  now?: Date;
}

/**
 * Collapsed series row (Phase 1.1): one card-styled disclosure `<button>` for
 * sibling tasks sharing a seriesId — series name, "{n} places", and a
 * worst-of-siblings "{x} of {n} overdue" summary with the same non-color cues
 * as TaskCard. Expanding renders one stock TaskCard per sibling, so Just Done,
 * undo, and detail navigation behave exactly as everywhere else. The row
 * itself has no checkbox or link — no nested interactive elements.
 */
export function TaskSeriesGroup({
  group,
  variant,
  category,
  now = new Date(),
}: TaskSeriesGroupProps) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const { worst, overdueCount, total } = seriesSummary(group.tasks, now);
  const isOverdue = worst === 'overdue' || worst === 'very-overdue';

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={listId}
        className={cn(
          'flex w-full items-center gap-3 rounded-card bg-surface-card px-[14px] py-[13px] text-left outline-none focus-visible:ring-2 focus-visible:ring-accent',
          isOverdue
            ? 'border-[1.5px] border-overdue-border'
            : 'shadow-[0_2px_10px_-6px_rgba(70,62,55,0.18)]',
        )}
      >
        {open ? (
          <ChevronUp className="size-4 shrink-0 text-ink-meta-aa" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-ink-meta-aa" aria-hidden="true" />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-[0.9375rem] font-semibold text-ink">{group.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-chip bg-surface-sunk px-2 py-0.5 text-xs text-ink-meta-aa">
              {total} places
            </span>
          </div>
        </div>

        <div
          className={cn(
            'flex shrink-0 items-center gap-1 font-display text-[0.9375rem] font-semibold',
            SUMMARY_COLOR[worst],
          )}
        >
          {worst === 'due-soon' && (
            <>
              <Clock className="size-3.5" aria-hidden="true" />
              <span className="sr-only">Due soon</span>
            </>
          )}
          {isOverdue && (
            <span
              className="inline-flex size-[17px] items-center justify-center rounded-full bg-overdue-tint text-[0.625rem] font-bold text-overdue"
              aria-hidden="true"
            >
              !
            </span>
          )}
          {worst === 'overdue' && <span className="sr-only">Overdue</span>}
          {worst === 'very-overdue' && <span className="sr-only">Very overdue</span>}
          {overdueCount > 0 && (
            <span>
              {overdueCount} of {total} overdue
            </span>
          )}
        </div>
      </button>

      <div
        id={listId}
        role="group"
        aria-label={`${group.name} instances`}
        className={cn('space-y-3', open && 'mt-3')}
      >
        {open &&
          group.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              category={category}
              variant={variant}
              now={now}
              className="ml-4"
            />
          ))}
      </div>
    </div>
  );
}
