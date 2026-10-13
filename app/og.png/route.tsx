import type { NextRequest } from "next/server";

import {
  renderEntryOgImage,
  renderSiteOgImage,
} from "@/components/seo/entry-og-image";
import { isLocale, routing } from "@/src/i18n/routing";
import { collectionNames } from "@/src/lib/content/collections";
import type { CollectionName } from "@/src/lib/content/types";
import { ogParams } from "@/src/lib/seo/og-url";

/**
 * `GET /og.png` — the social card for every page.
 *
 * Lives at the root with a dotted path so the locale proxy leaves it alone;
 * `src/lib/seo/og-url.ts` explains why the per-segment convention cannot work
 * here. Unknown or missing parameters degrade to the site card: a crawler
 * asking for nonsense gets a valid image, never a 500.
 */

function isCollection(value: string | null): value is CollectionName {
  return value !== null && collectionNames.includes(value as CollectionName);
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;

  const requested = query.get(ogParams.locale);
  const locale = isLocale(requested) ? requested : routing.defaultLocale;

  const collection = query.get(ogParams.collection);
  const slug = query.get(ogParams.slug);

  const image =
    isCollection(collection) && slug
      ? await renderEntryOgImage(collection, slug, locale)
      : await renderSiteOgImage(locale);

  // The card only changes when the content does, and a rebuild changes the URL
  // through its query — so a long shared cache is safe and spares the renderer.
  image.headers.set(
    "Cache-Control",
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
  );

  return image;
}
