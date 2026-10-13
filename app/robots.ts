import type { MetadataRoute } from "next";

import { absoluteUrl, siteUrl } from "@/src/lib/seo/site";

/**
 * `/robots.txt`.
 *
 * Everything is crawlable except `/api/`, which only serves the project preview
 * proxy — images a crawler should reach through the pages that embed them, not
 * by walking the endpoint. `host` resolves the apex-vs-www ambiguity for the
 * crawlers that still honour it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
