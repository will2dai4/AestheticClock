"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeSurface } from "@/components/theme-surface";
import { SettingsForm } from "@/components/settings-form";
import { ArrowLeftIcon } from "@/components/icons";
import { useSettingsStore } from "@/store/use-settings-store";

const HEADER_H = "5rem";

export function SettingsScreen() {
  // Preferences live in localStorage, so the first client render still shows
  // the defaults. Fade the form in once the store has rehydrated to avoid a
  // flash of the wrong selections.
  const hasHydrated = useSettingsStore((s) => s.hasHydrated);

  return (
    <ThemeSurface>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center gap-3 px-5 py-5 sm:px-8">
        <Link
          href="/"
          aria-label="Back to clock"
          className="pointer-events-auto -ml-2 grid h-10 w-10 shrink-0 place-items-center transition hover:scale-110 active:scale-95"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
      </header>

      {/* The page itself never scrolls; the settings list does. It spans the
          full height so items pass through the header band, softened by a mask
          rather than clipped at a hard edge. */}
      <motion.main
        className="thin-scroll relative z-10 flex-1 overflow-y-auto overscroll-none px-5 pb-8 sm:px-8"
        style={{
          paddingTop: HEADER_H,
          maskImage: `linear-gradient(to bottom, transparent 0, #000 ${HEADER_H})`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent 0, #000 ${HEADER_H})`,
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="mx-auto w-full max-w-4xl transition-opacity duration-300"
          style={{ opacity: hasHydrated ? 1 : 0 }}
        >
          <SettingsForm />
        </div>
      </motion.main>
    </ThemeSurface>
  );
}
