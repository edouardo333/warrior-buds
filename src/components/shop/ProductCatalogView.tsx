"use client";

import { memo, useEffect, useLayoutEffect, useMemo, useState, type MouseEvent } from "react";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import ShopCta from "./ShopCta";
import MinimumOrderCTA from "@/components/MinimumOrderCTA";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useProducts } from "@/lib/shop/product-actions";
import { findCategoryNode } from "@/lib/shop/category-tree";
import type { ProductFilters as Filters, ProductSort } from "@/lib/shop/product-engine";

// Cards rendered per batch — divisible by the 2/3/4-column grid so the last
// row of every batch is full. Filtering/sorting always runs on the complete
// catalog (useProducts); only how many matching cards are mounted is capped.
const PAGE_SIZE = 12;

// Snapshot taken when a product card is clicked, consumed once when the
// catalog remounts (Back from a product page) so the shopper returns to the
// same filters, loaded batch and scroll position.
const RETURN_STATE_KEY = "wb:products:return-state";

type ReturnState = {
  search: string;
  filters: Filters;
  sort: ProductSort;
  visibleCount: number;
  scrollY: number;
};

// Memoized (with visibleProducts below) so catalog state that doesn't change
// the visible slice — e.g. the Back scroll restore — skips the grid entirely.
const MemoProductGrid = memo(ProductGrid);

export default function ProductCatalog() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState<ProductSort>("featured");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [pendingScrollY, setPendingScrollY] = useState<number | null>(null);
  const products = useProducts(filters, sort);
  const visibleProducts = useMemo(() => products.slice(0, visibleCount), [products, visibleCount]);

  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    setVisibleCount(PAGE_SIZE);
  };
  const handleSortChange = (next: ProductSort) => {
    setSort(next);
    setVisibleCount(PAGE_SIZE);
  };

  // Seed browser-only state after mount (not in a state initializer) so the
  // prerendered markup and first client render stay identical. A layout
  // effect applies it before the first paint, so Back from a product (or a
  // ?category= deep link) never flashes the default catalog first.
  //
  // ?category= is read from window.location here rather than through
  // useSearchParams, which would make the static /products bail out to
  // client rendering: the prerendered catalog would be thrown away and
  // rebuilt from scratch (every card and image remounted) on each hard load.
  useLayoutEffect(() => {
    let saved: ReturnState | null = null;
    try {
      const raw = sessionStorage.getItem(RETURN_STATE_KEY);
      sessionStorage.removeItem(RETURN_STATE_KEY);
      if (raw) saved = JSON.parse(raw) as ReturnState;
    } catch {
      saved = null;
    }
    if (!saved || saved.search !== window.location.search) {
      // Homepage category cards (e.g. Topicals) can deep-link here via
      // ?category=<node id> to open the catalog pre-filtered. Only used to
      // seed the initial filter state — the dropdown filter logic is untouched.
      const category = new URLSearchParams(window.location.search).get("category");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the browser URL
      if (category && findCategoryNode(category)) setFilters({ categoryNode: category });
      return;
    }
    setFilters(saved.filters);
    setSort(saved.sort);
    setVisibleCount(Math.max(PAGE_SIZE, saved.visibleCount));
    setPendingScrollY(saved.scrollY);
  }, []);

  // Scroll once the restored batch has rendered and the page is tall enough.
  useEffect(() => {
    if (pendingScrollY === null) return;
    const id = requestAnimationFrame(() => {
      window.scrollTo({ top: pendingScrollY, behavior: "instant" });
      setPendingScrollY(null);
    });
    return () => cancelAnimationFrame(id);
  }, [pendingScrollY]);

  const saveReturnState = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as HTMLElement).closest("a[href^='/products/']");
    if (!link) return;
    const state: ReturnState = {
      search: window.location.search,
      filters,
      sort,
      visibleCount,
      scrollY: window.scrollY,
    };
    try {
      sessionStorage.setItem(RETURN_STATE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable (private mode) — Back simply starts fresh.
    }
  };

  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,_#1a0f08_0%,_#050403_45%,_#000000_100%)]" />
      <div className="absolute inset-0 -z-20 bg-noise opacity-[0.035]" />
      <div className="pointer-events-none absolute -top-20 left-[6%] -z-10 h-72 w-72 animate-pulse-glow rounded-full bg-wb-red/10 blur-[120px] wb-glow-soft" />
      <div
        className="pointer-events-none absolute top-1/3 right-[4%] -z-10 h-80 w-80 animate-pulse-glow rounded-full bg-wb-orange/10 blur-[140px] wb-glow-soft"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 -z-10 h-72 w-72 animate-pulse-glow rounded-full bg-wb-yellow/8 blur-[130px] wb-glow-soft"
        style={{ animationDelay: "2s" }}
      />

      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-wb-orange">{t.categories.eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl tracking-wide text-foreground sm:text-5xl">{t.nav.links.products}</h1>
        </div>
        <MinimumOrderCTA className="mb-10" />
        <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} sort={sort} onSortChange={handleSortChange} />
        <p className="mb-4 mt-6 text-sm text-foreground/50">{t.productCatalog.filters.resultsCount(products.length)}</p>
        <div onClickCapture={saveReturnState}>
          <MemoProductGrid products={visibleProducts} />
        </div>
        {visibleProducts.length < products.length && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-xs text-foreground/50">
              {t.productCatalog.filters.showingCount(visibleProducts.length, products.length)}
            </p>
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-wb-orange/40 bg-white/[0.04] px-8 py-3 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-wb-orange hover:bg-wb-orange/10 hover:text-wb-orange"
            >
              {t.productCatalog.filters.loadMore}
            </button>
          </div>
        )}
        <ShopCta />
      </div>
    </div>
  );
}
