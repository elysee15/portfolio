import { describe, expect, it } from "vitest";

import {
  buildPaletteEntries,
  filterEntries,
  type PaletteEntry,
} from "@/src/lib/palette/entries";
import { paletteLabels } from "./intl";

const CONTENT = {
  blog: [{ slug: "un-article", title: "Un article" }],
  notes: [{ slug: "raccourcis", title: "Raccourcis clavier" }],
  projets: [{ slug: "paynah-console", title: "PAYNAH Console" }],
};

describe("buildPaletteEntries", () => {
  const entries = buildPaletteEntries(CONTENT, paletteLabels("fr"));

  it("opens with the home sections, in page order", () => {
    const sections = entries
      .filter((entry) => entry.group === "sections")
      .map((entry) => entry.label);

    expect(sections).toEqual(["Bio", "Expérience", "Activité", "Projets"]);
  });

  it("points a section at its anchor on the home page", () => {
    const bio = entries.find((entry) => entry.label === "Bio");

    expect(bio?.href).toBe("/#bio");
  });

  it("links a content entry to its route, under its own group", () => {
    const note = entries.find((entry) => entry.label === "Raccourcis clavier");

    expect(note?.href).toBe("/notes/raccourcis");
    expect(note?.group).toBe("notes");
  });

  it("lists only the pages that exist", () => {
    const pages = entries
      .filter((entry) => entry.group === "pages")
      .map((entry) => entry.href);

    expect(pages).toEqual([
      "/",
      "/projets",
      "/blog",
      "/notes",
      "/lab",
      "/contact",
      "/cv",
    ]);
  });

  it("translates the group headings", () => {
    const english = buildPaletteEntries(CONTENT, paletteLabels("en"));
    const note = english.find((entry) => entry.group === "notes");
    const post = english.find((entry) => entry.group === "blog");

    expect(note?.groupLabel).toBe("Notes");
    expect(post?.groupLabel).toBe("Writing");
  });

  it("gives every entry a unique id", () => {
    const ids = entries.map((entry) => entry.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("stays flat and serializable — the island receives it as props", () => {
    for (const entry of entries) {
      expect(typeof entry.href).toBe("string");
      expect(Object.keys(entry).sort()).toEqual([
        "group",
        "groupLabel",
        "href",
        "id",
        "label",
      ]);
    }
  });
});

describe("filterEntries", () => {
  const entries: readonly PaletteEntry[] = [
    {
      id: "a",
      group: "sections",
      groupLabel: "Sections",
      label: "Activité",
      href: "/#activite",
    },
    { id: "b", group: "pages", groupLabel: "Pages", label: "Lab", href: "/lab" },
  ];

  it("ignores accents and case", () => {
    expect(filterEntries(entries, "activite").map((e) => e.id)).toEqual(["a"]);
  });

  it("returns everything on an empty query", () => {
    expect(filterEntries(entries, "  ")).toHaveLength(2);
  });
});
