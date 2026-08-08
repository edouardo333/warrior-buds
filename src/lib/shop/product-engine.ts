// Storefront — product catalog business rules: pricing, ratings, stock
// status, filtering/sorting, and locale-keyed labels. Pure functions, no
// storage access. Never imports from or writes to data/bud-guardian/**,
// lib/staff/**, or components/staff/**.

import type { Locale } from "@/lib/i18n/types";
import type { ProductBadge, ProductCategory, ProductStrain, StorefrontProduct } from "@/types/product";

export function getEffectivePrice(product: StorefrontProduct): number {
  return product.salePrice ?? product.price;
}

export function isOnSale(product: StorefrontProduct): boolean {
  return product.salePrice !== null && product.salePrice < product.price;
}

export function getAverageRating(product: StorefrontProduct): number | null {
  if (product.reviews.length === 0) return null;
  const total = product.reviews.reduce((sum, r) => sum + r.rating, 0);
  return Math.round((total / product.reviews.length) * 10) / 10;
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export function getStockStatus(product: StorefrontProduct): StockStatus {
  if (product.stock <= 0) return "out-of-stock";
  if (product.stock <= 8) return "low-stock";
  return "in-stock";
}

export type ProductFilters = {
  category?: ProductCategory;
  strain?: ProductStrain;
  search?: string;
  onSaleOnly?: boolean;
};

export type ProductSort = "featured" | "price-asc" | "price-desc" | "newest" | "rating";

export function filterProducts(products: StorefrontProduct[], filters: ProductFilters): StorefrontProduct[] {
  return products.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.strain && p.strain !== filters.strain) return false;
    if (filters.onSaleOnly && !isOnSale(p)) return false;
    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      if (q && !`${p.name} ${p.brand} ${p.shortDescription}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function sortProducts(products: StorefrontProduct[], sort: ProductSort): StorefrontProduct[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    case "price-desc":
      return copy.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    case "newest":
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "rating":
      return copy.sort((a, b) => (getAverageRating(b) ?? 0) - (getAverageRating(a) ?? 0));
    case "featured":
    default:
      return copy.sort((a, b) => Number(b.badges.includes("best-seller")) - Number(a.badges.includes("best-seller")));
  }
}

const CATEGORY_LABELS: Record<ProductCategory, Record<Locale, string>> = {
  flower: { fr: "Fleurs", en: "Flower" },
  "pre-rolls": { fr: "Pré-roulés", en: "Pre-Rolls" },
  edibles: { fr: "Comestibles", en: "Edibles" },
  concentrates: { fr: "Concentrés", en: "Concentrates" },
  vapes: { fr: "Vapoteuses", en: "Vapes" },
  cbd: { fr: "CBD", en: "CBD" },
  accessories: { fr: "Accessoires", en: "Accessories" },
  topicals: { fr: "Topiques", en: "Topicals" },
  mushrooms: { fr: "Champignons", en: "Mushrooms" },
};

export function getCategoryLabel(category: ProductCategory, locale: Locale): string {
  return CATEGORY_LABELS[category][locale];
}

export function getAllCategories(): ProductCategory[] {
  return Object.keys(CATEGORY_LABELS) as ProductCategory[];
}

const BADGE_LABELS: Record<ProductBadge, Record<Locale, string>> = {
  new: { fr: "Nouveau", en: "New" },
  "best-seller": { fr: "Populaire", en: "Best Seller" },
  sale: { fr: "Promo", en: "Sale" },
  "staff-pick": { fr: "Choix du personnel", en: "Staff Pick" },
  limited: { fr: "Édition limitée", en: "Limited" },
  "low-stock": { fr: "Stock limité", en: "Low Stock" },
};

export function getBadgeLabel(badge: ProductBadge, locale: Locale): string {
  return BADGE_LABELS[badge][locale];
}

const STRAIN_LABELS: Record<ProductStrain, Record<Locale, string>> = {
  sativa: { fr: "Sativa", en: "Sativa" },
  indica: { fr: "Indica", en: "Indica" },
  hybrid: { fr: "Hybride", en: "Hybrid" },
};

export function getStrainLabel(strain: ProductStrain, locale: Locale): string {
  return STRAIN_LABELS[strain][locale];
}
