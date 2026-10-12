import Image from "next/image";

import { TextLink } from "@/components/text-link";
import { formatDate, formatDateTime } from "@/src/lib/content/format";
import type { ProjetMeta } from "@/src/lib/content/types";

interface CaseStudyProps {
  meta: ProjetMeta;
  children: React.ReactNode;
}

/** Detail shell for `/projets/[slug]`: the facts first, then the write-up. */
export function CaseStudy({ meta, children }: CaseStudyProps) {
  return (
    <article>
      <header className="mb-12 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-h1">{meta.title}</h1>
          <p className="text-meta text-muted-foreground">
            <time dateTime={formatDateTime(meta.date)}>
              {formatDate(meta.date)}
            </time>
          </p>
        </div>

        {meta.cover ? (
          <Image
            src={meta.cover.src}
            alt={meta.cover.alt}
            width={meta.cover.width}
            height={meta.cover.height}
            priority
            className="border-border-token w-full rounded-md border"
          />
        ) : null}

        <dl className="text-meta divide-border-token divide-y">
          <div className="flex gap-4 py-2">
            <dt className="text-muted-foreground w-24 shrink-0">Rôle</dt>
            <dd>{meta.role}</dd>
          </div>
          <div className="flex gap-4 py-2">
            <dt className="text-muted-foreground w-24 shrink-0">Année</dt>
            <dd>{meta.year}</dd>
          </div>
          <div className="flex gap-4 py-2">
            <dt className="text-muted-foreground w-24 shrink-0">Stack</dt>
            <dd>{meta.stack.join(" · ")}</dd>
          </div>
          {meta.url ? (
            <div className="flex gap-4 py-2">
              <dt className="text-muted-foreground w-24 shrink-0">En ligne</dt>
              <dd>
                <TextLink href={meta.url}>{meta.url}</TextLink>
              </dd>
            </div>
          ) : null}
          {meta.repo ? (
            <div className="flex gap-4 py-2">
              <dt className="text-muted-foreground w-24 shrink-0">Code</dt>
              <dd>
                <TextLink href={meta.repo}>{meta.repo}</TextLink>
              </dd>
            </div>
          ) : null}
        </dl>
      </header>
      {children}
    </article>
  );
}
