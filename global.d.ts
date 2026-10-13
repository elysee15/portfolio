/**
 * Tells next-intl which locales and which message keys this app has, so
 * `getLocale()` returns the `"fr" | "en"` union rather than `string` and a
 * typo in a `t("…")` key is a type error instead of a runtime hole.
 */

import type messages from "@/src/i18n/messages/fr.json";
import type { routing } from "@/src/i18n/routing";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
