import { TextLink } from "@/components/ui/text-link";

interface GithubHandleProps {
  handle: string;
}

/** `@elysee15 ↗` — the right end of the « Activité » header, in both states. */
export function GithubHandle({ handle }: GithubHandleProps) {
  return (
    <TextLink
      href={`https://github.com/${handle}`}
      className="text-muted-foreground inline-flex items-baseline gap-0.5"
      target="_blank"
      rel="noopener noreferrer"
    >
      @{handle}{" "}
      <span aria-hidden className="text-[0.85em] ml-0.75 font-sans">
        ↗
      </span>
    </TextLink>
  );
}
