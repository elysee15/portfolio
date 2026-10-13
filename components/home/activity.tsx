import { getLocale, getTranslations } from "next-intl/server";

import { ActivityBoard } from "@/components/home/activity-board";
import { GithubHandle } from "@/components/home/github-handle";
import { profile } from "@/src/data/profile";
import { getContributionCalendar } from "@/src/lib/github/contributions";
import { buildGrid, buildMonthLabels } from "@/src/lib/github/grid";
import { formatLongDate } from "@/src/utils/date";
import { formatInteger } from "@/src/utils/number";

/**
 * Home « Activité » section: the trailing year of GitHub contributions, drawn
 * in `--fg` opacity steps (DESIGN.md § Other features). Server Component —
 * the fetch, the phrasing and the grid maths all happen here, and only
 * `ContributionGrid`, whose readout follows the pointer, is a client island.
 *
 * The `use cache` scope lives in the loader, which answers with a status
 * rather than a throw — see `CalendarResult`. The three branches below are
 * that status: the graph, an API outage, or a missing token.
 */
export async function Activity() {
  const t = await getTranslations("Home");
  const locale = await getLocale();
  const result = await getContributionCalendar(profile.github);

  return (
    <section id="activite" className="flex scroll-mt-8 flex-col gap-4">
      {result.status === "ok" ? (
        <ActivityBoard
          weeks={buildGrid(result.calendar, (count, date) =>
            t("contributionsDay", {
              count,
              date: formatLongDate(date, locale),
            }),
          )}
          months={buildMonthLabels(result.calendar, locale)}
          total={t("contributionsTotal", {
            total: formatInteger(result.calendar.total, locale),
            count: result.calendar.total,
          })}
          label={t("contributions")}
          github={profile.github}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="text-h2">{t("activity")}</h2>
            <span className="text-meta">
              <GithubHandle handle={profile.github} />
            </span>
          </div>
          <p className="text-muted-foreground">
            {result.status === "unavailable"
              ? t("contributionsUnavailable")
              : t("contributionsNoToken")}
          </p>
        </>
      )}
    </section>
  );
}
