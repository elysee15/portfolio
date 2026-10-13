"use client";

import { useRef, useState } from "react";

import { FILL } from "@/components/home/contribution-fill";
import { GridLegend } from "@/components/home/grid-legend";
import { GridMonths } from "@/components/home/grid-months";
import type { GridWeek } from "@/src/lib/github/grid";

interface ContributionGridProps {
  weeks: readonly GridWeek[];
  /** One entry per week: the month name, or `null` for an unlabelled column. */
  months: readonly (string | null)[];
  /** The readout at rest, before any cell is pointed at or focused. */
  total: string;
  /** Describes the whole grid to assistive tech. */
  label: string;
}

export function ContributionGrid({
  weeks,
  months,
  total,
  label,
}: ContributionGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  // Roving tabindex: the grid is one tab stop and the arrows walk it. 366 tab
  // stops would make the keyboard path through the page unusable.
  const [roving, setRoving] = useState({ week: 0, day: 0 });

  function activate(element: HTMLElement | null, focused = false): void {
    const label = element?.dataset.label;
    if (!label) return;

    setActive(label);

    // Focus moving onto a cell — by tab, by click, or from `moveTo` — becomes
    // the new arrow origin. Without this the arrows would always resume from
    // whichever cell was last roved to, not from the one the user is on.
    if (focused) {
      setRoving({
        week: Number(element?.dataset.week),
        day: Number(element?.dataset.day),
      });
    }
  }

  function moveTo(week: number, day: number): void {
    const target = weeks[week];
    if (!target) return;

    const clamped = Math.min(Math.max(day, 0), target.days.length - 1);
    setRoving({ week, day: clamped });
    containerRef.current
      ?.querySelector<HTMLElement>(
        `[data-week="${week}"][data-day="${clamped}"]`,
      )
      ?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    const { week, day } = roving;

    switch (event.key) {
      case "ArrowRight":
        moveTo(week + 1, day);
        break;
      case "ArrowLeft":
        moveTo(week - 1, day);
        break;
      case "ArrowDown":
        if (day + 1 < weeks[week].days.length) moveTo(week, day + 1);
        else moveTo(week + 1, 0);
        break;
      case "ArrowUp":
        if (day > 0) moveTo(week, day - 1);
        else moveTo(week - 1, 6);
        break;
      case "Escape":
        setActive(null);
        return;
      default:
        return;
    }

    event.preventDefault();
  }

  return (
    <div className="flex flex-col">
      <GridMonths months={months} ids={weeks.map((week) => week.id)} />

      <div
        ref={containerRef}
        role="group"
        aria-label={label}
        className="gap-cell flex"
        onPointerOver={(event) => activate(event.target as HTMLElement)}
        onPointerLeave={() => setActive(null)}
        onFocus={(event) => activate(event.target as HTMLElement, true)}
        onBlur={() => setActive(null)}
        onKeyDown={onKeyDown}
      >
        {weeks.map((week, weekIndex) => (
          <div key={week.id} className="gap-cell flex flex-1 flex-col">
            {/* The year rarely starts on a Sunday: the missing days of the
                first column are held open so every row is one weekday. */}
            {Array.from({ length: week.offset }, (_, index) => (
              <span key={index} aria-hidden className="aspect-square" />
            ))}
            {week.days.map((day, dayIndex) => (
              <span
                key={day.date}
                data-week={weekIndex}
                data-day={dayIndex}
                data-label={day.label}
                role="img"
                aria-label={day.label}
                tabIndex={
                  roving.week === weekIndex && roving.day === dayIndex ? 0 : -1
                }
                className={`duration-fast ease-out rounded-[1px] md:rounded-xs hover:outline-fg focus-visible:outline-fg aspect-square cursor-default outline outline-transparent transition-[outline-color] focus-visible:outline-2 ${FILL[day.level]}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="text-[13px] mt-2.5 font-sans text-fg flex items-baseline justify-between gap-4">
        <p aria-live="polite" className="">
          {active ?? total}
        </p>
        <GridLegend />
      </div>
    </div>
  );
}
