"use client";

import { RotateCcw, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getStrainLabel, type ProductFilters as Filters, type ProductSort } from "@/lib/shop/product-engine";
import type { ProductStrain } from "@/types/product";
import ProductCategoryMenu from "./ProductCategoryMenu";
import ProductSelectMenu from "./ProductSelectMenu";

const STRAINS: ProductStrain[] = ["sativa", "indica", "hybrid"];
const SORTS: ProductSort[] = ["featured", "price-asc", "price-desc", "newest", "rating"];

const inputClass =
  "wb-select w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground placeholder-foreground/35 outline-none transition-all duration-250 focus:border-wb-orange/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(244,103,15,0.15)] hover:border-white/20";

const labelClass = "text-xs font-semibold uppercase tracking-widest text-foreground/50";

export default function ProductFilters({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
}: {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  sort: ProductSort;
  onSortChange: (sort: ProductSort) => void;
}) {
  const { t, locale } = useLanguage();

  const sortLabels: Record<ProductSort, string> = {
    featured: t.productCatalog.filters.sortFeatured,
    "price-asc": t.productCatalog.filters.sortPriceAsc,
    "price-desc": t.productCatalog.filters.sortPriceDesc,
    newest: t.productCatalog.filters.sortNewest,
    rating: t.productCatalog.filters.sortRating,
  };

  return (
    // relative + isolate + z-20: makes this its own, explicitly-ordered
    // stacking context. Without an explicit z-index here, this whole panel
    // (backdrop-blur already forces a local stacking context) is compared
    // against product cards using DOM order, and — since ProductGrid renders
    // after these filters and each .wb-product-card sets isolation:isolate —
    // the cards would win and paint over any dropdown opened from here,
    // however high its own internal z-index. z-20 only has to clear the
    // cards' own z-10 badge/wishlist layers, which are isolated inside each
    // card and never escape to compete beyond it.
    <div className="relative isolate z-20 rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)] backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -top-16 right-[10%] h-40 w-40 rounded-full bg-wb-orange/10 blur-[80px]" />
      </div>
      <div className="relative flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[200px] flex-1">
          <label className={labelClass}>{t.productCatalog.filters.search}</label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" strokeWidth={2} />
            <input
              type="text"
              placeholder={t.productCatalog.filters.searchPlaceholder}
              value={filters.search ?? ""}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>
        <ProductCategoryMenu
          value={filters.categoryNode}
          onChange={(categoryNode) => onFiltersChange({ ...filters, categoryNode })}
        />
        <ProductSelectMenu
          className="min-w-[160px]"
          label={t.productCatalog.filters.strain}
          ariaLabel={t.productCatalog.filters.strain}
          value={filters.strain ?? ""}
          onChange={(v) => onFiltersChange({ ...filters, strain: (v || undefined) as ProductStrain | undefined })}
          options={[
            { value: "", label: t.productCatalog.filters.allStrains },
            ...STRAINS.map((s) => ({ value: s, label: getStrainLabel(s, locale) })),
          ]}
        />
        <ProductSelectMenu
          className="min-w-[180px]"
          label={t.productCatalog.filters.sort}
          ariaLabel={t.productCatalog.filters.sort}
          value={sort}
          onChange={(v) => onSortChange(v as ProductSort)}
          options={SORTS.map((s) => ({ value: s, label: sortLabels[s] }))}
        />

        <label className="group flex cursor-pointer items-center gap-3 pb-1 text-sm text-foreground/70 transition-colors duration-250 hover:text-foreground">
          <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
            <input
              type="checkbox"
              checked={Boolean(filters.onSaleOnly)}
              onChange={(e) => onFiltersChange({ ...filters, onSaleOnly: e.target.checked || undefined })}
              className="peer sr-only"
            />
            <span className="absolute inset-0 rounded-full border border-white/15 bg-white/10 transition-colors duration-250 peer-checked:border-wb-orange/50 peer-checked:bg-gradient-to-r peer-checked:from-wb-red peer-checked:via-wb-orange peer-checked:to-wb-yellow peer-focus-visible:ring-2 peer-focus-visible:ring-wb-orange/50" />
            <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-250 peer-checked:translate-x-5" />
          </span>
          {t.productCatalog.filters.onSaleOnly}
        </label>

        <button
          type="button"
          onClick={() => {
            onFiltersChange({});
            onSortChange("featured");
          }}
          className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-foreground/60 transition-all duration-250 hover:border-wb-orange/40 hover:bg-wb-orange/10 hover:text-wb-orange"
        >
          <RotateCcw className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-rotate-45" strokeWidth={2} />
          {t.productCatalog.filters.clear}
        </button>
      </div>
    </div>
  );
}
