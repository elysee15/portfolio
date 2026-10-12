import Image from "next/image";
import { BioTabs } from "@/components/bio-tabs";
import { bioVariants, profile } from "@/src/data/profile";

/**
 * Home opening: portrait, name, role, tagline, then the short / long bio.
 * Server Component — only `BioTabs` crosses into the client.
 */
export function Intro() {
  const { name, role, tagline, portrait } = profile;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        {portrait ? (
          <Image
            src={portrait.src}
            alt={portrait.alt}
            width={portrait.width}
            height={portrait.height}
            priority
            className="size-14 rounded-full object-cover grayscale transition-[filter] duration-base ease-out hover:grayscale-0"
          />
        ) : (
          <div
            aria-hidden
            className="bg-hover border-border-token size-14 rounded-full border"
          />
        )}

        <div className="flex flex-col gap-1">
          <h1 className="text-display">{name}</h1>
          <p className="text-meta text-muted-foreground">{role}</p>
        </div>

        <p className="text-h2">
          {tagline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>

      <BioTabs variants={bioVariants} />
    </section>
  );
}
