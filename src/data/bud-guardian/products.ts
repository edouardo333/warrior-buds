// Foundation for a future real product catalog (search, cart, checkout).
// The live site's /products page is still "coming soon", so V1 ships with
// zero fabricated items — Bud Guardian must never invent a product. This
// type is the contract later phases (real inventory, ordering, CRM) build
// against without reshaping the rest of the assistant.

import type { BudGuardianCategoryId } from "./categories";

export type BudGuardianProduct = {
  id: string;
  categoryId: BudGuardianCategoryId;
  fr: { name: string; description: string };
  en: { name: string; description: string };
  priceCad?: number;
  inStock?: boolean;
};

export const BUD_GUARDIAN_PRODUCTS: BudGuardianProduct[] = [];
