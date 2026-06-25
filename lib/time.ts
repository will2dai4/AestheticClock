/** Pure helpers for formatting clock, timer, and stopwatch values. */

export const pad = (n: number, len = 2): string =>
  Math.floor(Math.abs(n)).toString().padStart(len, "0");

export interface ClockParts {
  hours: string;
  minutes: string;
  seconds: string;
  ampm: string;
}

export interface ClockFormatOptions {
  hour12: boolean;
  showSeconds: boolean;
}

/** Splits a Date into display parts honoring the 12h/24h preference. */
export function getClockParts(date: Date, hour12: boolean): ClockParts {
  let h = date.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  if (hour12) {
    h = h % 12;
    if (h === 0) h = 12;
  }
  return {
    hours: pad(h),
    minutes: pad(date.getMinutes()),
    seconds: pad(date.getSeconds()),
    ampm,
  };
}

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function formatLongDate(date: Date): string {
  return DATE_FORMATTER.format(date);
}

/**
 * Formats a duration in milliseconds for the stopwatch/timer.
 * Hours are only shown when present. Stopwatch shows centiseconds.
 */
export function formatDuration(
  ms: number,
  opts: { showCentis?: boolean; alwaysHours?: boolean } = {}
): { main: string; centis: string } {
  const clamped = Math.max(0, ms);
  const totalSeconds = Math.floor(clamped / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centis = Math.floor((clamped % 1000) / 10);

  const main =
    hours > 0 || opts.alwaysHours
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;

  return { main, centis: opts.showCentis ? pad(centis) : "" };
}

/** Converts hours/minutes/seconds inputs into milliseconds. */
export function hmsToMs(h: number, m: number, s: number): number {
  return ((h * 60 + m) * 60 + s) * 1000;
}
