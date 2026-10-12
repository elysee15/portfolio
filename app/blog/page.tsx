import type { Metadata } from "next";

import { IllustrationSlot } from "@/components/illustration-slot";
import { PostList } from "@/components/post-list";
import { getEntries } from "@/src/lib/content/loader";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes longues sur le frontend, le rendu serveur et l’outillage.",
};

export default async function BlogIndexPage() {
  const posts = await getEntries("blog");

  return (
    <div className="container-page">
      <div className="layout-reading pt-10 pb-24 sm:pt-18">
        <main
          id="contenu"
          tabIndex={-1}
          className="flex flex-col gap-8 outline-none"
        >
          <h1 className="text-display">Blog</h1>
          <PostList posts={posts} basePath="/blog" />
        </main>

        <aside className="hidden lg:block">
          <IllustrationSlot />
        </aside>
      </div>
    </div>
  );
}
