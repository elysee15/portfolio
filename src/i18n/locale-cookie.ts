/**
 * Writes the locale cookie the proxy reads to pick a `[locale]` segment.
 *
 * Mirrors what `createMiddleware` sets, so a client-side switch and a
 * server-side detection agree on the same cookie: `NEXT_LOCALE`, `SameSite=Lax`,
 * site-wide, persisted for a year rather than for the session.
 *
 * Browser-only — `document` is the whole point. Call it from a client island.
 */
import type { Locale } from "@/src/i18n/routing";

const COOKIE_NAME = "NEXT_LOCALE";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function setLocaleCookie(locale: Locale): void {
  const secure = window.location.protocol === "https:" ? " Secure;" : "";

  document.cookie = `${COOKIE_NAME}=${locale}; Path=/; Max-Age=${ONE_YEAR_IN_SECONDS}; SameSite=Lax;${secure}`;
}
