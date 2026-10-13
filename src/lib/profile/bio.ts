/**
 * Derivations over `src/data/profile.ts`. The bio exists in both languages;
 * the island that renders it should receive one.
 */

import type { BioVariant } from "@/src/data/profile";
import type { Locale } from "@/src/i18n/routing";

/** One tab of the bio, flattened to the active language. */
export interface BioVariantRow {
  /** Stable key — the tab value, never printed. */
  id: BioVariant["id"];
  label: string;
  paragraphs: readonly string[];
}

export function buildBioVariants(
  variants: readonly BioVariant[],
  locale: Locale,
): readonly BioVariantRow[] {
  return variants.map((variant) => ({
    id: variant.id,
    label: variant.label[locale],
    paragraphs: variant.paragraphs[locale],
  }));
}
