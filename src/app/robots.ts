import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// H2 SEO pass — generated robots.txt (app/robots.ts replaces a static
// public/robots.txt; Next.js serves this at /robots.txt).
//
// Disallow is a crawl-budget hint, not access control or a security
// mechanism — every disallowed route below is already access-gated in the
// app itself (AccountGuard, staff auth, etc.) and also carries its own
// route-level `robots: { index: false }` metadata (see app/cart, /checkout,
// /account/**, /staff/**). The two are complementary: the route-level
// noindex is what actually keeps a page out of search results if it's ever
// linked from elsewhere; this file just tells well-behaved crawlers not to
// bother requesting these paths at all.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout", "/account", "/staff"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
