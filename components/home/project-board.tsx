"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useSpring } from "motion/react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProjectsDictionary } from "@/src/lib/projects/groups";
import type { ProjectGroup, ProjectRowData } from "@/src/lib/projects/groups";

interface ProjectBoardProps {
  groups: readonly ProjectGroup[];
  /** Rows across every tab, counted on the server (`countProjects`). */
  total: number;
  /** Slugs whose live site publishes an og:image — resolved on the server. */
  withPreview: readonly string[];
  words: ProjectsDictionary;
  link: { href: string; label: string };
  todo: string;
}

/** The tab is in the URL, so a filtered list can be linked and reloaded. */
const PARAM = "filtre";

/** Same-origin proxy: the browser never talks to the product's host itself. */
function previewSrc(slug: string): string {
  return `/api/preview/${slug}`;
}

/** The preview card trails the cursor — DESIGN.md § Motion, spring, not easing. */
const FOLLOW = { visualDuration: 0.25, bounce: 0 } as const;
/** Enough to clear the pointer without the card covering the row it describes. */
const OFFSET_Y = 28;

export function ProjectBoard({
  groups,
  total,
  withPreview,
  words,
  link,
  todo,
}: ProjectBoardProps) {
  const pathname = usePathname();
  const params = useSearchParams();

  // The URL still carries the filter — `?filtre=personnel` renders the same
  // board whether it was clicked, shared or reloaded — but it is written, not
  // read back: every row of every tab is already in `groups`, so a click only
  // has to swap a panel. An unknown value falls back to the first tab rather
  // than showing an empty panel.
  const [clicked, setClicked] = useState<string | null>(null);
  const requested = clicked ?? params.get(PARAM);
  const value =
    groups.find((group) => group.id === requested)?.id ?? groups[0]?.id;

  const [preview, setPreview] = useState<ProjectRowData | null>(null);
  const finePointer = useFinePointer();

  const previewable = useMemo(() => new Set(withPreview), [withPreview]);
  const warmed = useWarmPreviews(withPreview, finePointer);

  const x = useSpring(0, FOLLOW);
  const y = useSpring(0, FOLLOW);

  function select(next: string) {
    setClicked(next);
    setPreview(null);

    const query = new URLSearchParams(params);
    query.set(PARAM, next);
    // `history.replaceState`, not `router.replace`: the router would refetch
    // the whole RSC payload for a panel that is already mounted, and the tab
    // would only swap once that round trip lands. A filter is not a page, so
    // `replace` and not `push` — and nothing scrolls.
    window.history.replaceState(null, "", `${pathname}?${query}`);
  }

  // The card is mounted where the pointer already is: without the jump it would
  // spring in from wherever the previous row left it, across the whole list.
  function point(event: React.PointerEvent, jump: boolean) {
    if (jump) {
      x.jump(event.clientX);
      y.jump(event.clientY + OFFSET_Y);
      return;
    }
    x.set(event.clientX);
    y.set(event.clientY + OFFSET_Y);
  }

  return (
    <Tabs value={value} onValueChange={(next) => select(String(next))}>
      <div className="border-border-token flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b">
        {/* Same `text-h2` as every other home section title; the total is the
            tabs' own `text-meta` count, so the three figures on this bar read
            as one scale rather than as a heading with a badge. */}
        <h2
          id="h-proj"
          className="font-sans text-muted text-sm flex items-baseline gap-2 pb-1.5"
        >
          {words.allProjects}
          <span className="text-muted text-xs tabular-nums">{total}</span>
        </h2>

        <TabsList variant="bare" activateOnFocus aria-label={words.filterLabel}>
          {groups.map((group) => (
            <TabsTrigger key={group.id} value={group.id}>
              {group.label}
              <span className="text-muted text-xs tabular-nums">
                {group.count}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {groups.map((group) => (
        <TabsContent key={group.id} value={group.id}>
          <ol className="divide-border-token border-border-token divide-y border-b [&>li]:duration-base [&>li]:ease-out [&:has(:focus-visible)>li:not(:has(:focus-visible))]:opacity-50 [&>li]:transition-opacity pointer-fine:[&:has(:hover)>li:not(:hover)]:opacity-50">
            {group.entries.map((entry) => (
              <li key={entry.slug}>
                <ProjectRow
                  entry={entry}
                  onEnter={(event) => {
                    point(event, true);
                    if (finePointer) setPreview(entry);
                  }}
                  onMove={(event) => point(event, false)}
                  onLeave={() =>
                    setPreview((shown) => (shown === entry ? null : shown))
                  }
                />
              </li>
            ))}
          </ol>

          <p className="text-meta text-muted-foreground">{todo}</p>
        </TabsContent>
      ))}

      <p>
        <Link
          href={link.href}
          className="decoration-subtle hover:decoration-fg duration-fast ease-out group text-meta inline-flex items-center gap-2 underline decoration-1 underline-offset-[3px] transition-[text-decoration-color,text-underline-offset] hover:underline-offset-4"
        >
          {link.label}
          <ArrowRight
            aria-hidden
            strokeWidth={1.5}
            className="duration-base ease-out size-4 shrink-0 transition-transform group-hover:translate-x-1"
          />
        </Link>
      </p>

      <AnimatePresence>
        {preview ? (
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            style={{ x, y }}
            className="pointer-events-none fixed top-0 left-0 z-50"
          >
            {/* The hatch is the backdrop, never a state of its own: the image
                fades in on top of it, so a cold cache reads as a card loading
                rather than as two cards swapping. */}
            <div className="border-border-token bg-bg text-meta text-muted-foreground relative flex aspect-[16/10] w-72 -translate-x-1/2 items-center justify-center overflow-hidden rounded-lg border bg-[repeating-linear-gradient(135deg,var(--border-token)_0px,var(--border-token)_1px,transparent_1px,transparent_7px)] p-4 text-center font-mono outline outline-black/10 dark:outline-white/10">
              aperçu·{preview.name}
              {previewable.has(preview.slug) ? (
                // The bytes come from `/api/preview/<slug>`, already proxied and
                // cached for a week; `next/image` would only add a second
                // indirection in front of it.
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={preview.slug}
                  src={previewSrc(preview.slug)}
                  alt=""
                  loading="eager"
                  decoding="async"
                  className={`duration-base ease-out absolute inset-0 size-full object-cover object-top transition-opacity ${
                    warmed.has(preview.slug) ? "opacity-100" : "opacity-0"
                  }`}
                />
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Tabs>
  );
}

interface ProjectRowProps {
  entry: ProjectRowData;
  onEnter: (event: React.PointerEvent) => void;
  onMove: (event: React.PointerEvent) => void;
  onLeave: () => void;
}

/**
 * One row. An `href` makes it a link — arrow and all; without one it stays
 * plain text, so the hover never promises a page that does not exist. Case
 * studies go through `next/link`; a project with no case study written yet
 * points at the live product instead and opens in a new tab.
 */
function ProjectRow({ entry, onEnter, onMove, onLeave }: ProjectRowProps) {
  const t = useTranslations("Projects");

  const body = (
    <>
      <span className="flex items-baseline gap-4">
        {/* The shared name of the view transition to `/projets/<slug>`:
            DESIGN.md § Motion, list title → detail `<h1>`. */}
        <span
          className="text-h2"
          style={{ viewTransitionName: `t-${entry.slug}` }}
        >
          {entry.name}
        </span>
        <span className="text-meta text-muted-foreground ml-auto flex items-center gap-2 tabular-nums">
          {entry.meta}
          {entry.href ? (
            <ArrowRight
              aria-hidden
              strokeWidth={1.5}
              className="duration-base ease-out size-4 shrink-0 -translate-x-1 opacity-0 transition-[transform,opacity] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
            />
          ) : null}
        </span>
      </span>
      <span className="text-muted-foreground">{entry.desc}</span>
    </>
  );

  // No tint and no inset: the row's hover is the dimming of its siblings on the
  // `ol` above, so the shell only has to hold the two lines and the arrow. The
  // padding is what makes the row a 44px tap target on a phone.
  const shell = "group flex flex-col gap-1 py-4";

  const handlers = {
    onPointerEnter: onEnter,
    onPointerMove: onMove,
    onPointerLeave: onLeave,
  };

  if (!entry.href) {
    return (
      <div {...handlers} className={shell}>
        {body}
      </div>
    );
  }

  if (entry.external) {
    return (
      <a
        {...handlers}
        href={entry.href}
        target="_blank"
        rel="noreferrer"
        className={shell}
      >
        {body}
        <span className="sr-only">{t("newWindow")}</span>
      </a>
    );
  }

  return (
    <Link {...handlers} href={entry.href} className={shell}>
      {body}
    </Link>
  );
}

/**
 * Decodes the previews while the page is idle, and reports which ones are ready.
 *
 * A card fetched on hover would arrive a beat late every single time; decoding
 * them up front costs a handful of already-cached requests at the lowest
 * priority, and only on a device that can hover at all. Nothing is kept in the
 * DOM: the browser cache is the store, the set only drives the fade-in.
 */
function useWarmPreviews(
  slugs: readonly string[],
  enabled: boolean,
): ReadonlySet<string> {
  const [ready, setReady] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    if (!enabled || slugs.length === 0) return;

    let live = true;
    const images: HTMLImageElement[] = [];

    const warm = () => {
      for (const slug of slugs) {
        const image = new Image();
        image.decoding = "async";
        image.fetchPriority = "low";
        image.onload = () => {
          if (!live) return;
          setReady((done) => new Set(done).add(slug));
        };
        image.src = previewSrc(slug);
        images.push(image);
      }
    };

    // `requestIdleCallback` is still Safari-optional in 2026 — a macrotask is
    // the same promise, minus the scheduling hint.
    const idle = typeof window.requestIdleCallback === "function";
    const handle = idle
      ? window.requestIdleCallback(warm, { timeout: 2_000 })
      : window.setTimeout(warm, 1_000);

    return () => {
      live = false;
      for (const image of images) image.onload = null;
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [slugs, enabled]);

  return ready;
}

/**
 * The cursor preview is for a mouse on a wide screen only (DESIGN.md § Motion):
 * on a touch screen it would follow a tap it cannot track, and under `lg` the
 * card would cover the list it describes. `false` until mounted, so the server
 * HTML and the first client render agree.
 */
const FINE_POINTER = "(pointer: fine) and (min-width: 1024px)";

function subscribeToPointer(onChange: () => void) {
  const query = window.matchMedia(FINE_POINTER);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useFinePointer(): boolean {
  return useSyncExternalStore(
    subscribeToPointer,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  );
}
