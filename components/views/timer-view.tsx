"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSettingsStore } from "@/store/use-settings-store";
import { useChromeHidden } from "@/components/focus-context";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { formatDuration, hmsToMs, pad } from "@/lib/time";
import {
  MinusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  ResetIcon,
} from "@/components/icons";

type Phase = "idle" | "running" | "paused" | "done";

const PRESETS = [
  { label: "1m", ms: 60_000 },
  { label: "3m", ms: 180_000 },
  { label: "5m", ms: 300_000 },
  { label: "10m", ms: 600_000 },
  { label: "25m", ms: 1_500_000 },
];

export function TimerView() {
  const timerSound = useSettingsStore((s) => s.timerSound);
  const keepAwake = useSettingsStore((s) => s.keepAwake);
  const chromeHidden = useChromeHidden();

  const [phase, setPhase] = useState<Phase>("idle");
  const [durationMs, setDurationMs] = useState(300_000); // configured length
  const [remainingMs, setRemainingMs] = useState(300_000);
  const deadlineRef = useRef<number>(0);

  useWakeLock(keepAwake && phase === "running");

  // Drive the countdown from a deadline so it stays accurate when backgrounded.
  useEffect(() => {
    if (phase !== "running") return;

    const tick = () => {
      const remaining = deadlineRef.current - Date.now();
      if (remaining <= 0) {
        setRemainingMs(0);
        setPhase("done");
        return;
      }
      setRemainingMs(remaining);
    };

    tick();
    const id = window.setInterval(tick, 50);
    return () => window.clearInterval(id);
  }, [phase]);

  // Audible + vibration feedback on completion.
  useEffect(() => {
    if (phase !== "done") return;
    if (timerSound) playChime();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([120, 80, 120]);
    }
  }, [phase, timerSound]);

  const start = useCallback(() => {
    if (durationMs <= 0) return;
    const base = phase === "paused" ? remainingMs : durationMs;
    deadlineRef.current = Date.now() + base;
    if (phase !== "paused") setRemainingMs(durationMs);
    setPhase("running");
  }, [durationMs, phase, remainingMs]);

  const pause = useCallback(() => setPhase("paused"), []);

  const reset = useCallback(() => {
    setPhase("idle");
    setRemainingMs(durationMs);
  }, [durationMs]);

  const applyDuration = useCallback((ms: number) => {
    const clamped = Math.min(Math.max(ms, 0), 99 * 3600_000);
    setDurationMs(clamped);
    setRemainingMs(clamped);
    setPhase("idle");
  }, []);

  const editing = phase === "idle";
  const progress =
    durationMs > 0 ? Math.min(1, Math.max(0, remainingMs / durationMs)) : 0;
  const { main, centis } = formatDuration(remainingMs, {
    showCentis: false,
    alwaysHours: durationMs >= 3600_000,
  });

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <ProgressRing progress={editing ? 1 : progress} pulse={phase === "done"}>
        {editing ? (
          <DurationEditor durationMs={durationMs} onChange={applyDuration} />
        ) : (
          <div className="flex flex-col items-center">
            <span
              className={`tabular-nums leading-none ${
                phase === "done" ? "animate-soft-pulse" : ""
              }`}
              style={{
                fontSize: "clamp(2.6rem, 9vw, 5rem)",
                fontWeight: 600,
                color: phase === "done" ? "var(--accent)" : "var(--fg)",
              }}
            >
              {main}
              {centis && <span className="text-[0.5em]">.{centis}</span>}
            </span>
            <span
              className="mt-2 text-xs font-semibold tracking-[0.35em] uppercase"
              style={{ color: "var(--muted)" }}
            >
              {phase === "done" ? "Time's up" : phase}
            </span>
          </div>
        )}
      </ProgressRing>

      {editing && (
        <div
          className="flex flex-wrap items-center justify-center gap-2 transition-opacity duration-500"
          style={{
            opacity: chromeHidden ? 0 : 1,
            pointerEvents: chromeHidden ? "none" : "auto",
          }}
        >
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyDuration(p.ms)}
              className="rounded-full border px-4 py-2 text-sm font-medium transition hover:scale-105 active:scale-95"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
                color: "var(--fg)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div
        className="flex items-center gap-4 transition-opacity duration-500"
        style={{
          opacity: chromeHidden ? 0 : 1,
          pointerEvents: chromeHidden ? "none" : "auto",
        }}
      >
        {phase === "running" ? (
          <ControlButton onClick={pause} label="Pause" variant="solid">
            <PauseIcon className="h-6 w-6" />
          </ControlButton>
        ) : (
          <ControlButton
            onClick={start}
            label="Start"
            variant="solid"
            disabled={durationMs <= 0}
          >
            <PlayIcon className="h-6 w-6" />
          </ControlButton>
        )}
        <ControlButton onClick={reset} label="Reset" variant="ghost">
          <ResetIcon className="h-5 w-5" />
        </ControlButton>
      </div>
    </div>
  );
}

function DurationEditor({
  durationMs,
  onChange,
}: {
  durationMs: number;
  onChange: (ms: number) => void;
}) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const update = (nh: number, nm: number, ns: number) => {
    const hh = (nh + 24) % 24;
    const mm = (nm + 60) % 60;
    const ss = (ns + 60) % 60;
    onChange(hmsToMs(hh, mm, ss));
  };

  return (
    <div className="flex items-end gap-1">
      <Segment value={h} label="hr" onStep={(d) => update(h + d, m, s)} />
      <Sep />
      <Segment value={m} label="min" onStep={(d) => update(h, m + d, s)} />
      <Sep />
      <Segment value={s} label="sec" onStep={(d) => update(h, m, s + d)} />
    </div>
  );
}

function Segment({
  value,
  label,
  onStep,
}: {
  value: number;
  label: string;
  onStep: (delta: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onClick={() => onStep(1)}
        className="opacity-50 transition hover:opacity-100"
        style={{ color: "var(--fg)" }}
      >
        <PlusIcon className="h-5 w-5" />
      </button>
      <span
        className="tabular-nums leading-none"
        style={{ fontSize: "clamp(2.2rem, 8vw, 4rem)", fontWeight: 600 }}
      >
        {pad(value)}
      </span>
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        onClick={() => onStep(-1)}
        className="opacity-50 transition hover:opacity-100"
        style={{ color: "var(--fg)" }}
      >
        <MinusIcon className="h-5 w-5" />
      </button>
      <span
        className="text-[0.6rem] font-semibold tracking-[0.3em] uppercase"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

function Sep() {
  return (
    <span
      className="pb-9 leading-none"
      style={{ fontSize: "clamp(2rem, 7vw, 3.5rem)", color: "var(--muted)" }}
    >
      :
    </span>
  );
}

export function ProgressRing({
  progress,
  pulse,
  children,
}: {
  progress: number;
  pulse?: boolean;
  children: React.ReactNode;
}) {
  const size = 300;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: "min(78vw, 300px)", aspectRatio: "1 / 1" }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className={`absolute inset-0 h-full w-full -rotate-90 ${
          pulse ? "animate-soft-pulse" : ""
        }`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.2s linear" }}
        />
      </svg>
      <div className="relative z-10 grid place-items-center px-6 text-center">
        {children}
      </div>
    </div>
  );
}

export function ControlButton({
  onClick,
  label,
  variant,
  disabled,
  children,
}: {
  onClick: () => void;
  label: string;
  variant: "solid" | "ghost";
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const solid = variant === "solid";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-16 w-16 place-items-center rounded-full border transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        borderColor: solid
          ? "color-mix(in srgb, var(--accent) 55%, transparent)"
          : "var(--border)",
        background: solid
          ? "color-mix(in srgb, var(--accent) 22%, transparent)"
          : "var(--surface)",
        color: "var(--fg)",
      }}
    >
      {children}
    </button>
  );
}

/** Plays a short, pleasant three-note chime via the Web Audio API. */
function playChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const notes = [880, 1108.73, 1318.51];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {
    // Audio not available — silently ignore.
  }
}
