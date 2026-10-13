import { describe, expect, it } from "vitest";

import { directionFromKey, directionFromSwipe } from "@/src/lib/snake/input";

describe("directionFromKey", () => {
  it("reads the arrows, WASD and ZQSD, whatever the case", () => {
    expect(directionFromKey({ key: "ArrowLeft" })).toBe("left");
    expect(directionFromKey({ key: "w" })).toBe("up");
    expect(directionFromKey({ key: "Z" })).toBe("up");
    expect(directionFromKey({ key: "D" })).toBe("right");
  });

  it("leaves shortcuts alone, so ⌘S still saves the page", () => {
    expect(directionFromKey({ key: "s", metaKey: true })).toBeNull();
    expect(directionFromKey({ key: "a", ctrlKey: true })).toBeNull();
    expect(directionFromKey({ key: "ArrowLeft", altKey: true })).toBeNull();
  });

  it("ignores everything else", () => {
    expect(directionFromKey({ key: "Enter" })).toBeNull();
    expect(directionFromKey({ key: "k" })).toBeNull();
  });
});

describe("directionFromSwipe", () => {
  it("takes the dominant axis", () => {
    expect(directionFromSwipe(60, 10)).toBe("right");
    expect(directionFromSwipe(-60, 10)).toBe("left");
    expect(directionFromSwipe(10, 60)).toBe("down");
    expect(directionFromSwipe(10, -60)).toBe("up");
  });

  it("reads a tap, and a finger that barely moved, as nothing", () => {
    expect(directionFromSwipe(0, 0)).toBeNull();
    expect(directionFromSwipe(8, 9)).toBeNull();
  });
});
