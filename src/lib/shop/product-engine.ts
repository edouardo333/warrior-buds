// Storefront — product catalog business rules: pricing, ratings, stock
// status, filtering/sorting, and locale-keyed labels. Pure functions, no
// storage access. Never imports from or writes to data/bud-guardian/**,
// lib/staff/**, or components/staff/**.

import type { Locale } from "@/lib/i18n/types";
import type { BulkPriceTier, ProductBadge, ProductCategory, ProductStrain, StorefrontProduct } from "@/types/product";
import { findCategoryNode } from "./category-tree";

// True for products catalogued with verified format/size pricing
// (types/product.ts's ProductFormat — e.g. regulated cannabis flower sold by
// 3.5g/7g/14g/oz/QP/HP/lb) instead of the quantity-tier model above. These
// are priced and added to cart entirely through the selected ProductFormat
// object (label + price), never through the quantity-tier helpers below —
// never call getProductPriceForQuantity/getBulkTierForQuantity for a product
// this returns true for. ProductDetail requires a format to be selected
// before Add to Cart is enabled (see its formatPriced branch); ProductCard's
// quick-add stays off for these (no format selector on the card itself) —
// shoppers pick a format on the product page. Bud Guardian's add-to-cart
// tool/intent still refuses these and points shoppers to the product page —
// see each call site's own comment.
export function isFormatPriced(product: StorefrontProduct): boolean {
  return Boolean(product.formats && product.formats.length > 0);
}

// True for a product that must never be purchasable through this site (see
// types/product.ts's inStoreOnly) — Product Detail reads this to hide the
// quantity stepper, Add to Cart, and wishlist controls entirely and show
// t.productCatalog.detail.inStoreOnlyNotice instead, regardless of whether
// the product is also format-priced. Every other product is unaffected.
export function isInStoreOnly(product: StorefrontProduct): boolean {
  return Boolean(product.inStoreOnly);
}

// True for a product with no verified price yet (types/product.ts's
// priceOnRequest) — an informational listing: no price shown, never sorted or
// compared as $0, no Add to Cart/wishlist. `price` holds a 0 placeholder for
// these that must never leak into any customer-facing price. Every other
// product is unaffected.
export function isPriceOnRequest(product: StorefrontProduct): boolean {
  return Boolean(product.priceOnRequest);
}

// Lowest price in a display-only infoPricing list (types/product.ts) — the
// "From $X" figure for cards and the detail header. Informational only.
export function getInfoPricingFloor(tiers: BulkPriceTier[]): number {
  return Math.min(...tiers.map((tier) => tier.price));
}

const PRICE_ON_REQUEST_LABEL: Record<Locale, string> = { fr: "Prix sur demande", en: "Price on request" };

// Customer-facing price text: the localized "price on request" wording for a
// priceOnRequest product, otherwise the regular formatted effective price.
// Used by Bud Guardian's chat answers so they never quote the 0 placeholder.
export function getPriceLabel(product: StorefrontProduct, locale: Locale): string {
  return isPriceOnRequest(product) ? PRICE_ON_REQUEST_LABEL[locale] : formatPrice(getEffectivePrice(product), locale);
}

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

// `product.stock` is `null` whenever the client hasn't provided a verified
// inventory count — treated as "no known cap" everywhere a numeric stock
// ceiling is otherwise enforced (quantity steppers, Bud Guardian's cart
// tools). Never surfaced to a customer as a number either way.
export function getAvailableStock(product: StorefrontProduct): number {
  return product.stock ?? Infinity;
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export function getStockStatus(product: StorefrontProduct): StockStatus {
  if (product.stock === null) return "in-stock";
  if (product.stock <= 0) return "out-of-stock";
  if (product.stock <= 8) return "low-stock";
  return "in-stock";
}

// Single source of truth for a verified bulk/wholesale tier — an EXACT
// quantity match against product.bulkPricing (data/shop/products.ts), never
// an interpolated/invented discount for quantities in between tiers.
export function getBulkTierForQuantity(product: StorefrontProduct, quantity: number): BulkPriceTier | null {
  return product.bulkPricing?.find((tier) => tier.quantity === quantity) ?? null;
}

// THE shared pricing helper — every surface that needs "what does buying
// `quantity` of this product cost" (Product Detail's total, Add to Cart,
// the cart, checkout) must call this instead of recomputing price × quantity
// itself, so an exact verified bulk tier is never silently overridden by a
// naive multiplication. Returns the TOTAL price for `quantity` units: the
// verified tier price when `quantity` exactly matches one, otherwise the
// regular per-unit (sale-aware) price × quantity.
export function getProductPriceForQuantity(product: StorefrontProduct, quantity: number): number {
  const tier = getBulkTierForQuantity(product, quantity);
  if (tier) return tier.price;
  return Math.round(getEffectivePrice(product) * quantity * 100) / 100;
}

// Savings vs. buying the same quantity at the regular (non-sale) per-unit
// price — only meaningful, and only ever returned, for an exact verified
// bulk tier. Never an invented percentage or promotional claim.
export function getBulkSavings(product: StorefrontProduct, quantity: number): number | null {
  const tier = getBulkTierForQuantity(product, quantity);
  if (!tier) return null;
  const savings = Math.round((product.price * quantity - tier.price) * 100) / 100;
  return savings > 0 ? savings : null;
}

// Noun shown after a bulk tier's quantity ("pen"/"pens") — the product's own
// bulkUnitLabel when it has one, otherwise the caller's generic localized
// "unit(s)" fallback.
export function getBulkUnitLabel(product: StorefrontProduct, quantity: number, locale: Locale, fallback: string): string {
  const label = product.bulkUnitLabel;
  if (!label) return fallback;
  return (quantity === 1 ? label.singular : label.plural)[locale];
}

// Locale-aware CAD currency formatting — the single formatter shared by
// Product Detail, the bulk pricing table, the cart, and checkout so a
// price's FORMATTING (not its numeric value) is the only thing that changes
// between FR and EN.
export function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

export type ProductFilters = {
  // Selected node id from the Products page category mega-dropdown
  // (lib/shop/category-tree.ts) — may be a top-level parent (e.g.
  // "cannabis") or a 2nd-level subcategory (e.g. "cannabis-indica").
  categoryNode?: string;
  strain?: ProductStrain;
  search?: string;
  onSaleOnly?: boolean;
};

export type ProductSort = "featured" | "price-asc" | "price-desc" | "newest" | "rating";

export function filterProducts(products: StorefrontProduct[], filters: ProductFilters): StorefrontProduct[] {
  const categoryNode = filters.categoryNode ? findCategoryNode(filters.categoryNode) : undefined;
  return products.filter((p) => {
    if (categoryNode && !categoryNode.match(p)) return false;
    if (filters.strain && p.strain !== filters.strain) return false;
    if (filters.onSaleOnly && !isOnSale(p)) return false;
    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      // Flavour names are searchable too (e.g. "blue razz" finds the STLTH
      // TITAN MAX 50K product) — empty for every product without flavourGroups.
      const flavours = p.flavourGroups?.flatMap((g) => g.flavours).join(" ") ?? "";
      if (q && !`${p.name} ${p.brand ?? ""} ${p.grade ?? ""} ${p.shortDescription} ${flavours}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function sortProducts(products: StorefrontProduct[], sort: ProductSort): StorefrontProduct[] {
  const copy = [...products];
  switch (sort) {
    // Price-on-request products carry no real price, so they always sort after
    // every priced product in both directions instead of as a fake $0.
    case "price-asc":
      return copy.sort((a, b) => Number(isPriceOnRequest(a)) - Number(isPriceOnRequest(b)) || getEffectivePrice(a) - getEffectivePrice(b));
    case "price-desc":
      return copy.sort((a, b) => Number(isPriceOnRequest(a)) - Number(isPriceOnRequest(b)) || getEffectivePrice(b) - getEffectivePrice(a));
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
  cigarettes: { fr: "Cigarettes", en: "Cigarettes" },
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
