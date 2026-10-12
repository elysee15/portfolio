import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Article } from "@/components/article";
import { MdxContent } from "@/components/mdx/mdx-content";
import { getEntry, getSlugs } from "@/src/lib/content/loader";

export async function generateStaticParams() {
  const slugs = await getSlugs("blog");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry("blog", slug);
  if (!entry) return {};

  return {
    title: entry.meta.title,
    description: entry.meta.description,
    openGraph: {
      type: "article",
      title: entry.meta.title,
      description: entry.meta.description,
      publishedTime: entry.meta.date,
      tags: [...entry.meta.tags],
    },
  };
}

export default async function BlogPostPage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const entry = await getEntry("blog", slug);
  // `dynamicParams` isn't available under cacheComponents, so an unlisted slug
  // renders at request time and has to 404 here.
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
