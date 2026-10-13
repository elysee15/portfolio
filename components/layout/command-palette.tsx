"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import { Dialog } from "@base-ui/react/dialog";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import type { PaletteEntry } from "@/src/lib/palette/entries";
import { matches } from "@/src/utils/text";

interface PaletteItemGroup {
  /** Stable group key; `label` is what the heading prints. */
  value: string;
  label: string;
  items: readonly PaletteEntry[];
}

interface CommandPaletteProps {
  entries: readonly PaletteEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * ⌘K palette. Loaded on first open only (see `PaletteTrigger`), so its own
 * weight and Base UI's autocomplete never reach a visitor who does not ask.
 *
 * Filtering, roving highlight, `aria-activedescendant` and focus restoration
 * are Base UI's; this file owns the grouping, the routing and the styling.
 */
export function CommandPalette({
  entries,
  open,
  onOpenChange,
}: CommandPaletteProps) {
  const t = useTranslations("Palette");
  const router = useRouter();

  const groups = useMemo<PaletteItemGroup[]>(() => {
    const byGroup = new Map<string, PaletteEntry[]>();

    for (const entry of entries) {
      const bucket = byGroup.get(entry.group);
      if (bucket) bucket.push(entry);
      else byGroup.set(entry.group, [entry]);
    }

    return [...byGroup].map(([value, items]) => ({
      value,
      label: items[0].groupLabel,
      items,
    }));
  }, [entries]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-[color-mix(in_srgb,var(--bg)_75%,transparent)] transition-opacity duration-base ease-out data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 flex items-start justify-center overflow-hidden px-5 pt-[12vh] pb-4">
          <Dialog.Popup
            aria-label={t("dialog")}
            // 12px inner radius + 8px padding would read pinched against the
            // 8px shell, so the list keeps 4px (better-ui § 1).
            className="border-border-token bg-background flex max-h-[min(32rem,calc(100dvh-16vh))] w-full max-w-[32rem] flex-col rounded-lg border shadow-[0_1px_2px_oklch(0_0_0/0.04),0_8px_24px_oklch(0_0_0/0.08)] transition-[opacity,scale] duration-base ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
          >
            <Autocomplete.Root
              open
              // `inline`: the list belongs to the dialog, so Escape closes the
              // palette instead of being eaten by an autocomplete popup.
              inline
              items={groups}
              // « experience » must find « Expérience »: Base UI's default
              // matcher compares the raw strings, ours strips the diacritics.
              filter={(item: PaletteEntry, query: string) =>
                matches(item.label, query)
              }
              autoHighlight="always"
              keepHighlight
            >
              <Autocomplete.Input
                placeholder={t("placeholder")}
                aria-label={t("search")}
                className="text-meta border-border-token placeholder:text-muted-foreground h-12 w-full border-b bg-transparent px-4 outline-none"
              />

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2">
                <Autocomplete.Empty className="text-meta text-muted-foreground px-4 py-3">
                  {t("empty")}
                </Autocomplete.Empty>

                <Autocomplete.List>
                  {(group: PaletteItemGroup) => (
                    <Autocomplete.Group
                      key={group.value}
                      items={group.items}
                      className="not-last:mb-2"
                    >
                      <Autocomplete.GroupLabel className="text-muted-foreground px-4 pt-2 pb-1 font-sans text-xs">
                        {group.label}
                      </Autocomplete.GroupLabel>

                      <Autocomplete.Collection>
                        {(item: PaletteEntry) => (
                          <Autocomplete.Item
                            key={item.id}
                            value={item}
                            onClick={() => {
                              onOpenChange(false);
                              router.push(item.href);
                            }}
                            className="data-highlighted:bg-hover mx-2 cursor-default rounded-sm px-2 py-2 outline-none select-none"
                          >
                            {item.label}
                          </Autocomplete.Item>
                        )}
                      </Autocomplete.Collection>
                    </Autocomplete.Group>
                  )}
                </Autocomplete.List>
              </div>
            </Autocomplete.Root>

            <Dialog.Close className="sr-only">{t("close")}</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
