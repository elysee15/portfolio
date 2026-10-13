import { describe, expect, it } from "vitest";

import {
  createGame,
  step,
  tickDelay,
  turn,
  type Board,
  type Cell,
  type SnakeState,
} from "@/src/lib/snake/engine";

const board: Board = { columns: 10, rows: 7 };

/** A `Random` that always returns the same draw — food placement is then exact. */
const draw = (value: number) => () => value;

/** Puts a game in a known shape; the board maths never reads the other fields. */
function game(state: Partial<SnakeState>): SnakeState {
  return {
    ...createGame(board, draw(0)),
    status: "running",
    ...state,
  };
}

function cells(...pairs: readonly [number, number][]): Cell[] {
  return pairs.map(([x, y]) => ({ x, y }));
}

describe("createGame", () => {
  it("lays a three-cell snake across the middle row, head first", () => {
    const state = createGame(board, draw(0));

    expect(state.snake).toEqual(cells([5, 3], [4, 3], [3, 3]));
    expect(state.direction).toBe("right");
    expect(state.status).toBe("idle");
    expect(state.score).toBe(0);
  });

  it("never drops the food on the snake", () => {
    // Every draw lands on a free cell, whichever one the random picks.
    for (let i = 0; i < 20; i += 1) {
      const state = createGame(board, draw(i / 20));
      expect(state.snake).not.toContainEqual(state.food);
    }
  });
});

describe("turn", () => {
  it("starts an idle game", () => {
    expect(turn(createGame(board, draw(0)), "up").status).toBe("running");
  });

  it("ignores a half-turn onto the snake's own neck", () => {
    const state = game({ direction: "right" });
    expect(turn(state, "left").pending).toBeNull();
  });

  it("ignores a half-turn made of two quarter-turns inside one tick", () => {
    // right → up is legal, up → left is legal, but both land before the next
    // step: without queueing against `pending` the snake would reverse.
    const state = turn(game({ direction: "right" }), "up");
    expect(turn(state, "left").pending).toBe("up");
  });

  it("answers with the same state when the snake already runs that way", () => {
    // Key auto-repeat: a new object here would re-arm the clock every 30ms.
    const state = game({ direction: "right" });
    expect(turn(state, "right")).toBe(state);
  });

  it("does nothing once the game is over", () => {
    expect(turn(game({ status: "over" }), "up").status).toBe("over");
  });
});

describe("step", () => {
  it("moves the head and drops the tail", () => {
    const state = step(
      game({ snake: cells([5, 3], [4, 3], [3, 3]), direction: "right" }),
      board,
      draw(0),
    );

    expect(state.snake).toEqual(cells([6, 3], [5, 3], [4, 3]));
    expect(state.score).toBe(0);
  });

  it("applies the queued direction", () => {
    const state = step(
      game({ snake: cells([5, 3], [4, 3]), direction: "right", pending: "up" }),
      board,
      draw(0),
    );

    expect(state.snake[0]).toEqual({ x: 5, y: 2 });
    expect(state.direction).toBe("up");
    expect(state.pending).toBeNull();
  });

  it("comes out the other side of a wall, Nokia style", () => {
    const right = step(
      game({ snake: cells([9, 3], [8, 3]), direction: "right" }),
      board,
      draw(0),
    );
    expect(right.status).toBe("running");
    expect(right.snake[0]).toEqual({ x: 0, y: 3 });

    const up = step(
      game({ snake: cells([5, 0], [5, 1]), direction: "up" }),
      board,
      draw(0),
    );
    expect(up.snake[0]).toEqual({ x: 5, y: 6 });
  });

  it("ends the game against its own body", () => {
    const snake = cells([5, 3], [5, 2], [4, 2], [4, 3], [3, 3]);
    const state = step(game({ snake, direction: "up" }), board, draw(0));

    expect(state.status).toBe("over");
  });

  it("lets the head follow the cell the tail is leaving", () => {
    const snake = cells([5, 3], [5, 2], [4, 2], [4, 3]);
    const state = step(game({ snake, direction: "down" }), board, draw(0));

    expect(state.status).toBe("running");
    expect(state.snake[0]).toEqual({ x: 5, y: 4 });
  });

  it("grows, scores and re-places the food when it eats", () => {
    const snake = cells([5, 3], [4, 3]);
    const state = step(
      game({ snake, direction: "right", food: { x: 6, y: 3 } }),
      board,
      draw(0.5),
    );

    expect(state.snake).toEqual(cells([6, 3], [5, 3], [4, 3]));
    expect(state.score).toBe(1);
    expect(state.food).not.toEqual({ x: 6, y: 3 });
    expect(state.snake).not.toContainEqual(state.food);
  });

  it("stands still while idle or over", () => {
    const idle = createGame(board, draw(0));
    expect(step(idle, board, draw(0))).toBe(idle);

    const over = game({ status: "over" });
    expect(step(over, board, draw(0))).toBe(over);
  });
});

describe("tickDelay", () => {
  it("speeds up with the score, down to a floor", () => {
    expect(tickDelay(0)).toBeGreaterThan(tickDelay(5));
    expect(tickDelay(1000)).toBe(tickDelay(10_000));
  });
});
