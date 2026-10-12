# Portfolio — elyseebleu

Monochrome editorial portfolio. Next.js 16 App Router, React 19, Tailwind v4, shadcn on
Base UI. [DESIGN.md](./DESIGN.md) is the normative design system; [CLAUDE.md](./CLAUDE.md)
holds the working rules.

## Getting started

```bash
bun install
bun run dev      # http://localhost:3000
bun run build
bun run lint
```

Bun is the package manager and script runner; the app itself is served by Next.js.

## Writing content

Editorial content is MDX under `src/content/<collection>/<slug>.mdx`, one flat file per
entry — the filename is the URL slug. Structured data stays in TypeScript under `src/data/`.
There is no backoffice: edit the file, push, redeploy.

| Collection | Route | Frontmatter |
|---|---|---|
| `blog` | `/blog`, `/blog/[slug]` | `title`, `description`, `date`, `tags`, `draft` |
| `notes` | `/notes`, `/notes/[slug]` | same, `description` optional |
| `projets` | `/projets`, `/projets/[slug]` | same + `role`, `stack`, `year`, `cover`, `url`, `repo` |

Frontmatter is validated with zod at build time: a bad field fails `next build` with the
file path and the field name. Available in MDX bodies: `<Callout>`, `<Figure>`, `<TextLink>`.

Three things worth knowing:

- Each collection must contain **at least one non-draft file** — `cacheComponents` rejects an
  empty `generateStaticParams`.
- `draft: true` renders normally in `dev` and 404s in production.
- Editing a `.mdx` file does not trigger a Turbopack rebuild (it is not in the module graph).
  Refresh the page to pick up the change.

## Dependencies

Closed list (DESIGN.md § Dependencies); every addition is justified here.

| Package | Why |
|---|---|
| `next-mdx-remote` | Compiles MDX in RSC at render time. `@next/mdx` can't be used: Turbopack passes plugin options to Rust, and neither the autolink `content` node nor the pretty-code theme object survives that crossing. |
| `shiki`, `rehype-pretty-code` | Build-time syntax highlighting, dual light/dark theme, zero client JS. |
| `remark-gfm` | Tables, footnotes, strikethrough, task lists. |
| `rehype-slug`, `rehype-autolink-headings` | Heading ids and deep links into articles. |
| `zod` | Frontmatter validation — a typo fails the build, not the page. |
| `reading-time` | Reading estimate on list and detail pages. |
| `yaml` | Parses frontmatter for list pages without compiling every MDX body. |
