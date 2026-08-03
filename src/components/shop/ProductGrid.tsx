"use client";

import ProductCard from "./ProductCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StorefrontProduct } from "@/types/product";

export default function ProductGrid({ products }: { products: StorefrontProduct[] }) {
  const { t } = useLanguage();

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-16 text-center backdrop-blur-sm">
        <p className="text-sm text-foreground/50">{t.productCatalog.filters.noResults}</p>
      </div>
    );
  }

  return (
    <div className="grid auto-rows-fr grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
