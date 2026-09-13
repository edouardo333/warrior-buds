import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { STOREFRONT_PRODUCTS } from "@/data/shop/products";

// H2 SEO pass — generated sitemap.xml (Next.js serves this at /sitemap.xml).
//
// Only genuine public/indexable routes are listed. Deliberately excluded:
// /cart, /checkout (+ /checkout/confirmation/[id]), /account/** (customer
// data), /staff/** (internal tool), and the auth routes (/login, /signup,
// /forgot-password, /reset-password, /verify-email) — all of these already
// carry route-level `robots: { index: false }` metadata (see H2 report).
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
  "/about",
  "/contact",
  "/faq",
  "/privacy-policy",
  "/terms-and-conditions",
  "/cookie-policy",
  "/gallery",
  "/reviews",
  "/learning-center",
  "/track-order",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const productRoutes = STOREFRONT_PRODUCTS.map((product) => `/products/${product.slug}`);

  return [...STATIC_ROUTES, ...productRoutes].map((path) => ({
    url: `${SITE.url}${path}`,
  }));
}
