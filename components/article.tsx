import { formatDate, formatDateTime, formatReadingTime } from "@/src/lib/content/format";
import type { EntryMeta } from "@/src/lib/content/types";

interface ArticleProps {
  meta: EntryMeta;
  children: React.ReactNode;
}

/**
 * Detail shell for blog posts and notes. The title lives here rather than in
 * the MDX body, so a `.mdx` file starts at `##`.
 */
export function Article({ meta, children }: ArticleProps) {
  return (
    <article>
      <header className="mb-12 flex flex-col gap-3">
        <h1 className="text-h1">{meta.title}</h1>
        <p className="text-meta text-muted-foreground">
          <time dateTime={formatDateTime(meta.date)}>
            {formatDate(meta.date)}
          </time>
          {" · "}
          {formatReadingTime(meta.readingMinutes)}
          {meta.tags.length > 0 ? ` · ${meta.tags.join(", ")}` : null}
        </p>
      </header>
      {children}
    </article>
  );
}
