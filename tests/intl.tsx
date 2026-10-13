import { render, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";

import en from "@/src/i18n/messages/en.json";
import fr from "@/src/i18n/messages/fr.json";
import type { Locale } from "@/src/i18n/routing";
import type { PaletteLabels } from "@/src/lib/palette/entries";
import type { ProjectsDictionary } from "@/src/lib/projects/groups";

export const messages: Record<Locale, typeof fr> = { fr, en };

/**
 * Renders an island inside the provider it expects. Islands call
 * `useTranslations`, which throws without one — mounting them bare would make
 * every assertion fail for a reason that has nothing to do with the test.
 */
export function renderIntl(
  ui: ReactElement,
  { locale = "fr" as Locale, ...options }: RenderOptions & { locale?: Locale } = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        {children}
      </NextIntlClientProvider>
    ),
    ...options,
  });
}

/**
 * The board's labels, read from the same JSON the app reads. A test that hard
 * coded them would keep passing after a key was renamed out from under it.
 */
export function projectWords(locale: Locale): ProjectsDictionary {
  const { Projects } = messages[locale];
  return {
    allProjects: Projects.allProjects,
    company: Projects.company,
    personal: Projects.personal,
    filterLabel: Projects.filterLabel,
    labLink: Projects.labLink,
  };
}

/** The palette's labels, likewise read from the message files. */
export function paletteLabels(locale: Locale): PaletteLabels {
  const { Palette, Nav } = messages[locale];
  return {
    groups: Palette.group,
    sections: Palette.section,
    pages: {
      home: Nav.home,
      projets: Nav.projets,
      blog: Nav.blog,
      notes: Nav.notes,
      lab: Nav.lab,
      contact: Nav.contact,
      cv: Nav.cv,
    },
  };
}
