"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import type { PaletteEntry } from "@/src/lib/palette/entries";

/** The palette's code is fetched the first time it is actually opened. */
const CommandPalette = dynamic(
  () =>
    import("@/components/layout/command-palette").then(
      (mod) => mod.CommandPalette,
    ),
  { ssr: false },
);

interface PaletteTriggerProps {
  entries: readonly PaletteEntry[];
}

/** Never-changing store: `false` while rendering on the server, `true` after. */
const subscribeNever = () => () => {};
const onClient = () => true;
const onServer = () => false;

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

/**
 * The ⌘K affordance in the footer, and the global shortcut behind it. Kept
 * separate from the palette itself so the shortcut costs a listener, not a
 * dialog: the heavy island mounts only after the first open.
 */
export function PaletteTrigger({ entries }: PaletteTriggerProps) {
  const t = useTranslations("Palette");
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // The key cap only becomes knowable on the client, and it must not differ
  // between the server render and the first client one.
  const onBrowser = useSyncExternalStore(subscribeNever, onClient, onServer);
  const modifier =
    onBrowser && navigator.userAgent.includes("Mac") ? "⌘" : "Ctrl";

  const show = useCallback(() => {
    setLoaded(true);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const shortcut =
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !event.metaKey && !event.ctrlKey);

      if (!shortcut || isTyping(event.target)) return;

      event.preventDefault();
      show();
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, [show]);

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label={t("open")}
        aria-keyshortcuts="Meta+K Control+K"
        className="hover:text-foreground -my-2.5 flex items-center gap-1 py-2.5 transition-colors duration-fast ease-out"
      >
        <kbd>{modifier}</kbd>
        <kbd>K</kbd>
      </button>

      {loaded ? (
        <CommandPalette
          entries={entries}
          open={open}
          onOpenChange={setOpen}
        />
      ) : null}
    </>
  );
}
