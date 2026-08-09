"use client";

// Storefront — "use client" product-catalog hooks over
// data/shop/product-store.ts + lib/shop/product-engine.ts. Snapshots
// subscribed via useSyncExternalStore always read the store's raw,
// referentially-stable array (getProducts()); filtering/sorting/lookups
// are derived with useMemo so they only recompute when the raw snapshot
// actually changes. Never imports from or writes to data/bud-guardian/**,
// lib/staff/**, or components/staff/**.

import { useMemo, useSyncExternalStore } from "react";
import { getProducts, subscribeProducts } from "@/data/shop/product-store";
import * as productEngine from "./product-engine";
import type { StorefrontProduct } from "@/types/product";

const EMPTY_PRODUCTS: StorefrontProduct[] = [];

function useRawProducts(): StorefrontProduct[] {
  return useSyncExternalStore(subscribeProducts, getProducts, () => EMPTY_PRODUCTS);
}

export function useProducts(filters: productEngine.ProductFilters = {}, sort: productEngine.ProductSort = "featured") {
  const products = useRawProducts();
  return useMemo(
    () => productEngine.sortProducts(productEngine.filterProducts(products, filters), sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, sort, filters.categoryNode, filters.strain, filters.search, filters.onSaleOnly]
  );
}

// Unfiltered catalog snapshot — used by the Products page category
// mega-dropdown (components/shop/ProductCategoryMenu.tsx) to show live
// per-node product counts against the whole catalog, independent of
// whatever other filters are currently active.
export function useAllProducts(): StorefrontProduct[] {
  return useRawProducts();
}

export function useProduct(slug: string): StorefrontProduct | undefined {
  const products = useRawProducts();
  return useMemo(() => products.find((p) => p.slug === slug), [products, slug]);
}

export function useProductById(id: string): StorefrontProduct | undefined {
  const products = useRawProducts();
  return useMemo(() => products.find((p) => p.id === id), [products, id]);
}
