/**
 * schema.org graphs, as plain serializable objects.
 *
 * Builders only — nothing here renders. `components/seo/json-ld.tsx` is what
 * puts the result in the document, so this file stays free of React and can be
 * unit-tested as data.
 *
 * `@id` values are URLs with a fragment so the nodes can reference each other:
 * one `Person` is declared once and every article points back at it as its
 * author, instead of repeating the identity on each page.
 */

import { contact } from "@/src/data/contact";
import { profile } from "@/src/data/profile";
import type { Locale } from "@/src/i18n/routing";
import type { EntryMeta } from "@/src/lib/content/types";

import { siteName } from "./metadata";
import { absoluteUrl, siteUrl } from "./site";

/** A schema.org node. Loose on purpose: the vocabulary is open-ended. */
export type JsonLdNode = Record<string, unknown>;

const personId = `${siteUrl}/#person`;
const websiteId = `${siteUrl}/#website`;

/** The author node. Everything else references it by `@id`. */
export function buildPerson(locale: Locale): JsonLdNode {
  return {
    "@type": "Person",
    "@id": personId,
    name: profile.name,
    url: siteUrl,
    jobTitle: profile.role[locale],
    email: `mailto:${contact.email}`,
    image: profile.portrait ? absoluteUrl(profile.portrait.src) : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: contact.city,
      addressCountry: "CI",
    },
    sameAs: [contact.github, contact.linkedin],
  };
}

/** The site node, carrying the Person as its publisher. */
export function buildWebSite(locale: Locale, description: string): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: siteName,
    description,
    inLanguage: locale,
    publisher: { "@id": personId },
  };
}

/**
 * An entry of any collection. `blog` is a `BlogPosting`, the rest are
 * `Article`s — a case study is not a blog post and shouldn't claim to be.
 */
export function buildArticle(meta: EntryMeta, path: string): JsonLdNode {
  return {
    "@type": meta.collection === "blog" ? "BlogPosting" : "Article",
    "@id": `${absoluteUrl(path)}#article`,
    headline: meta.title,
    description: meta.description || undefined,
    datePublished: meta.date,
    dateModified: meta.date,
    inLanguage: meta.locale,
    keywords: meta.tags.length > 0 ? [...meta.tags] : undefined,
    timeRequired: `PT${Math.max(1, Math.round(meta.readingMinutes))}M`,
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) },
    author: { "@id": personId },
    publisher: { "@id": personId },
    isPartOf: { "@id": websiteId },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

/** Breadcrumbs for a detail page — `Accueil › Blog › Titre`. */
export function buildBreadcrumbs(crumbs: readonly Crumb[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** Wraps nodes into the single `@graph` document a page embeds. */
export function buildGraph(nodes: readonly JsonLdNode[]): JsonLdNode {
  return { "@context": "https://schema.org", "@graph": nodes };
}
