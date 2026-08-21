/**
 * One source of truth for everything the crawlers read.
 *
 * The canonical origin comes from NEXT_PUBLIC_SITE_URL so a preview deploy does
 * not advertise itself as the production site. The fallback is only a
 * development convenience.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexachatbangladesh.vercel.app"
).replace(/\/$/, "");

export const siteName = "NexaChat";

export const siteTagline = "Realtime chat for your people";

export const siteDescription =
  "NexaChat is a realtime messenger for direct chats and group conversations. " +
  "Sign in with a phone number — no password — and every message is delivered live, on every screen you own.";

export const siteKeywords = [
  "realtime chat app",
  "group chat",
  "instant messaging",
  "WebSocket chat",
  "direct messages",
  "team chat",
  "NexaChat",
];

/** Absolute URL for a route, which canonical tags and sitemaps both require. */
export function absoluteUrl(path = "/"): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Public routes worth indexing, in the order they matter. */
export const indexableRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/guide", priority: 0.8, changeFrequency: "monthly" as const },
];
