import { useId, useState } from 'react';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { filterForQuickPick, QUICK_PICK_FILTERS } from '@/lib/time-sections';
import type { Category, Task } from '@/types';

import { TaskCard } from './TaskCard';

interface QuickPickProps {
  tasks: Task[];
  categoryById: Map<string, Category>;
  /** Injectable clock for deterministic tests. */
  now?: Date;
}

/**
 * The Quick Wins panel (app-pages-prompts §4a, style-guide §3.7): choose how much
 * time you have and see the tasks that fit, as ordinary task rows — so
 * complete/undo work exactly as elsewhere (they ride on TaskCard). The
 * available-time → bucket policy lives in `filterForQuickPick` so it stays
 * testable. Defaults to "15 min", matching the first filter. Rendered by
 * `QuickWinsView`, which supplies the view shell (focus, empty state).
 *
 * The gradient panel holds only the prompt + radios; the "How much time do you
 * have?" prompt is styled as a section heading (matching CategoryBadge /
 * TimeSectionHeader) and matching tasks sit below it in their own group, at the
 * same full size as rows in By Category / By Time.
 */
export function QuickPick({ tasks, categoryById, now = new Date() }: QuickPickProps) {
  const [filterId, setFilterId] = useState(QUICK_PICK_FILTERS[0].id);
  const promptId = useId();

  const matches = filterForQuickPick(tasks, filterId, now);

  return (
    <>
      <div className="quick-pick-panel rounded-[20px] border px-[18px] py-4">
        <h3 id={promptId} className="font-display text-lg font-bold text-ink">
          How much time do you have?
        </h3>

        <RadioGroup
          value={filterId}
          onValueChange={setFilterId}
          aria-labelledby={promptId}
          className="mt-3 flex flex-wrap gap-x-5 gap-y-1"
        >
          {QUICK_PICK_FILTERS.map((filter) => {
            const id = `${promptId}-${filter.id}`;
            return (
              <div key={filter.id} className="flex items-center gap-2.5 py-1">
                <RadioGroupItem id={id} value={filter.id} className="size-5" />
                <label htmlFor={id} className="text-base text-ink">
                  {filter.label}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      <div className="mt-4 space-y-3">
        {matches.length === 0 ? (
          <p className="py-2 text-center text-sm text-ink-meta-aa">
            No tasks match this time filter.
          </p>
        ) : (
          matches.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              category={categoryById.get(task.categoryId)}
              variant="time"
              now={now}
            />
          ))
        )}
      </div>
    </>
  );
}
