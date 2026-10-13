/**
 * Site previews for the « Tous les projets » rows: the og:image each live
 * product already publishes, resolved on the server. Network-only —
 * `src/lib/content/loader.ts` stays the single module touching the filesystem,
 * and nothing here imports React.
 *
 * Everything returned crosses a `use cache` boundary, so the shapes stay
 * JSON-serializable: absolute `https` URLs as strings, nothing else.
 */

import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { projects, type ProjectEntry } from "@/src/data/projects";

/** A landing page that answers slower than this is not worth a build stall. */
const TIMEOUT = 5_000;
/** og:image lives in `<head>`; reading the whole body would buy nothing. */
const HEAD_LIMIT = 150_000;
/** Some hosts serve a stripped page to an unknown agent — this one is honest. */
const USER_AGENT =
  "Mozilla/5.0 (compatible; elyseebleu-portfolio/1.0; +https://github.com/elysee15)";

/** First match wins: `og:image` is the authored one, Twitter's is the fallback. */
const KEYS = ["og:image", "og:image:url", "twitter:image"] as const;

/**
 * Never follow a preview into the network the server sits on: the URL comes
 * from a third party's HTML, not from `src/data/projects.ts`.
 */
const PRIVATE_HOST =
  /^(localhost$|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|\[?::1\]?$|.*\.local$)/i;

/**
 * The og:image of one page, absolute, or `null` when the page has none, is
 * unreachable, or points somewhere we refuse to proxy.
 *
 * Cached for a week and tagged per URL: a marketing site changes its card a
 * couple of times a year, and the home page is prerendered.
 */
export async function getPreviewImage(pageUrl: string): Promise<string | null> {
  "use cache";
  // Days, not weeks: a `null` is cached too, and a site that was unreachable
  // during one build should get another chance the next day, not next month.
  cacheLife("days");
  cacheTag(`project-preview:${pageUrl}`);

  try {
    const response = await fetch(pageUrl, {
      headers: { "user-agent": USER_AGENT, accept: "text/html" },
      signal: AbortSignal.timeout(TIMEOUT),
    });

    if (!response.ok) return null;

    const html = (await response.text()).slice(0, HEAD_LIMIT);
    const content = findMeta(html);
    if (!content) return null;

    // `response.url` and not `pageUrl`: a relative og:image on a page that
    // redirected resolves against where it landed.
    const resolved = new URL(content, response.url);
    return isProxyable(resolved) ? resolved.toString() : null;
  } catch {
    // A preview is decoration: an outage degrades a card, never the build.
    return null;
  }
}

/**
 * The ids whose row can show a preview: every project pointing at a live site.
 * Three of the five publish no card at all, so the screenshot fallback — not
 * the og:image — is what decides this, and it exists for all of them.
 */
export function getProjectsWithPreview(
  entries: readonly ProjectEntry[],
): readonly string[] {
  return entries
    .filter((entry) => entry.href && isExternal(entry.href))
    .map((entry) => entry.slug);
}

/**
 * What `/api/preview/<id>` should fetch, best first: the site's own card, then
 * a rendered screenshot. Both, and in that order, because a published og:image
 * can point at a path the site no longer serves — RTIPlay advertises one and
 * answers its own `index.html` for it. The route walks the list until one of
 * them is really an image.
 */
export async function getPreviewTargets(id: string): Promise<readonly string[]> {
  const entry = projects.find((project) => project.slug === id);
  if (!entry?.href || !isExternal(entry.href)) return [];

  const card = await getPreviewImage(entry.href);
  return card ? [card, screenshotUrl(entry.href)] : [screenshotUrl(entry.href)];
}

/**
 * WordPress' mShots renders the page and serves the result — no key, no
 * package, and the only moving part is a URL. The first call answers a tiny
 * placeholder GIF while the render runs; the route treats that as "not yet"
 * rather than caching it (see `app/api/preview/[id]/route.ts`).
 */
export function screenshotUrl(pageUrl: string): string {
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(pageUrl)}?w=1200&h=750`;
}

export function isExternal(href: string): boolean {
  return href.startsWith("https://");
}

/** `https` only, and never an address inside the deployment's own network. */
export function isProxyable(url: URL): boolean {
  return url.protocol === "https:" && !PRIVATE_HOST.test(url.hostname);
}

/**
 * Scans `<meta>` tags rather than matching one shape: the attribute order and
 * the quoting change from one site generator to the next.
 */
function findMeta(html: string): string | null {
  const tags = html.match(/<meta\s[^>]*>/gi);
  if (!tags) return null;

  for (const key of KEYS) {
    for (const tag of tags) {
      const name = attribute(tag, "property") ?? attribute(tag, "name");
      if (name?.toLowerCase() !== key) continue;

      const content = attribute(tag, "content");
      if (content) return decode(content);
    }
  }

  return null;
}

function attribute(tag: string, name: string): string | null {
  const match = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i").exec(tag);
  return match?.[1] ?? null;
}

/** Only the entities that actually show up inside a URL attribute. */
function decode(value: string): string {
  return value.replaceAll("&amp;", "&").replaceAll("&#38;", "&").trim();
}
