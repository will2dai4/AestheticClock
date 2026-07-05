"use client";

import { formatDuration } from "@/lib/time";
import { FlagIcon, PauseIcon, PlayIcon, ResetIcon } from "@/components/icons";
import { ControlButton } from "@/components/views/timer-view";
import { useChromeHidden } from "@/components/focus-context";
import { useStopwatchStore } from "@/store/use-stopwatch-store";

export function StopwatchView() {
  const chromeHidden = useChromeHidden();

  // State + timing live in a store so the stopwatch keeps running when the
  // view is unmounted (switching to the clock or timer).
  const running = useStopwatchStore((s) => s.running);
  const elapsed = useStopwatchStore((s) => s.elapsed);
  const laps = useStopwatchStore((s) => s.laps);
  const toggle = useStopwatchStore((s) => s.toggle);
  const reset = useStopwatchStore((s) => s.reset);
  const addLap = useStopwatchStore((s) => s.lap);

  const { main, centis } = formatDuration(elapsed, {
    showCentis: true,
    alwaysHours: elapsed >= 3600_000,
  });

  // Per-lap deltas and best/worst highlighting.
  const lapDeltas = laps.map((cum, i) => cum - (laps[i - 1] ?? 0));
  const fastest = lapDeltas.length > 1 ? Math.min(...lapDeltas) : -1;
  const slowest = lapDeltas.length > 1 ? Math.max(...lapDeltas) : -1;

  const canLap = running || elapsed > 0;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <div className="flex flex-col items-center">
        <span
          className="tabular-nums leading-none"
          style={{ fontSize: "clamp(3rem, 13vw, 7rem)", fontWeight: 600 }}
        >
          {main}
          <span style={{ fontSize: "0.42em", color: "var(--accent)" }}>
            .{centis}
          </span>
        </span>
        <span
          className="mt-2 text-xs font-semibold tracking-[0.35em] uppercase"
          style={{ color: "var(--muted)" }}
        >
          Stopwatch
        </span>
      </div>

      <div
        className="flex items-center gap-4 transition-opacity duration-500"
        style={{
          opacity: chromeHidden ? 0 : 1,
          pointerEvents: chromeHidden ? "none" : "auto",
        }}
      >
        <ControlButton
          onClick={running ? addLap : reset}
          label={running ? "Lap" : "Reset"}
          variant="ghost"
          disabled={!canLap}
        >
          {running ? (
            <FlagIcon className="h-5 w-5" />
          ) : (
            <ResetIcon className="h-5 w-5" />
          )}
        </ControlButton>
        <ControlButton onClick={toggle} label="Start / pause" variant="solid">
          {running ? (
            <PauseIcon className="h-6 w-6" />
          ) : (
            <PlayIcon className="h-6 w-6" />
          )}
        </ControlButton>
      </div>

      {laps.length > 0 && (
        <ul
          className="thin-scroll max-h-52 w-full overflow-y-auto rounded-2xl border p-1 transition-opacity duration-500"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            opacity: chromeHidden ? 0 : 1,
            pointerEvents: chromeHidden ? "none" : "auto",
          }}
        >
          {laps
            .map((cum, i) => ({ i, cum, delta: lapDeltas[i] }))
            .reverse()
            .map(({ i, cum, delta }) => {
              const isFast = delta === fastest;
              const isSlow = delta === slowest;
              const color = isFast
                ? "#5fd0a0"
                : isSlow
                  ? "#ff6b6b"
                  : "var(--fg)";
              return (
                <li
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5 text-sm tabular-nums"
                >
                  <span
                    className="font-medium tracking-wide"
                    style={{ color: "var(--muted)" }}
                  >
                    Lap {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-semibold" style={{ color }}>
                    {formatDuration(delta, { showCentis: true }).main}.
                    {formatDuration(delta, { showCentis: true }).centis}
                  </span>
                  <span style={{ color: "var(--muted)" }}>
                    {formatDuration(cum, { showCentis: true }).main}.
                    {formatDuration(cum, { showCentis: true }).centis}
                  </span>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
