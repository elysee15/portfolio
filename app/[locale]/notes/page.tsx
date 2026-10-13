import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { IllustrationSlot } from "@/components/layout/illustration-slot";
import { NotesGrid } from "@/components/content/notes-grid";
import { getEntries } from "@/src/lib/content/loader";
import { buildPageMetadata } from "@/src/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Notes");
  const locale = await getLocale();
  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/notes",
    locale,
  });
}

export default async function NotesIndexPage() {
  const t = await getTranslations("Notes");
  const locale = await getLocale();
  const entries = await getEntries("notes", locale);

  return (
    <div className="container-page">
      <div className="layout-reading pt-10 pb-24 sm:pt-18">
        <main
          id="contenu"
          tabIndex={-1}
          className="flex flex-col gap-8 outline-none"
        >
          <h1 className="text-display">{t("title")}</h1>
          <NotesGrid notes={entries} />
        </main>

        <aside className="hidden lg:block">
          <IllustrationSlot />
        </aside>
      </div>
    </div>
  );
}
