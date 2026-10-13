"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setLocaleCookie } from "@/src/i18n/locale-cookie";
import { type Locale, routing } from "@/src/i18n/routing";

/**
 * FR / EN switch. The URL never carries the locale, so switching is a cookie
 * write plus a re-render of the same path — `router.refresh()` does the second
 * half against the cookie the first half just set.
 *
 * Deliberately *not* next-intl's `useRouter`: its locale-aware `replace` forces
 * a prefix on a locale change (`forcePrefix`), so it navigates to `/en/projets`,
 * which under `localePrefix: "never"` the proxy answers with a 307 back to
 * `/projets`. Three round trips for a switch that needs one.
 *
 * Deliberately undecorated: the label itself is the state, and a nav control is
 * a high-frequency target, so it animates no more than its `ThemeToggle`
 * neighbour (better-ui § 15). The only motion is the colour on hover and a dim
 * while the server round trip is in flight — opacity named explicitly rather
 * than through `transition-all` (§ 11).
 */
export function LocaleToggle() {
  const t = useTranslations("LocaleToggle");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const next =
    routing.locales[(routing.locales.indexOf(locale) + 1) % routing.locales.length];

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setLocaleCookie(next);
        startTransition(() => {
          router.refresh();
        });
      }}
      aria-label={t("action", { language: t(locale) })}
      className="hover:text-foreground -my-2.5 py-2.5 transition-[color,opacity] duration-fast ease-out disabled:opacity-50"
    >
      {t(locale)}
    </button>
  );
}
