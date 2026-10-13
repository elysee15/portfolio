export interface Track {
  readonly title: string;
  readonly artist: string;
  /** Chemin public, servi statiquement depuis `public/audio/`. */
  readonly src: string;
  readonly license: string;
  /** Page d'origine — la licence CC BY impose de pouvoir remonter à la source. */
  readonly source: string;
}

const LICENSE = "CC BY 4.0";
const SOURCE = "https://incompetech.com/music/royalty-free/music.html";

const catalogue = [
  ["Dreamy Flashback", "dreamy-flashback"],
  ["Meditation Impromptu", "meditation-impromptu"],
  ["Lightless Dawn", "lightless-dawn"],
  ["At The Shore", "at-the-shore"],
  ["Night Cave", "night-cave"],
  ["Southern Gothic", "southern-gothic"],
  ["Starting Out Waltz Vivace", "starting-out-waltz-vivace"],
  ["Thief in the Night", "thief-in-the-night"],
  ["Dub Eastern", "dub-eastern"],
  ["Ghost Story", "ghost-story"],
] as const;

export const tracks: readonly Track[] = catalogue.map(([title, slug]) => ({
  title,
  artist: "Kevin MacLeod",
  src: `/audio/${slug}.m4a`,
  license: LICENSE,
  source: SOURCE,
}));
