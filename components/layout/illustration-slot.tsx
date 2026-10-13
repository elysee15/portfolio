import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

import { profile } from "@/src/data/profile";

/**
 * Sticky aside rail (≥1024px only — the parent hides it below, so no image
 * request on mobile). Light and dark versions swap with the theme.
 */
export async function IllustrationSlot() {
  const t = await getTranslations("Illustration");
  const locale = await getLocale();
  const { illustration } = profile;

  return (
    <figure className="sticky top-16 flex flex-col gap-3">
      {illustration ? (
        <>
          <Image
            src={illustration.light.src}
            alt={illustration.light.alt[locale]}
            width={illustration.light.width}
            height={illustration.light.height}
            className="border-border-token w-full rounded-lg border dark:hidden"
          />
          <Image
            src={illustration.dark.src}
            alt={illustration.dark.alt[locale]}
            width={illustration.dark.width}
            height={illustration.dark.height}
            className="border-border-token hidden w-full rounded-lg border dark:block"
          />
        </>
      ) : (
        <div
          aria-hidden
          className="bg-hover border-border-token aspect-[4/5] w-full rounded-lg border"
        />
      )}

      <figcaption className="text-meta text-muted-foreground">
        {illustration ? illustration.caption[locale] : t("caption")}
      </figcaption>
    </figure>
  );
}
