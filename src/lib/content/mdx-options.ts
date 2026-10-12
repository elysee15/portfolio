/**
 * The remark / rehype pipeline.
 *
 * These options are the reason the project uses `next-mdx-remote` rather than
 * `@next/mdx`: Turbopack hands plugin options to Rust, and neither the hast
 * `content` node below nor rehype-pretty-code's theme object survives that
 * crossing. Compiling at render time in Node keeps them in JavaScript.
 */

import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

type MdxCompileOptions = NonNullable<
  NonNullable<MDXRemoteProps["options"]>["mdxOptions"]
>;

/**
 * With an *object* `theme`, shiki's `defaultColor` is disabled: tokens carry
 * `--shiki-light` / `--shiki-dark` custom properties and no inline `color`,
 * and globals.css picks one under `[data-theme="dark"]`.
 *
 * Do not pass a single theme literally named `dark`: the plugin writes the
 * theme *names* into `data-theme`, and `<pre data-theme="dark">` would match
 * the project's `@custom-variant dark` and flip every `dark:` utility inside.
 */
const prettyCode: PrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark" },
  keepBackground: false,
  bypassInlineCode: true,
  defaultLang: { block: "txt" },
  grid: true,
};

/**
 * `append`, not `wrap`: wrapping turns every heading into a link, so a reader
 * hears « lien, Titre » on each one. `tabIndex: -1` keeps ten headings from
 * adding ten tab stops; the anchors stay reachable by pointer and by
 * screen-reader link navigation.
 */
const autolink: Parameters<typeof rehypeAutolinkHeadings>[0] = {
  behavior: "append",
  properties: {
    className: ["heading-anchor"],
    "aria-label": "Lien permanent vers cette section",
    tabIndex: -1,
  },
  content: {
    type: "element",
    tagName: "span",
    properties: { ariaHidden: "true" },
    children: [{ type: "text", value: "#" }],
  },
};

/** Order matters: pretty-code rewrites the `<pre>` subtree, and autolink needs
 *  the ids that slug adds. */
export const mdxOptions: MdxCompileOptions = {
  format: "mdx",
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    [rehypePrettyCode, prettyCode],
    rehypeSlug,
    [rehypeAutolinkHeadings, autolink],
  ],
};
