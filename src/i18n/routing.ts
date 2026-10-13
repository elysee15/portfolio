/**
 * The single source of truth for which languages exist and how they appear in
 * the URL.
 *
 * `localePrefix: "never"` means no locale ever shows up in a pathname: `/projets`
 * serves French or English depending on the `NEXT_LOCALE` cookie, and the proxy
 * rewrites it to `/fr/projets` or `/en/projets` internally. Both variants are
 * still prerendered, so this costs nothing at request time.
 *
 * The trade-off is that alternate links are impossible — one URL cannot be two
 * languages for a crawler — so only the default locale is indexable. Switching
 * `localePrefix` to "as-needed" is the escape hatch; nothing else here changes.
 */
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "never",
});

/** The language a page renders in. Serializable, so it crosses `use cache`. */
export type Locale = (typeof routing.locales)[number];

/** Narrows an unknown segment value, e.g. the `[locale]` catch-all. */
export function isLocale(value: unknown): value is Locale {
  return routing.locales.includes(value as Locale);
}
