"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useSettingsStore, type ClockMode } from "@/store/use-settings-store";
import { ModeSwitcher } from "@/components/mode-switcher";
import { ThemeSurface } from "@/components/theme-surface";
import { ClockView } from "@/components/views/clock-view";
import { TimerView } from "@/components/views/timer-view";
import { StopwatchView } from "@/components/views/stopwatch-view";
import { CompressIcon, ExpandIcon, SettingsIcon } from "@/components/icons";
import { ChromeHiddenContext } from "@/components/focus-context";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { useTimerStore } from "@/store/use-timer-store";
import { useStopwatchStore } from "@/store/use-stopwatch-store";

export function ClockShell() {
  const [mode, setMode] = useState<ClockMode>("clock");

  const hasHydrated = useSettingsStore((s) => s.hasHydrated);
  const focusMode = useSettingsStore((s) => s.focusMode);
  const setFocusMode = useSettingsStore((s) => s.setFocusMode);
  const enlargeInFocus = useSettingsStore((s) => s.enlargeInFocus);

  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  // Hold the wake lock whenever the timer or stopwatch is running, regardless
  // of which view is currently displayed.
  const keepAwake = useSettingsStore((s) => s.keepAwake);
  const timerRunning = useTimerStore((s) => s.phase === "running");
  const stopwatchRunning = useStopwatchStore((s) => s.running);
  useWakeLock(keepAwake && (timerRunning || stopwatchRunning));

  // In focus mode the chrome fades out, then reappears briefly on any activity.
  const [recentlyActive, setRecentlyActive] = useState(false);

  useEffect(() => {
    if (!focusMode) {
      setRecentlyActive(false);
      return;
    }
    let timeout: number;
    const bump = () => {
      setRecentlyActive(true);
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setRecentlyActive(false), 2500);
    };
    bump();
    const events = ["pointermove", "pointerdown", "keydown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, bump));
    return () => {
      window.clearTimeout(timeout);
      events.forEach((e) => window.removeEventListener(e, bump));
    };
  }, [focusMode]);

  // Keyboard shortcuts: "F" toggles focus mode, "Esc" exits it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "f" || e.key === "F") {
        setFocusMode(!focusMode);
      } else if (e.key === "Escape" && focusMode) {
        setFocusMode(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode, setFocusMode]);

  const chromeHidden = focusMode && !recentlyActive;

  return (
    <ChromeHiddenContext.Provider value={chromeHidden}>
    <ThemeSurface
      className={`overflow-hidden ${chromeHidden ? "cursor-none" : ""}`}
    >
      <header
        className="relative z-10 flex items-center justify-between px-5 py-5 transition-opacity duration-500 sm:px-8"
        style={{
          opacity: chromeHidden ? 0 : 1,
          pointerEvents: chromeHidden ? "none" : "auto",
        }}
      >
        <span
          role="img"
          aria-label="Sigma"
          className="select-none text-lg leading-none font-medium"
          style={{ color: "var(--fg)" }}
        >
          Σ
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="grid h-10 w-10 place-items-center transition hover:scale-110 active:scale-95"
            style={{ color: "var(--fg)" }}
          >
            {isFullscreen ? (
              <CompressIcon className="h-5 w-5" />
            ) : (
              <ExpandIcon className="h-5 w-5" />
            )}
          </button>
          <Link
            href="/settings"
            aria-label="Open settings"
            className="grid h-10 w-10 place-items-center transition hover:scale-110 active:scale-95"
            style={{ color: "var(--fg)" }}
          >
            <SettingsIcon className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-4">
        <div
          className="flex w-full items-center justify-center transition-transform duration-500 ease-out"
          style={{
            transform: `scale(${
              chromeHidden && enlargeInFocus
                ? mode === "stopwatch"
                  ? 1.85
                  : 1.22
                : 1
            })`,
          }}
        >
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
        </div>
      </main>

      <footer
        className="relative z-10 flex justify-center px-5 pb-7 transition-opacity duration-500 sm:pb-9"
        style={{
          opacity: chromeHidden ? 0 : 1,
          pointerEvents: chromeHidden ? "none" : "auto",
        }}
      >
        <ModeSwitcher mode={mode} onChange={setMode} />
      </footer>
    </ThemeSurface>
    </ChromeHiddenContext.Provider>
  );
}
