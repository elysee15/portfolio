"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      // -my-2.5 / py-2.5: 44px touch target without disturbing the baseline row.
      className={`hover:text-foreground -my-2.5 py-2.5 no-underline transition-colors duration-fast ease-out ${
        isActive ? "text-foreground" : ""
      }`}
    >
      {children}
    </Link>
  );
}
