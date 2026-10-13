"use client";

interface GridMonthsProps {
  /** One entry per week: the month name, or `null` for an unlabelled column. */
  months: readonly (string | null)[];
  /** The week ids the grid below is keyed by, so both rows stay aligned. */
  ids: readonly string[];
}

/**
 * The month row above the contribution grid — shared by the graph and the
 * game, which draw the same 53 columns. Hidden below `sm`, where a 6px column
 * runs « sept » into « oct » (DESIGN.md § Other features).
 */
export function GridMonths({ months, ids }: GridMonthsProps) {
  return (
    <div
      aria-hidden
      className="gap-cell text-[11px] mb-0.5 font-sans text-muted-foreground hidden sm:flex"
    >
      {months.map((month, index) => (
        <span key={ids[index]} className="min-w-0 flex-1 basis-0 whitespace-nowrap">
          {month}
        </span>
      ))}
    </div>
  );
}
