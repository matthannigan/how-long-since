const DAY_MS = 864e5;

/** Local midnight for `d`, so day differences ignore the time of day. */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Whole calendar days between `from` and `now` in local time. Rounds so a DST
 * transition (which makes a local day 23h or 25h) can't shift the count by one.
 */
function calendarDaysBetween(from: Date, now: Date): number {
  return Math.round((startOfDay(now).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

function pluralize(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
}

/**
 * Human-readable time since last completion, per content-strategy-guide §3.4.
 * Ladder: "Not done yet" (null) → "Just now" → "Today" → "Yesterday" →
 * "N days/weeks/months/years ago".
 */
export function formatElapsed(from: Date | null, now = new Date()): string {
  if (from === null) return 'Not done yet';
  if (now.getTime() - from.getTime() < 60_000) return 'Just now';

  const days = calendarDaysBetween(from, now);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return pluralize(days, 'day');
  if (days < 30) return pluralize(Math.floor(days / 7), 'week');
  if (days < 365) return pluralize(Math.floor(days / 30), 'month');
  return pluralize(Math.floor(days / 365), 'year');
}

/**
 * Compact right-aligned row anchor, per style-guide §5: "New" (null), "Today",
 * "Yest.", "N d", "N wk", "N mo", "N yr". ("Today", "New", "N yr" extend the
 * guide's five literal examples.)
 */
export function formatElapsedCompact(from: Date | null, now = new Date()): string {
  if (from === null) return 'New';
  if (now.getTime() - from.getTime() < 60_000) return 'Today';

  const days = calendarDaysBetween(from, now);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yest.';
  if (days < 7) return `${days} d`;
  if (days < 30) return `${Math.floor(days / 7)} wk`;
  if (days < 365) return `${Math.floor(days / 30)} mo`;
  return `${Math.floor(days / 365)} yr`;
}
