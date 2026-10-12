/**
 * The collection registry. Routes and loaders read directory names and labels
 * from here so no page ever hardcodes a path under `src/content/`.
 */

import type { ZodType } from "zod";

import {
  blogFrontmatter,
  noteFrontmatter,
  projetFrontmatter,
} from "./schemas";
import type { CollectionName } from "./types";

export interface CollectionConfig {
  /** Directory under `src/content/` AND the first URL segment. */
  dir: CollectionName;
  /** French label, used in headings and metadata titles. */
  label: string;
  schema: ZodType;
}

export const collections: Readonly<Record<CollectionName, CollectionConfig>> = {
  blog: { dir: "blog", label: "Blog", schema: blogFrontmatter },
  notes: { dir: "notes", label: "Notes", schema: noteFrontmatter },
  projets: { dir: "projets", label: "Projets", schema: projetFrontmatter },
};

export const collectionNames = Object.keys(collections) as CollectionName[];
