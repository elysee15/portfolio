/**
 * Frontmatter schemas. Validation failures are build failures: a typo in a
 * `.mdx` header must stop `next build`, not render a broken page.
 */

import { z } from "zod";

/**
 * `yaml` (core schema) hands us a string for `date: 2026-03-14`. A quoted
 * string or a real Date is accepted too, so a future Git-based CMS writing
 * the same files can't break the build on a technicality.
 */
const isoDate = z
  .union([z.iso.date(), z.date()])
  .transform((value) =>
    typeof value === "string" ? value : value.toISOString().slice(0, 10),
  );

const base = z.object({
  title: z.string().min(1),
  /** Reused verbatim as `<meta name="description">`, hence the cap. */
  description: z.string().min(1).max(200),
  date: isoDate,
  tags: z.array(z.string().min(1)).default([]),
  draft: z.boolean().default(false),
});

export const blogFrontmatter = base;

/** Notes are short enough that a description is often redundant. */
export const noteFrontmatter = base.extend({
  description: z.string().max(200).default(""),
});

export const projetFrontmatter = base.extend({
  role: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  year: z.number().int().min(2015).max(2100),
  cover: z
    .object({
      src: z.string().startsWith("/"),
      alt: z.string().min(1),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .nullable()
    .default(null),
  url: z.url().nullable().default(null),
  repo: z.url().nullable().default(null),
});

export type BlogFrontmatter = z.infer<typeof blogFrontmatter>;
export type NoteFrontmatter = z.infer<typeof noteFrontmatter>;
export type ProjetFrontmatter = z.infer<typeof projetFrontmatter>;
