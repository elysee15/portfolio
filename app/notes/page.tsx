import type { Metadata } from "next";

import { IllustrationSlot } from "@/components/illustration-slot";
import { NotesGrid } from "@/components/notes-grid";
import { getEntries } from "@/src/lib/content/loader";

export const metadata: Metadata = {
  title: "Notes",
  description: "Notes courtes : détails d’interface, raccourcis, décisions.",
};

export default async function NotesIndexPage() {
  const notes = await getEntries("notes");

  return (
    <div className="container-page">
      <div className="layout-reading pt-10 pb-24 sm:pt-18">
        <main
          id="contenu"
          tabIndex={-1}
          className="flex flex-col gap-8 outline-none"
        >
          <h1 className="text-display">Notes</h1>
          <NotesGrid notes={notes} />
        </main>

        <aside className="hidden lg:block">
          <IllustrationSlot />
        </aside>
      </div>
    </div>
  );
}
