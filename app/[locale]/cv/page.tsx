import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { PrintButton } from "@/components/content/print-button";
import { contact } from "@/src/data/contact";
import { cvRole, education, stackGroups } from "@/src/data/cv";
import { experience } from "@/src/data/experience";
import { profile } from "@/src/data/profile";
import { formatPeriod } from "@/src/lib/experience/timeline";
import { buildPageMetadata } from "@/src/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Cv");
  const locale = await getLocale();
  return buildPageMetadata({
    title: t("title"),
    description: `${profile.name} — ${cvRole[locale]}`,
    path: "/cv",
    locale,
    type: "profile",
  });
}

/**
 * The printable CV: one reading column, no aside, no footer on paper. The
 * `@media print` rules in `globals.css` hide everything marked `data-noprint`.
 */
export default async function CvPage() {
  const t = await getTranslations("Cv");
  const home = await getTranslations("Home");
  const locale = await getLocale();
  const periodOptions = { locale, present: home("present") };

  return (
    <div className="container-page">
      {/* Same reading column as every other route — the CV has no aside, but it
          still starts where the nav does. */}
      <div className="layout-reading pt-10 pb-24 sm:pt-18">
        <main
          id="contenu"
          tabIndex={-1}
          className="flex flex-col gap-10 outline-none"
        >
          <div
            data-noprint
            className="text-meta text-muted-foreground flex items-baseline justify-end gap-5"
          >
            <span>
              {t("pdf")} <span className="font-mono text-xs">TODO</span>
            </span>
            <PrintButton />
          </div>

          <header className="flex flex-col gap-1">
            <h1 className="text-display">{profile.name}</h1>
            <p>{cvRole[locale]}</p>
            <p className="text-meta text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <span>{contact.email}</span>
              <span>{contact.linkedinLabel}</span>
              <span>github.com/{profile.github}</span>
            </p>
          </header>

          <section className="flex flex-col gap-5">
            <SectionTitle>{t("experience")}</SectionTitle>

            {experience.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-1.5 break-inside-avoid"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                  <span>
                    <span className="font-medium">{entry.company}</span> ·{" "}
                    {entry.role[locale]}
                  </span>
                  <span className="text-meta text-muted-foreground tabular-nums">
                    {formatPeriod(entry, periodOptions)}
                  </span>
                </div>
                <ul className="flex list-disc flex-col gap-1 pl-5">
                  {entry.details[locale].map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="flex flex-col gap-3">
            <SectionTitle>{t("education")}</SectionTitle>

            {education.map((degree) => (
              <div
                key={degree.id}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5"
              >
                <span>
                  <span className="font-medium">{degree.school}</span> ·{" "}
                  {degree.title[locale]}
                </span>
                <span className="text-muted-foreground font-mono text-xs">
                  {degree.years ?? "TODO"}
                </span>
              </div>
            ))}
          </section>

          <section className="flex flex-col gap-3">
            <SectionTitle>{t("stack")}</SectionTitle>

            <dl className="grid grid-cols-[minmax(0,170px)_minmax(0,1fr)] gap-x-5 gap-y-2">
              {stackGroups.map((group) => (
                <div key={group.items} className="contents">
                  <dt className="text-meta text-muted-foreground pt-0.5">
                    {group.label[locale]}
                  </dt>
                  <dd className="m-0">{group.items}</dd>
                </div>
              ))}
            </dl>
          </section>
        </main>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-h2 border-border-token border-b pb-1.5">{children}</h2>
  );
}
