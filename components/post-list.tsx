import { TextLink } from "@/components/text-link";
import { formatDate, formatDateTime, formatReadingTime } from "@/src/lib/content/format";
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
export function PostList({ posts, basePath }: PostListProps) {
  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground">Rien de publié pour l’instant.</p>
    );
  }

  return (
    <ol className="divide-border-token duration-base divide-y transition-opacity [&:has(:hover)>li:not(:hover)]:opacity-50 [&>li]:transition-opacity [&>li]:ease-out">
      {posts.map((post) => (
        <li key={post.slug} className="flex flex-col gap-1 py-4">
          <TextLink href={`${basePath}/${post.slug}`}>{post.title}</TextLink>
          <p className="text-meta text-muted-foreground">
            <time dateTime={formatDateTime(post.date)}>
              {formatDate(post.date)}
            </time>
            {" · "}
            {formatReadingTime(post.readingMinutes)}
          </p>
          {post.description ? (
            <p className="text-muted-foreground">{post.description}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
