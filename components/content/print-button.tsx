"use client";

import { useTranslations } from "next-intl";

/** Printing is a browser action; the CV page itself stays a Server Component. */
export function PrintButton() {
  const t = useTranslations("Cv");

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="decoration-subtle hover:decoration-fg underline decoration-1 underline-offset-[3px] transition-[text-decoration-color] duration-fast ease-out"
    >
      {t("print")}
    </button>
  );
}
