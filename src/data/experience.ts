/**
 * Professional history for the home « Expérience » section. Editorial copy
 * lives here rather than in the components — DESIGN.md § Content: data in
 * `src/data/`.
 *
 * Months are `YYYY-MM` strings, not `Date`: the section renders inside a
 * `use cache` tree and cached values must stay serializable. Prose is
 * `Localized` for the same reason the rest of `src/data/` is — the component
 * reads `[locale]`, it never picks a language.
 */

import type { Localized, LocalizedList } from "@/src/i18n/localized";

export interface ExperienceEntry {
  id: string;
  company: string;
  role: Localized;
  /** First month on the job, `YYYY-MM`. */
  start: string;
  /** Last month, `YYYY-MM`, or `null` while the job is current. */
  end: string | null;
  /** One line, always visible: the verb that sums the period up. */
  summary: Localized;
  /** Revealed by the row disclosure. Derived from the bio, nothing invented. */
  details: LocalizedList;
  stack: readonly string[];
}

/** Newest first — the list renders in this order, the timeline reverses it. */
export const experience: readonly ExperienceEntry[] = [
  {
    id: "paynah",
    company: "PAYNAH",
    role: {
      fr: "Développeur Frontend senior",
      en: "Senior Frontend Developer",
    },
    start: "2026-02",
    end: null,
    summary: {
      fr: "Structurer : architecture frontend, conventions partagées et workflows IA pour l’équipe.",
      en: "Structuring: frontend architecture, shared conventions and AI workflows for the team.",
    },
    details: {
      fr: [
        "Je travaille à l’échelle de l’équipe plutôt qu’à celle de l’écran : structuration des composants, choix des patterns, conventions de code et revue.",
        "Les workflows IA — Claude, Cursor — sont outillés sur mesure : skills, rules et commands pour automatiser le récurrent et standardiser les pratiques, au service de la relecture plutôt que du volume de code.",
        "La couverture de tests unitaires est posée et maintenue sur les composants et les parcours critiques.",
      ],
      en: [
        "I work at the scale of the team rather than the screen: component structure, pattern choices, coding conventions and review.",
        "The AI workflows — Claude, Cursor — are tooled to measure: skills, rules and commands that automate the recurring work and standardise practice, in service of review rather than of code volume.",
        "Unit test coverage is set up and maintained on the components and the critical paths.",
      ],
    },
    stack: ["Next.js", "React", "TypeScript", "Tests unitaires"],
  },
  {
    id: "veone",
    company: "VEONE",
    role: { fr: "Lead Frontend", en: "Frontend Lead" },
    start: "2023-06",
    end: "2026-02",
    summary: {
      fr: "Mener : lead frontend sur GMS Adtrack, RTIPlay, Docshield et CNPS Census.",
      en: "Leading: frontend lead on GMS Adtrack, RTIPlay, Docshield and CNPS Census.",
    },
    details: {
      fr: [
        "J’ai pris le frontend de plusieurs produits de bout en bout : la plateforme de centralisation et d’analyse de données publicitaires GMS Adtrack, le front-office de la plateforme VOD RTIPlay — avec son UI Kit —, la sécurisation de documents Docshield et la plateforme CNPS Census d’enregistrement des travailleurs indépendants.",
        "Autour : la VOD NCI au fil des retours clients, la landing page SEO d’Aynid.io avec son CI/CD et son image Docker, et des plugins Grafana branchés sur Prometheus pour les métriques d’Aynid Shop.",
        "En mission de consultant chez Orange CI : refonte visuelle et nouvelles fonctionnalités sur Orange Boutique, puis l’entraînement du chatbot Djingo avec Smartly pour réduire les passages en agence.",
        "La plupart de ce que je sais sur la dette technique vient de cette période : choisir une structure, vivre des mois avec elle.",
      ],
      en: [
        "I owned the frontend of several products end to end: the advertising data platform GMS Adtrack, the front office of the VOD platform RTIPlay — with its UI kit —, the document security product Docshield, and CNPS Census, the registration platform for self-employed workers.",
        "Around those: the NCI VOD service as customer feedback came in, the SEO landing page for Aynid.io with its CI/CD and Docker image, and Grafana plugins wired to Prometheus for the Aynid Shop metrics.",
        "On a consulting engagement at Orange CI: a visual redesign and new features on Orange Boutique, then training the Djingo chatbot with Smartly to cut down on store visits.",
        "Most of what I know about technical debt comes from this period: choosing a structure, then living with it for months.",
      ],
    },
    stack: ["React", "Next.js", "Angular", "TypeScript", "Docker", "Grafana"],
  },
  {
    id: "akil",
    company: "AKIL Technologies",
    role: { fr: "Développeur", en: "Developer" },
    start: "2020-01",
    end: "2023-03",
    summary: {
      fr: "Construire : Angular, NestJS, un premier UI Kit et des pipelines CI/CD.",
      en: "Building: Angular, NestJS, a first UI kit and CI/CD pipelines.",
    },
    details: {
      fr: [
        "Un périmètre simple au départ : maintenir et étendre la plateforme d’administration IDDATAWEB en Angular, écrire des composants, les brancher à une API, les faire tenir sur tous les écrans.",
        "Puis des fondations : une architecture modulaire et un CI/CD sur DAFExpert, un UI Kit basé sur Material UI et Emotion, les ressources API de DIGITEXPERT en NestJS et MongoDB, et une plateforme de web scraping en Python avec Scrapy et RabbitMQ pour passer les traitements en asynchrone.",
        "C’est là que j’ai appris à lire une maquette comme un système plutôt que comme une suite d’écrans.",
      ],
      en: [
        "A simple scope at first: maintaining and extending the IDDATAWEB admin platform in Angular — writing components, wiring them to an API, making them hold on every screen.",
        "Then the foundations: a modular architecture and CI/CD on DAFExpert, a UI kit built on Material UI and Emotion, the DIGITEXPERT API resources in NestJS and MongoDB, and a web scraping platform in Python with Scrapy and RabbitMQ to move the processing off the request path.",
        "That is where I learned to read a mockup as a system rather than as a sequence of screens.",
      ],
    },
    stack: ["Angular", "NestJS", "TypeScript", "Python", "MongoDB"],
  },
];

/** Still to write — kept visible so the gap stays on the page, not in a backlog. */
export const experienceTodo: Localized = {
  fr: "TODO : chiffrer l’impact de chaque poste.",
  en: "TODO: put numbers on the impact of each role.",
};
