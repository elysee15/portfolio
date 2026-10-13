/**
 * The GitHub contribution calendar, reduced to what the « Activité » section
 * draws. Network-only — `src/lib/content/loader.ts` stays the single module
 * allowed to touch the filesystem, and nothing here imports React.
 *
 * Everything returned crosses a `use cache` boundary, so the shapes stay
 * JSON-serializable: ISO `YYYY-MM-DD` strings, numbers, nothing else.
 */

import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { weekdayIndex, type IsoDate } from "@/src/utils/date";

const ENDPOINT = "https://api.github.com/graphql";

/**
 * `contributionsCollection` with no range returns the trailing year, which is
 * exactly the window the grid shows — asking for dates would only let the
 * cached entry and the calendar drift apart.
 */
const QUERY = `query Contributions($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}`;

/** `0` none → `4` the busiest quartile. Index into the opacity ramp. */
export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  date: IsoDate;
  count: number;
  level: ContributionLevel;
}

/** Sunday → Saturday, one grid column. The first and last are partial. */
export interface ContributionWeek {
  /** The week's first day — a stable React key for the column. */
  id: IsoDate;
  /**
   * Empty cells above the first day, `0` for a full week. The trailing week
   * needs none: it simply stops early at the bottom of its column.
   */
  offset: number;
  days: readonly ContributionDay[];
}

export interface ContributionCalendar {
  total: number;
  weeks: readonly ContributionWeek[];
  start: IsoDate;
  end: IsoDate;
}

const LEVELS: Readonly<Record<string, ContributionLevel>> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

interface ApiDay {
  date: string;
  contributionCount: number;
  contributionLevel: string;
}

interface ApiResponse {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: { contributionDays: ApiDay[] }[];
        };
      };
    } | null;
  };
  errors?: { message: string }[];
}

function toDay(day: ApiDay): ContributionDay {
  return {
    date: day.date,
    count: day.contributionCount,
    level: LEVELS[day.contributionLevel] ?? 0,
  };
}

/** A hung connection must not stall the render of the whole home page. */
const TIMEOUT_MS = 5000;

/**
 * Why three outcomes rather than a `null` or a throw: the section phrases a
 * missing token and an API outage differently, and a throw is not an option —
 * an error raised inside a `use cache` scope fails `next build`, caught by the
 * caller or not. A GitHub blip must cost a block of the page, never a deploy.
 */
export type CalendarResult =
  | { status: "ok"; calendar: ContributionCalendar }
  | { status: "no-token" }
  | { status: "unavailable" };

/**
 * The trailing year of contributions.
 *
 * `cacheLife("hours")` rather than `"days"`: the same entry holds successes
 * and failures, and a rate-limited afternoon must not pin « indisponible » to
 * the page until tomorrow. The graph moves by one column a week — an hourly
 * refetch is free at the scale of one page, and the ceiling is 24 calls a day
 * against a 5 000/hour quota.
 */
export async function getContributionCalendar(
  login: string,
): Promise<CalendarResult> {
  "use cache";
  cacheLife("hours");
  cacheTag("github", "github:contributions");

  const token = process.env.GITHUB_TOKEN;
  if (!token) return { status: "no-token" };

  let payload: ApiResponse;

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) return { status: "unavailable" };
    payload = (await response.json()) as ApiResponse;
  } catch {
    // Network error, DNS, or the 5s timeout above.
    return { status: "unavailable" };
  }

  const calendar =
    payload.data?.user?.contributionsCollection.contributionCalendar;

  if (payload.errors?.length || !calendar) return { status: "unavailable" };

  const weeks = calendar.weeks
    .filter((week) => week.contributionDays.length > 0)
    .map((week) => ({
      id: week.contributionDays[0].date,
      offset: weekdayIndex(week.contributionDays[0].date),
      days: week.contributionDays.map(toDay),
    }));

  if (weeks.length === 0) return { status: "unavailable" };

  const lastWeek = weeks[weeks.length - 1];

  return {
    status: "ok",
    calendar: {
      total: calendar.totalContributions,
      weeks,
      start: weeks[0].days[0].date,
      end: lastWeek.days[lastWeek.days.length - 1].date,
    },
  };
}
