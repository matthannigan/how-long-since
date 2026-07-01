import { useId, useState } from 'react';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { filterForQuickPick, QUICK_PICK_FILTERS } from '@/lib/time-sections';
import type { Category, Task } from '@/types';

import { TaskCard } from './TaskCard';

/** Tighter radius + lighter shadow for rows inside the panel (style-guide §3.7). */
const PANEL_ROW = 'rounded-[15px] shadow-[0_2px_8px_-4px_rgba(70,62,55,0.16)]';

interface QuickPickProps {
  tasks: Task[];
  categoryById: Map<string, Category>;
  /** Injectable clock for deterministic tests. */
  now?: Date;
}

/**
 * "Quick pick" panel (app-pages-prompts §4, style-guide §3.7): choose how much
 * time you have and see the tasks that fit, as ordinary task rows — so
 * complete/undo work exactly as elsewhere (they ride on TaskCard). The
 * available-time → bucket policy lives in `filterForQuickPick` so it stays
 * testable. Defaults to "15 min or less", matching the subline copy.
 */
export function QuickPick({ tasks, categoryById, now = new Date() }: QuickPickProps) {
  const [filterId, setFilterId] = useState(QUICK_PICK_FILTERS[0].id);
  const promptId = useId();

  const matches = filterForQuickPick(tasks, filterId, now);

  return (
    <div className="quick-pick-panel mx-4 mt-1 mb-2.5 rounded-[20px] border px-[18px] py-4">
      <h3 className="font-body text-xs font-bold text-accent-deep">
        <span aria-hidden="true">☀ </span>Quick pick
      </h3>
      <p id={promptId} className="mt-0.5 text-xs text-ink-meta-aa">
        How much time do you have?
      </p>

      <RadioGroup
        value={filterId}
        onValueChange={setFilterId}
        aria-labelledby={promptId}
        className="mt-3 flex flex-wrap gap-x-4 gap-y-2"
      >
        {QUICK_PICK_FILTERS.map((filter) => {
          const id = `${promptId}-${filter.id}`;
          return (
            <div key={filter.id} className="flex items-center gap-2">
              <RadioGroupItem id={id} value={filter.id} />
              <label htmlFor={id} className="text-[0.8125rem] text-ink">
                {filter.label}
              </label>
            </div>
          );
        })}
      </RadioGroup>

      <div className="mt-3 space-y-2">
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
              className={PANEL_ROW}
            />
          ))
        )}
      </div>
    </div>
  );
}
