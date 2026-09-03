"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { ACCENTS, buildBackground, getFont, getTheme } from "@/lib/presets";
import { useSettingsStore } from "@/store/use-settings-store";

interface ThemeSurfaceProps {
  children: ReactNode;
  /** Extra classes for the surface (e.g. `overflow-hidden`, `cursor-none`). */
  className?: string;
}

/**
 * Full-height page background that publishes the theme color tokens consumed
 * across the app. Every route renders inside one so the palette, accent, font,
 * and background style stay consistent wherever the user navigates.
 */
export function ThemeSurface({ children, className = "" }: ThemeSurfaceProps) {
  const theme = useSettingsStore((s) => s.theme);
  const accentId = useSettingsStore((s) => s.accent);
  const fontId = useSettingsStore((s) => s.font);
  const background = useSettingsStore((s) => s.background);

  const style = useMemo<CSSProperties>(() => {
    const { palette } = getTheme(theme);

    const accentValue =
      ACCENTS.find((a) => a.id === accentId)?.value || palette.accent;

    return {
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
  }, [theme, accentId, fontId, background]);

  return (
    <div
      style={style}
      className={`clock-face relative flex min-h-dvh w-full flex-col transition-colors duration-500 ${
        background === "animated" ? "bg-animated" : ""
      } ${className}`}
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
      {children}
    </div>
  );
}
