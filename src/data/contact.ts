/**
 * Where to reach me — the single source for the footer, `/contact` and `/cv`.
 * Editorial data, not configuration: DESIGN.md § Content keeps it in `src/data/`.
 */

export interface ContactChannel {
  label: string;
  href: string;
  /** Opens in a new tab and gets the `↗` affordance. */
  external: boolean;
}

export const contact = {
  email: "elyseebleu1@gmail.com",
  city: "Abidjan",
  /** The footer clock reads this zone; `/cv` prints the city alone. */
  timezone: "Africa/Abidjan",
  github: "https://github.com/elysee15",
  linkedin: "https://www.linkedin.com/in/elysee15",
  /** Shown bare on the CV, where a link is of no use on paper. */
  linkedinLabel: "linkedin.com/in/elysee15",
} as const;

/** Footer links, in order. Email is a copy button, so it is not listed here. */
export const footerChannels: readonly ContactChannel[] = [
  { label: "GitHub", href: contact.github, external: true },
  { label: "LinkedIn", href: contact.linkedin, external: true },
  { label: "CV", href: "/cv", external: false },
  { label: "Contact", href: "/contact", external: false },
];
