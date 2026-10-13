import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MusicPlayer } from "@/components/layout/music-player";
import { tracks } from "@/src/data/music";
import { renderIntl } from "./intl";

/**
 * jsdom implémente l'élément mais aucun des médias : sans ces stubs, `play()`
 * lève « Not implemented ». On émet aussi les événements que le lecteur écoute,
 * puisqu'il tire son état d'eux et non du clic, et on rend `paused` et `ended`
 * inscriptibles — le lecteur les lit pour distinguer une vraie pause d'un
 * enchaînement, et un échec de lecture d'un `play()` avorté.
 */
const play = vi.fn(function (this: HTMLAudioElement) {
  state(this).paused = false;
  this.dispatchEvent(new Event("play"));
  return Promise.resolve();
});

const pause = vi.fn(function (this: HTMLAudioElement) {
  state(this).paused = true;
  this.dispatchEvent(new Event("pause"));
});

interface MediaState {
  paused: boolean;
  ended: boolean;
}

const states = new WeakMap<HTMLMediaElement, MediaState>();

function state(media: HTMLMediaElement): MediaState {
  let found = states.get(media);
  if (!found) {
    found = { paused: true, ended: false };
    states.set(media, found);
  }
  return found;
}

Object.defineProperties(HTMLMediaElement.prototype, {
  play: { value: play },
  pause: { value: pause },
  paused: {
    get(this: HTMLMediaElement) {
      return state(this).paused;
    },
  },
  ended: {
    get(this: HTMLMediaElement) {
      return state(this).ended;
    },
  },
});

function element(): HTMLAudioElement {
  const audio = document.querySelector("audio");
  if (!audio) throw new Error("pas d’élément audio");
  return audio;
}

describe("MusicPlayer", () => {
  beforeEach(() => {
    play.mockClear();
    pause.mockClear();
  });

  /** Fait jouer le lecteur et rend le bouton play/pause. */
  async function start(user: ReturnType<typeof userEvent.setup>) {
    const button = screen.getByRole("button", {
      name: "Lire",
    });
    await user.click(button);
    return button;
  }

  it("ne charge rien avant le premier clic", () => {
    renderIntl(<MusicPlayer />);

    expect(element()).toHaveAttribute("preload", "none");
    expect(element().getAttribute("src")).toBeNull();
    expect(play).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Lire" })).toBeInTheDocument();
  });

  it("joue la première piste et bascule le libellé du bouton", async () => {
    const user = userEvent.setup();
    renderIntl(<MusicPlayer />);

    await user.click(screen.getByRole("button", { name: "Lire" }));

    expect(play).toHaveBeenCalledOnce();
    expect(element().src).toContain(tracks[0].src);
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });

  it("met en pause sans recharger la source", async () => {
    const user = userEvent.setup();
    renderIntl(<MusicPlayer />);

    await user.click(screen.getByRole("button", { name: "Lire" }));
    await user.click(screen.getByRole("button", { name: "Pause" }));

    expect(pause).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Lire" })).toBeInTheDocument();
  });

  it("passe à la piste suivante et reboucle sur la première", async () => {
    const user = userEvent.setup();
    renderIntl(<MusicPlayer />);

    const next = screen.getByRole("button", { name: "Piste suivante" });

    for (let step = 1; step <= tracks.length; step += 1) {
      await user.click(next);

      const expected = tracks[step % tracks.length];
      expect(element().src).toContain(expected.src);
      expect(screen.getByTitle(new RegExp(expected.title))).toBeInTheDocument();
    }
  });

  it("recule d’une piste et reboucle sur la dernière", async () => {
    const user = userEvent.setup();
    renderIntl(<MusicPlayer />);

    await user.click(screen.getByRole("button", { name: "Piste précédente" }));

    const last = tracks[tracks.length - 1];
    expect(element().src).toContain(last.src);
    expect(screen.getByTitle(new RegExp(last.title))).toBeInTheDocument();
  });

  it("déplie la playlist et joue la piste choisie", async () => {
    const user = userEvent.setup();
    renderIntl(<MusicPlayer />);

    const trigger = screen.getByRole("button", {
      name: `Playlist (${tracks.length})`,
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: /Lightless Dawn/ }));

    expect(element().src).toContain(tracks[2].src);
    expect(play).toHaveBeenCalledOnce();
  });

  it("enchaîne sur la piste suivante en fin de lecture", async () => {
    renderIntl(<MusicPlayer />);

    act(() => {
      element().dispatchEvent(new Event("ended"));
    });

    expect(element().src).toContain(tracks[1].src);
    expect(play).toHaveBeenCalledOnce();
  });

  it("revient au repos si la lecture échoue", async () => {
    const user = userEvent.setup();
    renderIntl(<MusicPlayer />);

    await user.click(screen.getByRole("button", { name: "Lire" }));

    act(() => {
      element().dispatchEvent(new Event("error"));
    });

    expect(screen.getByRole("button", { name: "Lire" })).toBeInTheDocument();
  });

  it("ignore la rejection du play() avorté par un changement de piste", async () => {
    const user = userEvent.setup();
    renderIntl(<MusicPlayer />);
    await start(user);

    // Remplacer la source avorte le play() en cours : il rejette alors que la
    // piste suivante, elle, joue déjà.
    play.mockImplementationOnce(function (this: HTMLAudioElement) {
      state(this).paused = false;
      this.dispatchEvent(new Event("play"));
      return Promise.reject(
        Object.assign(new Error("aborted"), { name: "AbortError" }),
      );
    });

    await user.click(screen.getByRole("button", { name: "Piste suivante" }));
    await act(async () => {});

    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });

  it("revient au repos quand play() échoue vraiment", async () => {
    const user = userEvent.setup();
    renderIntl(<MusicPlayer />);

    play.mockImplementationOnce(() =>
      Promise.reject(new Error("NotAllowedError")),
    );

    await start(user);
    await act(async () => {});

    expect(screen.getByRole("button", { name: "Lire" })).toBeInTheDocument();
  });

  it("ne clignote pas sur le `pause` qui précède `ended`", async () => {
    const user = userEvent.setup();
    renderIntl(<MusicPlayer />);
    await start(user);

    act(() => {
      const media = element();
      state(media).ended = true;
      media.dispatchEvent(new Event("pause"));
    });

    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });

  it("retire ses écouteurs au démontage", async () => {
    const user = userEvent.setup();
    const { unmount } = renderIntl(<MusicPlayer />);
    await start(user);

    const media = element();
    play.mockClear();
    unmount();
    media.dispatchEvent(new Event("ended"));

    expect(play).not.toHaveBeenCalled();
  });
});
