/**
 * Framework-free text primitives. Knows nothing but strings — the palette, and
 * anything else that searches a label, imports from here.
 */

/** Lowercased, trimmed, diacritics removed: « Écrits » and « ecrits » meet here. */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/** Substring match on the normalized forms. An empty query matches everything. */
export function matches(value: string, query: string): boolean {
  const needle = normalize(query);

  return needle.length === 0 || normalize(value).includes(needle);
}
