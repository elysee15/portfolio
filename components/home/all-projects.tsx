import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { ProjectBoard } from "@/components/home/project-board";
import type { Locale } from "@/src/i18n/routing";
import { projects, projectsLink, projectsTodo } from "@/src/data/projects";
import { getSlugs } from "@/src/lib/content/loader";
import {
  buildProjectGroups,
  countProjects,
  type ProjectsDictionary,
} from "@/src/lib/projects/groups";
import { getProjectsWithPreview } from "@/src/lib/projects/preview";

export async function AllProjects() {
  const t = await getTranslations("Projects");
  const locale = (await getLocale()) as Locale;

  // Resolved here so the island gets plain strings — it never looks a label up.
  const words: ProjectsDictionary = {
    allProjects: t("allProjects"),
    company: t("company"),
    personal: t("personal"),
    filterLabel: t("filterLabel"),
    labLink: t("labLink"),
  };

  const groups = buildProjectGroups(projects, {
    locale,
    words,
    caseStudies: await getSlugs("projets"),
  });

  return (
    <section id="projets" aria-labelledby="h-proj">
      <Suspense fallback={null}>
        <ProjectBoard
          groups={groups}
          total={countProjects(groups)}
          withPreview={getProjectsWithPreview(projects)}
          words={words}
          link={{ href: projectsLink.href, label: words.labLink }}
          todo={projectsTodo[locale]}
        />
      </Suspense>
    </section>
  );
}
