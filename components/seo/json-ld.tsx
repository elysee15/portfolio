import type { JsonLdNode } from "@/src/lib/seo/json-ld";

interface JsonLdProps {
  /** A `@graph` document from `src/lib/seo/json-ld.ts`. */
  data: JsonLdNode;
}

/**
 * Embeds a schema.org graph.
 *
 * `JSON.stringify` drops `undefined` members, so a builder can leave a field
 * out by leaving it undefined rather than branching. `<` is escaped because the
 * payload ends up inside a `<script>`: a title containing `</script>` would
 * otherwise close the tag early.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
