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
- Right side: language toggle (FR / EN), theme toggle (light / dark / system).
- ⌘K command palette available everywhere.

## Routes

No route carries a locale: `/projets` serves French or English depending on the
`NEXT_LOCALE` cookie (`localePrefix: "never"`, `src/i18n/routing.ts`). The proxy rewrites it
onto `app/[locale]/`, where both languages are prerendered. The cost of that choice is that
alternate links are impossible — one URL cannot be two languages for a crawler — so only the
default locale is indexable; `localePrefix: "as-needed"` is the one-line escape hatch.

Every route is listed in `/sitemap.xml` under its public path, and every page declares a
canonical URL and a social card built by `src/lib/seo/` — see README § SEO.

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

- Dark mode, FR / EN i18n (next-intl, no locale in the URL — see § Routes and § Content).
- Text-to-speech reader for articles.
- Music player in the footer, off by default: `preload="none"` and no `src` until the
  first click, so a visit that never asks for music downloads no audio. Three CC BY 4.0
  instrumental tracks served from `public/audio/`, credited in the README.
- GitHub contribution graph in `--fg` opacity steps: `8 / 25 / 45 / 70 / 100 %` for levels
  0 → 4, one `flex-1` column per week so 53 columns divide the reading width. It is the one
  surface below the 4px scale — `--radius-xs` (2px) and `--spacing-cell` (2px gap), because a
  4px radius on a 9px cell reads as a dot and a 4px gap outweighs the cell. Those two tokens
  belong to this graph; nothing else uses them.
  - Three rows: month names (hidden below `sm`, where a 6px column runs them together), the
    grid, then one readout line — `1 003 contributions sur les 12 derniers mois` at rest,
    `4 contribution(s) · 30 avril 2026` for the cell under the pointer or focus. **No
    tooltip**: nothing floats over the cells and the line never moves.
  - The hovered or focused cell takes a 1px `--fg` outline — the readout is never the only
    cue. Keyboard: the grid is a single tab stop, arrows walk the days, `Escape` clears.
  - Section header carries « Jouer » and `@handle ↗` on the right of the title.
  - « Jouer » turns the graph into a snake board in place — no route, no second grid. The
    header controls become ⤢, « Son : activé » and « Quitter le jeu », the year dims to
    `4 / 10 / 16 / 22 / 28 %` so a level-4 day can't be read as the snake, the snake draws at
    full `--fg` (body `70 %`) and the food is an outlined empty cell. The readout line becomes
    the game status (`role="status"`), the key beside it dims with the board. The game is the
    one surface with **no radius at all**: square cells, square swatches — it is a screen of
    pixels, not a set of cards.
  - The board wraps, as Snake II did on the Nokia: an edge is a doorway and the only way to
    lose is to run into yourself.
  - ⤢ takes the game full screen (fixed layer, `Escape` closes, page scroll locked). Under
    `sm` that layer turns a quarter turn: 53 columns across a phone held upright is a 7px
    cell whatever the chrome, so the board takes the screen's long edge instead and the cell
    reaches ~15px. Everything turns with it, pad and arrow glyphs included; only the swipe is
    read back through the quarter turn.
  - Three ways in, because the graph is thumbed as often as it is typed at: arrow keys (also
    `WASD` / `ZQSD`, `Entrée` restarts), a swipe across the board, and a 44px arrow pad
    below it on any coarse pointer — a tablet is wide and still has no arrow keys. The
    board is one tab stop with `role="application"`; it pauses on a hidden tab and when
    focus leaves the section (not for its own controls), and any direction resumes. A lost
    board is held 700ms before a direction may restart it, so the score can be read.
  - Sound is three synthesised blips (Web Audio, no asset), on by default, and the toggle
    sits in the header. Rules in `src/lib/snake/engine.ts`, tones in `src/utils/sound.ts`.

## Components

Server (zero JS): `Intro`, `Section`, `TextLink`, `FocusList / Row`, `NotesGrid`, `PostList`, `StackList`, `IllustrationSlot`, `ThemeScript`, `Footer`, `CaseStudy`, `Article`, `TranslationNotice`, `CvDocument`.

Client islands: `BioTabs`, `ActivityBoard` (`ContributionGrid` + `SnakeBoard`), `Disclosure`, `ProjectFilter`, `CursorPreview`, `CopyEmail`, `AbidjanClock`, `ThemeToggle`, `LocaleToggle`, `CommandPalette` (dynamic import on first ⌘K), `MusicPlayer`, plus the games, Todo, contact form and reader.

## Content

- Editorial content in MDX (`src/content/<locale>/<collection>/<slug>.mdx`, one flat file per
  entry, filename = slug), structured data in TypeScript (`src/data/`).
- A slug does not have to exist in both languages. When a translation is missing the default
  locale's file is served, `meta.fallbackFrom` records it, and `TranslationNotice` says so —
  nothing disappears from the site because it has not been translated yet.
- Prose in `src/data/` is `Localized` (`src/i18n/localized.ts`); short UI labels are keys in
  `src/i18n/messages/<locale>.json`. The author edits the first, the developer the second.
- Three collections: `blog`, `notes`, `projets`. Frontmatter is validated with zod
  (`src/lib/content/schemas.ts`) at build time; a bad field fails the build with the file path.
- Rendered with `next-mdx-remote/rsc`. `@next/mdx` is not an option: Turbopack passes plugin
  options to Rust, and the autolink `content` node and the pretty-code theme object don't survive.
- Each collection must hold at least one non-draft file — `cacheComponents` rejects an empty
  `generateStaticParams`. `draft: true` reads normally in dev and 404s in production.
- No backoffice: edit the `.mdx` file, push, redeploy. A Git-based CMS (Keystatic, TinaCMS) can
  be added later on the same files — the loader tags its cache entries `content:<locale>:*`,
  and the directory layout is already the `{locale}` path token such a CMS expects.

## Dependencies

Closed list; any addition is justified in the README.

- Runtime: next, react, react-dom, motion, next-themes, next-intl
- Content: next-mdx-remote, shiki, rehype-pretty-code, remark-gfm, rehype-slug,
  rehype-autolink-headings, zod, reading-time, yaml
- UI: @base-ui/react, class-variance-authority, lucide-react, cn, tw-animate-css
- Build: typescript, tailwindcss v4, @tailwindcss/turbopack
- Quality: eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, vitest, @testing-library/react, @testing-library/user-event, jsdom
