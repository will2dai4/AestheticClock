import { create } from "zustand";

interface StopwatchState {
  running: boolean;
  /** Elapsed milliseconds for display. */
  elapsed: number;
  /** Cumulative elapsed time captured at each lap. */
  laps: number[];
  toggle: () => void;
  reset: () => void;
  lap: () => void;
}

// Module-level so the stopwatch keeps ticking across view unmounts.
let intervalId: number | null = null;
let accumulated = 0;
let startedAt = 0;

const clearTick = () => {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

export const useStopwatchStore = create<StopwatchState>((set, get) => {
  const tick = () => set({ elapsed: accumulated + (Date.now() - startedAt) });

  return {
    running: false,
    elapsed: 0,
    laps: [],

    toggle: () => {
      if (get().running) {
        accumulated += Date.now() - startedAt;
        clearTick();
        set({ running: false, elapsed: accumulated });
      } else {
        startedAt = Date.now();
        clearTick();
        intervalId = window.setInterval(tick, 31);
        set({ running: true });
      }
    },

    reset: () => {
      clearTick();
      accumulated = 0;
      startedAt = 0;
      set({ running: false, elapsed: 0, laps: [] });
    },

    lap: () => set((s) => ({ laps: [...s.laps, s.elapsed] })),
  };
});
