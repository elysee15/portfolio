import type { Locale } from "@/src/i18n/routing";
import type { ProjectEntry, ProjectKind } from "@/src/data/projects";

/** The board's own labels, translated by the caller. */
export interface ProjectsDictionary {
  allProjects: string;
  company: string;
  personal: string;
  filterLabel: string;
  labLink: string;
}

/**
 * One row of the board, already localized and already resolved to a link. The
 * client island receives only this — plain strings, nothing to derive and no
 * locale lookup to repeat in the browser.
 */
export interface ProjectRowData {
  slug: string;
  name: string;
  /** Company for a company project, year for a personal one. */
  meta: string;
  desc: string;
  /** Where the row points, when it points anywhere. */
  href?: string;
  /** A live product opens in a new tab; a case study is a `next/link`. */
  external: boolean;
}

/** One tab of the « Tous les projets » board: its label, its count, its rows. */
export interface ProjectGroup {
  id: ProjectKind;
  label: string;
  count: number;
  entries: readonly ProjectRowData[];
}

export interface GroupOptions {
  locale: Locale;
  /** Tab labels, already translated — `buildProjectGroups` never looks one up. */
  words: ProjectsDictionary;
  /**
   * Slugs that have an MDX case study under `src/content/projets/`. A row
   * points at `/projets/<slug>` only when its page exists — the rest fall back
   * to the live product, and a project with neither stays plain text rather
   * than promising a 404.
   */
  caseStudies: readonly string[];
}

/** Tab order on the page — `projects` itself stays a flat, editable list. */
const ORDER: readonly ProjectKind[] = ["entreprise", "personnel"];

function labelOf(kind: ProjectKind, words: ProjectsDictionary): string {
  return kind === "entreprise" ? words.company : words.personal;
}

/** Company projects are placed by employer, personal ones by year. */
export function metaOf(entry: ProjectEntry): string {
  return (entry.kind === "entreprise" ? entry.company : entry.year) ?? "TODO";
}

/**
 * Splits the flat project list into the board's tabs, counted. Empty groups are
 * dropped: a « Personnel 0 » tab would advertise a hole rather than fill one.
 */
export function buildProjectGroups(
  entries: readonly ProjectEntry[],
  { locale, words, caseStudies }: GroupOptions,
): readonly ProjectGroup[] {
  const written = new Set(caseStudies);

  return ORDER.map((kind) => {
    const matching = entries
      .filter((entry) => entry.kind === kind)
      .map((entry) => toRow(entry, locale, written));

    return {
      id: kind,
      label: labelOf(kind, words),
      count: matching.length,
      entries: matching,
    };
  }).filter((group) => group.count > 0);
}

function toRow(
  entry: ProjectEntry,
  locale: Locale,
  written: ReadonlySet<string>,
): ProjectRowData {
  const caseStudy = written.has(entry.slug);

  return {
    slug: entry.slug,
    name: entry.name,
    meta: metaOf(entry),
    desc: entry.desc[locale],
    href: caseStudy ? `/projets/${entry.slug}` : entry.href,
    external: !caseStudy && Boolean(entry.href),
  };
}

/**
 * Rows across every tab — the figure beside the section title. Summed from the
 * groups, not from the flat list, so the total never counts a row no tab shows.
 */
export function countProjects(groups: readonly ProjectGroup[]): number {
  return groups.reduce((total, group) => total + group.count, 0);
}
