/**
 * Reading a direction out of what the player did. Pure, so the three ways into
 * the game — keys, swipe, on-screen pad — are testable without a board.
 */

import type { Direction } from "./engine";

/** Below this many pixels, a touch is a tap and not a swipe. */
export const SWIPE_PX = 16;

/** Arrows, `WASD`, and the `ZQSD` the same fingers land on an AZERTY board. */
const KEYS: Record<string, Direction> = {
  arrowup: "up",
  arrowdown: "down",
  arrowleft: "left",
  arrowright: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  z: "up",
  q: "left",
};

export interface KeyPress {
  readonly key: string;
  readonly metaKey?: boolean;
  readonly ctrlKey?: boolean;
  readonly altKey?: boolean;
}

/**
 * `null` for anything the game doesn't steer with — including a shortcut, so
 * ⌘S over the board still saves the page instead of turning the snake.
 */
export function directionFromKey(event: KeyPress): Direction | null {
  if (event.metaKey || event.ctrlKey || event.altKey) return null;
  return KEYS[event.key.toLowerCase()] ?? null;
}

/** The dominant axis of a swipe, or `null` when it was too short to mean one. */
export function directionFromSwipe(dx: number, dy: number): Direction | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}
