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

## Environment

Bun loads `.env` automatically; Next.js reads `.env.local`. Copy `.env.example` and fill it in.

| Variable | Required | Why |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | no | The production origin, without a trailing slash. Canonical links, `og:url`, `/sitemap.xml` and the JSON-LD graph are all absolute, so they need it. On Vercel it can be left unset: `VERCEL_PROJECT_PRODUCTION_URL` is read instead, which also keeps preview deployments pointing their canonicals at production. With neither, the build emits `http://localhost:3000` — a wrong-but-obvious origin rather than a plausible-looking wrong domain. |
| `GITHUB_TOKEN` | no | Reads the contribution calendar for the home « Activité » section through the GitHub GraphQL API, which rejects anonymous queries. A classic PAT with the `read:user` scope, or a fine-grained token with read-only access to public profile data. Without it the section renders a one-line notice instead of the graph — the build still passes. |

On Vercel the same variable goes in the project's environment variables (`vercel env add
GITHUB_TOKEN`). The calendar is fetched inside a `use cache` scope with `cacheLife("hours")`
— at most 24 API calls a day, never one per visitor. It is deliberately not `"days"`: the
same cache entry holds a failed attempt, and a rate-limited afternoon would otherwise pin
« graphe indisponible » to the home page until the next day.

## Project previews

Hovering a row of the home « Tous les projets » section shows the live site, Vercel-style.
No package and no API key: `src/lib/projects/preview.ts` reads the site's own `og:image`
(cached a `use cache` day — the same entry holds a failure, so an unreachable site gets
another chance tomorrow), and falls back to a rendered screenshot from WordPress' public
mShots endpoint when there is no card, or when the card turns out to be a dead path.

`/api/preview/<id>` proxies whichever one works under a stable, same-origin URL: the
visitor's browser never talks to the product's host, the id is all the client ever learns,
and the bytes are cached a week at the edge. mShots answers a small placeholder GIF while
it renders — the route treats that as 404 with a one-minute cache rather than storing it.
A client-rendered SPA can screenshot blank (RTIPlay does); drop a real image in
`src/data/projects.ts` the day that matters.

Previews are decoded during idle time on pointer devices only, so the first hover is
instant and a phone never downloads them.

## SEO

`src/lib/seo/` owns everything a crawler reads. No page writes a `<meta>` by hand:
`buildPageMetadata` takes a title, a description and a path, and returns the canonical
URL, the Open Graph block and the Twitter card together, so they can't drift apart. The
site-wide defaults — `metadataBase`, the `%s — Elysée Bleu` title template, the robots
directives — live in `app/[locale]/layout.tsx`.

`/sitemap.xml` and `/robots.txt` are generated from the content loader, so a new `.mdx`
file is listed the moment it is published. There is one URL per page and no `alternates`:
under `localePrefix: "never"` a single address serves both languages (see DESIGN.md §
Routes).

Social cards are rendered by `/og.png`, a route handler on `next/og`. It does **not** use
Next's per-segment `opengraph-image` convention: that would advertise
`/fr/blog/x/opengraph-image`, a path the locale proxy rewrites away — the crawler gets a
redirect and the card never renders. The dot in `/og.png` is what keeps the proxy out of
the way, and the query names a collection and a slug rather than free text, so the endpoint
can only draw words that are already in the repo. Newsreader and Geist are fetched from
Google at render time; without network the card falls back to Satori's own font instead of
failing.

Structured data is a single schema.org `@graph` per page. The `Person` and `WebSite` nodes
are declared once in the layout and referenced by `@id` everywhere else, so an article
states its author by pointing at the identity rather than repeating it.

## Writing content

Editorial content is MDX under `src/content/<locale>/<collection>/<slug>.mdx`, one flat file
per entry — the filename is the URL slug, the same in every language. Structured data stays
in TypeScript under `src/data/`. There is no backoffice: edit the file, push, redeploy.

| Collection | Route | Frontmatter |
|---|---|---|
| `blog` | `/blog`, `/blog/[slug]` | `title`, `description`, `date`, `tags`, `draft` |
| `notes` | `/notes`, `/notes/[slug]` | same, `description` optional |
| `projets` | `/projets`, `/projets/[slug]` | same + `role`, `stack`, `year`, `cover`, `url`, `repo` |

Frontmatter is validated with zod at build time: a bad field fails `next build` with the
file path and the field name. Available in MDX bodies: `<Callout>`, `<Figure>`, `<TextLink>`.

Four things worth knowing:

- **A translation is optional.** `src/content/en/blog/x.mdx` is served to an English reader
  when it exists; when it does not, the French file is, under a note saying so. Writing the
  English version later changes nothing else — same slug, same URL.
- Each collection must contain **at least one non-draft file** under `src/content/fr/` —
  `cacheComponents` rejects an empty `generateStaticParams`. The English directory may be
  empty.
- `draft: true` renders normally in `dev` and 404s in production.
- Editing a `.mdx` file does not trigger a Turbopack rebuild (it is not in the module graph).
  Refresh the page to pick up the change.

## Music

The footer player is off by default: `<audio preload="none">` with no `src` until the first
click, so a visit that never asks for music downloads nothing. Tracks live in `public/audio/`
and are declared in `src/data/music.ts`.

All ten are by **Kevin MacLeod** ([incompetech.com](https://incompetech.com/music/royalty-free/music.html)),
licensed **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)** — free for commercial
use, **attribution required**, which this section and the artist name in the player provide.

| Track | Artist | Licence |
|---|---|---|
| Dreamy Flashback | Kevin MacLeod | CC BY 4.0 |
| Meditation Impromptu 01 | Kevin MacLeod | CC BY 4.0 |
| Lightless Dawn | Kevin MacLeod | CC BY 4.0 |
| At The Shore | Kevin MacLeod | CC BY 4.0 |
| Night Cave | Kevin MacLeod | CC BY 4.0 |
| Southern Gothic | Kevin MacLeod | CC BY 4.0 |
| Starting Out Waltz Vivace | Kevin MacLeod | CC BY 4.0 |
| Thief in the Night | Kevin MacLeod | CC BY 4.0 |
| Dub Eastern | Kevin MacLeod | CC BY 4.0 |
| Ghost Story | Kevin MacLeod | CC BY 4.0 |

Re-encoded from the 320 kb/s MP3 originals to AAC 96 kb/s (`.m4a`, ~23 MB total) — background
music does not need a master-grade bitrate, and the repo should not carry 45 MB of it.
Replacing a track means dropping the file in `public/audio/` and editing `src/data/music.ts`;
record the new licence and source URL here at the same time.

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
| `next-intl` | FR / EN. Chosen over a hand-rolled dictionary for three things that are not one-liners: ICU plurals, `localePrefix: "never"` (the locale lives in a cookie, never in a URL), and a `getRequestConfig` that reads `next/root-params` so pages stay statically rendered under `cacheComponents` instead of opting into dynamic rendering by touching headers. |

## Languages

Two locales, `fr` (default) and `en`, declared once in [src/i18n/routing.ts](src/i18n/routing.ts).

Nothing about the language appears in a URL: `/projets` is `/projets` in both. The proxy
([proxy.ts](proxy.ts)) reads the `NEXT_LOCALE` cookie — or the `Accept-Language` header on a
first visit — and rewrites the request onto `app/[locale]/`. Both versions are prerendered at
build time, so the rewrite picks a static page rather than rendering one.

| Where a string lives | What goes there |
|---|---|
| `src/i18n/messages/<locale>.json` | UI labels, ARIA text, counts and dates phrasing — keyed, edited by the developer |
| `src/data/*.ts` | editorial prose, typed `Localized` / `LocalizedList` |
| `src/content/<locale>/…` | MDX entries, one file per language |

Two consequences worth knowing:

- **No `hreflang`.** One URL cannot be two languages for a crawler, so only French is
  indexable. Switching `localePrefix` to `"as-needed"` in `src/i18n/routing.ts` restores
  `/en/*` and alternate links; nothing else in the codebase changes.
- **A client island never looks a locale up.** The server resolves prose to one language and
  passes plain strings down — `ExperienceRow`, `ProjectRowData`, `BioVariantRow`,
  `PaletteEntry`. Both languages are never shipped to the browser.
