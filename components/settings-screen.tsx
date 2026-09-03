"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeSurface } from "@/components/theme-surface";
import { SettingsForm } from "@/components/settings-form";
import { ArrowLeftIcon } from "@/components/icons";
import { useSettingsStore } from "@/store/use-settings-store";

export function SettingsScreen() {
  // Preferences live in localStorage, so the first client render still shows
  // the defaults. Fade the form in once the store has rehydrated to avoid a
  // flash of the wrong selections.
  const hasHydrated = useSettingsStore((s) => s.hasHydrated);

  return (
    <ThemeSurface>
      <header
        className="sticky top-0 z-20 flex items-center gap-3 border-b px-5 py-4 sm:px-8"
        style={{
          borderColor: "var(--border)",
          background: "color-mix(in srgb, var(--surface) 60%, transparent)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Link
          href="/"
          aria-label="Back to clock"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border transition hover:scale-105 active:scale-95"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">Customize</h1>
      </header>

      <motion.main
        className="relative z-10 mx-auto w-full max-w-4xl px-5 py-8 sm:px-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="transition-opacity duration-300"
          style={{ opacity: hasHydrated ? 1 : 0 }}
        >
          <SettingsForm />
        </div>
      </motion.main>
    </ThemeSurface>
  );
}
