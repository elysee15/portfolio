import type { MetadataRoute } from "next";

import { routing } from "@/src/i18n/routing";
import { getEntries } from "@/src/lib/content/loader";
import { absoluteUrl } from "@/src/lib/seo/site";

/**
 * `/sitemap.xml`.
 *
 * One entry per URL, not per language: `localePrefix: "never"` means `/blog`
 * is a single address serving whichever language the cookie asks for, so there
 * is nothing to list under `alternates` (see `src/i18n/routing.ts`). Dates come
 * from the default locale, the one translation guaranteed to be complete.
 *
 * Only pages a visitor can reach are listed. `/cv` is here because it is a
 * page; the PDF in `public/` is not — a crawler finds it through the link.
 */

/** Routes that exist regardless of content, with their relative weight. */
const staticRoutes: readonly { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/projets", priority: 0.9 },
  { path: "/blog", priority: 0.8 },
  { path: "/notes", priority: 0.7 },
  { path: "/lab", priority: 0.7 },
  { path: "/cv", priority: 0.6 },
  { path: "/contact", priority: 0.5 },
];

/** Most recent entry date of a collection, or today when it is empty. */
function latest(dates: readonly string[]): string {
  return dates.length > 0
    ? dates.reduce((a, b) => (a > b ? a : b))
    : new Date().toISOString().slice(0, 10);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locale = routing.defaultLocale;

  const [blog, notes, projets] = await Promise.all([
    getEntries("blog", locale),
    getEntries("notes", locale),
    getEntries("projets", locale),
  ]);

  const indexDates: Record<string, string> = {
    "/blog": latest(blog.map((meta) => meta.date)),
    "/notes": latest(notes.map((meta) => meta.date)),
    "/projets": latest(projets.map((meta) => meta.date)),
  };
  const siteDate = latest(Object.values(indexDates));

  const pages: MetadataRoute.Sitemap = staticRoutes.map(({ path, priority }) => ({
    url: absoluteUrl(path),
    lastModified: indexDates[path] ?? siteDate,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority,
  }));

  const entries: MetadataRoute.Sitemap = [...projets, ...blog, ...notes].map(
    (meta) => ({
      url: absoluteUrl(`/${meta.collection}/${meta.slug}`),
      lastModified: meta.date,
      changeFrequency: "yearly",
      priority: meta.collection === "projets" ? 0.8 : 0.6,
    }),
  );

  return [...pages, ...entries];
}
