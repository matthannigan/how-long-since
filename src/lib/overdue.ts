import type { FrequencyUnit, OverdueStatus, Task } from '@/types';

export type { OverdueStatus } from '@/types';

/**
 * Fixed millisecond length of each frequency unit. Month/year are intentional
 * approximations (30d / 365d) for threshold math — not calendar arithmetic.
 */
const UNIT_MS: Record<FrequencyUnit, number> = {
  day: 864e5,
  week: 6048e5,
  month: 2592e6,
  year: 31536e6,
};

/**
 * Pure overdue calculation. A task is never overdue without both an
 * `expectedFrequency` and a first completion (`lastCompletedAt`). Otherwise the
 * tier is the fraction of the expected interval elapsed since last completion:
 * `<0.8` none, `<1` due-soon, `<1.5` overdue, `>=1.5` very-overdue.
 */
export function calculateOverdueStatus(task: Task, now = new Date()): OverdueStatus {
  if (!task.expectedFrequency || !task.lastCompletedAt) return 'none';

  const intervalMs = task.expectedFrequency.value * UNIT_MS[task.expectedFrequency.unit];
  const pctElapsed = (now.getTime() - task.lastCompletedAt.getTime()) / intervalMs;

  if (pctElapsed < 0.8) return 'none';
  if (pctElapsed < 1) return 'due-soon';
  if (pctElapsed < 1.5) return 'overdue';
  return 'very-overdue';
}
