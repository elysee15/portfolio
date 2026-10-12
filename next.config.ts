import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // Tracing follows the import graph; `readFile(join(process.cwd(), …))` is
  // invisible to it. Without this, a request-time render of an unlisted slug
  // ENOENTs in production even though the build succeeded.
  outputFileTracingIncludes: {
    "/blog/[slug]": ["./src/content/blog/**/*.mdx"],
    "/notes/[slug]": ["./src/content/notes/**/*.mdx"],
    "/projets/[slug]": ["./src/content/projets/**/*.mdx"],
  },
  partialPrefetching: true,
  // Defense-in-depth for a static, cookie-less site: clickjacking, MIME
  // sniffing, referrer leakage and unused device APIs. No CSP here — Next
  // inlines RSC flight data, so a useful policy needs a nonce from middleware.
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

export default nextConfig;
