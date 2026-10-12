/**
 * Renders an MDX body. A cached Server Component rather than a cached function
 * returning JSX: `use cache` stores the rendered RSC payload, and `source` is
 * a plain string, so the cache key stays clean.
 *
 * next-mdx-remote 6 defaults to `blockJS: true`, which *silently strips*
 * `{expression}` from the MDX. Content here is prose plus components, so the
 * default stands — but an author writing `{frontmatter.title}` will get
 * nothing and no warning.
 */

import { cacheLife } from "next/cache";
import { MDXRemote } from "next-mdx-remote/rsc";

import { mdxOptions } from "@/src/lib/content/mdx-options";
import { mdxComponents } from "./mdx-components";

interface MdxContentProps {
  /** MDX body, frontmatter already stripped by the loader. */
  source: string;
}

export async function MdxContent({ source }: MdxContentProps) {
  "use cache";
  cacheLife("max");

  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      // The loader already split the frontmatter; parsing it again would
      // reintroduce a yaml / vfile-matter divergence.
      options={{ mdxOptions, parseFrontmatter: false }}
    />
  );
}
