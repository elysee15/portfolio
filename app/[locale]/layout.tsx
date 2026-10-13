import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import "../globals.css";
import { MotionProvider } from "@/components/layout/motion-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { profile } from "@/src/data/profile";
import { isLocale, routing } from "@/src/i18n/routing";
import { getEntries } from "@/src/lib/content/loader";
import { fontVariables } from "@/src/lib/fonts";
import { buildPaletteEntries } from "@/src/lib/palette/entries";
import { buildGraph, buildPerson, buildWebSite } from "@/src/lib/seo/json-ld";
import { ogImage } from "@/src/lib/seo/og-url";
import { absoluteUrl, siteOrigin, siteUrl } from "@/src/lib/seo/site";

/**
 * Both locales are prerendered even though neither shows up in a URL: the proxy
 * rewrites `/projets` onto one of them, so the page it lands on has to exist
 * ahead of time (see `src/i18n/routing.ts`).
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Site-wide defaults. Every route inherits them and overrides what it owns.
 *
 * `metadataBase` is what makes a relative `opengraph-image` resolve to an
 * absolute URL — without it Next emits a relative `og:image`, which no social
 * crawler follows. `title.template` means a page only ever states its own
 * title; the suffix is appended here, and `/` opts out with `title.default`.
 */
export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale: requested } = await params;
  const locale = isLocale(requested) ? requested : routing.defaultLocale;
  const t = await getTranslations("Site");
  const title = t("title");
  const card = ogImage({ locale, alt: `${title} — ${profile.role[locale]}` });

  return {
    metadataBase: siteOrigin(),
    title: { default: title, template: `%s — ${title}` },
    description: t("description"),
    applicationName: title,
    authors: [{ name: profile.name, url: siteUrl }],
    creator: profile.name,
    publisher: profile.name,
    alternates: { canonical: absoluteUrl("/") },
    openGraph: {
      type: "website",
      url: absoluteUrl("/"),
      siteName: title,
      title,
      description: t("description"),
      locale: locale === "en" ? "en_US" : "fr_FR",
      images: [card],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t("description"),
      images: [card.url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    formatDetection: { telephone: false, address: false },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  // `[locale]` catches every unknown top-level path, so an invalid value is a
  // 404 rather than a silent fallback.
  if (!isLocale(locale)) notFound();

  const [nav, palette, site] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Palette"),
    getTranslations("Site"),
  ]);

  const [blog, notes, projets] = await Promise.all([
    getEntries("blog", locale),
    getEntries("notes", locale),
    getEntries("projets", locale),
  ]);

  const paletteEntries = buildPaletteEntries(
    { blog, notes, projets },
    {
      groups: {
        sections: palette("group.sections"),
        pages: palette("group.pages"),
        projets: palette("group.projets"),
        notes: palette("group.notes"),
        blog: palette("group.blog"),
      },
      sections: {
        bio: palette("section.bio"),
        experience: palette("section.experience"),
        activite: palette("section.activite"),
        projets: palette("section.projets"),
      },
      // Route names come from `Nav`, so the palette and the header can't drift.
      pages: {
        home: nav("home"),
        projets: nav("projets"),
        blog: nav("blog"),
        notes: nav("notes"),
        lab: nav("lab"),
        contact: nav("contact"),
        cv: nav("cv"),
      },
    },
  );

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Declared once for the whole site: every article's JSON-LD points
            back at these two nodes by `@id` instead of restating them. */}
        <JsonLd
          data={buildGraph([
            buildPerson(locale),
            buildWebSite(locale, site("description")),
          ])}
        />
        <NextIntlClientProvider>
          <ThemeProvider>
            <a
              href="#contenu"
              data-noprint
              className="text-meta bg-background sr-only rounded-sm border px-3 py-2 focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-60"
            >
              {nav("skipLink")}
            </a>
            <SiteHeader />
            <MotionProvider>{children}</MotionProvider>
            <SiteFooter paletteEntries={paletteEntries} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
