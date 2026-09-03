"use client";

import { motion } from "framer-motion";
import {
  ACCENTS,
  BACKGROUNDS,
  FONTS,
  LAYOUTS,
  THEMES,
  getTheme,
} from "@/lib/presets";
import { useSettingsStore } from "@/store/use-settings-store";
import { CheckIcon } from "@/components/icons";

/**
 * Every clock preference, grouped into cards. Rendered by the settings page;
 * the surrounding page owns the header and page chrome.
 */
export function SettingsForm() {
  const s = useSettingsStore();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Section title="Theme">
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
            {THEMES.map((t) => (
              <SwatchButton
                key={t.id}
                label={t.label}
                active={s.theme === t.id}
                onClick={() => s.setTheme(t.id)}
                preview={`linear-gradient(135deg, ${t.palette.bg}, ${t.palette.bgAlt})`}
                dot={getTheme(t.id).palette.accent}
              />
            ))}
          </div>
        </Section>

        <Section title="Accent">
          <div className="flex flex-wrap gap-2.5">
            {ACCENTS.map((a) => {
              const active = s.accent === a.id;
              const color = a.value || getTheme(s.theme).palette.accent;
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-label={a.label}
                  onClick={() => s.setAccent(a.id)}
                  className="grid h-9 w-9 place-items-center rounded-full border transition hover:scale-110 active:scale-95"
                  style={{
                    background: color,
                    borderColor: active ? "var(--fg)" : "rgba(255,255,255,0.15)",
                  }}
                >
                  {active && (
                    <CheckIcon className="h-4 w-4 text-black/80 mix-blend-overlay" />
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Font">
          <Segmented
            options={FONTS.map((f) => ({ id: f.id, label: f.label }))}
            value={s.font}
            onChange={(id) => s.setFont(id as typeof s.font)}
            style={(id) => ({
              fontFamily: `${
                FONTS.find((f) => f.id === id)?.cssVar
              }, sans-serif`,
            })}
          />
        </Section>

        <Section title="Display">
          <Segmented
            options={LAYOUTS.map((l) => ({ id: l.id, label: l.label }))}
            value={s.layout}
            onChange={(id) => s.setLayout(id as typeof s.layout)}
          />
        </Section>

        <Section title="Background">
          <Segmented
            options={BACKGROUNDS.map((b) => ({ id: b.id, label: b.label }))}
            value={s.background}
            onChange={(id) => s.setBackground(id as typeof s.background)}
          />
        </Section>

        <Section title="Clock format">
          <div className="flex flex-col gap-2">
            <Segmented
              options={[
                { id: "24", label: "24-hour" },
                { id: "12", label: "12-hour" },
              ]}
              value={s.hour12 ? "12" : "24"}
              onChange={(id) => s.setHour12(id === "12")}
            />
            <Toggle
              label="Show seconds"
              checked={s.showSeconds}
              onChange={s.setShowSeconds}
            />
            <Toggle
              label="Show date"
              checked={s.showDate}
              onChange={s.setShowDate}
            />
          </div>
        </Section>

        <Section title="Focus">
          <Toggle
            label="Numbers only"
            checked={s.focusMode}
            onChange={s.setFocusMode}
          />
          <Toggle
            label="Enlarge time"
            checked={s.enlargeInFocus}
            onChange={s.setEnlargeInFocus}
          />
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Hides everything but the time. Move the mouse or tap to reveal
            controls. Press{" "}
            <kbd
              className="rounded border px-1 py-0.5 text-[0.65rem] font-semibold"
              style={{ borderColor: "var(--border)" }}
            >
              F
            </kbd>{" "}
            to toggle,{" "}
            <kbd
              className="rounded border px-1 py-0.5 text-[0.65rem] font-semibold"
              style={{ borderColor: "var(--border)" }}
            >
              Esc
            </kbd>{" "}
            to exit.
          </p>
        </Section>

        <Section title="Timer & stopwatch">
          <Toggle
            label="Completion sound"
            checked={s.timerSound}
            onChange={s.setTimerSound}
          />
          <Toggle
            label="Keep screen awake while running"
            checked={s.keepAwake}
            onChange={s.setKeepAwake}
          />
        </Section>
      </div>

      <button
        type="button"
        onClick={s.reset}
        className="self-start rounded-xl border px-4 py-3 text-sm font-medium transition hover:opacity-80"
        style={{ borderColor: "var(--border)" }}
      >
        Reset to defaults
      </button>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="flex flex-col gap-3 rounded-2xl border p-5"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        backdropFilter: "blur(16px)",
      }}
    >
      <h2
        className="text-xs font-semibold tracking-[0.25em] uppercase"
        style={{ color: "var(--muted)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function SwatchButton({
  label,
  active,
  onClick,
  preview,
  dot,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  preview: string;
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border p-2.5 text-left transition hover:scale-[1.02] active:scale-95"
      style={{
        borderColor: active ? "var(--accent)" : "var(--border)",
        background: active
          ? "color-mix(in srgb, var(--accent) 14%, transparent)"
          : "transparent",
      }}
    >
      <span
        className="relative h-7 w-7 shrink-0 rounded-full border border-white/10"
        style={{ background: preview }}
      >
        {dot && (
          <span
            className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border border-black/30"
            style={{ background: dot }}
          />
        )}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function Segmented({
  options,
  value,
  onChange,
  style,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  style?: (id: string) => React.CSSProperties;
}) {
  return (
    <div
      className="grid gap-1 rounded-xl border p-1"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        borderColor: "var(--border)",
      }}
    >
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="relative rounded-lg px-2 py-2 text-sm font-medium transition"
            style={{ color: active ? "var(--fg)" : "var(--muted)" }}
          >
            {active && (
              <motion.span
                layoutId={`seg-${options.map((x) => x.id).join("")}`}
                className="absolute inset-0 rounded-lg"
                style={{
                  background:
                    "color-mix(in srgb, var(--accent) 22%, transparent)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10" style={style?.(o.id)}>
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition"
      style={{ borderColor: "var(--border)" }}
    >
      <span>{label}</span>
      <span
        className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
        style={{
          background: checked
            ? "var(--accent)"
            : "color-mix(in srgb, var(--fg) 18%, transparent)",
        }}
      >
        <motion.span
          className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
        />
      </span>
    </button>
  );
}
