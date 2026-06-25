import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BackgroundId,
  FontId,
  LayoutId,
  ThemeId,
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
  setHasHydrated: (v: boolean) => void;
  reset: () => void;
}

const DEFAULTS = {
  theme: "system" as ThemeId,
  accent: "default",
  font: "display" as FontId,
  background: "gradient" as BackgroundId,
  layout: "digital" as LayoutId,
  hour12: false,
  showSeconds: true,
  showDate: true,
  timerSound: true,
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
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: "lumen-clock-settings",
      partialize: ({ hasHydrated: _hasHydrated, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
