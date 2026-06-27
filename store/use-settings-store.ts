import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  THEMES,
  type BackgroundId,
  type FontId,
  type LayoutId,
  type ThemeId,
} from "@/lib/presets";

export type ClockMode = "clock" | "timer" | "stopwatch";

export interface SettingsState {
  // Appearance
  theme: ThemeId;
  accent: string; // accent option id ("default" follows the theme)
  font: FontId;
  background: BackgroundId;
  layout: LayoutId;

  // Clock format
  hour12: boolean;
  showSeconds: boolean;
  showDate: boolean;

  // Behavior
  timerSound: boolean;
  /** Hold a screen wake lock while the timer/stopwatch is running. */
  keepAwake: boolean;
  /** Distraction-free mode: fades out all chrome, leaving only the numbers. */
  focusMode: boolean;
  /** Scale the time up when the chrome is hidden in focus mode. */
  enlargeInFocus: boolean;

  // Hydration flag so the UI can avoid SSR mismatches.
  hasHydrated: boolean;

  setTheme: (theme: ThemeId) => void;
  setAccent: (accent: string) => void;
  setFont: (font: FontId) => void;
  setBackground: (background: BackgroundId) => void;
  setLayout: (layout: LayoutId) => void;
  setHour12: (v: boolean) => void;
  setShowSeconds: (v: boolean) => void;
  setShowDate: (v: boolean) => void;
  setTimerSound: (v: boolean) => void;
  setKeepAwake: (v: boolean) => void;
  setFocusMode: (v: boolean) => void;
  setEnlargeInFocus: (v: boolean) => void;
  setHasHydrated: (v: boolean) => void;
  reset: () => void;
}

const DEFAULTS = {
  theme: "midnight" as ThemeId,
  accent: "default",
  font: "display" as FontId,
  background: "gradient" as BackgroundId,
  layout: "digital" as LayoutId,
  hour12: false,
  showSeconds: true,
  showDate: true,
  timerSound: true,
  keepAwake: true,
  focusMode: false,
  enlargeInFocus: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      hasHydrated: false,

      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setFont: (font) => set({ font }),
      setBackground: (background) => set({ background }),
      setLayout: (layout) => set({ layout }),
      setHour12: (hour12) => set({ hour12 }),
      setShowSeconds: (showSeconds) => set({ showSeconds }),
      setShowDate: (showDate) => set({ showDate }),
      setTimerSound: (timerSound) => set({ timerSound }),
      setKeepAwake: (keepAwake) => set({ keepAwake }),
      setFocusMode: (focusMode) => set({ focusMode }),
      setEnlargeInFocus: (enlargeInFocus) => set({ enlargeInFocus }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: "lumen-clock-settings",
      partialize: ({ hasHydrated: _hasHydrated, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        // Coerce any removed/invalid theme (e.g. the old "system") to a default.
        if (state && !THEMES.some((t) => t.id === state.theme)) {
          state.theme = DEFAULTS.theme;
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
