"use client";

import { motion } from "framer-motion";
import type { ClockMode } from "@/store/use-settings-store";
import { ClockIcon, StopwatchIcon, TimerIcon } from "@/components/icons";

const MODES: { id: ClockMode; label: string; Icon: typeof ClockIcon }[] = [
  { id: "clock", label: "Clock", Icon: ClockIcon },
  { id: "timer", label: "Timer", Icon: TimerIcon },
  { id: "stopwatch", label: "Stopwatch", Icon: StopwatchIcon },
];

interface ModeSwitcherProps {
  mode: ClockMode;
  onChange: (mode: ClockMode) => void;
}

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <nav
      className="flex items-center gap-1 rounded-full border p-1 backdrop-blur-md"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      aria-label="Clock mode"
    >
      {MODES.map(({ id, label, Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={active}
            className="relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
            style={{ color: active ? "var(--fg)" : "var(--muted)" }}
          >
            {active && (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "color-mix(in srgb, var(--accent) 22%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--accent) 45%, transparent)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10 hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
