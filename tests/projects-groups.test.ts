import { describe, expect, it } from "vitest";

import type { ProjectEntry } from "@/src/data/projects";
import { projects } from "@/src/data/projects";
import {
  buildProjectGroups,
  countProjects,
  metaOf,
} from "@/src/lib/projects/groups";
import { projectWords } from "./intl";

const SAMPLE: readonly ProjectEntry[] = [
  {
    slug: "un",
    name: "Un",
    kind: "entreprise",
    company: "VEONE",
    stack: [],
    desc: { fr: "Premier.", en: "First." },
    href: "https://un.example/",
  },
  {
    slug: "deux",
    name: "Deux",
    kind: "entreprise",
    company: "AKIL",
    stack: [],
    desc: { fr: "Deuxième.", en: "Second." },
  },
  {
    slug: "trois",
    name: "Trois",
    kind: "personnel",
    year: "2025",
    stack: [],
    desc: { fr: "Troisième.", en: "Third." },
  },
];

const options = {
  locale: "fr" as const,
  words: projectWords("fr"),
  caseStudies: [] as string[],
};

describe("buildProjectGroups", () => {
  it("counts each kind and totals what the tabs show", () => {
    const groups = buildProjectGroups(SAMPLE, options);

    expect(groups.map((group) => [group.id, group.count])).toEqual([
      ["entreprise", 2],
      ["personnel", 1],
    ]);
    expect(countProjects(groups)).toBe(SAMPLE.length);
  });

  it("drops a kind nobody has shipped rather than showing an empty tab", () => {
    const groups = buildProjectGroups(SAMPLE.slice(0, 2), options);

    expect(groups.map((group) => group.id)).toEqual(["entreprise"]);
  });

  it("labels the tabs from the dictionary of the locale", () => {
    const labels = (locale: "fr" | "en") =>
      buildProjectGroups(SAMPLE, {
        ...options,
        locale,
        words: projectWords(locale),
      }).map((group) => group.label);

    expect(labels("fr")).toEqual(["Entreprise", "Personnel"]);
    expect(labels("en")).toEqual(["Company", "Personal"]);
  });

  it("takes the description from the locale asked for", () => {
    const [company] = buildProjectGroups(SAMPLE, { ...options, locale: "en" });

    expect(company.entries[0].desc).toBe("First.");
  });

  it("points a row at its case study when the MDX exists", () => {
    const [company] = buildProjectGroups(SAMPLE, {
      ...options,
      caseStudies: ["un"],
    });

    expect(company.entries[0]).toMatchObject({
      href: "/projets/un",
      external: false,
    });
  });

  it("falls back to the live product, then to no link at all", () => {
    const [company] = buildProjectGroups(SAMPLE, options);

    expect(company.entries[0]).toMatchObject({
      href: "https://un.example/",
      external: true,
    });
    expect(company.entries[1].href).toBeUndefined();
  });
});

describe("metaOf", () => {
  it("shows the company of a company project and the year of a personal one", () => {
    expect(metaOf(SAMPLE[0])).toBe("VEONE");
    expect(metaOf(SAMPLE[2])).toBe("2025");
  });

  it("marks a missing meta as a TODO instead of inventing one", () => {
    expect(metaOf({ ...SAMPLE[0], company: undefined })).toBe("TODO");
  });
});

describe("the shipped data", () => {
  it("gives every project a unique slug", () => {
    const slugs = projects.map((project) => project.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  /**
   * The years of the personal projects are still unwritten — the gap is on the
   * page, under `projectsTodo`. The guard is therefore "no *new* hole": a
   * project outside this list that loses its meta fails here, and a year filled
   * in only shortens the list.
   */
  const AWAITING_META: readonly string[] = [
    "lapige",
    "art-gallery",
    "pomodoro-timer",
    "babi-music",
    "spotify-clone",
  ];

  it("gives every project the meta its kind is listed by", () => {
    const missing = projects
      .filter((project) => metaOf(project) === "TODO")
      .map((project) => project.slug);

    expect(missing.filter((slug) => !AWAITING_META.includes(slug))).toEqual([]);
  });
});
