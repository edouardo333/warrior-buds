"use client";

import { useState } from "react";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useProducts } from "@/lib/shop/product-actions";
import type { ProductFilters as Filters, ProductSort } from "@/lib/shop/product-engine";

export default function ProductCatalogView() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState<ProductSort>("featured");
  const products = useProducts(filters, sort);

  return (
    <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-wb-orange">{t.categories.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl tracking-wide text-foreground sm:text-5xl">{t.nav.links.products}</h1>
      </div>
      <ProductFilters filters={filters} onFiltersChange={setFilters} sort={sort} onSortChange={setSort} />
      <p className="mb-4 mt-6 text-sm text-foreground/50">{t.productCatalog.filters.resultsCount(products.length)}</p>
      <ProductGrid products={products} />
    </div>
  );
}
