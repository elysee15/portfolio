/**
 * Font data for `ImageResponse`.
 *
 * `next/font/google` can't help here: Satori needs the raw bytes, not a CSS
 * variable. So the Google Fonts stylesheet is fetched and the font URL is
 * pulled out of it.
 *
 * The request deliberately sends no `User-Agent`. Google serves the format it
 * thinks the client supports, and to a browser that means WOFF2 — which Satori
 * rejects with `Unsupported OpenType signature`. Unidentified, it answers with
 * raw TrueType, which is what Satori wants.
 *
 * Everything is best-effort: a render without network access gets `null` and
 * the card falls back to Satori's built-in font rather than failing.
 */

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600;
  style: "normal";
}

/**
 * One weight of one Google font, ready for `ImageResponse`'s `fonts` option.
 * `text` narrows the subset to the glyphs actually drawn, which keeps the
 * download small when the caller knows its string ahead of time.
 */
export async function loadGoogleFont(
  family: string,
  weight: 400 | 500 | 600,
  text: string,
): Promise<OgFont | null> {
  try {
    const url =
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}` +
      `&text=${encodeURIComponent(text)}`;

    const css = await fetch(url).then((response) =>
      response.ok ? response.text() : "",
    );

    // A subsetted answer is one `@font-face` with a bare `src: url(…)` and no
    // `format()` hint, so the URL is taken as-is.
    const source = /src:\s*url\(([^)]+)\)/.exec(css)?.[1];
    if (!source) return null;

    const response = await fetch(source);
    if (!response.ok) return null;

    return {
      name: family,
      data: await response.arrayBuffer(),
      weight,
      style: "normal",
    };
  } catch {
    // A card in the default font beats a failed deployment.
    return null;
  }
}
