// Storefront — public Product Catalog types. Deliberately separate from the
// staff Inventory module's InventoryProduct (types/inventory.ts —
// warehouse/SKU/supplier/purchase-cost operations) and from the empty CRM
// BudGuardianProduct fixture (data/bud-guardian/products.ts, which Bud
// Guardian's chat must never invent from). This is the new customer-facing
// shop catalog, seeded with its own sample data in data/shop/products.ts.
// Never imports from or writes to data/bud-guardian/**, lib/staff/**, or
// components/staff/**.

export type ProductCategory =
  | "flower"
  | "pre-rolls"
  | "edibles"
  | "concentrates"
  | "vapes"
  | "cbd"
  | "accessories"
  | "topicals"
  | "mushrooms";

export type ProductBadge = "new" | "best-seller" | "sale" | "staff-pick" | "limited" | "low-stock";

export type ProductStrain = "sativa" | "indica" | "hybrid";

export type ProductReview = {
  id: string;
  author: string;
  rating: number; // 1-5
  title: string;
  body: string;
  createdAt: string;
  verifiedPurchase: boolean;
};

export type ProductImage = {
  url: string;
  alt: string;
};

export type StorefrontProduct = {
  id: string; // e.g. "PROD-1001"
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  strain: ProductStrain | null;
  thcPercent: number | null;
  cbdPercent: number | null;
  weightGrams: number | null;
  price: number;
  salePrice: number | null;
  images: ProductImage[];
  shortDescription: string;
  description: string;
  stock: number;
  badges: ProductBadge[];
  reviews: ProductReview[];
  createdAt: string;
};
