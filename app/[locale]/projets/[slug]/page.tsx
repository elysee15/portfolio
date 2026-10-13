import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { CaseStudy } from "@/components/content/case-study";
import { MdxContent } from "@/components/mdx/mdx-content";
import { JsonLd } from "@/components/seo/json-ld";
import { getEntry, getSlugs } from "@/src/lib/content/loader";
import { buildArticle, buildBreadcrumbs, buildGraph } from "@/src/lib/seo/json-ld";
import { buildPageMetadata } from "@/src/lib/seo/metadata";
import { ogImage } from "@/src/lib/seo/og-url";

export async function generateStaticParams() {
  const slugs = await getSlugs("projets");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projets/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const entry = await getEntry("projets", slug, locale);
  if (!entry) return {};

  const { cover, title, description, date, tags } = entry.meta;

  return buildPageMetadata({
    title,
    description,
    path: `/projets/${slug}`,
    locale,
    type: "article",
    publishedTime: date,
    tags,
    // A real cover beats the generated card.
    images: [
      cover
        ? {
            url: cover.src,
            alt: cover.alt,
            width: cover.width,
            height: cover.height,
          }
        : ogImage({ locale, collection: "projets", slug, alt: title }),
    ],
  });
}

export default async function ProjetPage({
  params,
}: PageProps<"/[locale]/projets/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const entry = await getEntry("projets", slug, locale);
  if (!entry) notFound();

  const nav = await getTranslations("Nav");
  const path = `/projets/${slug}`;

  return (
    <div className="container-page">
      <JsonLd
        data={buildGraph([
          buildArticle(entry.meta, path),
          buildBreadcrumbs([
            { name: nav("home"), path: "/" },
            { name: nav("projets"), path: "/projets" },
            { name: entry.meta.title, path },
          ]),
        ])}
      />
      <div className="layout-reading pt-10 pb-24 sm:pt-18">
        <main id="contenu" tabIndex={-1} className="outline-none">
          <CaseStudy meta={entry.meta}>
            <MdxContent source={entry.body} />
          </CaseStudy>
        </main>

        <aside className="hidden lg:block" />
      </div>
    </div>
  );
}
