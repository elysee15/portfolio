import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { ContactForm } from "@/components/contact/contact-form";
import { IllustrationSlot } from "@/components/layout/illustration-slot";
import { contact } from "@/src/data/contact";
import { buildPageMetadata } from "@/src/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Contact");
  const locale = await getLocale();
  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/contact",
    locale,
  });
}

export default async function ContactPage() {
  const t = await getTranslations("Contact");

  return (
    <div className="container-page">
      <div className="layout-reading pt-10 pb-24 sm:pt-18">
        <main
          id="contenu"
          tabIndex={-1}
          className="flex flex-col gap-10 outline-none"
        >
          <header className="flex flex-col gap-3">
            <h1 className="text-display">{t("title")}</h1>
            <p>{t("description")}</p>
            <p className="text-meta text-muted-foreground">
              {t("location", { city: contact.city })}
            </p>
          </header>

          <section className="flex flex-col gap-6">
            <h2 className="text-h2">{t("formTitle")}</h2>
            <ContactForm />
          </section>
        </main>

        <aside className="hidden lg:block">
          <IllustrationSlot />
        </aside>
      </div>
    </div>
  );
}
