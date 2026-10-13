/**
 * The address of the social card, and the query it is built from.
 *
 * Why a single `/og.png` endpoint rather than Next's per-segment
 * `opengraph-image` convention: every page lives under `app/[locale]/`, but no
 * URL ever shows a locale (`localePrefix: "never"`). A colocated image route
 * would be advertised as `/fr/blog/x/opengraph-image`, which the proxy rewrites
 * away — the crawler gets a redirect or a 500, and the card never renders.
 *
 * The dot in `/og.png` is what keeps the proxy out: its matcher skips anything
 * with a file extension, so this path reaches the route handler untouched.
 *
 * The query names a collection and a slug, never free text: the card's words
 * are read from the content files, so the endpoint can't be used to render
 * arbitrary strings under this site's name.
 */

import type { Locale } from "@/src/i18n/routing";
import type { CollectionName } from "@/src/lib/content/types";

/** One `og:image`, as `buildPageMetadata` takes it. */
export interface OgImageInput {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

/** Query keys, shared by the builder and the route handler. */
export const ogParams = {
  collection: "c",
  slug: "s",
  locale: "l",
} as const;

export interface OgImageRequest {
  locale: Locale;
  /** Omit both to get the site-wide card. */
  collection?: CollectionName;
  slug?: string;
  /** `og:image:alt` — what the card says, for a reader who can't see it. */
  alt: string;
}

/** The `images` entry to hand `buildPageMetadata`. */
export function ogImage({
  locale,
  collection,
  slug,
  alt,
}: OgImageRequest): OgImageInput {
  const query = new URLSearchParams({ [ogParams.locale]: locale });
  if (collection && slug) {
    query.set(ogParams.collection, collection);
    query.set(ogParams.slug, slug);
  }

  return { url: `/og.png?${query}`, alt, width: 1200, height: 630 };
}
