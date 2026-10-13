import { getTranslations } from "next-intl/server";

import { LocaleToggle } from "@/components/layout/locale-toggle";
import { NavLink } from "@/components/layout/nav-link";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const NAV_ITEMS = [
  { href: "/", key: "home" },
  { href: "/projets", key: "projets" },
  { href: "/blog", key: "blog" },
  { href: "/notes", key: "notes" },
  { href: "/lab", key: "lab" },
  { href: "/contact", key: "contact" },
  // « Jeux » and « Todo » come back with their routes — a nav item that 404s
  // is worse than one that is missing.
] as const;

export async function SiteHeader() {
  const t = await getTranslations("Nav");

  return (
    <div className="container-page pt-6 sm:pt-10">
      <nav
        aria-label={t("main")}
        data-noprint
        className="text-meta text-muted-foreground max-w-reading flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2.5"
      >
        <div className="flex gap-5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {t(item.key)}
            </NavLink>
          ))}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-4.5 gap-y-2">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
