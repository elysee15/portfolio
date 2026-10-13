/**
 * Number primitives. One formatter per language, built on first use —
 * constructing an `Intl` object per call is the expensive part.
 */

import type { LocaleTag } from "@/src/utils/date";

const integerFormatters = new Map<LocaleTag, Intl.NumberFormat>();

/** `1003` → `"1 003"` in French, `"1,003"` in English. */
export function formatInteger(value: number, locale: LocaleTag): string {
  let formatter = integerFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    integerFormatters.set(locale, formatter);
  }
  return formatter.format(value);
}
