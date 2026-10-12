import { NavLink } from "@/components/nav-link";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Accueil" },
  { href: "/projets", label: "Projets" },
  { href: "/blog", label: "Blog" },
  { href: "/notes", label: "Notes" },
  { href: "/lab", label: "Lab" },
  { href: "/jeux", label: "Jeux" },
  { href: "/contact", label: "Contact" },
  { href: "/todo", label: "Todo" },
] as const;

export function SiteHeader() {
  return (
    <div className="container-page pt-6 sm:pt-10">
      <nav
        aria-label="Navigation principale"
        data-noprint
        className="text-meta text-muted-foreground max-w-reading flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2.5"
      >
        <div className="flex gap-5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-4.5 gap-y-2">
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
