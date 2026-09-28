"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import ShopCta from "./ShopCta";
import MinimumOrderCTA from "@/components/MinimumOrderCTA";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useProducts } from "@/lib/shop/product-actions";
import { findCategoryNode } from "@/lib/shop/category-tree";
import type { ProductFilters as Filters, ProductSort } from "@/lib/shop/product-engine";

// Reads ?category= and hands it to the catalog. useSearchParams makes the
// statically prerendered /products bail out to client rendering up to the
// nearest Suspense boundary — app/products/page.tsx therefore uses
// <ProductCatalog /> (default filters) as that boundary's fallback, so the
// prerendered HTML carries the real catalog instead of an empty page.
export default function ProductCatalogView() {
  const searchParams = useSearchParams();
  return <ProductCatalog initialCategory={searchParams.get("category")} />;
}

export function ProductCatalog({ initialCategory = null }: { initialCategory?: string | null }) {
  const { t } = useLanguage();
  // Homepage category cards (e.g. Topicals) can deep-link here via
  // ?category=<node id> to open the catalog pre-filtered. Only used to seed
  // the initial filter state — the dropdown filter logic itself is untouched.
  const [filters, setFilters] = useState<Filters>(() =>
    initialCategory && findCategoryNode(initialCategory) ? { categoryNode: initialCategory } : {}
  );
  const [sort, setSort] = useState<ProductSort>("featured");
  const products = useProducts(filters, sort);

  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,_#1a0f08_0%,_#050403_45%,_#000000_100%)]" />
      <div className="absolute inset-0 -z-20 bg-noise opacity-[0.035]" />
      <div className="pointer-events-none absolute -top-20 left-[6%] -z-10 h-72 w-72 animate-pulse-glow rounded-full bg-wb-red/10 blur-[120px]" />
      <div
        className="pointer-events-none absolute top-1/3 right-[4%] -z-10 h-80 w-80 animate-pulse-glow rounded-full bg-wb-orange/10 blur-[140px]"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 -z-10 h-72 w-72 animate-pulse-glow rounded-full bg-wb-yellow/8 blur-[130px]"
        style={{ animationDelay: "2s" }}
      />

      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-wb-orange">{t.categories.eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl tracking-wide text-foreground sm:text-5xl">{t.nav.links.products}</h1>
        </div>
        <MinimumOrderCTA className="mb-10" />
        <ProductFilters filters={filters} onFiltersChange={setFilters} sort={sort} onSortChange={setSort} />
        <p className="mb-4 mt-6 text-sm text-foreground/50">{t.productCatalog.filters.resultsCount(products.length)}</p>
        <ProductGrid products={products} />
        <ShopCta />
      </div>
    </div>
  );
}
