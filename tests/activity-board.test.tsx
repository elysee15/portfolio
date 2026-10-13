import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ActivityBoard } from "@/components/home/activity-board";
import type { GridWeek } from "@/src/lib/github/grid";

import { messages, renderIntl } from "./intl";

const words = messages.fr.Home;

/** Ten full weeks — the shape the server hands down, minus a year of days. */
const weeks: readonly GridWeek[] = Array.from({ length: 10 }, (_, week) => ({
  id: `2026-01-${String(week + 1).padStart(2, "0")}`,
  offset: 0,
  days: Array.from({ length: 7 }, (_, day) => ({
    date: `2026-01-${String(week * 7 + day + 1).padStart(2, "0")}`,
    level: 0 as const,
    label: `0 contribution · jour ${week * 7 + day + 1}`,
  })),
}));

/** Inside a `<section>`, as `Activity` renders it: the game reads that
 *  element to tell its own controls from the rest of the page. */
function board() {
  return renderIntl(
    <section id="activite">
      <ActivityBoard
        weeks={weeks}
        months={weeks.map(() => null)}
        total="1 003 contributions sur les 12 derniers mois"
        label={words.contributions}
        github="elysee15"
      />
    </section>,
  );
}

describe("ActivityBoard", () => {
  it("shows the graph and its readout until the game is opened", () => {
    board();

    expect(
      screen.getByText("1 003 contributions sur les 12 derniers mois"),
    ).toBeInTheDocument();
    expect(screen.queryByText(words.snakeReady)).not.toBeInTheDocument();
  });

  it("swaps the header controls and the graph for the game", async () => {
    const user = userEvent.setup();
    board();

    await user.click(screen.getByRole("button", { name: words.play }));

    expect(screen.getByText(words.snakeReady)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: words.quit }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("1 003 contributions sur les 12 derniers mois"),
    ).not.toBeInTheDocument();
    // The handle stays put: only the left of the row belongs to the game.
    expect(screen.getByRole("link", { name: /elysee15/ })).toBeInTheDocument();
  });

  it("starts on an arrow key and scores from zero", async () => {
    const user = userEvent.setup();
    board();

    await user.click(screen.getByRole("button", { name: words.play }));
    await user.keyboard("{ArrowUp}");

    expect(screen.getByText("Score : 0")).toBeInTheDocument();
  });

  it("starts from the on-screen pad, for a thumb with no keyboard", async () => {
    const user = userEvent.setup();
    board();

    await user.click(screen.getByRole("button", { name: words.play }));
    await user.click(screen.getByRole("button", { name: words.snakeDown }));

    expect(screen.getByText("Score : 0")).toBeInTheDocument();
  });

  it("starts on a swipe across the board, and ignores a tap", async () => {
    const user = userEvent.setup();
    board();

    await user.click(screen.getByRole("button", { name: words.play }));
    const game = screen.getByRole("application");

    fireEvent.touchStart(game, { touches: [{ clientX: 120, clientY: 40 }] });
    fireEvent.touchEnd(game, {
      changedTouches: [{ clientX: 124, clientY: 44 }],
    });
    expect(screen.getByText(words.snakeReady)).toBeInTheDocument();

    fireEvent.touchStart(game, { touches: [{ clientX: 120, clientY: 40 }] });
    fireEvent.touchEnd(game, {
      changedTouches: [{ clientX: 120, clientY: 100 }],
    });
    expect(screen.getByText("Score : 0")).toBeInTheDocument();
  });

  it("toggles the sound without pausing the game", async () => {
    const user = userEvent.setup();
    board();

    await user.click(screen.getByRole("button", { name: words.play }));
    await user.keyboard("{ArrowUp}");

    const toggle = screen.getByRole("button", { name: /Son/ });
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await user.click(toggle);

    expect(
      screen.getByRole("button", { name: "Son : coupé" }),
    ).toHaveAttribute("aria-pressed", "false");
    // Focus left the board for a control that belongs to the game: pausing
    // here would park the snake behind a button the arrows can't reach.
    expect(screen.queryByText(words.snakePaused)).not.toBeInTheDocument();
    expect(screen.getByText("Score : 0")).toBeInTheDocument();
  });

  it("expands the board, and Escape brings it back", async () => {
    const user = userEvent.setup();
    board();

    await user.click(screen.getByRole("button", { name: words.play }));
    await user.keyboard("{ArrowUp}");
    await user.click(screen.getByRole("button", { name: words.expand }));

    const collapse = screen.getByRole("button", { name: words.collapse });
    expect(collapse).toHaveAttribute("aria-pressed", "true");
    // Expanding hands the arrows back, so the run survives the click.
    expect(screen.getByRole("application")).toHaveFocus();
    expect(screen.getByText("Score : 0")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(
      screen.getByRole("button", { name: words.expand }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("gives the graph and the focus back on quit", async () => {
    const user = userEvent.setup();
    board();

    await user.click(screen.getByRole("button", { name: words.play }));
    await user.click(screen.getByRole("button", { name: words.quit }));

    const play = screen.getByRole("button", { name: words.play });
    expect(play).toHaveFocus();
    expect(
      screen.getByText("1 003 contributions sur les 12 derniers mois"),
    ).toBeInTheDocument();
  });
});
