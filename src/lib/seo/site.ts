/**
 * The site's own origin, and absolute URLs built from it.
 *
 * Canonical links, `metadataBase`, the sitemap and JSON-LD all need the full
 * origin — a crawler never resolves a relative URL the way a browser does.
 * The value is resolved once, in this order:
 *
 * 1. `NEXT_PUBLIC_SITE_URL` — set it to the production domain.
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel injects the production host on
 *    every deployment, so previews still emit production canonicals instead of
 *    advertising themselves.
 * 3. `http://localhost:3000` — local dev, never shipped.
 *
 * Nothing is guessed: with no env set, the build produces localhost URLs rather
 * than a plausible-looking wrong domain.
 */

function resolveOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

/** The origin, without a trailing slash. */
export const siteUrl = resolveOrigin();

/** `metadataBase` for `app/[locale]/layout.tsx` — a `URL`, as Next expects. */
export function siteOrigin(): URL {
  return new URL(siteUrl);
}

/**
 * Absolute URL for a route path. `/` keeps its trailing slash, every other
 * path loses one, so a canonical never has two spellings.
 */
export function absoluteUrl(path: string): string {
  const normalized = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  return `${siteUrl}${normalized}`;
}
