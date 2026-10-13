/**
 * Every project shipped, listed flat for the home « Tous les projets » section.
 * Editorial copy lives here rather than in the components — DESIGN.md § Content:
 * data in `src/data/`.
 *
 * Nothing here is a `Date` or a class: the section renders inside a `use cache`
 * tree and cached values must stay serializable.
 *
 * `TODO` is a real value, not a placeholder to clean up later: it marks the
 * copy that has not been written yet — the English translations, the stacks of
 * the older projects — so the gap stays visible on the page rather than in a
 * backlog. Nothing here is invented to fill a field.
 */

import type { Localized } from "@/src/i18n/localized";

export type ProjectKind = "entreprise" | "personnel";

export interface ProjectEntry {
  /** Identity everywhere: the row's link (`/projets/<slug>`) and the preview id. */
  slug: string;
  name: string;
  kind: ProjectKind;
  /** Company projects only — the employer, shown as the row's meta. */
  company?: string;
  /** Personal projects only — the year, shown as the row's meta. */
  year?: string;
  stack: readonly string[];
  /** One line, no second sentence: the row is a list item, not a card. */
  desc: Localized;
  role?: Localized;
  result?: Localized;
  /**
   * The live product, when there is one: an absolute URL. It is not where the
   * row points — that is the case study — it is what the cursor preview shows.
   */
  href?: string;
}

/** Newest first, grouped by employer — the list renders in this order. */
export const projects: readonly ProjectEntry[] = [
  {
    slug: "gms-adtrack",
    name: "GMS Adtrack",
    kind: "entreprise",
    company: "VEONE",
    stack: [],
    desc: {
      fr: "Centralisation et analyse de données publicitaires.",
      en: "TODO",
    },
  },
  {
    slug: "rtiplay",
    name: "RTIPlay",
    kind: "entreprise",
    company: "VEONE",
    stack: [],
    desc: { fr: "Front-office VOD et son UI Kit.", en: "TODO" },
    href: "https://rtiplay.ci/",
  },
  {
    slug: "docshield",
    name: "Docshield",
    kind: "entreprise",
    company: "VEONE",
    stack: [],
    desc: { fr: "Sécurisation de documents.", en: "TODO" },
    href: "https://www.veone.net/docshield/",
  },
  {
    slug: "cnps-census",
    name: "CNPS Census",
    kind: "entreprise",
    company: "VEONE",
    stack: [],
    desc: { fr: "Enregistrement des travailleurs indépendants.", en: "TODO" },
  },
  {
    slug: "vod-nci",
    name: "VOD NCI",
    kind: "entreprise",
    company: "VEONE",
    stack: [],
    desc: { fr: "Évolutions de la plateforme VOD.", en: "TODO" },
    href: "https://www.nci.ci/",
  },
  {
    slug: "aynid-io",
    name: "Aynid.io",
    kind: "entreprise",
    company: "VEONE",
    stack: [],
    desc: {
      fr: "Landing page SEO avec CI/CD et déploiement Docker.",
      en: "TODO",
    },
  },
  {
    slug: "aynid-shop",
    name: "Aynid Shop",
    kind: "entreprise",
    company: "VEONE",
    stack: [],
    desc: {
      fr: "Plugins Grafana personnalisés connectés à Prometheus.",
      en: "TODO",
    },
  },
  {
    slug: "orange-boutique",
    name: "Orange Boutique",
    kind: "entreprise",
    company: "Orange CI",
    stack: [],
    desc: { fr: "Refonte visuelle et nouvelles fonctionnalités.", en: "TODO" },
    href: "https://laboutique.orange.ci/accueil",
  },
  {
    slug: "djingo",
    name: "Djingo",
    kind: "entreprise",
    company: "Orange CI",
    stack: [],
    desc: {
      fr: "Chatbot d’Orange CI, développé avec Smartly pour réduire les passages en agence.",
      en: "TODO",
    },
  },
  {
    slug: "dafexpert",
    name: "DAFExpert",
    kind: "entreprise",
    company: "AKIL",
    stack: [],
    desc: { fr: "Architecture modulaire et CI/CD.", en: "TODO" },
  },
  {
    slug: "digitexpert",
    name: "DIGITEXPERT",
    kind: "entreprise",
    company: "AKIL",
    stack: [],
    desc: { fr: "API REST.", en: "TODO" },
  },
  {
    slug: "iddataweb",
    name: "IDDATAWEB",
    kind: "entreprise",
    company: "AKIL",
    stack: [],
    desc: { fr: "Maintenance et fonctionnalités sur l’admin.", en: "TODO" },
    href: "https://www.iddataweb.com/",
  },
  {
    slug: "lapige",
    name: "La Pige",
    kind: "personnel",
    stack: [],
    desc: {
      fr: "Annuaire de travailleurs indépendants, avec son parcours de candidature.",
      en: "TODO",
    },
    href: "https://lapige.vercel.app/",
  },
  {
    slug: "art-gallery",
    name: "Art Gallery",
    kind: "personnel",
    stack: [],
    desc: {
      fr: "Galerie d’œuvres, une page par pièce.",
      en: "TODO",
    },
    href: "https://art-gallery-nu-eight.vercel.app/",
  },
  {
    slug: "pomodoro-timer",
    name: "Pomodoro Timer",
    kind: "personnel",
    stack: [],
    desc: {
      fr: "Minuteur Pomodoro : cycles de travail et de pause.",
      en: "TODO",
    },
    href: "https://v0-preview-one-phi.vercel.app/",
  },
  {
    slug: "babi-music",
    name: "BabiMusic",
    kind: "personnel",
    stack: [],
    desc: {
      fr: "Vitrine de clips, freestyles et collaborations d’artistes.",
      en: "TODO",
    },
    href: "https://babi-music.vercel.app/",
  },
  {
    slug: "spotify-clone",
    name: "Spotify Clone",
    kind: "personnel",
    stack: [],
    desc: {
      fr: "Clone de Spotify : lecture, playlists et bibliothèque.",
      en: "TODO",
    },
    href: "https://nextjs-spotify-clone-jade.vercel.app/",
  },
];

/** Below the list — the rest of the work lives on `/lab` (DESIGN.md § Routes). */
export const projectsLink = { href: "/lab" };

/** Still to write — kept visible so the gap stays on the page, not in a backlog. */
export const projectsTodo: Localized = {
  fr: "TODO : les années et les stacks des projets personnels, les missions freelance et les formations.",
  en: "TODO: the years and stacks of the personal projects, the freelance work and the courses.",
};
