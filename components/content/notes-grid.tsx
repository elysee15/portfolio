import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";

import { formatDate, formatDateTime } from "@/src/lib/content/format";
import type { NoteMeta } from "@/src/lib/content/types";

interface NotesGridProps {
  notes: readonly NoteMeta[];
}

/** Notes are short, so they read better as cards than as a dated feed. */
export async function NotesGrid({ notes }: NotesGridProps) {
  const t = await getTranslations("Content");
  const locale = await getLocale();

  if (notes.length === 0) {
    return <p className="text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {notes.map((note) => (
        <li key={note.slug} lang={note.locale}>
          <Link
            href={`/notes/${note.slug}`}
            className="border-border-token hover:bg-hover duration-fast flex h-full flex-col gap-2 rounded-md border p-4 no-underline transition-colors ease-out"
          >
            <span className="text-h2">{note.title}</span>
            <time
              dateTime={formatDateTime(note.date)}
              className="text-meta text-muted-foreground"
            >
              {formatDate(note.date, locale)}
            </time>
            {note.description ? (
              <span className="text-muted-foreground">{note.description}</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
