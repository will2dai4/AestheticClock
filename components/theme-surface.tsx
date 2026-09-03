"use client";

import { useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import { ACCENTS, buildBackground, getFont, getTheme } from "@/lib/presets";
import { useSettingsStore } from "@/store/use-settings-store";

interface ThemeSurfaceProps {
  children: ReactNode;
  /** Extra classes for the surface (e.g. `overflow-hidden`, `cursor-none`). */
  className?: string;
}

/**
 * Full-height page shell that publishes the theme color tokens consumed across
 * the app. Every route renders inside one so the palette, accent, font, and
 * background style stay consistent wherever the user navigates.
 */
export function ThemeSurface({ children, className = "" }: ThemeSurfaceProps) {
  const theme = useSettingsStore((s) => s.theme);
  const accentId = useSettingsStore((s) => s.accent);
  const fontId = useSettingsStore((s) => s.font);
  const background = useSettingsStore((s) => s.background);

  const { style, backdrop, baseColor } = useMemo(() => {
    const { palette } = getTheme(theme);

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
      color: palette.fg,
    };

    return {
      style: css,
      backdrop: buildBackground(background, palette, accentValue),
      baseColor: palette.bg,
    };
  }, [theme, accentId, fontId, background]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.background = backdrop;
    root.style.backgroundColor = baseColor;
    root.style.backgroundAttachment = "fixed";
    root.classList.toggle("bg-animated", background === "animated");
  }, [backdrop, baseColor, background]);

  return (
    <div
      style={style}
      className={`clock-face relative flex h-dvh w-full flex-col overflow-hidden transition-colors duration-500 ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, transparent 55%, rgba(0,0,0,0.18) 100%)",
        }}
      />
      {children}
    </div>
  );
}
