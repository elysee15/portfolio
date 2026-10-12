# DESIGN.md — elyseebleu

Portfolio of Elysée Bleu, Senior Frontend Developer in Abidjan (PAYNAH since Feb. 2026).
Monochrome, minimal, editorial. The story is told through real context (Abidjan, the Ébrié lagoon, the workspace), not marketing copy.

Reference prototype: `Portfolio v4.dc.html`. Viewports: `Responsive.dc.html`.

---

## Principles

- One warm gray scale, no accent color.
- Serif for reading, sans for metadata, mono for code and shortcuts.
- No shadows, no gradients, no icons for decoration.
- Server Components by default; client JS only for interactive islands.
- Every animation is optional: everything is neutralized under `prefers-reduced-motion: reduce`.

## Colors

CSS variables, exposed to Tailwind v4 via `@theme`, switched by `[data-theme="dark"]`.

| Token      | Light     | Dark      | Usage                                           |
|------------|-----------|-----------|-------------------------------------------------|
| `--bg`     | `#FAFAF9` | `#0A0A0A` | Page background                                 |
| `--fg`     | `#171716` | `#EDEDEC` | Text, headings (17:1)                           |
| `--muted`  | `#6B6B67` | `#A1A19C` | Dates, labels, inactive tabs (5.1:1 / 7.5:1)    |
| `--subtle` | `#A3A39E` | `#5A5A56` | Link underline at rest. Never for text.         |
| `--border` | `#E7E7E4` | `#222221` | List separators, tab rail                       |
| `--hover`  | `#F2F2F0` | `#141413` | Hovered row, active palette item                |

Selection: `background: var(--fg); color: var(--bg)`.

## Typography

Loaded with `next/font`, latin subset, `display: swap`, fallback metric adjustment (CLS = 0).

- **Newsreader** (optical-size serif): body and headings
- **Geist**: metadata, UI labels
- **Geist Mono**: code, `kbd`

| Role       | Font            | Size / line-height       | Notes                    |
|------------|-----------------|--------------------------|--------------------------|
| display    | Newsreader 500  | 36 / 1.15 (mobile 30)    | letter-spacing -0.01em   |
| h1 article | Newsreader 500  | 28 / 1.25                |                          |
| h2 section | Newsreader 500  | 20 / 1.4                 |                          |
| body       | Newsreader 400  | 18 / 1.6 (≥768px: 19)    | `text-wrap: pretty`      |
| meta       | Geist 400       | 14 / 1.4                 | `tabular-nums`, `--muted`|
| kbd        | Geist Mono 400  | 12                       | 1px border, radius 4px   |

## Spacing and layout

Tailwind default scale (4px base), limited to: `1 2 3 4 6 8 12 16 24` (4 → 96px).

- Side margins: 20px mobile, 24px ≥640px.
- Home sections: 64px apart; section title → content: 16px.
- Reading column: max 640px.
- ≥1024px: grid `640px 280px`, 96px gutter, illustration `position: sticky`. Below 1024px the illustration is not rendered (no image request).
- Radii: 4px (kbd, focus), 6px (cards), 8px (palette, project preview).
- Breakpoints validated: 375, 834, 1440.

## Links and focus

- Links: underline 1px in `--subtle`, offset 3px. Hover: underline `--fg`, offset 4px. 150ms ease-out.
- Focus: `outline: 2px solid var(--fg)`, offset 3px, radius 2px, `:focus-visible` only.

## Motion

| Token             | Value                          | Used for                 |
|-------------------|--------------------------------|--------------------------|
| `--duration-fast` | 150ms                          | colors, underlines       |
| `--duration-base` | 200ms                          | opacity, crossfades      |
| `--duration-slow` | 300ms                          | heights, movement        |
| `--ease-out`      | `cubic-bezier(0.25, 1, 0.5, 1)`| default                  |
| `--ease-in-out`   | `cubic-bezier(0.65, 0, 0.35, 1)`| page/view transitions   |
| spring (Motion)   | `visualDuration: 0.25, bounce: 0` | tab indicator, heights |

Reduced motion: durations set to 0 in CSS, `<MotionConfig reducedMotion="user">`.

CSS first, Motion when earned. Default to Tailwind / plain CSS on the tokens above —
hovers, focus, color and underline transitions, opacity crossfades, simple transforms,
`@keyframes`, View Transitions. Reach for [motion.dev](https://motion.dev) (`motion/react`)
only when CSS can't express the interaction: spring physics, gesture- or scroll-driven
values, `layoutId` / shared-element transitions, orchestrated staggers, exit animations
(`AnimatePresence`), interruptible state-dependent motion. If a CSS transition reads the
same, it wins. The list below names the path for each interaction.

Per interaction:
- Bio tabs: `layoutId` indicator + animated height (spring).
- Lists: focus via `:has(:hover)`, other rows at 50% opacity (CSS, base).
- Cursor project preview: Motion `useSpring`, `(pointer: fine)` only.
- Copy email: "Copier" / "Copié" crossfade, reverts after 1.5s, announced via `aria-live`.
- ⌘K palette: opacity + scale 0.98 → 1 (base, ease-out).
- Page enter: fade + short slide (base, ease-out).
- Abidjan clock: no motion, `tabular-nums` only.
- View Transitions: shared title list → detail (slow, ease-in-out); no effect if the API is missing.
- Theme switch: blocking inline script in `<head>`, transitions disabled during the swap.

## Imagery

- Portrait: grayscale, full color on hover (base, ease-out). Home and Contact.
- Ébrié lagoon illustration: light and dark versions, swapped with the theme.
- Assets pending: logo, favicon, logotype.

## Navigation

- Top bar: Accueil, Projets, Blog, Notes, Lab, Jeux, Contact, Todo. Wraps to a second row below ~640px.
- Right side: theme toggle (light / dark / system), language (FR / EN), audio.
- ⌘K command palette available everywhere.

## Routes

| Route          | Content                                                    |
|----------------|------------------------------------------------------------|
| `/`            | Intro, bio (short / long), experience AKIL → VEONE → PAYNAH, studies, stack, GitHub activity |
| `/lab`         | Personal projects, freelance, training (content pending)  |
| `/jeux`        | 7 games in tabs, last open game remembered, one route per game |
| `/todo`        | Todo app                                                   |
| `/contact`     | Form + copy email + portrait                               |
| `/cv`          | Printable CV (`@media print`), built from `data/`          |
| `/blog`, `/notes`, `/projets` | Index lists, newest first (`PostList`, `NotesGrid`) |
| `/projets/[slug]`, `/notes/[slug]`, `/blog/[slug]` | MDX detail pages |

## Games

2048 (with undo), Minesweeper (chord-reveal on flagged neighbors), Typing Test (duration options, record per duration), Séquence (Simon), Réflexes (reaction time), and the two others from the prototype.

Rules for all games:
- Per-game sound toggle.
- Best scores in `localStorage`.
- Pause on `visibilitychange` and on route change.
- Same tokens as the rest of the site: no game-specific colors.

## Other features

- Dark mode, FR / EN i18n.
- Text-to-speech reader for articles.
- Music player (off by default).
- GitHub contribution graph in `--fg` opacity steps.

## Components

Server (zero JS): `Intro`, `Section`, `TextLink`, `FocusList / Row`, `NotesGrid`, `PostList`, `StackList`, `IllustrationSlot`, `ThemeScript`, `Footer`, `CaseStudy`, `Article`, `CvDocument`.

Client islands: `BioTabs`, `Disclosure`, `ProjectFilter`, `CursorPreview`, `CopyEmail`, `AbidjanClock`, `ThemeToggle`, `CommandPalette` (dynamic import on first ⌘K), plus the games, Todo, contact form, reader and player.

## Content

- Editorial content in MDX (`src/content/<collection>/<slug>.mdx`, one flat file per entry,
  filename = slug), structured data in TypeScript (`src/data/`).
- Three collections: `blog`, `notes`, `projets`. Frontmatter is validated with zod
  (`src/lib/content/schemas.ts`) at build time; a bad field fails the build with the file path.
- Rendered with `next-mdx-remote/rsc`. `@next/mdx` is not an option: Turbopack passes plugin
  options to Rust, and the autolink `content` node and the pretty-code theme object don't survive.
- Each collection must hold at least one non-draft file — `cacheComponents` rejects an empty
  `generateStaticParams`. `draft: true` reads normally in dev and 404s in production.
- No backoffice: edit the `.mdx` file, push, redeploy. A Git-based CMS (Keystatic, TinaCMS) can
  be added later on the same files — the loader already tags its cache entries `content:*`.

## Dependencies

Closed list; any addition is justified in the README.

- Runtime: next, react, react-dom, motion, next-themes
- Content: next-mdx-remote, shiki, rehype-pretty-code, remark-gfm, rehype-slug,
  rehype-autolink-headings, zod, reading-time, yaml
- UI: @base-ui/react, class-variance-authority, lucide-react, cn, tw-animate-css
- Build: typescript, tailwindcss v4, @tailwindcss/turbopack
- Quality: eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, vitest, @testing-library/react, @testing-library/user-event, jsdom
