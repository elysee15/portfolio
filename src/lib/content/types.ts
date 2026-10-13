/**
 * Shapes for the MDX content layer. Everything here crosses a `use cache`
 * boundary, so it must stay JSON-serializable: no `Date`, no `URL`, no class
 * instances. Dates are ISO `YYYY-MM-DD` strings, which also sort correctly.
 */

import type { Locale } from "@/src/i18n/routing";

export type CollectionName = "blog" | "notes" | "projets";

/** Validated frontmatter, plus everything derived from the file itself. */
export interface EntryMetaBase {
  collection: CollectionName;
  slug: string;
  /** The language this file is written in — not necessarily the one requested. */
  locale: Locale;
  /**
   * Set when the requested locale had no file and another one was served in its
   * place, so the page can say so. `null` when the translation exists.
   */
  fallbackFrom: Locale | null;
  /** Repo-relative, so build errors name a file you can open. */
  filePath: string;
  title: string;
  description: string;
  /** ISO `YYYY-MM-DD`. Sorting key — never render it raw, use `formatDate`. */
  date: string;
  tags: readonly string[];
  draft: boolean;
  readingMinutes: number;
}

export interface BlogMeta extends EntryMetaBase {
  collection: "blog";
}

export interface NoteMeta extends EntryMetaBase {
  collection: "notes";
}

export interface ProjetCover {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProjetMeta extends EntryMetaBase {
  collection: "projets";
  role: string;
  stack: readonly string[];
  year: number;
  cover: ProjetCover | null;
  url: string | null;
  repo: string | null;
}

export interface MetaByCollection {
  blog: BlogMeta;
  notes: NoteMeta;
  projets: ProjetMeta;
}

export type EntryMeta<C extends CollectionName = CollectionName> =
  MetaByCollection[C];

/** Meta plus the MDX body, frontmatter already stripped. */
export interface Entry<C extends CollectionName = CollectionName> {
  meta: EntryMeta<C>;
  body: string;
}
