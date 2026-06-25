"use client";

import { useEffect, useState } from "react";

/**
 * Returns a `Date` that updates on an interval. Defaults to ~4fps which is
 * plenty for a clock; pass a smaller interval for smoother stopwatch ticks.
 */
export function useNow(intervalMs = 250): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
