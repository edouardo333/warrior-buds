"use client";

import ProductCard from "./ProductCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StorefrontProduct } from "@/types/product";

export default function ProductGrid({ products }: { products: StorefrontProduct[] }) {
  const { t } = useLanguage();

  if (products.length === 0) {
    return <p className="py-16 text-center text-sm text-foreground/50">{t.productCatalog.filters.noResults}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
