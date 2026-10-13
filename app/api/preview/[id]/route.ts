import { getPreviewTargets, isProxyable } from "@/src/lib/projects/preview";

/**
 * Proxies one project's preview under a stable, same-origin URL: the site's
 * og:image when it has one, a rendered screenshot otherwise.
 *
 * Same-origin matters twice: the browser can warm `/api/preview/<id>` from the
 * client without the visitor ever hitting a third-party host, and the URL never
 * changes when the site behind it swaps its card — the cached lookup in
 * `src/lib/projects/preview.ts` decides that.
 */

/** A card is a few hundred KB at most; past that it is not a card. */
const MAX_BYTES = 3_000_000;
/** mShots renders in the background, so it gets more room than an HTML fetch. */
const TIMEOUT = 15_000;
/** The "render in progress" placeholder: a GIF, and a tiny one. */
const PENDING_TYPE = "image/gif";
const PENDING_LIMIT = 30_000;

const BROWSER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

const IMMUTABLE =
  "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";
/** Short, so the next visit picks the render up instead of the placeholder. */
const RETRY = "public, max-age=0, s-maxage=60";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  for (const target of await getPreviewTargets(id)) {
    const image = await load(target);
    if (!image) continue;

    return new Response(image.bytes, {
      headers: {
        ...cache(IMMUTABLE),
        "content-type": image.type,
        "content-security-policy": "default-src 'none'; sandbox",
        "x-content-type-options": "nosniff",
      },
    });
  }

  // Nothing yet: a screenshot still rendering, or a site that is down. Both are
  // worth asking again in a minute, and the card falls back to its hatch.
  return new Response(null, { status: 404, headers: cache(RETRY) });
}

interface LoadedImage {
  type: string;
  bytes: ArrayBuffer;
}

/** `null` whenever the URL is not, right now, a usable image. */
async function load(target: string): Promise<LoadedImage | null> {
  const url = new URL(target);
  if (!isProxyable(url)) return null;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      headers: { accept: "image/*", "user-agent": BROWSER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT),
    });
  } catch {
    return null;
  }

  const type = upstream.headers.get("content-type") ?? "";
  const length = Number(upstream.headers.get("content-length") ?? 0);

  // An SPA answering its own `index.html` for a stale og:image path is the
  // common case here, and it arrives as a 200.
  if (!upstream.ok || !type.startsWith("image/") || length > MAX_BYTES) {
    return null;
  }

  // The placeholder has to be read to be measured, so it is buffered: at
  // ~9 KB that is cheaper than shipping it to the card as if it were the shot.
  const bytes = await upstream.arrayBuffer();
  if (type.startsWith(PENDING_TYPE) && bytes.byteLength < PENDING_LIMIT) {
    return null;
  }

  return { type, bytes };
}

function cache(value: string): Record<string, string> {
  return { "cache-control": value };
}
