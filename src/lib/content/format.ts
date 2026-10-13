/**
 * Rendering helpers for content metadata. The calendar maths and the `Intl`
 * setup live in `src/utils/date.ts` — this module only says how a *content
 * entry* presents them. Reading time is a sentence, not a format, so it is a
 * message key (`Content.readingTime`) rather than a function here.
 */

import { formatLongDate, type IsoDate, type LocaleTag } from "@/src/utils/date";

/** `"2026-03-14"` → `"14 mars 2026"`. */
export function formatDate(iso: IsoDate, locale: LocaleTag): string {
  return formatLongDate(iso, locale);
}

/** Value for the `dateTime` attribute of `<time>`. Already ISO; kept explicit. */
export function formatDateTime(iso: IsoDate): string {
  return iso;
}
