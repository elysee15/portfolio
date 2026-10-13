"use client";

import { useTranslations } from "next-intl";

import { FILL } from "@/components/home/contribution-fill";

interface GridLegendProps {
  /** The board's own steps — the game dims them, so the key dims with it. */
  fills?: readonly string[];
  /** Square corners, to match the game's cells. */
  square?: boolean;
}

/**
 * « Moins ▢▢▢▢▢ Plus » — the five fills, at the right of the readout line.
 * Decorative: the readout beside it already says what a cell means, so the
 * whole row is hidden from assistive tech.
 */
export function GridLegend({ fills = FILL, square }: GridLegendProps) {
  const t = useTranslations("Home");

  return (
    <span aria-hidden className="flex text-muted shrink-0 items-center gap-1">
      <span className="mr-1">{t("less")}</span>
      {fills.map((fill) => (
        <span
          key={fill}
          className={`size-2.5 ${square ? "rounded-none" : "rounded-xs"} ${fill}`}
        />
      ))}
      <span className="ml-1">{t("more")}</span>
    </span>
  );
}
