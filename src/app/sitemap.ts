import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { STOREFRONT_PRODUCTS } from "@/data/shop/products";

// H2 SEO pass — generated sitemap.xml (Next.js serves this at /sitemap.xml).
//
// Only genuine public/indexable routes are listed.
//
// No lastModified/changeFrequency/priority: nothing in the repo tracks a
// real "last modified" timestamp for these routes or product records
// (StorefrontProduct.createdAt is a catalog-ordering seed value, not a
// content-modification date), and there's no defensible basis for hand-
// picking crawl-frequency/priority hints — so all three are omitted rather
// than fabricated.
const STATIC_ROUTES = [
  "/",
  "/products",
  "/contact",
  "/privacy-policy",
  "/terms-and-conditions",
  "/cookie-policy",
  "/reviews",
  "/learning-center",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const productRoutes = STOREFRONT_PRODUCTS.map((product) => `/products/${product.slug}`);

  return [...STATIC_ROUTES, ...productRoutes].map((path) => ({
    url: `${SITE.url}${path}`,
  }));
}
