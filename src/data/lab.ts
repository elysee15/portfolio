/**
 * The Lab page: what I build and learn outside the job. Personal projects come
 * from `src/data/projects.ts` — this file owns only the two groups that have no
 * other home yet, and the copy that says so out loud.
 *
 * Prose is `Localized`, like `projects.ts`: the page reads `[locale]` and never
 * decides a language itself. `TODO` stays a real value — it marks copy that is
 * not written, so the gap shows on the page rather than in a backlog.
 */

import type { Localized } from "@/src/i18n/localized";

export interface LabItem {
  id: string;
  name: string;
  desc: Localized;
  meta: string;
  href?: string;
}

export interface LabGroupData {
  id: "formations" | "autres";
  title: Localized;
  desc: Localized;
  /** Shown instead of the list while the group is empty. */
  todo: Localized;
  items: readonly LabItem[];
}

export const labIntro: Localized = {
  fr: "Ce que je construis et apprends en dehors de mon poste : projets personnels, missions freelance, formations et le reste.",
  en: "What I build and learn outside my job: personal projects, freelance work, training and the rest.",
};

/** The personal-projects group, filled from `projects.ts`. */
export const labPersonal: { title: Localized; desc: Localized } = {
  title: {
    fr: "Projets personnels et freelance",
    en: "Personal and freelance projects",
  },
  desc: {
    fr: "TODO : préciser pour chaque projet s’il est personnel ou réalisé en freelance pour un client.",
    en: "TODO: say for each project whether it is personal or freelance work for a client.",
  },
};

export const labGroups: readonly LabGroupData[] = [
  {
    id: "formations",
    title: { fr: "Formations", en: "Training" },
    desc: {
      fr: "Formations suivies en autonomie.",
      en: "Courses taken on my own.",
    },
    todo: {
      fr: "TODO : ajouter les formations dans src/data/lab.ts (intitulé, organisme, année, lien).",
      en: "TODO: add the courses in src/data/lab.ts (title, provider, year, link).",
    },
    items: [],
  },
  {
    id: "autres",
    title: { fr: "Autres", en: "Other" },
    desc: {
      fr: "Open source, talks, side projects et expérimentations.",
      en: "Open source, talks, side projects and experiments.",
    },
    todo: {
      fr: "TODO : ajouter les autres réalisations dans src/data/lab.ts (nom, description, année, lien).",
      en: "TODO: add the other work in src/data/lab.ts (name, description, year, link).",
    },
    items: [],
  },
];
