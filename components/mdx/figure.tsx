import Image from "next/image";

interface FigureProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  priority?: boolean;
}

/**
 * The image path for articles. Markdown's `![]()` carries no dimensions, so
 * the `img` mapping stays a plain tag; anything that must not shift the page
 * uses this instead.
 */
export function Figure({
  src,
  alt,
  width,
  height,
  caption,
  priority = false,
}: FigureProps) {
  return (
    <figure className="my-8 flex flex-col gap-2">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="border-border-token w-full rounded-md border"
      />
      {caption ? (
        <figcaption className="text-meta text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
