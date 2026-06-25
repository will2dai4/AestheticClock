"use client";

import { useNow } from "@/hooks/use-now";
import { useSettingsStore } from "@/store/use-settings-store";
import { formatLongDate, getClockParts } from "@/lib/time";

export function ClockView() {
  const now = useNow(250);
  const hour12 = useSettingsStore((s) => s.hour12);
  const showSeconds = useSettingsStore((s) => s.showSeconds);
  const showDate = useSettingsStore((s) => s.showDate);
  const layout = useSettingsStore((s) => s.layout);

  const { hours, minutes, seconds, ampm } = getClockParts(now, hour12);

  if (layout === "stacked") {
    return (
      <div className="flex flex-col items-center gap-1 text-center leading-none">
        <Unit value={hours} label="Hours" />
        <Unit value={minutes} label="Minutes" />
        {showSeconds && <Unit value={seconds} label="Seconds" accent />}
        {hour12 && (
          <span
            className="mt-2 text-lg font-medium tracking-[0.4em]"
            style={{ color: "var(--muted)" }}
          >
            {ampm}
          </span>
        )}
        {showDate && (
          <span
            className="mt-3 text-sm font-medium tracking-wide sm:text-base"
            style={{ color: "var(--muted)" }}
          >
            {formatLongDate(now)}
          </span>
        )}
      </div>
    );
  }

  const minimal = layout === "minimal";

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="flex items-baseline justify-center leading-none"
        style={{
          fontSize: "clamp(3.25rem, 15vw, 12rem)",
          fontWeight: minimal ? 300 : 600,
          letterSpacing: minimal ? "0.01em" : "-0.02em",
        }}
      >
        <span>{hours}</span>
        <Colon dim={minimal} />
        <span>{minutes}</span>
        {showSeconds && (
          <>
            <Colon dim={minimal} />
            <span
              style={{
                fontSize: "0.5em",
                alignSelf: minimal ? "baseline" : "flex-end",
                paddingBottom: minimal ? 0 : "0.35em",
                color: minimal ? "var(--fg)" : "var(--accent)",
                fontWeight: minimal ? 300 : 500,
              }}
            >
              {seconds}
            </span>
          </>
        )}
        {hour12 && (
          <span
            className="self-start"
            style={{
              fontSize: "0.22em",
              marginLeft: "0.4em",
              marginTop: "0.6em",
              letterSpacing: "0.15em",
              color: "var(--muted)",
              fontWeight: 500,
            }}
          >
            {ampm}
          </span>
        )}
      </div>

      {showDate && (
        <span
          className="mt-5 text-sm font-medium tracking-[0.08em] sm:text-lg"
          style={{ color: "var(--muted)" }}
        >
          {formatLongDate(now)}
        </span>
      )}
    </div>
  );
}

function Colon({ dim }: { dim?: boolean }) {
  return (
    <span
      style={{
        opacity: dim ? 0.35 : 0.55,
        padding: "0 0.04em",
      }}
    >
      :
    </span>
  );
}

function Unit({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span
        style={{
          fontSize: "clamp(3rem, 13vw, 8rem)",
          fontWeight: 600,
          lineHeight: 0.95,
          color: accent ? "var(--accent)" : "var(--fg)",
        }}
      >
        {value}
      </span>
      <span
        className="text-[0.6rem] font-semibold tracking-[0.35em] uppercase"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </span>
    </div>
  );
}
