/**
 * Structured content for the home intro. Editorial copy lives here rather than
 * in the components so DESIGN.md § Content holds: data in `src/data/`.
 */

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ThemedImageAsset {
  light: ImageAsset;
  dark: ImageAsset;
  caption: string;
}

export interface Profile {
  name: string;
  role: string;
  /** One line per rendered line: the tagline breaks on meaning, not on width. */
  tagline: readonly string[];
  /** Portrait is grayscale at rest, full color on hover. `null` until shot. */
  portrait: ImageAsset | null;
  /** Lagoon illustration for the sticky aside rail. `null` until drawn. */
  illustration: ThemedImageAsset | null;
}

export interface BioVariant {
  id: "court" | "long";
  label: string;
  paragraphs: readonly string[];
}

export const profile: Profile = {
  name: "Elysée Bleu",
  role: "Développeur Frontend",
  tagline: [
    "Six ans à construire des interfaces",
    "depuis Abidjan, du composant",
    "à l’architecture d’équipe.",
  ],
  portrait: null,
  illustration: null,
};

export const bioVariants: readonly BioVariant[] = [
  {
    id: "court",
    label: "Court",
    paragraphs: [
      "Je suis développeur Frontend senior, basé à Abidjan. J’ai commencé en 2020 par écrire des composants chez AKIL Technologies, puis j’ai mené le frontend de plusieurs produits chez VEONE.",
      "Depuis février 2026, chez PAYNAH, je travaille à l’échelle de l’équipe : architecture frontend, conventions de code et workflows IA avec Claude et Cursor. Mes outils principaux sont React, Next.js, Angular et TypeScript.",
    ],
  },
  {
    id: "long",
    label: "Long",
    paragraphs: [
      "Je suis développeur Frontend senior, basé à Abidjan. En 2020, chez AKIL Technologies, mon travail tenait dans un périmètre simple : écrire des composants, les brancher à une API, les faire tenir sur tous les écrans. C’est là que j’ai appris à lire une maquette comme un système plutôt que comme une suite d’écrans.",
      "Chez VEONE, j’ai pris le frontend de plusieurs produits de bout en bout. Choisir une structure de projet, poser les conventions, arbitrer entre une librairie et vingt lignes de CSS, et vivre ensuite avec ces décisions pendant des mois. La plupart de ce que je sais sur la dette technique vient de cette période.",
      "Depuis février 2026, chez PAYNAH, je travaille à l’échelle de l’équipe : architecture frontend, conventions de code partagées, revue, et des workflows IA avec Claude et Cursor pour que l’outillage serve la relecture plutôt que le volume. React, Next.js, Angular et TypeScript restent mes outils principaux.",
    ],
  },
];

/** Still to write — kept visible so the gap stays on the page, not in a backlog. */
export const bioTodo = "TODO : ce qui m’intéresse en dehors du code.";
