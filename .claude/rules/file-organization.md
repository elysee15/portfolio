# File organization — one folder per context

Normative for this repo. Read before creating **any** new file, and before adding a
function to an existing one.

## The rule

Every file belongs to one context (an entity or a domain), and that context is a folder.
A flat `components/` or a catch-all `utils.ts` is a defect, not a starting point.

```
app/                        routes only — no logic, no markup worth naming
components/
  home/                     sections of `/` (intro, bio-tabs, experience, experience-board)
  layout/                   shell: site-header, nav-link, illustration-slot, providers, theme-toggle
  content/                  renders a content entry: article, case-study, post-list, notes-grid
  mdx/                      the MDX element map and its building blocks
  ui/                       context-free primitives: button, text-link (shadcn lands here)
src/
  data/<entity>.ts          editorial data, typed, serializable
  lib/<entity>/<topic>.ts   derivations over one entity (experience/timeline.ts, content/loader.ts)
  utils/<primitive>.ts      framework-free, entity-free primitives (date.ts)
```

## Where a piece of code goes

Ask in this order, stop at the first yes:

1. **Does it know a React/Next API?** → `components/<context>/` (or `app/` if it's a route).
2. **Does it know one entity by name** (`ExperienceEntry`, `EntryMeta`)? → `src/lib/<entity>/`.
3. **Does it know nothing but a primitive** (a date string, a slug, a number)? → `src/utils/<primitive>.ts`.
4. **Is it a literal the author edits, not the developer?** → `src/data/<entity>.ts`.

A name tells you when you got it wrong: `utils/experience.ts` mixes layers 2 and 3,
`lib/helpers.ts` names no context, `components/card.tsx` sits in no folder.

## Component files

- A Server Component computes nothing inline that a `src/lib/` function could own. It
  reads data, calls the derivation, renders. `components/home/experience.tsx` is the
  reference shape — ~25 lines, no maths.
- A client island takes **plain serialized props**. Types for those props live next to the
  derivation that produces them (`src/lib/experience/timeline.ts`), not in the island —
  the island imports them, so the server stays the single source of the shape.
- One exported component per file, named after the file. No barrel `index.ts`: imports are
  explicit paths so a move is a grep, not a mystery.

## Before writing a new function

- Grep for the behaviour first (`Intl.`, `new Date(`, `slice(0, 4)`, the verb in its name).
  A second `Intl.DateTimeFormat` anywhere in the repo means the first one was in the wrong
  place — move it to `src/utils/date.ts` and have both callers import it.
- Two call sites is the threshold for extraction, not three. One call site plus an obvious
  second is already two.
- Prefer moving an existing function over writing a parallel one. Duplicated maths with
  different names is the failure this rule exists to prevent.

## Imports

- Always the `@/` alias, never `../..`.
- `src/utils/` imports nothing from the app. `src/lib/` imports `src/data/` and
  `src/utils/`. `components/` imports from all of them. Never the reverse — a
  `src/lib/` file importing a component is a boundary violation.
- `src/lib/content/loader.ts` stays the only module touching the filesystem (see CLAUDE.md).
