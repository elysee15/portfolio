import Link from "next/link";

interface TextLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  href?: string;
}

/**
 * The one link style on the site: 1px underline in `--subtle` at 3px offset,
 * thickening to `--fg` at 4px on hover (DESIGN.md § Links and focus).
 *
 * Exported on its own for the handful of controls that read as links but are
 * buttons — a `<button>` that opens the game can't be an `<a>`.
 */
export const UNDERLINE =
  "decoration-subtle hover:decoration-fg underline decoration-1 underline-offset-[3px] transition-[text-decoration-color,text-underline-offset] duration-fast ease-out hover:underline-offset-4";

/**
 * The site's link. Internal hrefs go through `next/link`; external ones get
 * `rel="noreferrer"`.
 */
export function TextLink({
  href = "",
  className,
  children,
  ...props
}: TextLinkProps) {
  const classes = className ? `${UNDERLINE} ${className}` : UNDERLINE;
  const isInternal = href.startsWith("/") || href.startsWith("#");

  if (isInternal) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={classes}
      rel="noreferrer"
      {...props}
    >
      {children}
      {props.target === "_blank" ? (
        <span className="sr-only"> (nouvelle fenêtre)</span>
      ) : null}
    </a>
  );
}
