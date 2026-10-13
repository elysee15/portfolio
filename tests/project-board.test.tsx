import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectBoard } from "@/components/home/project-board";
import { buildProjectGroups } from "@/src/lib/projects/groups";
import type { ProjectEntry } from "@/src/data/projects";
import { projectWords, renderIntl } from "./intl";

/** The board writes the filter straight to the history entry, never through
 *  the router: the panel it would refetch is already mounted. */
const replace = vi.spyOn(window.history, "replaceState");
let search = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => search,
}));

const ENTRIES: readonly ProjectEntry[] = [
  {
    slug: "un",
    name: "Un",
    kind: "entreprise",
    company: "VEONE",
    stack: [],
    desc: { fr: "Premier.", en: "First." },
    href: "https://un.example/",
  },
  {
    slug: "deux",
    name: "Deux",
    kind: "entreprise",
    company: "AKIL",
    stack: [],
    desc: { fr: "Deuxième.", en: "Second." },
  },
  {
    slug: "trois",
    name: "Trois",
    kind: "personnel",
    year: "2025",
    stack: [],
    desc: { fr: "Troisième.", en: "Third." },
  },
];

const words = projectWords("fr");

/**
 * The board keeps no tab state of its own: `?filtre` is the state. The mocked
 * router therefore has to behave like the real one — write the query, then
 * render again — or every assertion after the first click would read a URL
 * that never changed.
 */
function renderBoard() {
  const groups = buildProjectGroups(ENTRIES, {
    locale: "fr",
    words,
    caseStudies: ["trois"],
  });

  const board = () => (
    <ProjectBoard
      groups={groups}
      total={ENTRIES.length}
      withPreview={["un"]}
      words={words}
      link={{ href: "/lab", label: words.labLink }}
      todo="TODO : le reste."
    />
  );

  return renderIntl(board());
}

function tabs() {
  return within(screen.getByRole("tablist")).getAllByRole("tab");
}

beforeEach(() => {
  replace.mockClear();
  search = new URLSearchParams();
});

describe("ProjectBoard", () => {
  it("counts the rows of each tab and of the whole section", () => {
    renderBoard();

    const [company, personal] = tabs();
    expect(company).toHaveTextContent("Entreprise2");
    expect(personal).toHaveTextContent("Personnel1");
    expect(
      screen.getByRole("heading", { name: /Tous les projets/ }),
    ).toHaveTextContent("3");
  });

  it("opens on the company tab and shows only its rows", () => {
    renderBoard();

    const [company] = tabs();
    expect(company).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText("Trois")).not.toBeInTheDocument();
  });

  it("names the tablist for the screen reader", () => {
    renderBoard();

    expect(screen.getByRole("tablist")).toHaveAccessibleName(
      words.filterLabel,
    );
  });

  it("keeps the panel labelled by the selected tab", () => {
    search = new URLSearchParams("filtre=personnel");
    renderBoard();

    const [, personal] = tabs();
    expect(personal).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      personal.getAttribute("id"),
    );
  });

  it("renders the tab named by the URL", () => {
    search = new URLSearchParams("filtre=personnel");
    renderBoard();

    expect(screen.getByText("Trois")).toBeInTheDocument();
    expect(screen.queryByText("Un")).not.toBeInTheDocument();
  });

  it("falls back to the first tab when the URL names an unknown filter", () => {
    search = new URLSearchParams("filtre=martien");
    renderBoard();

    expect(tabs()[0]).toHaveAttribute("aria-selected", "true");
  });

  it("writes the chosen filter to the URL without scrolling", async () => {
    const user = userEvent.setup();
    renderBoard();

    await user.click(tabs()[1]);

    expect(replace).toHaveBeenCalledWith(null, "", "/?filtre=personnel");
  });

  it("swaps the panel on click without waiting for a navigation", async () => {
    const user = userEvent.setup();
    renderBoard();

    await user.click(tabs()[1]);

    expect(screen.getByText("Trois")).toBeInTheDocument();
    expect(screen.queryByText("Un")).not.toBeInTheDocument();
  });

  it("moves between tabs with the arrow keys, and to the ends with Home/End", async () => {
    const user = userEvent.setup();
    renderBoard();

    const [company, personal] = tabs();
    company.focus();

    await user.keyboard("{ArrowRight}");
    expect(personal).toHaveFocus();
    expect(replace).toHaveBeenLastCalledWith(null, "", "/?filtre=personnel");

    await user.keyboard("{Home}");
    expect(company).toHaveFocus();
    expect(replace).toHaveBeenLastCalledWith(null, "", "/?filtre=entreprise");

    await user.keyboard("{End}");
    expect(personal).toHaveFocus();
  });

  it("gives the keyboard one stop for the whole tablist", () => {
    renderBoard();

    expect(tabs().map((tab) => tab.getAttribute("tabindex"))).toEqual([
      "0",
      "-1",
    ]);
  });

  it("links a row to its case study, to the live product, or nowhere", () => {
    search = new URLSearchParams("filtre=personnel");
    const { unmount } = renderBoard();

    expect(screen.getByRole("link", { name: /Trois/ })).toHaveAttribute(
      "href",
      "/projets/trois",
    );
    unmount();

    search = new URLSearchParams();
    renderBoard();
    const live = screen.getByRole("link", { name: /Un/ });
    expect(live).toHaveAttribute("href", "https://un.example/");
    expect(live).toHaveAttribute("target", "_blank");
    expect(screen.queryByRole("link", { name: /Deux/ })).not.toBeInTheDocument();
  });

  it("does not mount the cursor preview on a coarse pointer", async () => {
    const user = userEvent.setup();
    renderBoard();

    await user.hover(screen.getByRole("link", { name: /Un/ }));

    expect(screen.queryByText(/aperçu/)).not.toBeInTheDocument();
  });
});
