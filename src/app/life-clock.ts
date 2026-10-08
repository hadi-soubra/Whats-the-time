/**
 * Maps a human lifespan onto a single 24-hour day.
 *
 * Birth is 00:00 (midnight) and the expected end of life is 24:00.
 * Everything in between is linear: if you've lived 25% of your expected
 * lifespan, it is 06:00 on your life clock.
 */

export const DAY_MS = 24 * 60 * 60 * 1000;

export interface LifeClockTime {
  /** 0..1 — how much of the expected lifespan has passed (clamped). */
  fraction: number;
  /** True once the expected lifespan has been exceeded. */
  overtime: boolean;
  hours: number;
  minutes: number;
  seconds: number;
  /** Exact clock-time in ms since life-midnight, for smooth hand angles. */
  dayMs: number;
  /** Real-world duration of one life-clock minute, in ms. */
  msPerClockMinute: number;
  /** Current age in fractional years. */
  ageYears: number;
}

/** Parse a yyyy-mm-dd string as a local-time date (not UTC). */
export function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  return date.getMonth() === m - 1 ? date : null;
}

export function computeLifeClock(birth: Date, lifespanYears: number, now: Date): LifeClockTime {
  const death = new Date(birth);
  death.setFullYear(birth.getFullYear() + lifespanYears);

  const totalMs = death.getTime() - birth.getTime();
  const livedMs = Math.max(0, now.getTime() - birth.getTime());
  const rawFraction = livedMs / totalMs;
  const fraction = Math.min(1, rawFraction);

  const dayMs = fraction * DAY_MS;
  const totalSeconds = Math.floor(dayMs / 1000);

  return {
    fraction,
    overtime: rawFraction > 1,
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    dayMs,
    msPerClockMinute: totalMs / (24 * 60),
    ageYears: rawFraction * lifespanYears,
  };
}

/** A human description of where in the day a given hour falls. */
export function partOfDay(hours: number): string {
  if (hours < 5) return 'the middle of the night';
  if (hours < 8) return 'early morning';
  if (hours < 12) return 'the morning';
  if (hours < 17) return 'the afternoon';
  if (hours < 21) return 'the evening';
  return 'late at night';
}
