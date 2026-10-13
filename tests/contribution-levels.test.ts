import { describe, expect, it } from "vitest";

import { buildLevelColumns, type GridWeek } from "@/src/lib/github/grid";

/** A week whose days start at `offset`, as the first week of a year does. */
function week(id: string, offset: number, count: number): GridWeek {
  return {
    id,
    offset,
    days: Array.from({ length: count }, (_, index) => ({
      date: `${id}-${index}`,
      level: 2 as const,
      label: "",
    })),
  };
}

describe("buildLevelColumns", () => {
  it("pads the partial weeks at both ends into full columns", () => {
    const columns = buildLevelColumns([
      week("a", 3, 4),
      week("b", 0, 7),
      week("c", 0, 2),
    ]);

    expect(columns).toHaveLength(3);
    expect(columns.every((column) => column.length === 7)).toBe(true);
    // The days the year doesn't cover read as level 0, not as holes.
    expect(columns[0]).toEqual([0, 0, 0, 2, 2, 2, 2]);
    expect(columns[2]).toEqual([2, 2, 0, 0, 0, 0, 0]);
  });
});
