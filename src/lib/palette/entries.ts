import { matches } from "@/src/utils/text";

/**
 * Everything the ⌘K palette can reach, flattened on the server. The island
 * receives plain strings: no locale lookup, no filesystem, nothing to derive in
 * the browser (file-organization.md § Component files).
 *
 * Group and route names are translated, so the caller hands in a lookup instead
 * of this module spelling them out. Entry titles come from the content itself
 * and are already in the right language.
 */
export interface PaletteEntry {
  /** Stable across renders — it is the `aria-activedescendant` target. */
  id: string;
  /** Stable key, never shown. Grouping and tests key off this. */
  group: PaletteGroup;
  /** The group's heading in the active language. */
  groupLabel: string;
  label: string;
  href: string;
}

export type PaletteGroup =
  | "sections"
  | "pages"
  | "projets"
  | "notes"
  | "blog";

/** Home sections, in the order the page renders them. */
export type PaletteSection = "bio" | "experience" | "activite" | "projets";

/** Routes with a page behind them. A palette must never offer a 404. */
export type PalettePage =
  | "home"
  | "projets"
  | "blog"
  | "notes"
  | "lab"
  | "contact"
  | "cv";

/**
 * Every name the palette prints that is not an entry title, resolved to the
 * active language. A record rather than a translator: a missing label is then
 * a type error at the call site instead of a key that renders as itself.
 */
export interface PaletteLabels {
  groups: Readonly<Record<PaletteGroup, string>>;
  sections: Readonly<Record<PaletteSection, string>>;
  pages: Readonly<Record<PalettePage, string>>;
}

/** One content entry, reduced to what the palette shows. */
export interface PaletteContentEntry {
  slug: string;
  title: string;
}

export interface PaletteContent {
  blog: readonly PaletteContentEntry[];
  notes: readonly PaletteContentEntry[];
  projets: readonly PaletteContentEntry[];
}

const SECTIONS: readonly PaletteSection[] = [
  "bio",
  "experience",
  "activite",
  "projets",
];

const PAGES: readonly { href: string; key: PalettePage }[] = [
  { href: "/", key: "home" },
  { href: "/projets", key: "projets" },
  { href: "/blog", key: "blog" },
  { href: "/notes", key: "notes" },
  { href: "/lab", key: "lab" },
  { href: "/contact", key: "contact" },
  { href: "/cv", key: "cv" },
];

const COLLECTIONS: readonly {
  key: keyof PaletteContent;
  group: PaletteGroup;
  base: string;
}[] = [
  { key: "projets", group: "projets", base: "/projets" },
  { key: "notes", group: "notes", base: "/notes" },
  { key: "blog", group: "blog", base: "/blog" },
];

export function buildPaletteEntries(
  content: PaletteContent,
  labels: PaletteLabels,
): PaletteEntry[] {
  const sections = SECTIONS.map((id) => ({
    id: `section-${id}`,
    group: "sections" as const,
    groupLabel: labels.groups.sections,
    label: labels.sections[id],
    href: `/#${id}`,
  }));

  const pages = PAGES.map(({ href, key }) => ({
    id: `page-${href}`,
    group: "pages" as const,
    groupLabel: labels.groups.pages,
    label: labels.pages[key],
    href,
  }));

  const documents = COLLECTIONS.flatMap(({ key, group, base }) =>
    content[key].map((entry) => ({
      id: `${key}-${entry.slug}`,
      group,
      groupLabel: labels.groups[group],
      label: entry.title,
      href: `${base}/${entry.slug}`,
    })),
  );

  return [...sections, ...pages, ...documents];
}

/** Accent-insensitive filter, order preserved — groups keep their page order. */
export function filterEntries(
  entries: readonly PaletteEntry[],
  query: string,
): PaletteEntry[] {
  return entries.filter((entry) => matches(entry.label, query));
}
