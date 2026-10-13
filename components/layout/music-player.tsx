"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { tracks } from "@/src/data/music";

/** À 1.0 le lecteur agresse et personne ne clique une deuxième fois. */
const VOLUME = 0.5;

/** Deux décimales sur la progression suffisent : le rail fait 1px de haut. */
const PROGRESS_STEPS = 200;

/** Cible tactile de 44px sur le bouton central, pour que « Lire » et « Pause »
 *  — qui n'ont pas la même largeur — ne décalent pas la ligne en basculant. */
const CONTROL =
  "transition-colors duration-fast ease-out hover:text-foreground";

/**
 * Le lecteur de musique du footer. « Off by default » au sens littéral :
 * `preload="none"` et aucun `src` tant que le visiteur n'a pas cliqué, donc la
 * page ne télécharge pas un octet d'audio avant qu'il soit demandé.
 *
 * Le `src` est posé impérativement sur l'élément plutôt que par le JSX : React
 * ne commite qu'après le handler, et `play()` rejouerait la piste précédente.
 *
 * `playing` suit les événements de l'élément, pas le clic — si `play()` est
 * rejeté (fichier absent, politique d'autoplay), le libellé ne ment pas.
 */
export function MusicPlayer() {
  const t = useTranslations("Player");
  const audio = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  const track = tracks[index];

  // Le `.catch()` est indispensable : `play()` rend une promesse, et une
  // rejection non gérée remonterait en erreur console à chaque échec. Le test
  // sur `paused` écarte l'`AbortError` d'un enchaînement rapide — remplacer la
  // source avorte le `play()` précédent, et sa rejection arrive après le
  // `play` de la piste suivante, qui est bien en train de jouer.
  const run = useCallback((element: HTMLAudioElement) => {
    element.volume = VOLUME;
    void element.play().catch(() => {
      if (element.paused) setPlaying(false);
    });
  }, []);

  const select = useCallback(
    (next: number) => {
      const element = audio.current;
      if (!element) return;

      setIndex(next);
      setProgress(0);
      element.src = tracks[next].src;
      run(element);
    },
    [run],
  );

  const step = useCallback(
    (delta: number) => {
      select((index + delta + tracks.length) % tracks.length);
    },
    [index, select],
  );

  const toggle = useCallback(() => {
    const element = audio.current;
    if (!element) return;

    if (playing) {
      element.pause();
      return;
    }

    // Première lecture de la session : l'élément n'a pas encore de source.
    if (!element.src) element.src = track.src;
    run(element);
  }, [playing, run, track.src]);

  // Enchaînement automatique en fin de piste : autorisé hors geste utilisateur
  // parce que le même élément a déjà joué après un clic.
  useEffect(() => {
    const element = audio.current;
    if (!element) return;

    const onPlay = () => setPlaying(true);
    // `pause` est émis juste avant `ended` : sans ce garde, chaque enchaînement
    // ferait clignoter le libellé le temps d'un aller-retour de 200ms.
    const onStop = () => {
      if (!element.ended) setPlaying(false);
    };
    const onNext = () => step(1);
    // La progression est quantifiée : sans ça, `timeupdate` repeindrait le rail
    // quatre fois par seconde pour un déplacement sous le pixel.
    const onTime = () => {
      const ratio = element.duration
        ? element.currentTime / element.duration
        : 0;
      setProgress(Math.round(ratio * PROGRESS_STEPS) / (PROGRESS_STEPS / 100));
    };

    element.addEventListener("play", onPlay);
    element.addEventListener("pause", onStop);
    element.addEventListener("error", onStop);
    element.addEventListener("ended", onNext);
    element.addEventListener("timeupdate", onTime);

    return () => {
      element.removeEventListener("play", onPlay);
      element.removeEventListener("pause", onStop);
      element.removeEventListener("error", onStop);
      element.removeEventListener("ended", onNext);
      element.removeEventListener("timeupdate", onTime);
    };
  }, [step]);

  return (
    <div
      role="region"
      aria-label={t("region")}
      className="flex flex-col gap-2"
    >
      <audio ref={audio} preload="none" hidden />

      <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={t("previous")}
          className={CONTROL}
        >
          {t("previousShort")}
        </button>

        <button
          type="button"
          onClick={toggle}
          aria-pressed={playing}
          className="text-foreground min-w-11 text-left"
        >
          {playing ? t("pause") : t("play")}
        </button>

        <button
          type="button"
          onClick={() => step(1)}
          aria-label={t("next")}
          className={CONTROL}
        >
          {t("nextShort")}
        </button>

        <span
          title={`${track.title} — ${track.artist} · ${track.license} · ${track.source}`}
          className="text-foreground min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {track.title}
          <span className="text-muted-foreground"> · {track.artist}</span>
        </span>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="playlist"
          className={`${CONTROL} ml-auto`}
        >
          {t("playlist", { count: tracks.length })}
        </button>
      </div>

      {/* Rail de progression : décoratif, l'information utile est dans le
          `role="status"` plus bas. */}
      <div
        aria-hidden
        className="bg-border-token relative h-px overflow-hidden"
      >
        <span
          style={{ width: `${progress}%` }}
          className="bg-foreground duration-base absolute inset-y-0 left-0 transition-[width] ease-linear"
        />
      </div>

      {/* `grid-template-rows: 0fr → 1fr` : la seule façon d'animer vers une
          hauteur automatique sans la mesurer en JS. */}
      <div
        id="playlist"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        className="duration-slow grid transition-[grid-template-rows] ease-out"
      >
        <div
          style={{ visibility: open ? "visible" : "hidden" }}
          className="duration-slow min-h-0 overflow-hidden transition-[visibility]"
        >
          <ol className="m-0 mt-1 flex list-none flex-col p-0">
            {tracks.map((entry, key) => (
              <li key={entry.src}>
                <button
                  type="button"
                  onClick={() => select(key)}
                  aria-current={key === index}
                  className={`${CONTROL} flex w-full justify-between gap-3 py-1.5 ${
                    key === index ? "text-foreground" : ""
                  }`}
                >
                  <span>{entry.title}</span>
                  <span className="tabular-nums">
                    {String(key + 1).padStart(2, "0")}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <span role="status" className="sr-only">
        {playing ? t("nowPlaying", { title: track.title, artist: track.artist }) : ""}
      </span>
    </div>
  );
}
