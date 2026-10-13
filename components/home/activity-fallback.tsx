import { getTranslations } from "next-intl/server";

/**
 * Streaming placeholder. Holds roughly the height of seven cell rows so the
 * sections below don't jump when the calendar lands — no pulse: the wait is
 * one network round trip, and DESIGN.md § Motion keeps idle animation out.
 */
export async function ActivityFallback() {
  const t = await getTranslations("Home");

  return (
    <section aria-busy className="flex flex-col gap-4">
      <h2 className="text-h2">{t("activity")}</h2>
      <div className="bg-foreground/8 rounded-xs h-20" />
    </section>
  );
}
