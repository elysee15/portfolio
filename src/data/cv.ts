/**
 * The printable CV, minus the experience — that one already lives in
 * `src/data/experience.ts` and is read from there rather than duplicated.
 *
 * `TODO` is a value, not a leftover: it marks copy still to write (the years of
 * each degree) so the gap shows on the page instead of hiding in a backlog.
 */

import type { Localized } from "@/src/i18n/localized";

export interface Degree {
  id: string;
  school: string;
  title: Localized;
  /** `null` until the years are confirmed — rendered as a mono `TODO`. */
  years: string | null;
}

/** Most recent first. */
export const education: readonly Degree[] = [
  {
    id: "agitel",
    school: "AGITEL",
    title: {
      fr: "Licence professionnelle",
      en: "Professional bachelor’s degree",
    },
    years: null,
  },
  {
    id: "groupe-loko",
    school: "Groupe Loko",
    title: { fr: "BTS", en: "Two-year technical diploma" },
    years: null,
  },
];

export interface StackGroup {
  label: Localized;
  items: string;
}

/** Grouped the way the CV reads them, not the way npm installs them. */
export const stackGroups: readonly StackGroup[] = [
  {
    label: { fr: "Langages", en: "Languages" },
    items: "TypeScript, JavaScript, Python, HTML, CSS",
  },
  {
    label: { fr: "Frameworks", en: "Frameworks" },
    items: "React, Next.js, Remix, Angular, Vue",
  },
  {
    label: { fr: "Backend", en: "Backend" },
    items: "NestJS, Express, Hapi, tRPC",
  },
  {
    label: { fr: "Styles et animation", en: "Styling and motion" },
    items: "Tailwind CSS, Motion, Material UI, Emotion",
  },
  {
    label: { fr: "État", en: "State" },
    items: "Redux, NgRx, NGXS, MobX",
  },
  {
    label: { fr: "CI/CD et cloud", en: "CI/CD and cloud" },
    items: "GitLab CI, GitHub Actions, AWS, Vercel",
  },
];

export const cvRole: Localized = {
  fr: "Développeur Frontend Senior · Abidjan, Côte d’Ivoire",
  en: "Senior Frontend Developer · Abidjan, Côte d’Ivoire",
};
