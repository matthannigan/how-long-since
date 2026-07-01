import { describe, expect, it } from 'vitest';

import { formatElapsed, formatElapsedCompact } from './time-format';

// Fixed reference "now" — mid-June noon, well clear of DST boundaries.
const NOW = new Date(2026, 5, 15, 12, 0, 0);

/** A local-noon date `days` calendar days before NOW. */
function daysAgo(days: number): Date {
  return new Date(2026, 5, 15 - days, 12, 0, 0);
}

describe('formatElapsed', () => {
  it('returns "Not done yet" for a null date', () => {
    expect(formatElapsed(null, NOW)).toBe('Not done yet');
  });

  it('returns "Just now" within the last minute', () => {
    expect(formatElapsed(new Date(NOW.getTime() - 30_000), NOW)).toBe('Just now');
  });

  it('returns "Today" for earlier the same day', () => {
    expect(formatElapsed(new Date(2026, 5, 15, 9, 0, 0), NOW)).toBe('Today');
  });

  it('returns "Yesterday" for the previous calendar day', () => {
    expect(formatElapsed(daysAgo(1), NOW)).toBe('Yesterday');
  });

  it('returns "N days ago" (always plural, since 1 day is Yesterday)', () => {
    expect(formatElapsed(daysAgo(3), NOW)).toBe('3 days ago');
    expect(formatElapsed(daysAgo(6), NOW)).toBe('6 days ago');
  });

  it('returns weeks with singular/plural agreement', () => {
    expect(formatElapsed(daysAgo(7), NOW)).toBe('1 week ago');
    expect(formatElapsed(daysAgo(14), NOW)).toBe('2 weeks ago');
  });

  it('returns months with singular/plural agreement', () => {
    expect(formatElapsed(daysAgo(30), NOW)).toBe('1 month ago');
    expect(formatElapsed(daysAgo(90), NOW)).toBe('3 months ago');
  });

  it('returns years with singular/plural agreement', () => {
    expect(formatElapsed(daysAgo(365), NOW)).toBe('1 year ago');
    expect(formatElapsed(daysAgo(730), NOW)).toBe('2 years ago');
  });
});

describe('formatElapsedCompact', () => {
  it('returns "New" for a never-completed task', () => {
    expect(formatElapsedCompact(null, NOW)).toBe('New');
  });

  it('returns "Today" for just-now and earlier the same day', () => {
    expect(formatElapsedCompact(new Date(NOW.getTime() - 30_000), NOW)).toBe('Today');
    expect(formatElapsedCompact(new Date(2026, 5, 15, 9, 0, 0), NOW)).toBe('Today');
  });

  it('returns "Yest." for the previous day', () => {
    expect(formatElapsedCompact(daysAgo(1), NOW)).toBe('Yest.');
  });

  it('returns compact day/week/month/year anchors', () => {
    expect(formatElapsedCompact(daysAgo(3), NOW)).toBe('3 d');
    expect(formatElapsedCompact(daysAgo(7), NOW)).toBe('1 wk');
    expect(formatElapsedCompact(daysAgo(14), NOW)).toBe('2 wk');
    expect(formatElapsedCompact(daysAgo(90), NOW)).toBe('3 mo');
    expect(formatElapsedCompact(daysAgo(365), NOW)).toBe('1 yr');
  });
});
