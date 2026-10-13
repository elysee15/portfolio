import { getLocale, getTranslations } from "next-intl/server";

import { TextLink } from "@/components/ui/text-link";
import { getEntries } from "@/src/lib/content/loader";

/** Beyond this the home page stops being a home page. The rest is `/projets`. */
const SHOWN = 3;

/**
 * Home « Projets » section: the most recent case studies from
 * `src/content/projets/`. Server Component, zero JS — the "focus the hovered
 * row" effect of DESIGN.md § Motion is `:has(:hover)` in CSS, as in `PostList`.
 */
export async function Projects() {
  const t = await getTranslations("Home");
  const tc = await getTranslations("Content");
  const locale = await getLocale();
  const projets = await getEntries("projets", locale);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-h2">{t("projects")}</h2>

      {projets.length === 0 ? (
        <p className="text-muted-foreground">{tc("empty")}</p>
      ) : (
        <>
          <ol className="divide-border-token border-border-token divide-y border-b [&:has(:hover)>li:not(:hover)]:opacity-50 [&>li]:transition-opacity [&>li]:duration-base [&>li]:ease-out">
            {projets.slice(0, SHOWN).map((projet) => (
              <li key={projet.slug} className="flex flex-col gap-1 py-4">
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <TextLink href={`/projets/${projet.slug}`}>
                    {projet.title}
                  </TextLink>
                  <span className="text-meta text-muted-foreground">
                    {projet.role}
                  </span>
                  <span className="text-meta text-muted-foreground ml-auto">
                    {projet.year}
                  </span>
                </span>
                <p className="text-muted-foreground">{projet.description}</p>
                <p className="text-meta text-muted-foreground">
                  {projet.stack.join(" · ")}
                </p>
              </li>
            ))}
          </ol>

          {projets.length > SHOWN ? (
            <p className="text-meta">
              <TextLink href="/projets">
                {t("allProjects", { count: projets.length })}
              </TextLink>
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
