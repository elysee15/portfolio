import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudy } from "@/components/case-study";
import { MdxContent } from "@/components/mdx/mdx-content";
import { getEntry, getSlugs } from "@/src/lib/content/loader";

export async function generateStaticParams() {
  const slugs = await getSlugs("projets");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projets/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry("projets", slug);
  if (!entry) return {};

  const { cover, title, description, date, tags } = entry.meta;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: date,
      tags: [...tags],
      images: cover
        ? [
            {
              url: cover.src,
              width: cover.width,
              height: cover.height,
              alt: cover.alt,
            },
          ]
        : undefined,
    },
  };
}

export default async function ProjetPage({
  params,
}: PageProps<"/projets/[slug]">) {
  const { slug } = await params;
  const entry = await getEntry("projets", slug);
  if (!entry) notFound();

  return (
    <div className="container-page">
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
