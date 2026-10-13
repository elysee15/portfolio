/**
 * The SEO layer is pure functions over data, so it is tested as data: what a
 * crawler reads is a string, and a wrong string is invisible in a browser.
 *
 * `src/lib/seo/site.ts` resolves the origin once at module load, so every case
 * that changes the environment re-imports it through `vi.resetModules()`.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import { buildArticle, buildBreadcrumbs, buildGraph } from "@/src/lib/seo/json-ld";
import { buildPageMetadata } from "@/src/lib/seo/metadata";
import { ogImage } from "@/src/lib/seo/og-url";
import type { EntryMeta } from "@/src/lib/content/types";
import type { Metadata } from "next";

const ORIGIN = "https://example.com";

/**
 * `Metadata["twitter"]` is a union whose base member carries no `card`, so the
 * property is only reachable through the members that declare one.
 */
type CardedTwitter = Extract<NonNullable<Metadata["twitter"]>, { card: unknown }>;

function twitterCard(metadata: Metadata): CardedTwitter["card"] | undefined {
  return (metadata.twitter as CardedTwitter | null | undefined)?.card;
}

/** Re-imports `site.ts` with the environment the caller set up. */
async function importSite(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) vi.stubEnv(key, "");
    else vi.stubEnv(key, value);
  }
  return import("@/src/lib/seo/site");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("siteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL and drops its trailing slash", async () => {
    const { siteUrl } = await importSite({
      NEXT_PUBLIC_SITE_URL: `${ORIGIN}/`,
    });
    expect(siteUrl).toBe(ORIGIN);
  });

  it("falls back to the Vercel production host rather than the preview one", async () => {
    const { siteUrl } = await importSite({
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_PROJECT_PRODUCTION_URL: "example.com",
    });
    expect(siteUrl).toBe(ORIGIN);
  });

  it("never guesses a domain when nothing is configured", async () => {
    const { siteUrl } = await importSite({
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_PROJECT_PRODUCTION_URL: undefined,
    });
    expect(siteUrl).toBe("http://localhost:3000");
  });
});

describe("absoluteUrl", () => {
  it("gives one spelling per path", async () => {
    const { absoluteUrl } = await importSite({ NEXT_PUBLIC_SITE_URL: ORIGIN });

    expect(absoluteUrl("/")).toBe(`${ORIGIN}/`);
    expect(absoluteUrl("/blog")).toBe(`${ORIGIN}/blog`);
    expect(absoluteUrl("blog/")).toBe(`${ORIGIN}/blog`);
    expect(absoluteUrl("/blog/mon-article")).toBe(`${ORIGIN}/blog/mon-article`);
  });
});

describe("ogImage", () => {
  it("points at the dotted path the locale proxy skips", () => {
    const { url } = ogImage({ locale: "fr", alt: "Elysée Bleu" });
    expect(url.startsWith("/og.png?")).toBe(true);
  });

  it("names a collection and a slug, never free text", () => {
    const { url } = ogImage({
      locale: "en",
      collection: "blog",
      slug: "mon-article",
      alt: "Mon article",
    });

    const query = new URLSearchParams(url.split("?")[1]);
    expect(query.get("l")).toBe("en");
    expect(query.get("c")).toBe("blog");
    expect(query.get("s")).toBe("mon-article");
    expect([...query.keys()].sort()).toEqual(["c", "l", "s"]);
  });
});

const meta: EntryMeta<"blog"> = {
  collection: "blog",
  slug: "mon-article",
  locale: "fr",
  fallbackFrom: null,
  filePath: "src/content/fr/blog/mon-article.mdx",
  title: "Mon article",
  description: "Une description.",
  date: "2026-03-14",
  tags: ["next"],
  draft: false,
  readingMinutes: 4,
};

describe("buildPageMetadata", () => {
  it("keeps the canonical, og:url and og:image in agreement", () => {
    const metadata = buildPageMetadata({
      title: meta.title,
      description: meta.description,
      path: "/blog/mon-article",
      locale: "fr",
      type: "article",
      publishedTime: meta.date,
      tags: meta.tags,
    });

    expect(metadata.alternates?.canonical).toBe(metadata.openGraph?.url);
    expect(metadata.openGraph?.locale).toBe("fr_FR");
    // A route that defines openGraph replaces the layout's, images included —
    // so a page without an explicit card still has to carry one.
    expect(metadata.openGraph?.images).toHaveLength(1);
    expect(twitterCard(metadata)).toBe("summary_large_image");
  });

  it("carries a cover through instead of the generated card", () => {
    const cover = {
      url: "/covers/paynah.png",
      alt: "Console PAYNAH",
      width: 1600,
      height: 900,
    };

    const metadata = buildPageMetadata({
      title: "PAYNAH Console",
      path: "/projets/paynah-console",
      locale: "fr",
      images: [cover],
    });

    expect(metadata.openGraph?.images).toEqual([cover]);
  });
});

describe("json-ld", () => {
  it("makes a blog entry a BlogPosting and anything else an Article", () => {
    expect(buildArticle(meta, "/blog/mon-article")["@type"]).toBe("BlogPosting");
    expect(
      buildArticle({ ...meta, collection: "notes" } as EntryMeta, "/notes/x")[
        "@type"
      ],
    ).toBe("Article");
  });

  it("references the author by @id rather than restating it", () => {
    const article = buildArticle(meta, "/blog/mon-article");
    expect(article.author).toEqual(article.publisher);
    expect(article.author).toHaveProperty("@id");
  });

  it("numbers breadcrumbs from one, in order", () => {
    const crumbs = buildBreadcrumbs([
      { name: "Accueil", path: "/" },
      { name: "Blog", path: "/blog" },
    ]);

    const items = crumbs.itemListElement as { position: number }[];
    expect(items.map((item) => item.position)).toEqual([1, 2]);
  });

  it("drops undefined members when serialized", () => {
    const graph = buildGraph([buildArticle({ ...meta, tags: [] }, "/blog/x")]);
    expect(JSON.stringify(graph)).not.toContain("keywords");
    expect(JSON.parse(JSON.stringify(graph))["@context"]).toBe(
      "https://schema.org",
    );
  });
});
