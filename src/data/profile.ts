/**
 * Structured content for the home intro. Editorial copy lives here rather than
 * in the components so DESIGN.md § Content holds: data in `src/data/`. Prose is
 * `Localized`; the components read `[locale]` and pick nothing themselves.
 */

import type { Localized, LocalizedList } from "@/src/i18n/localized";

export interface ImageAsset {
  src: string;
  alt: Localized;
  width: number;
  height: number;
}

export interface ThemedImageAsset {
  light: ImageAsset;
  dark: ImageAsset;
  caption: Localized;
}

export interface Profile {
  name: string;
  role: Localized;
  /** GitHub login — the « Activité » section reads its calendar. */
  github: string;
  /** One line per rendered line: the tagline breaks on meaning, not on width. */
  tagline: LocalizedList;
  /** Portrait is grayscale at rest, full color on hover. `null` until shot. */
  portrait: ImageAsset | null;
  /** Lagoon illustration for the sticky aside rail. `null` until drawn. */
  illustration: ThemedImageAsset | null;
}

export interface BioVariant {
  /** Stable key, never printed — `label` is what the tab shows. */
  id: "court" | "long";
  label: Localized;
  paragraphs: LocalizedList;
}

export const profile: Profile = {
  name: "Elysée Bleu",
  role: { fr: "Développeur Frontend", en: "Frontend Developer" },
  github: "elysee15",
  tagline: {
    fr: [
      "Six ans à construire des interfaces",
      "depuis Abidjan, du composant",
      "à l’architecture d’équipe.",
    ],
    en: [
      "Six years building interfaces",
      "from Abidjan, from the component",
      "to the architecture of a team.",
    ],
  },
  portrait: {
    src: "/elysee-bleu.jpg",
    alt: {
      fr: "Portrait d’Elysée Bleu",
      en: "Portrait of Elysée Bleu",
    },
    width: 800,
    height: 800,
  },
  illustration: null,
};

export const bioVariants: readonly BioVariant[] = [
  {
    id: "court",
    label: { fr: "Court", en: "Short" },
    paragraphs: {
      fr: [
        "Je suis développeur Frontend senior, basé à Abidjan. J’ai commencé en 2020 par écrire des composants chez AKIL Technologies, puis j’ai été lead frontend chez VEONE sur GMS Adtrack, RTIPlay, Docshield et CNPS Census — avec une mission de consultant chez Orange CI.",
        "Depuis février 2026, chez PAYNAH, je travaille à l’échelle de l’équipe : architecture frontend, conventions de code, tests et workflows IA avec Claude et Cursor. Mes outils principaux sont React, Next.js, Angular et TypeScript.",
      ],
      en: [
        "I am a senior Frontend developer based in Abidjan. I started in 2020 writing components at AKIL Technologies, then was frontend lead at VEONE on GMS Adtrack, RTIPlay, Docshield and CNPS Census — including a consulting engagement at Orange CI.",
        "Since February 2026, at PAYNAH, I work at the scale of the team: frontend architecture, coding conventions, tests and AI workflows with Claude and Cursor. My main tools are React, Next.js, Angular and TypeScript.",
      ],
    },
  },
  {
    id: "long",
    label: { fr: "Long", en: "Long" },
    paragraphs: {
      fr: [
        "Je suis développeur Frontend senior, basé à Abidjan, formé au BTS développement d’applications puis à une licence professionnelle en informatique. En 2020, chez AKIL Technologies, mon travail tenait dans un périmètre simple : maintenir une plateforme d’administration Angular, écrire des composants, les brancher à une API. Puis les fondations sont arrivées — architecture modulaire, CI/CD, un premier UI Kit, des ressources API en NestJS. C’est là que j’ai appris à lire une maquette comme un système plutôt que comme une suite d’écrans.",
        "Chez VEONE, j’ai pris le frontend de plusieurs produits de bout en bout : GMS Adtrack pour l’analyse de données publicitaires, le front-office VOD de RTIPlay et son UI Kit, Docshield, CNPS Census, la VOD NCI, la landing page SEO d’Aynid.io et ses plugins Grafana. En mission chez Orange CI, j’ai retravaillé Orange Boutique et entraîné le chatbot Djingo. Choisir une structure de projet, poser les conventions, arbitrer entre une librairie et vingt lignes de CSS, puis vivre avec ces décisions pendant des mois : la plupart de ce que je sais sur la dette technique vient de cette période.",
        "Depuis février 2026, chez PAYNAH, je travaille à l’échelle de l’équipe : architecture frontend, conventions de code partagées, couverture de tests, revue, et des workflows IA avec Claude et Cursor — skills, rules et commands — pour que l’outillage serve la relecture plutôt que le volume. React, Next.js, Angular et TypeScript restent mes outils principaux.",
      ],
      en: [
        "I am a senior Frontend developer based in Abidjan, trained first on a BTS in application development, then on a professional bachelor's degree in computing. In 2020, at AKIL Technologies, my work fitted in a simple scope: maintaining an Angular admin platform, writing components, wiring them to an API. Then the foundations arrived — a modular architecture, CI/CD, a first UI kit, API resources in NestJS. That is where I learned to read a mockup as a system rather than as a sequence of screens.",
        "At VEONE I owned the frontend of several products end to end: GMS Adtrack for advertising data analysis, the RTIPlay VOD front office and its UI kit, Docshield, CNPS Census, the NCI VOD service, the Aynid.io SEO landing page and its Grafana plugins. On an engagement at Orange CI, I reworked Orange Boutique and trained the Djingo chatbot. Choosing a project structure, setting the conventions, deciding between a library and twenty lines of CSS, then living with those decisions for months: most of what I know about technical debt comes from this period.",
        "Since February 2026, at PAYNAH, I work at the scale of the team: frontend architecture, shared coding conventions, test coverage, review, and AI workflows with Claude and Cursor — skills, rules and commands — so that the tooling serves review rather than volume. React, Next.js, Angular and TypeScript remain my main tools.",
      ],
    },
  },
];

/** Still to write — kept visible so the gap stays on the page, not in a backlog. */
export const bioTodo: Localized = {
  fr: "TODO : ce qui m’intéresse en dehors du code.",
  en: "TODO: what interests me outside of code.",
};
