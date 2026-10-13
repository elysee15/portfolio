import { getLocale } from "next-intl/server";
import Image from "next/image";

import { BioTabs } from "@/components/home/bio-tabs";
import { bioTodo, bioVariants, profile } from "@/src/data/profile";
import { buildBioVariants } from "@/src/lib/profile/bio";

/**
 * Home opening: portrait, name, role, tagline, then the short / long bio.
 * Server Component — only `BioTabs` crosses into the client.
 */
export async function Intro() {
  const locale = await getLocale();
  const { name, role, tagline, portrait } = profile;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        {portrait ? (
          <Image
            src={portrait.src}
            alt={portrait.alt[locale]}
            width={portrait.width}
            height={portrait.height}
            priority
            className="size-14 rounded-full object-cover object-[50%_35%] grayscale transition-[filter] duration-base ease-out hover:grayscale-0"
          />
        ) : (
          <div
            aria-hidden
            className="bg-hover border-border-token size-14 rounded-full border"
          />
        )}

        <div className="flex flex-col gap-1">
          <h1 className="text-display">{name}</h1>
          <p className="text-meta text-muted-foreground">{role[locale]}</p>
        </div>

        <p className="text-h2">
          {tagline[locale].map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>

      <div id="bio" className="scroll-mt-8">
        <BioTabs
          variants={buildBioVariants(bioVariants, locale)}
          todo={bioTodo[locale]}
        />
      </div>
    </section>
  );
}
