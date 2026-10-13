"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { ContributionGrid } from "@/components/home/contribution-grid";
import { GithubHandle } from "@/components/home/github-handle";
import { SnakeBoard } from "@/components/home/snake-board";
import { UNDERLINE } from "@/components/ui/text-link";
import type { GridWeek } from "@/src/lib/github/grid";

/** Phones, where the reading column is the whole screen. */
const NARROW = "(max-width: 639px)";

function useNarrowScreen(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(NARROW);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(NARROW).matches,
    // The server has no screen, and a rotated first paint would be a lie.
    () => false,
  );
}

interface ActivityBoardProps {
  weeks: readonly GridWeek[];
  /** One entry per week: the month name, or `null` for an unlabelled column. */
  months: readonly (string | null)[];
  /** The graph's readout at rest, before any cell is pointed at. */
  total: string;
  /** Describes the graph to assistive tech. */
  label: string;
  github: string;
}

/**
 * The « Activité » block: the contribution graph, and the game played on it.
 *
 * Header and board are one island because « Jouer » swaps both at once — the
 * controls on the right of the title become the game's, and the graph below
 * becomes the board. Everything it prints is handed down already formatted by
 * the server, so no date or number formatter reaches the bundle.
 */
export function ActivityBoard({
  weeks,
  months,
  total,
  label,
  github,
}: ActivityBoardProps) {
  const t = useTranslations("Home");
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const playRef = useRef<HTMLButtonElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);
  const narrow = useNarrowScreen();
  /**
   * 53 columns across a phone held upright is a 7px cell, and expanding it
   * changes nothing — the width is the constraint. So the expanded game turns
   * sideways, the way the page can't: a cell then gets the screen's long edge
   * and grows to about 15px. Everything inside turns with it, pad and arrow
   * glyphs included, so the board the player sees stays coherent; only the
   * swipe has to be read back into board space.
   */
  const rotated = expanded && narrow;

  // Leaving the game hands focus back to the control that opened it; without
  // this, a keyboard quit drops the caret at the top of the document.
  useEffect(() => {
    if (playing) played.current = true;
    else if (played.current) playRef.current?.focus();
  }, [playing]);

  /** Both game controls hand the arrows back, so a click never ends the run. */
  function keepPlaying(): void {
    boardRef.current?.focus({ preventScroll: true });
  }

  function leave(): void {
    setExpanded(false);
    setPlaying(false);
  }

  // Full screen is a layer over the page, so the page must not scroll under
  // it, and `Escape` has to be the way out — there is no chrome to click.
  useEffect(() => {
    if (!expanded) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setExpanded(false);
      boardRef.current?.focus({ preventScroll: true });
    };

    const scroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = scroll;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  return (
    <div
      className={
        expanded ? "bg-background fixed inset-0 z-50 overflow-hidden" : "contents"
      }
    >
      <div
        style={
          rotated
            ? { width: "100dvh", height: "100dvw", transform: "translate(-50%, -50%) rotate(90deg)" }
            : undefined
        }
        className={
          expanded
            ? `flex flex-col justify-center gap-6 px-5 sm:px-8 ${
                rotated ? "absolute top-1/2 left-1/2" : "h-full"
              }`
            : "contents"
        }
      >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="text-h2">{t("activity")}</h2>

        <span className="text-meta flex items-baseline gap-4">
          {playing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setExpanded((current) => !current);
                  keepPlaying();
                }}
                aria-pressed={expanded}
                aria-label={t(expanded ? "collapse" : "expand")}
                className="text-muted-foreground hover:text-foreground duration-fast ease-out self-center transition-colors"
              >
                {expanded ? (
                  <Minimize2 aria-hidden size={14} strokeWidth={1.5} />
                ) : (
                  <Maximize2 aria-hidden size={14} strokeWidth={1.5} />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSound((current) => !current);
                  keepPlaying();
                }}
                aria-pressed={sound}
                className="text-muted-foreground hover:text-foreground duration-fast ease-out transition-colors"
              >
                {t("sound", { state: t(sound ? "soundOn" : "soundOff") })}
              </button>

              <button type="button" onClick={leave} className={UNDERLINE}>
                {t("quit")}
              </button>
            </>
          ) : (
            <button
              ref={playRef}
              type="button"
              onClick={() => setPlaying(true)}
              className={UNDERLINE}
            >
              {t("play")}
            </button>
          )}

          <GithubHandle handle={github} />
        </span>
      </div>

      {playing ? (
        <SnakeBoard
          weeks={weeks}
          months={months}
          sound={sound}
          boardRef={boardRef}
          rotated={rotated}
        />
      ) : (
        <ContributionGrid
          weeks={weeks}
          months={months}
          total={total}
          label={label}
        />
      )}
      </div>
    </div>
  );
}
