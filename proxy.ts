/**
 * Resolves the request locale and rewrites to the matching `[locale]` segment.
 *
 * Named `proxy.ts` rather than `middleware.ts` — that is the convention from
 * Next 16 on. The matcher skips `/api` (the image proxy lives outside the
 * `[locale]` segment), Next's own assets, and anything with a file extension.
 */
import createMiddleware from "next-intl/middleware";

import { routing } from "@/src/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
