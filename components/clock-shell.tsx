"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ACCENTS,
  buildBackground,
  DEFAULT_DARK_THEME,
  DEFAULT_LIGHT_THEME,
  getFont,
  getTheme,
} from "@/lib/presets";
import { useSettingsStore, type ClockMode } from "@/store/use-settings-store";
import { useSystemPrefersDark } from "@/hooks/use-system-theme";
import { ModeSwitcher } from "@/components/mode-switcher";
import { SettingsPanel } from "@/components/settings-panel";
import { ClockView } from "@/components/views/clock-view";
import { TimerView } from "@/components/views/timer-view";
import { StopwatchView } from "@/components/views/stopwatch-view";
import { SettingsIcon } from "@/components/icons";

export function ClockShell() {
  const [mode, setMode] = useState<ClockMode>("clock");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const theme = useSettingsStore((s) => s.theme);
  const accentId = useSettingsStore((s) => s.accent);
  const fontId = useSettingsStore((s) => s.font);
  const background = useSettingsStore((s) => s.background);
  const hasHydrated = useSettingsStore((s) => s.hasHydrated);

  const prefersDark = useSystemPrefersDark();

  const { style, isDark } = useMemo(() => {
    const resolvedThemeId =
      theme === "system"
        ? prefersDark
          ? DEFAULT_DARK_THEME
          : DEFAULT_LIGHT_THEME
        : theme;
    const { palette } = getTheme(resolvedThemeId);

    const accentValue =
      ACCENTS.find((a) => a.id === accentId)?.value || palette.accent;

    const css: CSSProperties = {
      // Color tokens consumed across the app.
      ["--fg" as string]: palette.fg,
      ["--muted" as string]: palette.muted,
      ["--surface" as string]: palette.surface,
      ["--border" as string]: palette.border,
      ["--accent" as string]: accentValue,
      ["--font-clock" as string]: getFont(fontId).cssVar,
      background: buildBackground(background, palette, accentValue),
      color: palette.fg,
    };

    return { style: css, isDark: palette.isDark };
  }, [theme, prefersDark, accentId, fontId, background]);

  return (
    <div
      style={style}
      className={`clock-face relative flex min-h-dvh w-full flex-col overflow-hidden transition-colors duration-500 ${
        background === "animated" ? "bg-animated" : ""
      }`}
    >
      {/* Soft vignette for depth, independent of the chosen background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, transparent 55%, rgba(0,0,0,0.18) 100%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <span
          className="select-none text-sm font-medium tracking-[0.3em] uppercase"
          style={{ color: "var(--muted)" }}
        >
          Lumen
        </span>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          className="grid h-10 w-10 place-items-center rounded-full border backdrop-blur-sm transition hover:scale-105 active:scale-95"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            color: "var(--fg)",
          }}
        >
          <SettingsIcon className="h-5 w-5" />
        </button>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-4">
        {hasHydrated ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full max-w-3xl items-center justify-center"
            >
              {mode === "clock" && <ClockView />}
              {mode === "timer" && <TimerView />}
              {mode === "stopwatch" && <StopwatchView />}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="h-40" aria-hidden />
        )}
      </main>

      <footer className="relative z-10 flex justify-center px-5 pb-7 sm:pb-9">
        <ModeSwitcher mode={mode} onChange={setMode} />
      </footer>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        isDark={isDark}
      />
    </div>
  );
}
