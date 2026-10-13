/**
 * Shapes for editorial copy that exists in each language.
 *
 * Structured data in `src/data/` uses these instead of a bare `string` wherever
 * the value is prose a reader sees. Short UI labels do not: those live in
 * `src/i18n/messages/`, keyed, because the developer edits them and the author
 * does not.
 */

import type { Locale } from "@/src/i18n/routing";

/** One sentence per language. */
export type Localized = Record<Locale, string>;

/** One list per language — a tagline, a set of paragraphs, bullet points. */
export type LocalizedList = Record<Locale, readonly string[]>;
