"use client";

import { useEffect, useMemo, useRef } from "react";
import { buildEmbedUrl, parseYouTube } from "@/lib/youtube";

interface YouTubeBackgroundProps {
  /** Raw link as typed in settings; ignored when it isn't a YouTube video. */
  url: string;
  /** Unmute the player once the page has been interacted with. */
  sound: boolean;
  /** 0-1 scrim drawn over the video in the theme's base color. */
  dim: number;
}

/**
 * Full-bleed looping YouTube video behind the clock.
 *
 * The player always starts muted — browsers refuse to autoplay audio, and a
 * blocked autoplay means no video at all — so sound is turned on afterwards
 * over the IFrame API, on the first interaction that makes it permissible.
 */
export function YouTubeBackground({ url, sound, dim }: YouTubeBackgroundProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const source = useMemo(() => parseYouTube(url), [url]);
  const src = useMemo(() => (source ? buildEmbedUrl(source) : null), [source]);

  useEffect(() => {
    if (!src) return;

    const send = (func: string, args: unknown[] = []) =>
      frame.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*"
      );

    if (!sound) {
      send("mute");
      return;
    }

    // Try straight away (the player may already be allowed to make noise),
    // then again on every interaction until it sticks.
    const unmute = () => {
      send("unMute");
      send("setVolume", [100]);
    };
    unmute();

    const events = ["pointerdown", "keydown", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, unmute));
    return () => events.forEach((e) => window.removeEventListener(e, unmute));
  }, [src, sound]);

  if (!src) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* 16:9 sized to cover the viewport in either orientation, so the video
          fills the screen instead of letterboxing. */}
      <iframe
        ref={frame}
        src={src}
        title="Background video"
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
        style={{
          width: "100vw",
          height: "56.25vw",
          minWidth: "177.78vh",
          minHeight: "100vh",
        }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: "var(--bg, #000)",
          opacity: Math.min(Math.max(dim, 0), 1),
        }}
      />
    </div>
  );
}
