import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { markTaskComplete, undoComplete } from '@/lib/tasks';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import type { Task } from '@/types';

/** How long a repeat tap counts as the same completion "burst" (matches the 5s toast). */
const BURST_MS = 5000;

/**
 * The "Just Done" control (style-guide §3.3): a 30px circle inside a ≥44px tap
 * target. Completion is a momentary action — the data model has no "done"
 * boolean, so the row just records a new `lastCompletedAt`. On activate we show
 * a brief terracotta fill + check as confirmation, then revert.
 *
 * The 5-second undo restores the *prior* completion date (which may be `null`):
 * `markTaskComplete` returns it and the toast's Undo action passes it straight
 * to `undoComplete` — never recomputed.
 *
 * Repeat taps within the undo window (e.g. an accidental double-click) collapse
 * to a single toast (stable id) and keep the *original* prior in `burstRef` —
 * plus every completion-log row the burst appended — so one Undo always jumps
 * back to the true earlier date and removes all of the burst's log rows. The
 * window is a per-row wall-clock ref, independent of the toast lifecycle, so
 * it's correct even for same-tick double-fires.
 */
export function TaskCompletionButton({ task }: { task: Task }) {
  const showUndo = useUIStore((s) => s.showUndo);
  const dismissUndo = useUIStore((s) => s.dismissUndo);

  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstRef = useRef<{
    prior: Date | null;
    completionIds: string[];
    expiresAt: number;
  } | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  // Include the instance label so sibling tasks in a series ("Vacuum bedroom —
  // Guest room") are distinguishable in the toast and to assistive tech.
  const displayName = task.instanceLabel ? `${task.name} — ${task.instanceLabel}` : task.name;

  async function handleComplete() {
    try {
      const { previous, completionId } = await markTaskComplete(task.id);

      // Within an active burst, keep the original prior and accumulate the
      // appended log rows; otherwise this tap starts a fresh burst from the
      // date it just replaced.
      const now = Date.now();
      const inBurst = burstRef.current !== null && now < burstRef.current.expiresAt;
      const originalPrior = inBurst ? burstRef.current!.prior : previous;
      const completionIds = inBurst
        ? [...burstRef.current!.completionIds, completionId]
        : [completionId];
      burstRef.current = { prior: originalPrior, completionIds, expiresAt: now + BURST_MS };

      // Clear our undo-store slot only while it's still ours (never clobber
      // another row's active undo — the store holds a single slot).
      const clearOurUndo = () => {
        if (useUIStore.getState().undoSnackbar?.taskId === task.id) dismissUndo();
      };

      setConfirming(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setConfirming(false), 1500);

      showUndo(task.id, originalPrior, completionIds);
      toast.success(`Nice work! Updated ${displayName}`, {
        id: `complete-${task.id}`, // same id → a repeat tap replaces, never stacks
        action: {
          label: 'Undo',
          onClick: () => {
            void undoComplete(task.id, originalPrior, completionIds);
            burstRef.current = null;
            setConfirming(false);
            clearOurUndo();
          },
        },
        onAutoClose: clearOurUndo,
        onDismiss: clearOurUndo,
      });
    } catch {
      // lib/ throws internal identifiers; map to content-strategy-guide §4.3 copy.
      toast.error("Changes couldn't be saved. Try again.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleComplete}
      aria-label={`Mark ${displayName} complete`}
      className="grid size-11 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span
        className={cn(
          'grid size-[30px] place-items-center rounded-full border-2 transition-colors',
          confirming ? 'border-accent bg-accent text-white' : 'border-border-soft bg-surface-input',
        )}
      >
        {confirming && <Check className="size-4" strokeWidth={3} aria-hidden="true" />}
      </span>
    </button>
  );
}
