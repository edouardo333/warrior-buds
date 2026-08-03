"use client";

import { fieldClass } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getAllCategories, getCategoryLabel, getStrainLabel, type ProductFilters as Filters, type ProductSort } from "@/lib/shop/product-engine";
import type { ProductStrain } from "@/types/product";

const STRAINS: ProductStrain[] = ["sativa", "indica", "hybrid"];

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
  const categories = getAllCategories();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-[180px] flex-1">
        <label className="text-xs font-semibold uppercase tracking-widest text-foreground/50">{t.productCatalog.filters.search}</label>
        <input
          type="text"
          placeholder={t.productCatalog.filters.searchPlaceholder}
          value={filters.search ?? ""}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className={`${fieldClass()} mt-2`}
        />
      </div>
      <div className="min-w-[160px]">
        <label className="text-xs font-semibold uppercase tracking-widest text-foreground/50">{t.productCatalog.filters.category}</label>
        <select
          value={filters.category ?? ""}
          onChange={(e) => onFiltersChange({ ...filters, category: (e.target.value || undefined) as Filters["category"] })}
          className={`${fieldClass()} mt-2`}
        >
          <option value="">{t.productCatalog.filters.allCategories}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {getCategoryLabel(c, locale)}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[150px]">
        <label className="text-xs font-semibold uppercase tracking-widest text-foreground/50">{t.productCatalog.filters.strain}</label>
        <select
          value={filters.strain ?? ""}
          onChange={(e) => onFiltersChange({ ...filters, strain: (e.target.value || undefined) as ProductStrain | undefined })}
          className={`${fieldClass()} mt-2`}
        >
          <option value="">{t.productCatalog.filters.allStrains}</option>
          {STRAINS.map((s) => (
            <option key={s} value={s}>
              {getStrainLabel(s, locale)}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[170px]">
        <label className="text-xs font-semibold uppercase tracking-widest text-foreground/50">{t.productCatalog.filters.sort}</label>
        <select value={sort} onChange={(e) => onSortChange(e.target.value as ProductSort)} className={`${fieldClass()} mt-2`}>
          <option value="featured">{t.productCatalog.filters.sortFeatured}</option>
          <option value="price-asc">{t.productCatalog.filters.sortPriceAsc}</option>
          <option value="price-desc">{t.productCatalog.filters.sortPriceDesc}</option>
          <option value="newest">{t.productCatalog.filters.sortNewest}</option>
          <option value="rating">{t.productCatalog.filters.sortRating}</option>
        </select>
      </div>
      <label className="flex items-center gap-2 pb-3 text-sm text-foreground/70">
        <input
          type="checkbox"
          checked={Boolean(filters.onSaleOnly)}
          onChange={(e) => onFiltersChange({ ...filters, onSaleOnly: e.target.checked || undefined })}
          className="h-4 w-4 rounded border-white/20 bg-white/5 accent-wb-orange"
        />
        {t.productCatalog.filters.onSaleOnly}
      </label>
      <button
        type="button"
        onClick={() => {
          onFiltersChange({});
          onSortChange("featured");
        }}
        className="pb-3 text-sm text-foreground/50 underline-offset-2 hover:text-wb-orange hover:underline"
      >
        {t.productCatalog.filters.clear}
      </button>
    </div>
  );
}
