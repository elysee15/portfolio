import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { IllustrationSlot } from "@/components/layout/illustration-slot";
import { TextLink } from "@/components/ui/text-link";
import type { Locale } from "@/src/i18n/routing";
import { labGroups, labIntro, labPersonal } from "@/src/data/lab";
import { projects, projectsTodo } from "@/src/data/projects";
import { getSlugs } from "@/src/lib/content/loader";
import {
  buildProjectGroups,
  type ProjectsDictionary,
} from "@/src/lib/projects/groups";
import { buildPageMetadata } from "@/src/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Lab");
  const locale = (await getLocale()) as Locale;
  return buildPageMetadata({
    title: t("title"),
    description: labIntro[locale],
    path: "/lab",
    locale,
  });
}

/**
 * Everything built outside the job. Server Component, zero JS: the rows are
 * links and the dimming is `:has(:hover)`, as on the home board.
 */
export default async function LabPage() {
  const t = await getTranslations("Lab");
  const p = await getTranslations("Projects");
  const locale = (await getLocale()) as Locale;
  const caseStudies = await getSlugs("projets");

  const words: ProjectsDictionary = {
    allProjects: p("allProjects"),
    company: p("company"),
    personal: p("personal"),
    filterLabel: p("filterLabel"),
    labLink: p("labLink"),
  };

  const personal =
    buildProjectGroups(projects, {
      locale,
      words,
      caseStudies,
    }).find((group) => group.id === "personnel")?.entries ?? [];

  const sections = [
    {
      id: "perso",
      title: labPersonal.title[locale],
      desc: labPersonal.desc[locale],
      count: personal.length,
    },
    ...labGroups.map((group) => ({
      id: group.id,
      title: group.title[locale],
      desc: group.desc[locale],
      count: group.items.length,
    })),
  ];

  return (
    <div className="container-page">
      <div className="layout-reading pt-10 pb-24 sm:pt-18">
        <main
          id="contenu"
          tabIndex={-1}
          className="flex flex-col gap-14 outline-none"
        >
          <header className="flex flex-col gap-3">
            <h1 className="text-display">{t("title")}</h1>
            <p>{labIntro[locale]}</p>

            <nav
              aria-label={t("toc")}
              className="text-meta mt-1 flex flex-wrap gap-x-5 gap-y-1.5"
            >
              {sections.map((section) => (
                <TextLink
                  key={section.id}
                  href={`#lab-${section.id}`}
                  className="text-muted-foreground hover:text-foreground -my-2.5 inline-flex gap-1.5 py-2.5 no-underline transition-colors duration-fast ease-out"
                >
                  {section.title}
                  <span className="text-xs tabular-nums">{section.count}</span>
                </TextLink>
              ))}
            </nav>
          </header>

          <section
            id="lab-perso"
            aria-labelledby="h-lab-perso"
            className="flex scroll-mt-8 flex-col gap-1.5"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="h-lab-perso" className="text-h2">
                {labPersonal.title[locale]}
              </h2>
              <span className="text-meta text-muted-foreground tabular-nums">
                {personal.length}
              </span>
            </div>
            <p className="text-muted-foreground mb-2.5">{labPersonal.desc[locale]}</p>

            {personal.length > 0 ? (
              /* Same affordance as the home board: the list dims around the row
                 under the pointer, in CSS only. */
              <ul className="border-border-token list-none border-b p-0 has-[a:hover]:[&>li:not(:hover)]:opacity-45 has-[a:focus-visible]:[&>li:not(:focus-within)]:opacity-45">
                {personal.map((entry) => (
                  <li
                    key={entry.slug}
                    className="border-border-token border-t transition-opacity duration-base ease-out"
                  >
                    <Row entry={entry} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-border-token text-muted-foreground border-y py-3.5 font-mono text-xs">
                {projectsTodo[locale]}
              </p>
            )}
          </section>

          {labGroups.map((group) => (
            <section
              key={group.id}
              id={`lab-${group.id}`}
              aria-labelledby={`h-lab-${group.id}`}
              className="flex scroll-mt-8 flex-col gap-1.5"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 id={`h-lab-${group.id}`} className="text-h2">
                  {group.title[locale]}
                </h2>
                <span className="text-meta text-muted-foreground tabular-nums">
                  {group.items.length}
                </span>
              </div>
              <p className="text-muted-foreground mb-2.5">{group.desc[locale]}</p>

              <p className="border-border-token text-muted-foreground border-y py-3.5 font-mono text-xs">
                {group.todo[locale]}
              </p>
            </section>
          ))}
        </main>

        <aside className="hidden lg:block">
          <IllustrationSlot />
        </aside>
      </div>
    </div>
  );
}

function Row({
  entry,
}: {
  entry: { slug: string; name: string; desc: string; meta: string; href?: string };
}) {
  const content = (
    <>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span>{entry.name}</span>
        <span className="text-meta text-muted-foreground">{entry.desc}</span>
      </span>
      <span className="text-meta text-muted-foreground tabular-nums">
        {entry.meta}
      </span>
    </>
  );

  const className =
    "hover:bg-hover -mx-2 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-0.5 rounded-sm px-2 py-3 no-underline transition-colors duration-base ease-out";

  if (!entry.href) {
    return <div className={`${className} hover:bg-transparent`}>{content}</div>;
  }

  return (
    <TextLink href={entry.href} className={className}>
      {content}
    </TextLink>
  );
}
