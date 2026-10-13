"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GAME_FILL } from "@/components/home/contribution-fill";
import { GridLegend } from "@/components/home/grid-legend";
import { GridMonths } from "@/components/home/grid-months";
import {
  buildLevelColumns,
  WEEK_ROWS,
  type GridWeek,
} from "@/src/lib/github/grid";
import {
  createGame,
  step,
  tickDelay,
  turn,
  type Board,
  type Direction,
  type SnakeState,
} from "@/src/lib/snake/engine";
import {
  directionFromKey,
  directionFromSwipe,
} from "@/src/lib/snake/input";
import { createBeeper } from "@/src/utils/sound";

/**
 * How long the lost board is held before a direction may restart it. Players
 * are still mashing arrows when they hit the wall, and without this the score
 * they just lost would be gone before they read it.
 */
const RESTART_MS = 700;

/** Laid out as a cross on a 3×2 grid, each button placed explicitly. */
const PAD: readonly {
  direction: Direction;
  Icon: typeof ArrowUp;
  cell: string;
}[] = [
  { direction: "up", Icon: ArrowUp, cell: "col-start-2 row-start-1" },
  { direction: "left", Icon: ArrowLeft, cell: "col-start-1 row-start-2" },
  { direction: "down", Icon: ArrowDown, cell: "col-start-2 row-start-2" },
  { direction: "right", Icon: ArrowRight, cell: "col-start-3 row-start-2" },
];

interface SnakeBoardProps {
  weeks: readonly GridWeek[];
  months: readonly (string | null)[];
  /** Whether the blips are on; the toggle lives in the section header. */
  sound: boolean;
  /** The board the arrows talk to, held by the section so its controls can
   *  hand focus back after a click. */
  boardRef: React.RefObject<HTMLDivElement | null>;
  /** True when the expanded game is turned sideways on a phone. */
  rotated?: boolean;
}

/**
 * Snake, played on the contribution graph: the year keeps its fills and the
 * snake is drawn over them in `--fg`, so the board never stops being the
 * graph it replaces.
 *
 * The rules are in `src/lib/snake/engine.ts`; this island owns the clock, the
 * input and the pixels. Three ways in, because the graph is on a page people
 * reach with a thumb as often as with a keyboard: arrow keys, a swipe across
 * the board, and a four-button pad below it on small screens.
 */
export function SnakeBoard({
  weeks,
  months,
  sound,
  boardRef,
  rotated = false,
}: SnakeBoardProps) {
  const t = useTranslations("Home");
  const board = useMemo<Board>(
    () => ({ columns: weeks.length, rows: WEEK_ROWS }),
    [weeks.length],
  );

  const [game, setGame] = useState<SnakeState>(() =>
    createGame(board, Math.random),
  );
  const [paused, setPaused] = useState(false);

  const touch = useRef<{ x: number; y: number } | null>(null);
  /** When the last board was lost — see `RESTART_MS`. */
  const lostAt = useRef(0);
  const beeper = useRef<ReturnType<typeof createBeeper> | null>(null);
  // The prop is read inside effects that only depend on the game: holding it
  // in a ref keeps a sound toggle from re-running them, which would replay the
  // last blip.
  const audible = useRef(sound);

  useEffect(() => {
    audible.current = sound;
  }, [sound]);

  const beep = useCallback((tone: "start" | "eat" | "over") => {
    if (!audible.current) return;
    beeper.current ??= createBeeper();
    beeper.current.play(tone);
  }, []);

  /** The graph underneath the game, one column per week. */
  const levels = useMemo(() => buildLevelColumns(weeks), [weeks]);

  const parts = useMemo(() => {
    const map = new Map<string, "head" | "body">();
    game.snake.forEach((cell, index) => {
      map.set(`${cell.x}:${cell.y}`, index === 0 ? "head" : "body");
    });
    return map;
  }, [game.snake]);

  const restart = useCallback(() => {
    setPaused(false);
    setGame(createGame(board, Math.random));
  }, [board]);

  const direct = useCallback(
    (direction: Direction) => {
      setPaused(false);
      setGame((current) => {
        if (current.status !== "over") return turn(current, direction);
        if (Date.now() - lostAt.current < RESTART_MS) return current;
        return turn(createGame(board, Math.random), direction);
      });
    },
    [board],
  );

  /**
   * The clock, re-armed only when the rate can have changed — the status, the
   * score, or a pause. Hanging it off the whole game state would restart the
   * interval on every turn, and key auto-repeat would then hold the snake a
   * tick short of ever moving.
   */
  useEffect(() => {
    if (game.status !== "running" || paused) return;

    const id = setInterval(
      () => setGame((current) => step(current, board, Math.random)),
      tickDelay(game.score),
    );

    return () => clearInterval(id);
  }, [game.status, game.score, paused, board]);

  // Sound follows the state rather than the input: a key that the engine
  // refuses — a half-turn, a press after the wall — makes no noise.
  useEffect(() => {
    if (game.score > 0) beep("eat");
  }, [game.score, beep]);

  useEffect(() => {
    if (game.status === "running") beep("start");
    if (game.status === "over") {
      lostAt.current = Date.now();
      beep("over");
    }
  }, [game.status, beep]);

  useEffect(() => {
    boardRef.current?.focus({ preventScroll: true });
    return () => beeper.current?.close();
  }, [boardRef]);

  // A hidden tab is a lost game otherwise: the loop keeps ticking into a
  // board nobody can see.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setPaused(true);
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    const direction = directionFromKey(event);

    if (direction) {
      direct(direction);
      event.preventDefault();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      restart();
      event.preventDefault();
    }
  }

  function onTouchEnd(event: React.TouchEvent<HTMLDivElement>): void {
    const start = touch.current;
    const end = event.changedTouches[0];
    touch.current = null;
    if (!start || !end) return;

    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    // The finger moves in screen space. Turned sideways, the board's +x runs
    // down the screen and its +y runs left, so the swipe is read back through
    // that quarter turn before it means anything.
    const direction = rotated
      ? directionFromSwipe(dy, -dx)
      : directionFromSwipe(dx, dy);

    if (direction) direct(direction);
  }

  /**
   * Focus leaving the game pauses it — but the sound toggle and the pad are
   * part of the game, so the pause only fires when focus lands outside the
   * section. Pausing on those would park the snake behind a button the arrow
   * keys can't reach.
   */
  function onBlur(event: React.FocusEvent<HTMLDivElement>): void {
    const region = event.currentTarget.closest("section") ?? event.currentTarget;
    const next = event.relatedTarget as Node | null;
    if (!next || !region.contains(next)) setPaused(true);
  }

  const padLabels: Record<Direction, string> = {
    up: t("snakeUp"),
    down: t("snakeDown"),
    left: t("snakeLeft"),
    right: t("snakeRight"),
  };

  const status =
    game.status === "over"
      ? t("snakeOver", { score: game.score })
      : paused
        ? t("snakePaused")
        : game.status === "running"
          ? t("snakeScore", { score: game.score })
          : t("snakeReady");

  return (
    <div className="flex flex-col">
      <GridMonths months={months} ids={weeks.map((week) => week.id)} />

      <div
        ref={boardRef}
        role="application"
        tabIndex={0}
        aria-label={t("snakeBoard")}
        aria-describedby="snake-status"
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onTouchStart={(event) => {
          touch.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };
        }}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => {
          touch.current = null;
        }}
        className="gap-cell flex touch-none outline-none"
      >
        {levels.map((column, x) => (
          <div key={weeks[x].id} className="gap-cell flex flex-1 flex-col">
            {column.map((level, y) => {
              const part = parts.get(`${x}:${y}`);
              const food = game.food.x === x && game.food.y === y;

              return (
                <span
                  key={y}
                  aria-hidden
                  className={`duration-fast ease-out aspect-square rounded-none transition-colors ${
                    part === "head"
                      ? "bg-foreground outline-foreground outline"
                      : part === "body"
                        ? "bg-foreground/70"
                        : food
                          ? "outline-foreground bg-transparent outline"
                          : GAME_FILL[level]
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="text-[13px] mt-2.5 font-sans text-fg flex items-baseline justify-between gap-4">
        <p id="snake-status" role="status">
          {status}
        </p>
        <GridLegend fills={GAME_FILL} square />
      </div>

      {/* Thumbs on a 6px cell can't aim, so the pad is the real control on a
          touch screen; the swipe above it is the shortcut. Keyed off the
          pointer rather than the width — a tablet is wide and still has no
          arrow keys — so a mouse never sees this row. */}
      <div className="pointer-coarse:grid mx-auto mt-6 hidden w-max grid-cols-3 grid-rows-2 gap-1.5">
        {PAD.map(({ direction, Icon, cell }) => (
          <button
            key={direction}
            type="button"
            onClick={() => direct(direction)}
            aria-label={padLabels[direction]}
            className={`${cell} border-border-token text-muted-foreground hover:text-foreground active:scale-[0.96] duration-fast ease-out flex size-11 items-center justify-center rounded-md border transition-[color,scale]`}
          >
            <Icon aria-hidden size={16} strokeWidth={1.5} />
          </button>
        ))}
      </div>
    </div>
  );
}
