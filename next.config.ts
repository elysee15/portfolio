import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // Tracing follows the import graph; `readFile(join(process.cwd(), …))` is
  // invisible to it. Without this, a request-time render of an unlisted slug
  // ENOENTs in production even though the build succeeded. The glob stays wide
  // because the locale sits above the collection and a page may fall back to
  // another locale's file.
  outputFileTracingIncludes: {
    "/[locale]/blog/[slug]": ["./src/content/**/*.mdx"],
    "/[locale]/notes/[slug]": ["./src/content/**/*.mdx"],
    "/[locale]/projets/[slug]": ["./src/content/**/*.mdx"],
  },
  partialPrefetching: true,
  // Defense-in-depth for a static site: clickjacking, MIME sniffing, referrer
  // leakage and unused device APIs. No CSP here — Next inlines RSC flight data,
  // so a useful policy needs a nonce from the proxy.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
