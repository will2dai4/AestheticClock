/**
 * Curated visual presets for the clock app: color themes, accent swatches,
 * selectable fonts, background styles, and the available display layouts.
 */

export type ThemeId =
  | "midnight"
  | "daylight"
  | "mocha"
  | "nord"
  | "rose"
  | "forest";

export interface ThemePalette {
  /** Base page color (used for solid backgrounds and gradient stops). */
  bg: string;
  /** A secondary color used to build gradients. */
  bgAlt: string;
  /** Primary text color. */
  fg: string;
  /** Secondary / muted text color. */
  muted: string;
  /** Surface color for panels and controls. */
  surface: string;
  /** Border color for surfaces. */
  border: string;
  /** Default accent for this theme. */
  accent: string;
  /** Whether this palette is dark (drives color-scheme). */
  isDark: boolean;
}

export interface ThemeOption {
  id: ThemeId;
  label: string;
  palette: ThemePalette;
}

export const THEMES: ThemeOption[] = [
  {
    id: "midnight",
    label: "Midnight",
    palette: {
      bg: "#0b0d12",
      bgAlt: "#161a24",
      fg: "#f4f6fb",
      muted: "#8a93a6",
      surface: "rgba(255,255,255,0.05)",
      border: "rgba(255,255,255,0.10)",
      accent: "#7c9cff",
      isDark: true,
    },
  },
  {
    id: "daylight",
    label: "Daylight",
    palette: {
      bg: "#f6f7fb",
      bgAlt: "#e7ebf5",
      fg: "#15181f",
      muted: "#666e7d",
      surface: "rgba(0,0,0,0.04)",
      border: "rgba(0,0,0,0.08)",
      accent: "#3b66ff",
      isDark: false,
    },
  },
  {
    id: "mocha",
    label: "Mocha",
    palette: {
      bg: "#1c1714",
      bgAlt: "#2a211c",
      fg: "#f3e9e0",
      muted: "#a89384",
      surface: "rgba(255,255,255,0.05)",
      border: "rgba(255,255,255,0.10)",
      accent: "#e0a472",
      isDark: true,
    },
  },
  {
    id: "nord",
    label: "Nord",
    palette: {
      bg: "#2e3440",
      bgAlt: "#3b4252",
      fg: "#eceff4",
      muted: "#9aa3b2",
      surface: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.12)",
      accent: "#88c0d0",
      isDark: true,
    },
  },
  {
    id: "rose",
    label: "Rose",
    palette: {
      bg: "#1a1015",
      bgAlt: "#2a1620",
      fg: "#fbe9f0",
      muted: "#bf94a5",
      surface: "rgba(255,255,255,0.05)",
      border: "rgba(255,255,255,0.10)",
      accent: "#ff7eb6",
      isDark: true,
    },
  },
  {
    id: "forest",
    label: "Forest",
    palette: {
      bg: "#0d1512",
      bgAlt: "#15211c",
      fg: "#e7f3ec",
      muted: "#83a394",
      surface: "rgba(255,255,255,0.05)",
      border: "rgba(255,255,255,0.10)",
      accent: "#5fd0a0",
      isDark: true,
    },
  },
];

export function getTheme(id: ThemeId): ThemeOption {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export interface AccentOption {
  id: string;
  label: string;
  value: string;
}

export const ACCENTS: AccentOption[] = [
  { id: "default", label: "Theme", value: "" },
  { id: "blue", label: "Blue", value: "#7c9cff" },
  { id: "violet", label: "Violet", value: "#a78bfa" },
  { id: "pink", label: "Pink", value: "#ff7eb6" },
  { id: "amber", label: "Amber", value: "#f5b14c" },
  { id: "emerald", label: "Emerald", value: "#5fd0a0" },
  { id: "cyan", label: "Cyan", value: "#5fd0e0" },
  { id: "red", label: "Coral", value: "#ff6b6b" },
];

export type FontId = "sans" | "mono" | "serif" | "display";

export interface FontOption {
  id: FontId;
  label: string;
  /** CSS variable injected by next/font in the layout. */
  cssVar: string;
}

export const FONTS: FontOption[] = [
  { id: "display", label: "Display", cssVar: "var(--font-display)" },
  { id: "sans", label: "Sans", cssVar: "var(--font-sans)" },
  { id: "mono", label: "Mono", cssVar: "var(--font-mono)" },
  { id: "serif", label: "Serif", cssVar: "var(--font-serif)" },
];

export function getFont(id: FontId): FontOption {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}

export type BackgroundId = "solid" | "gradient" | "animated";

export interface BackgroundOption {
  id: BackgroundId;
  label: string;
}

export const BACKGROUNDS: BackgroundOption[] = [
  { id: "solid", label: "Solid" },
  { id: "gradient", label: "Gradient" },
  { id: "animated", label: "Animated" },
];

/**
 * Builds the CSS background value for a given style using palette + accent so
 * the background always stays coherent with the chosen theme.
 */
export function buildBackground(
  style: BackgroundId,
  palette: ThemePalette,
  accent: string
): string {
  if (style === "solid") return palette.bg;
  if (style === "gradient") {
    return `radial-gradient(120% 120% at 15% 10%, ${tint(
      accent,
      palette.bg,
      0.22
    )} 0%, ${palette.bg} 45%, ${palette.bgAlt} 100%)`;
  }
  // animated: a soft, drifting multi-stop gradient.
  return `linear-gradient(125deg, ${palette.bg} 0%, ${tint(
    accent,
    palette.bgAlt,
    0.28
  )} 35%, ${palette.bgAlt} 65%, ${tint(palette.accent, palette.bg, 0.2)} 100%)`;
}

/** Mixes `color` over `base` by `amount` using CSS color-mix at runtime. */
function tint(color: string, base: string, amount: number): string {
  return `color-mix(in srgb, ${color} ${Math.round(
    amount * 100
  )}%, ${base})`;
}

export type LayoutId = "digital" | "minimal" | "stacked";

export interface LayoutOption {
  id: LayoutId;
  label: string;
}

export const LAYOUTS: LayoutOption[] = [
  { id: "digital", label: "Digital" },
  { id: "minimal", label: "Minimal" },
  { id: "stacked", label: "Stacked" },
];
