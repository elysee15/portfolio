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
