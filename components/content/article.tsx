import { getLocale, getTranslations } from "next-intl/server";

import { TranslationNotice } from "@/components/content/translation-notice";
import { formatDate, formatDateTime } from "@/src/lib/content/format";
import type { EntryMeta } from "@/src/lib/content/types";

interface ArticleProps {
  meta: EntryMeta;
  children: React.ReactNode;
}

/**
 * Detail shell for blog posts and notes. The title lives here rather than in
 * the MDX body, so a `.mdx` file starts at `##`.
 *
 * `lang` is set from the entry, not from the page: an untranslated entry is
 * served in another language and a screen reader has to hear it that way.
 */
export async function Article({ meta, children }: ArticleProps) {
  const t = await getTranslations("Content");
  const locale = await getLocale();

  return (
    <article lang={meta.locale}>
      <header className="mb-12 flex flex-col gap-3">
        <TranslationNotice fallbackFrom={meta.fallbackFrom} />
        <h1 className="text-h1">{meta.title}</h1>
        <p className="text-meta text-muted-foreground">
          <time dateTime={formatDateTime(meta.date)}>
            {formatDate(meta.date, locale)}
          </time>
          {" · "}
          {t("readingTime", { minutes: meta.readingMinutes })}
          {meta.tags.length > 0 ? ` · ${meta.tags.join(", ")}` : null}
        </p>
      </header>
      {children}
    </article>
  );
}
