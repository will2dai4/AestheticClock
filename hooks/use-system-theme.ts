"use client";

import { useEffect, useState } from "react";

/** Tracks the OS color-scheme preference, updating on change. */
export function useSystemPrefersDark(): boolean {
  const [prefersDark, setPrefersDark] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setPrefersDark(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return prefersDark;
}
