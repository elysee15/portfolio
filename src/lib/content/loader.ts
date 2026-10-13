/**
 * The only module that touches the filesystem. Everything else reads content
 * through these four functions.
 *
 * `cacheComponents` is on, so an uncached `await readFile()` inside a component
 * is a validation error: each exported function opens its own `use cache`
 * scope. The `cacheLife` / `cacheTag` preamble stays at the call site — the
 * function's location is part of the cache key and hoisting it into a helper
 * would collapse distinct entries.
 *
 * Content lives at `src/content/<locale>/<collection>/<slug>.mdx`. A slug does
 * not have to exist in every locale: when a translation is missing the default
 * locale's file is served instead and `meta.fallbackFrom` records it, so a page
 * can say which language the reader is actually getting.
 */

import "server-only";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { cacheLife, cacheTag } from "next/cache";
import readingTime from "reading-time";
import { parse as parseYaml } from "yaml";

import { type Locale, routing } from "@/src/i18n/routing";

import { collections } from "./collections";
import type { CollectionName, Entry, EntryMeta } from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
/** The slug comes from the URL; anything else must never reach `path.join`. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MDX_EXTENSION = ".mdx";

function collectionDir(locale: Locale, collection: CollectionName): string {
  return path.join(CONTENT_ROOT, locale, collections[collection].dir);
}

function isMissing(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ENOENT"
  );
}

/** Drafts stay readable in development and 404 in production. */
function isPublished(meta: { draft: boolean }): boolean {
  return !meta.draft || process.env.NODE_ENV !== "production";
}

/** Newest first; ties broken on slug so the build output is deterministic. */
function byDateDesc(a: EntryMeta, b: EntryMeta): number {
  return b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug);
}

/** Projects read as a timeline of years before they read as a feed. */
function byYearDesc(a: EntryMeta, b: EntryMeta): number {
  const yearA = "year" in a ? a.year : 0;
  const yearB = "year" in b ? b.year : 0;
  return yearB - yearA || byDateDesc(a, b);
}

function sortFor(collection: CollectionName) {
  return collection === "projets" ? byYearDesc : byDateDesc;
}

/** The locale actually read, then the one to fall back to. */
function readOrder(locale: Locale): readonly Locale[] {
  return locale === routing.defaultLocale
    ? [routing.defaultLocale]
    : [locale, routing.defaultLocale];
}

/**
 * Splits and validates one file. Zod's own message dumps the offending value
 * and no filename, which is unusable in a `next build` log — the repo-relative
 * path goes first, then one line per issue.
 */
function parseEntry<C extends CollectionName>(
  locale: Locale,
  collection: C,
  slug: string,
  raw: string,
): Entry<C> {
  const filePath = `src/content/${locale}/${collection}/${slug}${MDX_EXTENSION}`;
  const match = FRONTMATTER.exec(raw);

  if (!match) {
    throw new Error(`${filePath} : en-tête frontmatter YAML manquant.`);
  }

  const body = raw.slice(match[0].length);
  const result = collections[collection].schema.safeParse(parseYaml(match[1]));

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  · ${issue.path.join(".") || "(racine)"} : ${issue.message}`)
      .join("\n");
    throw new Error(`Frontmatter invalide — ${filePath}\n${issues}`);
  }

  const frontmatter = result.data as Record<string, unknown>;

  return {
    meta: {
      ...frontmatter,
      collection,
      slug,
      locale,
      fallbackFrom: null,
      filePath,
      readingMinutes: Math.max(1, Math.round(readingTime(body).minutes)),
    } as EntryMeta<C>,
    body,
  };
}

async function readEntry<C extends CollectionName>(
  locale: Locale,
  collection: C,
  slug: string,
): Promise<Entry<C> | null> {
  if (!SLUG.test(slug)) return null;

  try {
    const raw = await readFile(
      path.join(collectionDir(locale, collection), `${slug}${MDX_EXTENSION}`),
      "utf8",
    );
    return parseEntry(locale, collection, slug, raw);
  } catch (error: unknown) {
    if (isMissing(error)) return null;
    throw error;
  }
}

async function readAll<C extends CollectionName>(
  locale: Locale,
  collection: C,
): Promise<readonly Entry<C>[]> {
  const dir = collectionDir(locale, collection);
  let files: string[];

  try {
    const dirents = await readdir(dir, { withFileTypes: true });
    files = dirents
      .filter((d) => d.isFile() && d.name.endsWith(MDX_EXTENSION))
      .map((d) => d.name.slice(0, -MDX_EXTENSION.length));
  } catch (error: unknown) {
    // A locale that has not been translated yet simply has no directory.
    if (isMissing(error)) return [];
    throw error;
  }

  const entries = await Promise.all(
    files.map(async (slug) => {
      const raw = await readFile(path.join(dir, `${slug}${MDX_EXTENSION}`), "utf8");
      return parseEntry(locale, collection, slug, raw);
    }),
  );

  return entries.filter((entry) => isPublished(entry.meta));
}

/** Flags an entry as served in a language the reader did not ask for. */
function asFallback<C extends CollectionName>(
  entry: Entry<C>,
  requested: Locale,
): Entry<C> {
  if (entry.meta.locale === requested) return entry;
  return {
    ...entry,
    meta: { ...entry.meta, fallbackFrom: entry.meta.locale },
  };
}

/**
 * Every slug of a collection, across every locale. The union is deliberate:
 * a page must exist in both languages even when only one translation is
 * written, because the untranslated one falls back rather than 404s.
 *
 * Throws rather than returning `[]`: `cacheComponents` rejects an empty
 * `generateStaticParams`, and its own error doesn't say which directory is empty.
 */
export async function getSlugs(
  collection: CollectionName,
): Promise<readonly string[]> {
  "use cache";
  cacheLife("max");
  cacheTag("content", `content:${collection}`);

  const perLocale = await Promise.all(
    routing.locales.map((locale) => readAll(locale, collection)),
  );

  // The default locale wins ties, so ordering follows the language that is
  // guaranteed to be complete.
  const bySlug = new Map<string, EntryMeta>();
  for (const entries of perLocale) {
    for (const { meta } of entries) {
      const seen = bySlug.get(meta.slug);
      if (!seen || seen.locale !== routing.defaultLocale) bySlug.set(meta.slug, meta);
    }
  }

  if (bySlug.size === 0) {
    throw new Error(
      `src/content/*/${collection}/ ne contient aucun fichier .mdx publié — ` +
        "generateStaticParams doit renvoyer au moins un paramètre (cacheComponents).",
    );
  }

  return [...bySlug.values()]
    .sort(sortFor(collection))
    .map((meta) => meta.slug);
}

/**
 * `null` for an unknown slug, a malformed slug, or a draft in production.
 * Falls back to the default locale when the requested translation is missing.
 */
export async function getEntry<C extends CollectionName>(
  collection: C,
  slug: string,
  locale: Locale,
): Promise<Entry<C> | null> {
  "use cache";
  cacheLife("max");
  cacheTag(
    "content",
    `content:${locale}`,
    `content:${locale}:${collection}`,
    `content:${locale}:${collection}:${slug}`,
  );

  for (const candidate of readOrder(locale)) {
    const entry = await readEntry(candidate, collection, slug);
    if (entry && isPublished(entry.meta)) return asFallback(entry, locale);
  }

  return null;
}

/**
 * Metadata only — list pages never compile the MDX bodies they link to.
 * Untranslated entries appear in the default locale rather than disappearing.
 */
export async function getEntries<C extends CollectionName>(
  collection: C,
  locale: Locale,
): Promise<readonly EntryMeta<C>[]> {
  "use cache";
  cacheLife("max");
  cacheTag("content", `content:${locale}`, `content:${locale}:${collection}`);

  const bySlug = new Map<string, EntryMeta<C>>();

  // Reverse order: the requested locale is read last and overwrites the fallback.
  for (const candidate of [...readOrder(locale)].reverse()) {
    for (const { meta } of await readAll(candidate, collection)) {
      bySlug.set(meta.slug, meta as EntryMeta<C>);
    }
  }

  return [...bySlug.values()]
    .map((meta) =>
      meta.locale === locale ? meta : { ...meta, fallbackFrom: meta.locale },
    )
    .sort(sortFor(collection) as (a: EntryMeta<C>, b: EntryMeta<C>) => number);
}

/** Previous / next in reading order, for the footer of a detail page. */
export async function getAdjacent<C extends CollectionName>(
  collection: C,
  slug: string,
  locale: Locale,
): Promise<{ previous: EntryMeta<C> | null; next: EntryMeta<C> | null }> {
  "use cache";
  cacheLife("max");
  cacheTag(
    "content",
    `content:${locale}`,
    `content:${locale}:${collection}`,
    `content:${locale}:${collection}:${slug}`,
  );

  const entries = await getEntries(collection, locale);
  const index = entries.findIndex((meta) => meta.slug === slug);

  if (index === -1) return { previous: null, next: null };

  return {
    previous: entries[index - 1] ?? null,
    next: entries[index + 1] ?? null,
  };
}
