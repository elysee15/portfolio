/**
 * The HTML element map handed to `<MDXRemote>`.
 *
 * Plain object, no provider: RSC has no context, so `MDXProvider` is not an
 * option. Every class comes from the design tokens — no raw `text-lg`, no
 * hardcoded color, radius or duration.
 */

import type { MDXRemoteProps } from "next-mdx-remote/rsc";

import { TextLink } from "@/components/text-link";
import { Callout } from "./callout";
import { Figure } from "./figure";

type MdxComponentMap = NonNullable<MDXRemoteProps["components"]>;
type Props<T extends keyof React.JSX.IntrinsicElements> =
  React.ComponentPropsWithoutRef<T>;

/** `h4` and below share one register: Geist, small, uppercase. */
function MinorHeading({ children, ...props }: Props<"h4">) {
  return (
    <h4
      className="text-meta text-muted-foreground group mt-8 mb-3 scroll-mt-24 uppercase"
      {...props}
    >
      {children}
    </h4>
  );
}

export const mdxComponents: MdxComponentMap = {
  // The page title is rendered by `Article` / `CaseStudy`, so `h1` is rare
  // inside a body — it exists so a stray one doesn't fall back to the browser.
  h1: (props: Props<"h1">) => (
    <h1 className="text-h1 group mt-12 mb-4 scroll-mt-24" {...props} />
  ),
  h2: (props: Props<"h2">) => (
    <h2 className="text-h2 group mt-12 mb-4 scroll-mt-24" {...props} />
  ),
  // No `text-h3` token: body size with weight is the next step down.
  h3: (props: Props<"h3">) => (
    <h3 className="group mt-8 mb-3 scroll-mt-24 font-medium" {...props} />
  ),
  h4: MinorHeading,
  h5: MinorHeading,
  h6: MinorHeading,

  // No size class — the body size is set on `body`.
  p: (props: Props<"p">) => <p className="mb-6" {...props} />,
  // rehype-autolink-headings appends its own <a class="heading-anchor">; it is
  // decoration, so it must not pick up the underline treatment.
  a: ({ className, ...props }: Props<"a">) =>
    className?.includes("heading-anchor") ? (
      <a className={className} {...props} />
    ) : (
      <TextLink className={className} {...props} />
    ),

  ul: (props: Props<"ul">) => (
    <ul
      className="marker:text-subtle mb-6 list-disc space-y-2 pl-6 [&>li>ol]:mt-2 [&>li>ul]:mt-2"
      {...props}
    />
  ),
  ol: (props: Props<"ol">) => (
    <ol
      className="marker:text-subtle mb-6 list-decimal space-y-2 pl-6 [&>li>ol]:mt-2 [&>li>ul]:mt-2"
      {...props}
    />
  ),
  li: (props: Props<"li">) => <li className="pl-1" {...props} />,

  blockquote: (props: Props<"blockquote">) => (
    <blockquote
      className="border-border-token text-muted-foreground my-8 border-l-2 pl-6 italic [&>p:last-child]:mb-0"
      {...props}
    />
  ),
  hr: (props: Props<"hr">) => (
    <hr className="border-border-token my-12" {...props} />
  ),

  // Markdown images carry no dimensions, so `next/image` would have to guess
  // an aspect ratio and ship layout shift. Use <Figure> when it matters.
  img: (props: Props<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="border-border-token my-8 w-full rounded-md border"
      loading="lazy"
      decoding="async"
      alt=""
      {...props}
    />
  ),

  // GFM tables are data, so they read in Geist with tabular numerals.
  table: (props: Props<"table">) => (
    <div className="my-8 overflow-x-auto">
      <table className="text-meta w-full border-collapse text-left" {...props} />
    </div>
  ),
  th: (props: Props<"th">) => (
    <th className="border-border-token border-b pb-2 pr-4 font-medium" {...props} />
  ),
  td: (props: Props<"td">) => (
    <td className="border-border-token border-b py-2 pr-4" {...props} />
  ),

  // Inline code only: rehype-pretty-code runs with `bypassInlineCode`.
  code: (props: Props<"code">) => (
    <code
      className="border-border-token bg-hover text-code rounded-sm border px-1 py-0.5 font-mono"
      {...props}
    />
  ),
  // The frame lives on the generated figure (globals.css), so the horizontal
  // scrollbar sits inside the border instead of under it.
  pre: (props: Props<"pre">) => (
    <pre className="text-code overflow-x-auto py-4 font-mono" {...props} />
  ),

  Callout,
  Figure,
  TextLink,
};
