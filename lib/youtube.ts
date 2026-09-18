/**
 * Helpers for turning a user-pasted YouTube link into an embeddable background
 * video. Accepts the shapes people actually copy out of the address bar or the
 * share sheet — watch links, youtu.be links, shorts, live, embed — plus a bare
 * video id.
 */

const VIDEO_ID = /^[\w-]{11}$/;

export interface YouTubeSource {
  /** The 11-character video id. */
  id: string;
  /** Seconds into the video to start at, from a `t` / `start` parameter. */
  start: number;
}

/** Parses a user-supplied link; returns null when it isn't a YouTube video. */
export function parseYouTube(input: string): YouTubeSource | null {
  const raw = input.trim();
  if (!raw) return null;
  if (VIDEO_ID.test(raw)) return { id: raw, start: 0 };

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www|m|music)\./, "");
  const [, segment = "", value = ""] = url.pathname.split("/");

  let id: string | null = null;
  if (host === "youtu.be") {
    id = segment;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (segment === "watch") id = url.searchParams.get("v");
    else if (["embed", "shorts", "live", "v"].includes(segment)) id = value;
  }

  if (!id || !VIDEO_ID.test(id)) return null;

  return {
    id,
    start: parseStart(url.searchParams.get("t") ?? url.searchParams.get("start")),
  };
}

/** "90", "90s", "1m30s", "1h2m3s" → seconds. */
function parseStart(value: string | null): number {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value);

  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!match) return 0;
  const [, h, m, s] = match;
  return Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0);
}

/**
 * Builds the embed URL for the background player: chrome-free and looping.
 * It always starts muted so autoplay is never blocked; sound is turned on
 * afterwards over the IFrame API, which is why `enablejsapi` is set. `loop`
 * only works alongside a `playlist` of the same id, hence the repetition.
 */
export function buildEmbedUrl({ id, start }: YouTubeSource): string {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: id,
    controls: "0",
    disablekb: "1",
    fs: "0",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
    iv_load_policy: "3",
    enablejsapi: "1",
  });
  if (start > 0) params.set("start", String(start));

  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}
