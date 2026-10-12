import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Article } from "@/components/article";
import { MdxContent } from "@/components/mdx/mdx-content";
import { getEntry, getSlugs } from "@/src/lib/content/loader";

export async function generateStaticParams() {
  const slugs = await getSlugs("notes");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/notes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry("notes", slug);
  if (!entry) return {};

  return {
    title: entry.meta.title,
    description: entry.meta.description || undefined,
    openGraph: {
      type: "article",
      title: entry.meta.title,
      description: entry.meta.description || undefined,
      publishedTime: entry.meta.date,
      tags: [...entry.meta.tags],
    },
  };
}

export default async function NotePage({ params }: PageProps<"/notes/[slug]">) {
  const { slug } = await params;
  const entry = await getEntry("notes", slug);
  if (!entry) notFound();

  return (
    <div className="container-page">
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
