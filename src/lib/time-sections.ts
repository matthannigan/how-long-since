import { calculateOverdueStatus, OVERDUE_STATUS_RANK } from '@/lib/overdue';
import type { Task, TimeCommitment } from '@/types';

/**
 * A By Time group (app-pages-prompts §4). The view shows five named sections
 * shortest→longest (`4hrs+` is the open-ended "Big projects" top bucket) plus a
 * trailing "No time set" catch-all (Req 4.2).
 */
export interface TimeSection {
  id: string;
  /** Section heading text (app-pages §4). */
  title: string;
  /** Short duration label shown next to the count, e.g. "15 min · 3". */
  shortLabel: string;
  /** Time-commitment buckets this section collects; empty = tasks with none. */
  buckets: TimeCommitment[];
}

/**
 * Time-commitment → filled-circle count + label (style-guide §5). The circles
 * are always paired with the text label so meaning never rides on the glyph
 * alone. Shared by TaskCard and the series group row.
 */
export const TIME_COMMITMENT_META: Record<TimeCommitment, { dots: number; label: string }> = {
  '15min': { dots: 1, label: '15 min' },
  '30min': { dots: 2, label: '30 min' },
  '1hr': { dots: 3, label: '1 hr' },
  '2hrs': { dots: 4, label: '2 hrs' },
  '4hrs+': { dots: 5, label: '4+ hrs' },
};

export const TIME_SECTIONS: TimeSection[] = [
  { id: 'quick', title: 'Quick tasks', shortLabel: '15 min', buckets: ['15min'] },
  { id: 'short', title: 'Short tasks', shortLabel: '30 min', buckets: ['30min'] },
  { id: 'medium', title: 'Medium tasks', shortLabel: '1 hr', buckets: ['1hr'] },
  { id: 'longer', title: 'Longer tasks', shortLabel: '2 hrs', buckets: ['2hrs'] },
  { id: 'big', title: 'Big projects', shortLabel: '4+ hrs', buckets: ['4hrs+'] },
  { id: 'none', title: 'No time set', shortLabel: '', buckets: [] },
];

export interface TimeGroup {
  section: TimeSection;
  tasks: Task[];
}

/** Position of a task's bucket within its (currently single-bucket) section. */
function bucketRank(section: TimeSection, bucket: TimeCommitment | undefined): number {
  if (!bucket) return 0;
  const i = section.buckets.indexOf(bucket);
  return i === -1 ? 0 : i;
}

/**
 * Group tasks into the fixed sections above, shortest→longest with "No time
 * set" last, preserving bucket order within a section and dropping empty
 * sections (mirrors ByCategoryView's skip-empty). Input should already be
 * non-archived (the caller filters in memory — the isArchived boolean-index trap).
 */
export function groupTasksByTime(tasks: Task[]): TimeGroup[] {
  return TIME_SECTIONS.map((section) => {
    const inSection =
      section.buckets.length === 0
        ? tasks.filter((t) => !t.timeCommitment)
        : tasks.filter((t) => t.timeCommitment && section.buckets.includes(t.timeCommitment));

    const ordered = [...inSection].sort(
      (a, b) => bucketRank(section, a.timeCommitment) - bucketRank(section, b.timeCommitment),
    );

    return { section, tasks: ordered };
  }).filter((group) => group.tasks.length > 0);
}

export interface QuickPickFilter {
  id: string;
  /** Available-time window shown on the radio (e.g. "30 min", "2 hours"). */
  label: string;
  buckets: TimeCommitment[];
}

/**
 * The Quick Pick "How much time do you have?" windows. Each maps the chosen
 * window to the time-commitment buckets that fit, cumulatively. Quick Pick is
 * for surfacing quick wins, so it deliberately tops out at `2hrs` — the "Big
 * projects" (`4hrs+`) and "No time set" buckets are never offered here (they
 * still appear in the full By Time list below). Documenting the mapping here
 * keeps it testable (step-6 risk note).
 */
export const QUICK_PICK_FILTERS: QuickPickFilter[] = [
  { id: '15', label: '15 min', buckets: ['15min'] },
  { id: '30', label: '30 min', buckets: ['15min', '30min'] },
  { id: '60', label: '1 hour', buckets: ['15min', '30min', '1hr'] },
  { id: '120', label: '2 hours', buckets: ['15min', '30min', '1hr', '2hrs'] },
];

/** How many matches the Quick Wins view surfaces (app-pages §4: "up to 8"). */
export const QUICK_PICK_LIMIT = 8;

/** Milliseconds since last completion; never-completed sorts as 0 (least urgent). */
function elapsedMs(task: Task, now: Date): number {
  return task.lastCompletedAt ? now.getTime() - task.lastCompletedAt.getTime() : 0;
}

/**
 * Non-archived tasks whose time commitment fits the chosen filter, most-urgent
 * first (very-overdue → none, tie-break by longest elapsed), capped at
 * `QUICK_PICK_LIMIT`. Phase 1 has no "show more" — extra matches are simply not
 * shown (the cap is intentional; it backs the standalone Quick Wins view).
 */
export function filterForQuickPick(tasks: Task[], filterId: string, now = new Date()): Task[] {
  const filter = QUICK_PICK_FILTERS.find((f) => f.id === filterId);
  if (!filter) return [];

  return tasks
    .filter((t) => !t.isArchived && t.timeCommitment && filter.buckets.includes(t.timeCommitment))
    .sort((a, b) => {
      const byStatus =
        OVERDUE_STATUS_RANK[calculateOverdueStatus(a, now)] -
        OVERDUE_STATUS_RANK[calculateOverdueStatus(b, now)];
      return byStatus !== 0 ? byStatus : elapsedMs(b, now) - elapsedMs(a, now);
    })
    .slice(0, QUICK_PICK_LIMIT);
}
