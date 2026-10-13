import { getTranslations } from "next-intl/server";

import type { Locale } from "@/src/i18n/routing";

interface TranslationNoticeProps {
  /** The language actually served, or `null` when the translation exists. */
  fallbackFrom: Locale | null;
}

/**
 * Says, in the language the reader asked for, that the entry below is not in
 * it. Server Component, zero JS. Quieter than a `Callout` — it frames the page
 * rather than interrupting it, so it is a rule and a line of meta, no box.
 */
export async function TranslationNotice({ fallbackFrom }: TranslationNoticeProps) {
  if (!fallbackFrom) return null;

  const t = await getTranslations("Content");

  return (
    <p
      role="note"
      lang={fallbackFrom}
      className="text-meta text-muted-foreground border-border-token mb-8 border-l pl-3"
    >
      {t("fallbackNotice")}
    </p>
  );
}
