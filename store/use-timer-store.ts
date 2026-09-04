import { create } from "zustand";
import { playChime } from "@/lib/sound";
import { useSettingsStore } from "@/store/use-settings-store";

export type TimerPhase = "idle" | "running" | "paused" | "done";

const MAX_MS = 99 * 3600_000;

interface TimerState {
  phase: TimerPhase;
  /** Configured length of the timer. */
  durationMs: number;
  /** Remaining time for display. */
  remainingMs: number;
  /** Absolute completion timestamp while running. */
  deadline: number;
  setDuration: (ms: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

// Module-level interval so the countdown survives component unmounts
// (e.g. switching to the clock or stopwatch view).
let intervalId: number | null = null;

const clearTick = () => {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const onComplete = () => {
  if (useSettingsStore.getState().timerSound) playChime();
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate?.([120, 80, 120]);
  }
};

export const useTimerStore = create<TimerState>((set, get) => {
  const tick = () => {
    const remaining = get().deadline - Date.now();
    if (remaining <= 0) {
      clearTick();
      set({ remainingMs: 0, phase: "done" });
      onComplete();
      return;
    }
    set({ remainingMs: remaining });
  };

  return {
    phase: "idle",
    durationMs: 300_000,
    remainingMs: 300_000,
    deadline: 0,

    setDuration: (ms) => {
      const clamped = Math.min(Math.max(ms, 0), MAX_MS);
      clearTick();
      set({ durationMs: clamped, remainingMs: clamped, phase: "idle" });
    },

    start: () => {
      const { phase, durationMs, remainingMs } = get();
      if (durationMs <= 0) return;
      const base = phase === "paused" ? remainingMs : durationMs;
      clearTick();
      set({ deadline: Date.now() + base, remainingMs: base, phase: "running" });
      intervalId = window.setInterval(tick, 50);
    },

    pause: () => {
      clearTick();
      set({ phase: "paused" });
    },

    reset: () => {
      clearTick();
      set((s) => ({ phase: "idle", remainingMs: s.durationMs }));
    },
  };
});
