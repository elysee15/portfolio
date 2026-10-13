/**
 * Date primitives, pinned to UTC so `2026-03-01` never renders as
 * « 28 février ». Nothing here knows about a collection or a section — anything
 * domain-shaped (reading time, period labels) belongs to that domain's module.
 *
 * Every formatter takes the BCP 47 tag of the active language. The `Intl`
 * objects are memoized per tag: constructing one is the expensive part, and the
 * app only ever asks for two.
 *
 * Two string shapes circulate in the app, both serializable so they survive a
 * `use cache` boundary:
 * - `IsoDate`  — `YYYY-MM-DD`, content front matter
 * - `IsoMonth` — `YYYY-MM`, coarse timeline data
 */

/** `YYYY-MM-DD`. */
export type IsoDate = string;

/** `YYYY-MM`. */
export type IsoMonth = string;

/** A BCP 47 tag, e.g. `"fr"` or `"en"`. */
export type LocaleTag = string;

function memoize(
  options: Intl.DateTimeFormatOptions,
): (locale: LocaleTag) => Intl.DateTimeFormat {
  const cache = new Map<LocaleTag, Intl.DateTimeFormat>();

  return (locale) => {
    let formatter = cache.get(locale);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat(locale, options);
      cache.set(locale, formatter);
    }
    return formatter;
  };
}

const longDateFormatter = memoize({
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const shortMonthFormatter = memoize({
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const monthNameFormatter = memoize({ month: "short", timeZone: "UTC" });

/** `"2026-03-14"` → `"14 mars 2026"`. */
export function formatLongDate(iso: IsoDate, locale: LocaleTag): string {
  return longDateFormatter(locale).format(new Date(`${iso}T00:00:00Z`));
}

/** `"2026-02"` → `"Févr. 2026"`. Intl lowercases the month in French. */
export function formatShortMonth(month: IsoMonth, locale: LocaleTag): string {
  const label = shortMonthFormatter(locale).format(
    new Date(`${month}-01T00:00:00Z`),
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** `"2020-01"`, `"2023-03"` → `39`. Inclusive, so a one-month span counts as 1. */
export function monthsBetween(start: IsoMonth, end: IsoMonth): number {
  const [startYear, startMonth] = start.split("-").map(Number);
  const [endYear, endMonth] = end.split("-").map(Number);
  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}

/** The month this render happens in, `YYYY-MM`. */
export function currentMonth(): IsoMonth {
  return new Date().toISOString().slice(0, 7);
}

/**
 * `"2026-01-04"` → `"janv"`. Bare month name, lowercase and without the
 * abbreviation dot French `Intl` adds — a column header, not a sentence.
 */
export function formatMonthName(iso: IsoDate, locale: LocaleTag): string {
  return monthNameFormatter(locale)
    .format(new Date(`${iso}T00:00:00Z`))
    .replace(/\.$/, "");
}

/** `0` Sunday → `6` Saturday, in UTC so the index never shifts by a timezone. */
export function weekdayIndex(iso: IsoDate): number {
  return new Date(`${iso}T00:00:00Z`).getUTCDay();
}

/** The year part of either shape: `"2023-06"` → `"2023"`. */
export function yearOf(value: IsoDate | IsoMonth): string {
  return value.slice(0, 4);
}
