/**
 * Level → fill, shared by the grid island and the legend beside it. Full
 * class strings, never interpolated fragments: Tailwind scans the source as
 * text and would not emit a class it can't read whole.
 *
 * Its own module rather than an export of the island: a value imported from a
 * `"use client"` file reaches a Server Component as a client reference, not as
 * the array itself, and `FILL.map` would throw during the prerender.
 */
/** The graph's five steps, `8 / 25 / 45 / 70 / 100 %` of `--fg`. */
export const FILL = [
  "bg-foreground/8",
  "bg-foreground/25",
  "bg-foreground/45",
  "bg-foreground/70",
  "bg-foreground",
] as const;

/**
 * The same five steps, dimmed for the game. The year stays readable under the
 * board, but a level-4 day can no longer be mistaken for the snake — which is
 * drawn at full `--fg` over it.
 */
export const GAME_FILL = [
  "bg-foreground/4",
  "bg-foreground/10",
  "bg-foreground/16",
  "bg-foreground/22",
  "bg-foreground/28",
] as const;
