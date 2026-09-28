import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// H2 SEO pass — generated robots.txt (app/robots.ts replaces a static
// public/robots.txt; Next.js serves this at /robots.txt).

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
