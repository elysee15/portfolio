import { AbidjanClock } from "@/components/layout/abidjan-clock";
import { CopyEmail } from "@/components/layout/copy-email";
import { MusicPlayer } from "@/components/layout/music-player";
import { PaletteTrigger } from "@/components/layout/palette-trigger";
import { TextLink } from "@/components/ui/text-link";
import { footerChannels } from "@/src/data/contact";
import type { PaletteEntry } from "@/src/lib/palette/entries";

interface SiteFooterProps {
  /** Built on the server — the palette island never reads the filesystem. */
  paletteEntries: readonly PaletteEntry[];
}

/**
 * Site footer: where to reach me, the hour in Abidjan, and the ⌘K hint. Server
 * Component — only the clock, the copy button and the palette are islands.
 */
export function SiteFooter({ paletteEntries }: SiteFooterProps) {
  return (
    <div className="container-page">
      <footer
        data-noprint
        className="text-meta text-muted-foreground border-border-token max-w-reading mt-24 flex flex-col gap-4.5 border-t pt-6 pb-12"
      >
        <ul className="flex list-none flex-wrap gap-x-5 gap-y-1.5 p-0">
          {footerChannels.map((channel) => (
            <li key={channel.label}>
              <TextLink
                href={channel.href}
                target={channel.external ? "_blank" : undefined}
              >
                {channel.label}
                {channel.external ? (
                  <span aria-hidden className="ml-0.5 text-[0.85em]">
                    ↗
                  </span>
                ) : null}
              </TextLink>
            </li>
          ))}
          <li>
            <CopyEmail />
          </li>
        </ul>

        {/* Le lecteur tient sa propre ligne : son rail de progression et sa
            playlist dépliante occupent toute la largeur de la colonne. */}
        <MusicPlayer />

        <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
          <AbidjanClock />
          <PaletteTrigger entries={paletteEntries} />
        </div>
      </footer>
    </div>
  );
}
