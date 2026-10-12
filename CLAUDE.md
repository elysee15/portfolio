---
description: Portfolio elyseebleu — Next.js App Router, shadcn/Base UI, Bun as the toolchain.
globs: "*.ts, *.tsx, *.mdx, *.css, package.json, components.json"
alwaysApply: true
---

# Portfolio — elyseebleu

Next.js 16 App Router + React 19 + Tailwind v4 + shadcn (Base UI). Monochrome editorial portfolio.

Design system is normative: read [DESIGN.md](./DESIGN.md) before any UI work. It owns the
color scale, type scale, spacing, motion tokens, routes and the component inventory.

## Toolchain — Bun

- `bun install`, `bun run dev`, `bun run build`, `bunx shadcn@latest add <component>`
- `bun <file>` instead of `node <file>` / `ts-node <file>`
- `bun test` for unit tests; Playwright for E2E
- Bun loads `.env` automatically — don't add `dotenv`

Bun is the package manager and script runner. The app itself is served by Next.js
(`next dev` / `next start`), **not** `Bun.serve()`. Don't swap the Next runtime for Bun APIs.

## Design tokens

Defined in [app/globals.css](./app/globals.css). Never hardcode a color, radius or duration.

- Scale: `--bg`, `--fg`, `--muted`, `--subtle`, `--border-token`, `--hover`
- shadcn semantics (`--background`, `--primary`, `--accent`, …) are mapped onto that scale
- Dark mode switches on `[data-theme="dark"]` — **not** a `.dark` class. The `dark:` Tailwind
  variant is remapped to match, so `dark:` still works.
- Motion: `--duration-fast|base|slow`, `--ease-out`, `--ease-in-out`. All zeroed under
  `prefers-reduced-motion: reduce`.
- `--destructive` is the only non-gray value in the system. Don't add accent colors.

## Spacing and layout

Two custom utilities in [app/globals.css](./app/globals.css) own the page shell. Don't
hand-roll `max-w-*` / `px-*` on page wrappers — use these.

- `container-page` — centers, side margins 20px then 24px at ≥640px, max-width 640px
  (reading column) widening to 1016px at ≥1024px to fit the aside rail.
- `layout-reading` — one reading column, becoming `640px 280px` with a 96px gutter at
  ≥1024px. The aside is the second child; hide it below `lg` and make it `sticky`.

Widths live in `@theme`: `--container-reading`, `--container-aside`, `--container-page`,
`--gutter-page`, `--gutter-page-sm`, `--gutter-aside`.

Rhythm, on the default 4px Tailwind scale — stick to `1 2 3 4 6 8 12 16 24`:

- Home sections 64px apart → `gap-16`
- Section title → content 16px → `gap-4`

## Typography

Loaded with `next/font` in [app/layout.tsx](./app/layout.tsx):

| Tailwind class | Font | Use |
|----------------|------|-----|
| `font-serif` (body default) | Newsreader | body copy, headings |
| `font-sans` | Geist | metadata, UI labels |
| `font-mono` | Geist Mono | code, `kbd` |

Semantic sizes — never pick a raw `text-lg` / `text-2xl`:

| Class | Size | Notes |
|-------|------|-------|
| `text-display` | 30 → 36px at ≥640px, 1.15 | letter-spacing -0.01em |
| `text-h1` | 28 / 1.25 | article titles |
| `text-h2` | 20 / 1.4 | section titles |
| body (no class) | 18 / 1.6, 19px at ≥768px | `text-wrap: pretty`, set on `body` |
| `text-meta` | 14 / 1.4, Geist | `tabular-nums`; pair with `text-muted-foreground` |
| `text-code` | 15px mono | code in prose, optically matched to the 17px serif |
| `<kbd>` | 12px mono | styled in the base layer, no class needed |

## Animation

**Always invoke the `better-ui` skill (`/better-ui`) before any motion, interaction or
animation work** — new animations, hover/focus states, transitions, enter/exit, staggers,
micro-interactions, or reviewing existing ones. No exceptions, even for a one-line
`transition-*`. It owns the polish bar; this section owns the mechanics.

CSS first, JS when earned. DESIGN.md § Motion decides which path an interaction takes —
read it before animating anything. The short form: Tailwind / plain CSS on the motion
tokens by default, [motion.dev](https://motion.dev) (`motion/react`) only for springs,
gestures, scroll, `layoutId`, staggers, `AnimatePresence` exits and interruptible motion.

What that means in code:

- Reach for `transition-*` / `animate-*` and the `--duration-*` / `--ease-*` tokens first.
  If a CSS transition reads the same as the JS one, ship the CSS.
- A `motion/react` component is a client island: `"use client"`, kept small, imported at
  the leaf. Don't pull a page into the client for one animated element.
- Reduced motion is handled for both paths already — CSS tokens zero out, and
  `<MotionConfig reducedMotion="user">` wraps the tree. Don't re-implement per component.

## shadcn

- Config: [components.json](./components.json) — style `base-nova`, base color `neutral`,
  CSS variables on, RSC on, icons from `lucide-react`.
- Add components with `bunx shadcn@latest add <name>`; they land in `components/ui/`.
- After adding, strip any color the generated component hardcodes and re-point it at the tokens.
- Primitives come from `@base-ui/react`, not Radix.

## Components

- Server Components by default. Client islands only where DESIGN.md lists one
  (`BioTabs`, `CommandPalette`, games, forms…), each with `"use client"` at the top.
- `CommandPalette` is dynamically imported on first ⌘K.
- Content: MDX in `src/content/<collection>/<slug>.mdx`, structured data in `src/data/`.
  Collections are `blog`, `notes`, `projets`; the loader is `src/lib/content/loader.ts` and
  the MDX element map is `components/mdx/mdx-components.tsx`.
- `src/lib/content/loader.ts` is the only module allowed to touch the filesystem. Every read
  lives in a `use cache` scope — `cacheComponents` is on, so an uncached `await readFile()`
  in a component is a build error. Keep `cacheLife` / `cacheTag` at the call site.
- Cached values are serialized: no `Date`, `URL` or class instance in `EntryMeta`. Dates are
  ISO `YYYY-MM-DD` strings, formatted by `src/lib/content/format.ts`.

## Dependencies

Closed list (see DESIGN.md § Dependencies). Any addition is justified in the README.
Prefer a token or a few lines of CSS over a new package.
