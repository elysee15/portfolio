/**
 * The snake game played on the contribution graph. Pure and framework-free:
 * the board is `columns × rows`, the island owns the clock, the keyboard and
 * the pixels, and every function here answers with a new state.
 *
 * Keeping it out of the island is what makes the rules testable — a tick is a
 * call, not a timer — and keeps the graph's own derivations (`github/grid.ts`)
 * free of game state.
 */

export interface Board {
  readonly columns: number;
  readonly rows: number;
}

/** A board square. `y` counts down from the top row, like the graph's weekdays. */
export interface Cell {
  readonly x: number;
  readonly y: number;
}

export type Direction = "up" | "down" | "left" | "right";

export type SnakeStatus = "idle" | "running" | "over";

export interface SnakeState {
  /** Head first; the last entry is the tail that leaves on the next step. */
  readonly snake: readonly Cell[];
  readonly food: Cell;
  /** The direction the last step was taken in. */
  readonly direction: Direction;
  /** Queued for the next step — see `turn`. */
  readonly pending: Direction | null;
  readonly status: SnakeStatus;
  readonly score: number;
}

/** `Math.random` in the app; a fixed draw in the tests. */
export type Random = () => number;

const INITIAL_LENGTH = 3;

/** Slow enough to read a 9px cell, fast enough not to feel like a slideshow. */
const START_MS = 160;
const FLOOR_MS = 80;
/** Milliseconds shaved off the tick per point eaten. */
const SPEED_UP_MS = 4;

const VECTORS: Record<Direction, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function tickDelay(score: number): number {
  return Math.max(FLOOR_MS, START_MS - score * SPEED_UP_MS);
}

/** `-1` on a 53-wide board is column 52, not an error. */
function wrap(value: number, length: number): number {
  return (value + length) % length;
}

function same(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Draws one of the free squares. Counting free squares rather than retrying a
 * random cell keeps the draw bounded: on a nearly full board, rejection
 * sampling would spin.
 */
function placeFood(
  board: Board,
  snake: readonly Cell[],
  random: Random,
): Cell {
  const free = board.columns * board.rows - snake.length;
  let remaining = Math.floor(random() * free);

  for (let x = 0; x < board.columns; x += 1) {
    for (let y = 0; y < board.rows; y += 1) {
      const cell = { x, y };
      if (snake.some((part) => same(part, cell))) continue;
      if (remaining === 0) return cell;
      remaining -= 1;
    }
  }

  // Unreachable while the snake is shorter than the board; a filled board is a
  // win, and the caller reads it as such rather than crashing on `undefined`.
  return snake[0];
}

export function createGame(board: Board, random: Random): SnakeState {
  const y = Math.floor(board.rows / 2);
  const x = Math.floor(board.columns / 2);
  const snake = Array.from({ length: INITIAL_LENGTH }, (_, index) => ({
    x: x - index,
    y,
  }));

  return {
    snake,
    food: placeFood(board, snake, random),
    direction: "right",
    pending: null,
    status: "idle",
    score: 0,
  };
}

/**
 * Queues a direction, starting the game if it was idle. A half-turn is
 * dropped: it would run the head straight into the neck.
 *
 * The queue holds one turn, and a second one inside the same tick is dropped:
 * `right → up → left` would otherwise land before a single step ran and
 * reverse the snake onto itself.
 */
export function turn(state: SnakeState, direction: Direction): SnakeState {
  if (state.status === "over") return state;
  if (state.pending !== null) return state;
  if (OPPOSITES[direction] === state.direction) return state;
  // Key auto-repeat sends the direction already being run 30 times a second.
  // Answering with the same state keeps those presses out of React.
  if (direction === state.direction && state.status === "running") return state;

  return { ...state, pending: direction, status: "running" };
}

/** One tick. Idle and finished games stand still, identity included. */
export function step(
  state: SnakeState,
  board: Board,
  random: Random,
): SnakeState {
  if (state.status !== "running") return state;

  const direction = state.pending ?? state.direction;
  const vector = VECTORS[direction];
  // The board wraps, as Snake II did on the Nokia: an edge is a doorway, and
  // the only way to lose is to run into yourself.
  const head = {
    x: wrap(state.snake[0].x + vector.x, board.columns),
    y: wrap(state.snake[0].y + vector.y, board.rows),
  };

  const eating = same(head, state.food);
  // The tail square frees up on the same tick, so the head may follow it —
  // unless the snake is growing, in which case the tail stays put.
  const body = eating ? state.snake : state.snake.slice(0, -1);

  if (body.some((part) => same(part, head))) {
    return { ...state, direction, pending: null, status: "over" };
  }

  const snake = [head, ...body];

  return {
    snake,
    food: eating ? placeFood(board, snake, random) : state.food,
    direction,
    pending: null,
    status: "running",
    score: eating ? state.score + 1 : state.score,
  };
}
