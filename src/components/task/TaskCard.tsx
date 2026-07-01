import { Link } from '@tanstack/react-router';
import { Clock } from 'lucide-react';

import { getCategoryTag } from '@/lib/category-tags';
import { calculateOverdueStatus } from '@/lib/overdue';
import { formatElapsedCompact } from '@/lib/time-format';
import { cn } from '@/lib/utils';
import type { Category, OverdueStatus, Task, TimeCommitment } from '@/types';

import { TaskCompletionButton } from './TaskCompletionButton';

/**
 * Time-commitment → filled-circle count + label (style-guide §5). The circles
 * are always paired with the text label so meaning never rides on the glyph
 * alone. Shared shape so Step 6's By Time markers can reuse it.
 */
const TIME_COMMITMENT_META: Record<TimeCommitment, { dots: number; label: string }> = {
  '15min': { dots: 1, label: '15 min' },
  '30min': { dots: 2, label: '30 min' },
  '1hr': { dots: 3, label: '1 hr' },
  '2hrs': { dots: 4, label: '2 hrs' },
  '4hrs+': { dots: 5, label: '4+ hrs' },
};

/** Elapsed-anchor text color per status (AA-safe tokens for the alert tiers). */
const ELAPSED_COLOR: Record<OverdueStatus, string> = {
  none: 'text-ink',
  'due-soon': 'text-due-soon-aa',
  overdue: 'text-overdue-aa',
  'very-overdue': 'text-overdue-aa',
};

interface TaskCardProps {
  task: Task;
  /** Needed by the `time` variant's category tag (Step 6). */
  category?: Category;
  /**
   * `category` (default) → greige time-estimate chip. `time` → tinted category
   * tag + muted time text (built for Step 6's By Time view).
   */
  variant?: 'category' | 'time';
  /** Injectable clock so status/elapsed are deterministic in tests. */
  now?: Date;
  /** Extra classes on the row root — used by Quick Pick to tighten the row. */
  className?: string;
}

/**
 * A single task row (app-pages-prompts §1, style-guide §3.2): checkbox · body
 * (name + meta line) · right-aligned elapsed anchor. The whole body — everything
 * but the checkbox — links to the detail/edit route. Three overdue tiers each
 * carry a non-color cue plus screen-reader text.
 */
export function TaskCard({
  task,
  category,
  variant = 'category',
  now = new Date(),
  className,
}: TaskCardProps) {
  const status = calculateOverdueStatus(task, now);
  const elapsed = formatElapsedCompact(task.lastCompletedAt, now);
  const isOverdue = status === 'overdue' || status === 'very-overdue';
  const time = task.timeCommitment ? TIME_COMMITMENT_META[task.timeCommitment] : null;

  const showPill = status === 'very-overdue';
  const showTag = variant === 'time' && !!category;
  const tag = showTag ? getCategoryTag(category) : null;
  const hasMeta = showPill || showTag || !!time;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-card bg-surface-card px-[14px] py-[13px]',
        isOverdue
          ? 'border-[1.5px] border-overdue-border'
          : 'shadow-[0_2px_10px_-6px_rgba(70,62,55,0.18)]',
        className,
      )}
    >
      <TaskCompletionButton task={task} />

      <Link
        to="/tasks/$taskId"
        params={{ taskId: task.id }}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-[0.9375rem] font-semibold text-ink">{task.name}</p>

          {hasMeta && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {showPill && (
                <span className="rounded-chip bg-overdue-tint px-2 py-0.5 text-[0.5625rem] font-bold tracking-[0.03em] text-overdue uppercase">
                  Very overdue
                </span>
              )}
              {showTag && (
                // AA-safe tinted category tag (style-guide §1.4/§1.5), tokenized
                // via getCategoryTag so dark mode swaps automatically.
                <span
                  className="rounded-chip px-2 py-0.5 text-[0.625rem] font-semibold"
                  style={tag ? { backgroundColor: tag.bg, color: tag.fg } : undefined}
                >
                  {category.name}
                </span>
              )}
              {time && (
                <span
                  className={cn(
                    'flex items-center gap-1 text-xs text-ink-meta-aa',
                    variant === 'category' && 'rounded-chip bg-surface-sunk px-2 py-0.5',
                  )}
                >
                  <span aria-hidden="true">{'●'.repeat(time.dots)}</span>
                  {time.label}
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex shrink-0 items-center gap-1 font-display text-[0.9375rem] font-semibold',
            ELAPSED_COLOR[status],
          )}
        >
          {status === 'due-soon' && (
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
          {status === 'overdue' && <span className="sr-only">Overdue</span>}
          <span>{elapsed}</span>
        </div>
      </Link>
    </div>
  );
}
