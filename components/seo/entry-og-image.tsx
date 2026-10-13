import type { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import { profile } from "@/src/data/profile";
import type { Locale } from "@/src/i18n/routing";
import { getEntry } from "@/src/lib/content/loader";
import { formatDate } from "@/src/lib/content/format";
import type { CollectionName } from "@/src/lib/content/types";

import { renderOgCard } from "./og-card";

/** The `Nav` key whose label becomes the card's eyebrow. */
const navKey: Readonly<Record<CollectionName, "blog" | "notes" | "projets">> = {
  blog: "blog",
  notes: "notes",
  projets: "projets",
};

/**
 * The site-wide card: the one served when no entry is named.
 *
 * The name is the wordmark in the corner, so the headline is the tagline
 * instead — printing « Elysée Bleu » twice on one card says nothing twice.
 */
export function renderSiteOgImage(locale: Locale): Promise<ImageResponse> {
  return renderOgCard({
    eyebrow: profile.role[locale],
    title: profile.tagline[locale].join(" "),
  });
}

/**
 * The card of one content entry.
 *
 * An unknown slug falls back to the site card rather than throwing: the page
 * itself 404s, and a failed image would leave the link with no preview at all.
 */
export async function renderEntryOgImage(
  collection: CollectionName,
  slug: string,
  locale: Locale,
): Promise<ImageResponse> {
  const [entry, nav] = await Promise.all([
    getEntry(collection, slug, locale),
    getTranslations({ locale, namespace: "Nav" }),
  ]);

  if (!entry) return renderSiteOgImage(locale);

  const { title, description, date } = entry.meta;

  return renderOgCard({
    eyebrow: nav(navKey[collection]),
    title,
    footer: description || formatDate(date, locale),
  });
}
