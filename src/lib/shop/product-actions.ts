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
import { STOREFRONT_PRODUCTS } from "@/data/shop/products";
import * as productEngine from "./product-engine";
import type { StorefrontProduct } from "@/types/product";

// Server (and hydration) snapshot: the static seed catalog, not an empty
// array. An empty server snapshot made /products SSR its "no results" state
// and every /products/[slug] SSR nothing at all between header and footer —
// on phones the page stayed blank (footer right under the header) until JS
// hydrated, then the whole catalog popped in. The seed is a stable module
// constant identical on server and client, so hydration can't mismatch;
// React then swaps to the persisted client store (getProducts) right after.
function getServerProducts(): StorefrontProduct[] {
  return STOREFRONT_PRODUCTS;
}

function useRawProducts(): StorefrontProduct[] {
  return useSyncExternalStore(subscribeProducts, getProducts, getServerProducts);
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
