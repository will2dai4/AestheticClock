"use client";

import { useCallback, useEffect, useState } from "react";

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
}

/** Tracks and toggles browser fullscreen, with a Safari (webkit) fallback. */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const doc = document as FullscreenDocument;
    const onChange = () =>
      setIsFullscreen(
        Boolean(document.fullscreenElement || doc.webkitFullscreenElement)
      );
    onChange();
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const toggle = useCallback(async () => {
    const doc = document as FullscreenDocument;
    const el = document.documentElement as FullscreenElement;
    try {
      if (document.fullscreenElement || doc.webkitFullscreenElement) {
        await (document.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());
      } else {
        await (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.());
      }
    } catch {
      // Fullscreen can be blocked (e.g. iframe / permissions) — ignore.
    }
  }, []);

  return { isFullscreen, toggle };
}
