/**
 * Per-request i18n configuration, read by the next-intl plugin.
 *
 * The locale comes from `next/root-params` rather than `requestLocale`: reading
 * it from the matched `[locale]` segment keeps pages statically renderable under
 * `cacheComponents`, where touching request headers would opt them out.
 */
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { getRequestConfig } from "next-intl/server";

import { isLocale } from "@/src/i18n/routing";

export default getRequestConfig(async ({ locale }) => {
  const candidate = locale ?? (await rootParams.locale());

  // The `[locale]` segment catches unknown top-level paths too, so an invalid
  // value here is a 404, not a fallback.
  if (!isLocale(candidate)) notFound();

  const { default: messages } = await import(
    `@/src/i18n/messages/${candidate}.json`
  );

  return { locale: candidate, messages };
});
