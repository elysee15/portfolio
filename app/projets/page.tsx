import type { Metadata } from "next";

import { IllustrationSlot } from "@/components/illustration-slot";
import { PostList } from "@/components/post-list";
import { getEntries } from "@/src/lib/content/loader";

export const metadata: Metadata = {
  title: "Projets",
  description: "Études de cas : contexte, décisions, et ce qui a changé.",
};

export default async function ProjetsIndexPage() {
  const projets = await getEntries("projets");

  return (
    <div className="container-page">
      <div className="layout-reading pt-10 pb-24 sm:pt-18">
        <main
          id="contenu"
          tabIndex={-1}
          className="flex flex-col gap-8 outline-none"
        >
          <h1 className="text-display">Projets</h1>
          <PostList posts={projets} basePath="/projets" />
        </main>

        <aside className="hidden lg:block">
          <IllustrationSlot />
        </aside>
      </div>
    </div>
  );
}
