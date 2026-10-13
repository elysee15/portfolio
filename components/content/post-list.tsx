import { getLocale, getTranslations } from "next-intl/server";

import { TextLink } from "@/components/ui/text-link";
import { formatDate, formatDateTime } from "@/src/lib/content/format";
import type { EntryMeta } from "@/src/lib/content/types";

interface PostListProps {
  posts: readonly EntryMeta[];
  /** URL prefix, e.g. `/blog`. */
  basePath: string;
}

/**
 * Chronological list of entries. Server Component, zero JS: the "focus the
 * hovered row" effect of DESIGN.md § Motion is `:has(:hover)` in CSS.
 */
export async function PostList({ posts, basePath }: PostListProps) {
  const t = await getTranslations("Content");
  const locale = await getLocale();

  if (posts.length === 0) {
    return <p className="text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <ol className="divide-border-token duration-base divide-y transition-opacity [&:has(:hover)>li:not(:hover)]:opacity-50 [&>li]:transition-opacity [&>li]:ease-out">
      {posts.map((post) => (
        // An untranslated entry keeps its own language so a screen reader
        // switches voice for it rather than reading French as English.
        <li
          key={post.slug}
          lang={post.locale}
          className="flex flex-col gap-1 py-4"
        >
          <TextLink href={`${basePath}/${post.slug}`}>{post.title}</TextLink>
          <p className="text-meta text-muted-foreground">
            <time dateTime={formatDateTime(post.date)}>
              {formatDate(post.date, locale)}
            </time>
            {" · "}
            {t("readingTime", { minutes: post.readingMinutes })}
          </p>
          {post.description ? (
            <p className="text-muted-foreground">{post.description}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
