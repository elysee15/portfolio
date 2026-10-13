import { getLocale, getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";

import { ExperienceBoard } from "@/components/home/experience-board";
import { experience, experienceTodo } from "@/src/data/experience";
import { buildRows, buildSegments } from "@/src/lib/experience/timeline";
import { currentMonth } from "@/src/utils/date";

/**
 * Home « Expérience » section. Server Component: the dates and the segment
 * ratios are computed here, and only `ExperienceBoard` — which needs hover
 * state to link a row to its segment — crosses into the client.
 */
export async function Experience() {
  "use cache";
  // The ongoing job's segment grows with the calendar, so the render is pinned
  // to a daily cache entry rather than read at request time.
  cacheLife("days");

  const t = await getTranslations("Home");
  const locale = await getLocale();
  const periodOptions = { locale, present: t("present") };

  return (
    <section id="experience" className="flex scroll-mt-8 flex-col gap-4">
      <h2 className="text-h2">{t("experience")}</h2>

      <ExperienceBoard
        entries={buildRows(experience, periodOptions)}
        segments={buildSegments(experience, currentMonth())}
        todo={experienceTodo[locale]}
      />
    </section>
  );
}
