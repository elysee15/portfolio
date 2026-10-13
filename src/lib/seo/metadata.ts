/**
 * One builder for every page's `generateMetadata`.
 *
 * Pages pass what they know — a title, a description, their path — and get back
 * a canonical URL, Open Graph and Twitter cards that agree with each other. The
 * point is that no route reinvents the shape: a missing `og:url` or a canonical
 * that drifts from the real path is invisible in the browser and fatal to a
 * crawler.
 *
 * `localePrefix: "never"` (see `src/i18n/routing.ts`) means one URL serves both
 * languages, so there are no `alternates.languages` to emit — only `og:locale`,
 * which describes what the crawler is actually being served.
 */

import type { Metadata } from "next";

import type { Locale } from "@/src/i18n/routing";

import { ogImage, type OgImageInput } from "./og-url";
import { absoluteUrl } from "./site";

/** Human name of the site, reused as `og:site_name` and the title suffix. */
export const siteName = "Elysée Bleu";

/** BCP 47 tags, as Open Graph wants them (`fr_FR`, not `fr`). */
const ogLocales: Readonly<Record<Locale, string>> = {
  fr: "fr_FR",
  en: "en_US",
};

export interface PageMetadataInput {
  /** Page title, without the site name — the layout template appends it. */
  title: string;
  description?: string;
  /** Route path as the visitor sees it, e.g. `/blog/mon-article`. */
  path: string;
  locale: Locale;
  type?: "website" | "article" | "profile";
  /** ISO `YYYY-MM-DD`, articles only. */
  publishedTime?: string;
  modifiedTime?: string;
  tags?: readonly string[];
  /**
   * Omit to get the site card. A route that defines `openGraph` replaces the
   * layout's wholesale, images included, so every page states one — an inherited
   * `og:image` is a thing that does not exist.
   */
  images?: readonly OgImageInput[];
}

export function buildPageMetadata({
  title,
  description,
  path,
  locale,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
  images,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const ogImages = (images ?? [ogImage({ locale, alt: title })]).map((image) => ({
    url: image.url,
    alt: image.alt,
    width: image.width,
    height: image.height,
  }));

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: type === "profile" ? "profile" : type,
      url,
      siteName,
      title,
      description,
      locale: ogLocales[locale],
      ...(type === "article"
        ? { publishedTime, modifiedTime: modifiedTime ?? publishedTime, tags: tags ? [...tags] : undefined }
        : {}),
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImages ? { images: ogImages.map((image) => image.url) } : {}),
    },
  };
}
