import { describe, expect, it } from "vitest";

import { normalize, matches } from "@/src/utils/text";

describe("normalize", () => {
  it("strips diacritics and case", () => {
    expect(normalize("Écrits")).toBe("ecrits");
    expect(normalize("Activité")).toBe("activite");
  });

  it("collapses surrounding whitespace", () => {
    expect(normalize("  Lab  ")).toBe("lab");
  });
});

describe("matches", () => {
  it("finds an accented label from an unaccented query", () => {
    expect(matches("Écrits", "ecrits")).toBe(true);
    expect(matches("Activité", "ACTIV")).toBe(true);
  });

  it("matches everything on an empty query", () => {
    expect(matches("Lab", "")).toBe(true);
  });

  it("rejects a query that is not a substring", () => {
    expect(matches("Lab", "jeux")).toBe(false);
  });
});
