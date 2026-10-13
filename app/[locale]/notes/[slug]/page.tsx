import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { Article } from "@/components/content/article";
import { MdxContent } from "@/components/mdx/mdx-content";
import { JsonLd } from "@/components/seo/json-ld";
import { getEntry, getSlugs } from "@/src/lib/content/loader";
import { buildArticle, buildBreadcrumbs, buildGraph } from "@/src/lib/seo/json-ld";
import { buildPageMetadata } from "@/src/lib/seo/metadata";
import { ogImage } from "@/src/lib/seo/og-url";

export async function generateStaticParams() {
  const slugs = await getSlugs("notes");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/notes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const entry = await getEntry("notes", slug, locale);
  if (!entry) return {};

  return buildPageMetadata({
    title: entry.meta.title,
    description: entry.meta.description || undefined,
    path: `/notes/${slug}`,
    locale,
    type: "article",
    publishedTime: entry.meta.date,
    tags: entry.meta.tags,
    images: [
      ogImage({ locale, collection: "notes", slug, alt: entry.meta.title }),
    ],
  });
}

export default async function NotePage({ params }: PageProps<"/[locale]/notes/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const entry = await getEntry("notes", slug, locale);
  if (!entry) notFound();

  const nav = await getTranslations("Nav");
  const path = `/notes/${slug}`;

  return (
    <div className="container-page">
      <JsonLd
        data={buildGraph([
          buildArticle(entry.meta, path),
          buildBreadcrumbs([
            { name: nav("home"), path: "/" },
            { name: nav("notes"), path: "/notes" },
            { name: entry.meta.title, path },
          ]),
        ])}
      />
      <div className="layout-reading pt-10 pb-24 sm:pt-18">
        <main id="contenu" tabIndex={-1} className="outline-none">
          <Article meta={entry.meta}>
            <MdxContent source={entry.body} />
          </Article>
        </main>

        <aside className="hidden lg:block" />
      </div>
    </div>
  );
}
