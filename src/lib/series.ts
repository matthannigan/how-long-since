import { calculateOverdueStatus, OVERDUE_STATUS_RANK } from '@/lib/overdue';
import type { OverdueStatus, Task } from '@/types';

/**
 * Pure series grouping + summary logic (Phase 1.1). Views pass in the tasks of
 * one already-bucketed render group (a time section or a category group) and
 * render the returned display items in order — this module is the single
 * grouping entry point so By Time and By Category can't drift.
 */

/** Sibling tasks sharing a `seriesId`, label-sorted for stable display. */
export interface SeriesGroup {
  seriesId: string;
  /** Display name for the group row — the first member's task name. */
  name: string;
  tasks: Task[];
}

export type SeriesDisplayItem =
  { kind: 'task'; task: Task } | { kind: 'series'; group: SeriesGroup };

/** Alphabetical by instance label (locale, case-insensitive); unlabeled last. */
function byInstanceLabel(a: Task, b: Task): number {
  if (!a.instanceLabel) return b.instanceLabel ? 1 : 0;
  if (!b.instanceLabel) return -1;
  return a.instanceLabel.localeCompare(b.instanceLabel, undefined, { sensitivity: 'base' });
}

/**
 * Collapse siblings into series groups for rendering. Input order is
 * preserved: a group row sits at its first member's position. A series only
 * groups when **≥2 siblings are present in this list** — a lone sibling in a
 * bucket (series of one, or siblings split across buckets after an edit)
 * renders as a plain task. Tasks without a `seriesId` always pass through.
 */
export function groupSeriesForDisplay(tasks: Task[]): SeriesDisplayItem[] {
  const bySeries = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.seriesId) continue;
    const siblings = bySeries.get(task.seriesId) ?? [];
    siblings.push(task);
    bySeries.set(task.seriesId, siblings);
  }

  const emitted = new Set<string>();
  const items: SeriesDisplayItem[] = [];
  for (const task of tasks) {
    const siblings = task.seriesId ? bySeries.get(task.seriesId) : undefined;
    if (!task.seriesId || !siblings || siblings.length < 2) {
      items.push({ kind: 'task', task });
    } else if (!emitted.has(task.seriesId)) {
      emitted.add(task.seriesId);
      items.push({
        kind: 'series',
        group: {
          seriesId: task.seriesId,
          name: task.name,
          tasks: [...siblings].sort(byInstanceLabel),
        },
      });
    }
  }
  return items;
}

/** The most urgent status across the given tasks (`none` for an empty list). */
export function worstStatus(tasks: Task[], now = new Date()): OverdueStatus {
  let worst: OverdueStatus = 'none';
  for (const task of tasks) {
    const status = calculateOverdueStatus(task, now);
    if (OVERDUE_STATUS_RANK[status] < OVERDUE_STATUS_RANK[worst]) worst = status;
  }
  return worst;
}

/**
 * Group-row summary. `overdueCount` counts only `overdue` + `very-overdue`
 * (matching the word "overdue" in "2 of 5 overdue"); a due-soon sibling
 * affects `worst` but not the count.
 */
export function seriesSummary(
  tasks: Task[],
  now = new Date(),
): { worst: OverdueStatus; overdueCount: number; total: number } {
  const overdueCount = tasks.filter((t) => {
    const status = calculateOverdueStatus(t, now);
    return status === 'overdue' || status === 'very-overdue';
  }).length;
  return { worst: worstStatus(tasks, now), overdueCount, total: tasks.length };
}

/** How many suggestions the chip input offers. */
export const SUGGESTION_LIMIT = 8;

/**
 * The "tiny recommendation engine": distinct instance labels already used by
 * non-archived tasks in `categoryId`, minus `exclude` (both case-insensitive),
 * ordered most-frequent-then-alphabetical, capped at `SUGGESTION_LIMIT`.
 * Add "Vacuum" to Bedroom and it offers the bedroom names you've already
 * listed on other Bedroom tasks.
 */
export function suggestLabels(tasks: Task[], categoryId: string, exclude: string[]): string[] {
  const excluded = new Set(exclude.map((label) => label.trim().toLowerCase()));
  const counts = new Map<string, { label: string; count: number }>();
  for (const task of tasks) {
    if (task.isArchived || task.categoryId !== categoryId || !task.instanceLabel) continue;
    const key = task.instanceLabel.toLowerCase();
    if (excluded.has(key)) continue;
    const entry = counts.get(key);
    if (entry) entry.count += 1;
    else counts.set(key, { label: task.instanceLabel, count: 1 });
  }
  return [...counts.values()]
    .sort(
      (a, b) =>
        b.count - a.count || a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
    )
    .slice(0, SUGGESTION_LIMIT)
    .map((entry) => entry.label);
}
