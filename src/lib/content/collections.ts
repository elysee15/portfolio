/**
 * The collection registry. Routes and loaders read directory names from here so
 * no page ever hardcodes a path under `src/content/`. Display names are
 * translated, so they live in `src/i18n/messages/`, not here.
 */

import type { ZodType } from "zod";

import {
  blogFrontmatter,
  noteFrontmatter,
  projetFrontmatter,
} from "./schemas";
import type { CollectionName } from "./types";

export interface CollectionConfig {
  /** Directory under `src/content/<locale>/` AND the first URL segment. */
  dir: CollectionName;
  schema: ZodType;
}

export const collections: Readonly<Record<CollectionName, CollectionConfig>> = {
  blog: { dir: "blog", schema: blogFrontmatter },
  notes: { dir: "notes", schema: noteFrontmatter },
  projets: { dir: "projets", schema: projetFrontmatter },
};

export const collectionNames = Object.keys(collections) as CollectionName[];
