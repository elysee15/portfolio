import { ImageResponse } from "next/og";

import { loadGoogleFont } from "@/src/lib/seo/og-font";

/** 1.91:1 — what every network crops to. Re-exported by each image route. */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/**
 * The design tokens, duplicated as literals.
 *
 * Satori renders outside the document: there is no `globals.css` and no
 * `var(--fg)` to resolve. These four values must stay in step with the light
 * scale in `app/globals.css` by hand — the card is always light, so the dark
 * scale has no equivalent here.
 */
const token = {
  bg: "#fafaf9",
  fg: "#171716",
  muted: "#6b6b67",
  border: "#e7e7e4",
};

export interface OgCardInput {
  /** Small label above the title — a section or collection name. */
  eyebrow: string;
  title: string;
  /** One line under the rule: a description, a date, a role. */
  footer?: string;
}

/**
 * The shared social card: an eyebrow, the title set in Newsreader, a rule and
 * a footer. Every route renders this one layout so a link to a note and a link
 * to a case study are recognisably the same site.
 */
export async function renderOgCard({
  eyebrow,
  title,
  footer,
}: OgCardInput): Promise<ImageResponse> {
  // Subset to the glyphs this card draws, plus the site name in the corner.
  const glyphs = `${eyebrow}${title}${footer ?? ""}Elysée Bleu`;
  const [serif, sans] = await Promise.all([
    loadGoogleFont("Newsreader", 500, glyphs),
    loadGoogleFont("Geist", 400, glyphs),
  ]);

  const fonts = [serif, sans].filter((font) => font !== null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: token.bg,
          color: token.fg,
          padding: "80px",
          fontFamily: fonts.length > 0 ? "Geist" : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: token.muted,
          }}
        >
          {eyebrow}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: serif ? "Newsreader" : undefined,
              fontSize: title.length > 70 ? 60 : 76,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </div>

          {footer ? (
            <div
              style={{
                display: "flex",
                marginTop: 32,
                paddingTop: 32,
                borderTop: `1px solid ${token.border}`,
                fontSize: 26,
                lineHeight: 1.4,
                color: token.muted,
              }}
            >
              {footer}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", fontSize: 26 }}>Elysée Bleu</div>
      </div>
    ),
    // No `fonts` key at all when the fetch failed: Satori needs at least one
    // font and falls back to its own only when the option is absent.
    { ...ogSize, ...(fonts.length > 0 ? { fonts } : {}) },
  );
}
