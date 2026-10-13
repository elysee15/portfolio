/**
 * Derivations over `src/data/experience.ts`: the shapes the « Expérience »
 * section renders. Pure and framework-free — the components only map over the
 * result, so the maths is testable without React and the `Intl` setup stays out
 * of the client bundle.
 */

import type { ExperienceEntry } from "@/src/data/experience";
import type { Locale } from "@/src/i18n/routing";
import {
  currentMonth,
  formatShortMonth,
  monthsBetween,
  yearOf,
} from "@/src/utils/date";

export interface ExperienceSegment {
  id: string;
  /** Start year, printed under the segment. */
  year: string;
  /** Length of the job in months — the segment's share of the bar. */
  months: number;
}

/**
 * One row of the board, resolved to the active language and already formatted.
 * The island receives only this — plain strings, no `Intl` and no locale lookup
 * repeated in the browser (file-organization.md § Component files).
 */
export interface ExperienceRow {
  id: string;
  company: string;
  role: string;
  /** `"Févr. 2026 — aujourd’hui"`. */
  period: string;
  summary: string;
  details: readonly string[];
  stack: readonly string[];
}

/**
 * How the period prints. `present` is the word for an ongoing job, translated
 * by the caller — this module knows the entity, not the language.
 */
export interface PeriodOptions {
  locale: Locale;
  present: string;
}

/** `"Févr. 2026 — aujourd’hui"` while the job is current. */
export function formatPeriod(
  entry: ExperienceEntry,
  { locale, present }: PeriodOptions,
): string {
  const start = formatShortMonth(entry.start, locale);
  return entry.end
    ? `${start} — ${formatShortMonth(entry.end, locale)}`
    : `${start} — ${present}`;
}

/**
 * Chronological segments for the bar — the reverse of `entries`, which is
 * newest first. An ongoing job is measured up to `now`, defaulted to the
 * current month so a caller inside a cache scope can pin it.
 */
export function buildSegments(
  entries: readonly ExperienceEntry[],
  now: string = currentMonth(),
): ExperienceSegment[] {
  return [...entries].reverse().map((entry) => ({
    id: entry.id,
    year: yearOf(entry.start),
    months: monthsBetween(entry.start, entry.end ?? now),
  }));
}

/** Entries flattened to the active language, in the order they are rendered. */
export function buildRows(
  entries: readonly ExperienceEntry[],
  options: PeriodOptions,
): readonly ExperienceRow[] {
  const { locale } = options;

  return entries.map((entry) => ({
    id: entry.id,
    company: entry.company,
    role: entry.role[locale],
    period: formatPeriod(entry, options),
    summary: entry.summary[locale],
    details: entry.details[locale],
    stack: entry.stack,
  }));
}
