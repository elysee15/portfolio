/**
 * Derivations over a `ContributionCalendar`: the shapes the grid island
 * renders. Pure and framework-free — the island takes plain serialized props,
 * so the `Intl` setup of `src/utils/date.ts` never reaches the client bundle.
 *
 * The readout of a single day is a translated sentence, so the caller passes it
 * in rather than this module phrasing it: a `src/lib/` derivation knows the
 * entity, not the language.
 */

import { formatMonthName, type LocaleTag } from "@/src/utils/date";

import type { ContributionCalendar, ContributionLevel } from "./contributions";

export interface GridDay {
  date: string;
  level: ContributionLevel;
  /** `"3 contribution(s) · 29 avril 2026"` — the readout reads this verbatim. */
  label: string;
}

export interface GridWeek {
  id: string;
  /** Empty cells above the first day, `0` for a full week. */
  offset: number;
  days: readonly GridDay[];
}

/**
 * Minimum columns between two month labels, and before the end of the grid.
 * A label is ~3 columns wide at the reading width: closer than that and
 * « sept » prints over « oct ». The trailing month loses its label rather
 * than overflow the row — the year opens and closes on the same month.
 */
const LABEL_COLUMNS = 3;

/** Weekdays — the graph's rows, and the game board's. */
export const WEEK_ROWS = 7;

/**
 * The graph as a rectangle: one column per week, seven levels down. The days
 * missing from the first and last weeks read as level 0 rather than as holes,
 * which is what lets the game run on the full rectangle — a snake that died
 * on an absent Tuesday would be a puzzle, not a rule.
 */
export function buildLevelColumns(
  weeks: readonly GridWeek[],
): readonly (readonly ContributionLevel[])[] {
  return weeks.map((week) =>
    Array.from(
      { length: WEEK_ROWS },
      (_, row) => week.days[row - week.offset]?.level ?? 0,
    ),
  );
}

/** Phrases one cell, e.g. `"3 contributions · 29 avril 2026"`. */
export type DayLabel = (count: number, date: string) => string;

export function buildGrid(
  calendar: ContributionCalendar,
  dayLabel: DayLabel,
): readonly GridWeek[] {
  return calendar.weeks.map((week) => ({
    id: week.id,
    offset: week.offset,
    days: week.days.map((day) => ({
      date: day.date,
      level: day.level,
      label: dayLabel(day.count, day.date),
    })),
  }));
}

/**
 * One entry per week, aligned with `buildGrid`: the month name when that week
 * opens a new month and there is room to print it, `null` otherwise. The
 * header row then maps over the same columns as the grid, so a label always
 * sits above the week its month starts in.
 */
export function buildMonthLabels(
  calendar: ContributionCalendar,
  locale: LocaleTag,
): readonly (string | null)[] {
  const total = calendar.weeks.length;
  let previousMonth = "";
  let lastLabelled = -LABEL_COLUMNS;

  return calendar.weeks.map((week, index) => {
    const month = week.id.slice(0, 7);
    const isNewMonth = month !== previousMonth;
    previousMonth = month;

    const hasRoom =
      index - lastLabelled >= LABEL_COLUMNS &&
      total - index >= LABEL_COLUMNS;

    if (!isNewMonth || !hasRoom) return null;

    lastLabelled = index;
    return formatMonthName(week.id, locale);
  });
}
