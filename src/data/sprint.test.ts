import { describe, expect, it } from 'vitest';
import { SPRINT_WEEKS, localIsoDate, weekForDate } from './sprint';

describe('localIsoDate', () => {
  it('uses the local calendar date, not the UTC one', () => {
    // 01:00 on 11 Aug local time. `toISOString()` would report 10 Aug for any
    // timezone east of UTC, which is exactly the bug this guards against.
    const earlyMorning = new Date(2026, 7, 11, 1, 0, 0);
    expect(localIsoDate(earlyMorning)).toBe('2026-08-11');
  });

  it('pads single-digit months and days', () => {
    expect(localIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('handles late-evening dates too', () => {
    expect(localIsoDate(new Date(2026, 8, 14, 23, 30))).toBe('2026-09-14');
  });
});

describe('weekForDate', () => {
  it('finds the week containing the first day of the sprint', () => {
    expect(weekForDate(new Date(2026, 7, 11, 1, 0))?.id).toBe('week-1');
  });

  it('finds the week containing the last day of the sprint', () => {
    expect(weekForDate(new Date(2026, 8, 14, 23, 0))?.id).toBe('week-5');
  });

  it('covers every day of the sprint with exactly one week', () => {
    const start = new Date(2026, 7, 11);
    for (let offset = 0; offset < 35; offset++) {
      const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset);
      const matches = SPRINT_WEEKS.filter(
        (week) => localIsoDate(day) >= week.start && localIsoDate(day) <= week.end,
      );
      expect(matches, localIsoDate(day)).toHaveLength(1);
    }
  });

  it('returns nothing outside the sprint', () => {
    expect(weekForDate(new Date(2026, 7, 10))).toBeUndefined();
    expect(weekForDate(new Date(2026, 8, 15))).toBeUndefined();
  });
});
