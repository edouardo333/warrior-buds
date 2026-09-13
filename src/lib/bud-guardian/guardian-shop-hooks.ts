// Bud Guardian — Storefront integration hooks (NOT WIRED IN YET). Additive,
// read-only functions over the Storefront's own stores
// (data/shop/{product-store,order-store,account-store}.ts) that a future
// version of the customer-facing chat widget (components/bud-guardian/
// BudGuardian.tsx) could call to answer order questions, retrieve a
// customer's orders, explain tracking, recommend products, and notify
// customers about order updates — per the "Future AI" hooks requested for
// the Storefront build.
//
// This file only ever reads from data/shop/**; it never writes to it, and
// it never imports from or writes to data/bud-guardian/**, lib/staff/**, or
// components/staff/** (the CRM/Staff Dashboard/Risk Engine stay untouched).
// BudGuardian.tsx itself is not modified by this file — wiring these hooks
// into the chat orchestrator (new detectXIntent()/useXSession() hooks and
// QuickActionConfig entries, mirroring order-intent.ts/useOrderSession.ts)
// is left for a future pass.

import { findAccountByEmail } from "@/data/shop/account-store";
import { getOrders, getOrdersForAccount } from "@/data/shop/order-store";
import { getProducts } from "@/data/shop/product-store";
import type { Locale } from "@/lib/i18n/types";
import { buildTrackingSteps, getOrderStatusLabel } from "@/lib/shop/order-engine";
import { getAvailableStock, getAverageRating, getEffectivePrice } from "@/lib/shop/product-engine";
import type { ProductCategory, StorefrontProduct } from "@/types/product";
import type { ShopOrder } from "@/types/shop-order";

// Retrieve every Storefront order placed by the customer with this email,
// newest first — e.g. for "what have I ordered?" or "where's my stuff?".
export function getOrdersForGuardian(email: string): ShopOrder[] {
  const account = findAccountByEmail(email);
  if (!account) return [];
  return getOrdersForAccount(account.id);
}

// A short, chat-friendly sentence describing where an order currently
// stands — e.g. for "where's my order WB-100234?". Looks up by order id
// across all accounts, since a chat session identifies the order directly
// rather than by the customer's account.
export function getOrderTrackingSummary(orderId: string, locale: Locale): string | null {
  const order = getOrders().find((o) => o.id === orderId);
  if (!order) return null;
  const steps = buildTrackingSteps(order, locale);
  const current = steps.find((s) => s.state === "current");
  const statusLabel = getOrderStatusLabel(order.status, locale);
  if (!current || !order.canadaPostTrackingNumber) return statusLabel;
  return locale === "fr"
    ? `${statusLabel} — numéro de suivi Postes Canada ${order.canadaPostTrackingNumber}`
    : `${statusLabel} — Canada Post tracking number ${order.canadaPostTrackingNumber}`;
}

// V11 — Smart Product Advisor filter/sort options. `minPrice` is an
// EXCLUSIVE lower bound (used for "more expensive than $X" / "pricier than
// product Y"), `maxPrice` is inclusive ("under/at most $X").
export type ProductAdviceFilters = {
  category?: ProductCategory;
  maxPrice?: number;
  minPrice?: number;
  excludeId?: string; // e.g. the anchor product in "cheaper than X"/"similar to X"
};

export type ProductAdviceSort = "rating" | "price-asc";

// V11 — the single place Guardian's product-advice paths (product-intent.ts)
// filter/sort the live catalog, so category/budget/exclude-id logic exists
// exactly once no matter which intent (recommend, cheaper/pricier-than,
// no-result fallback, ...) needs it. Never returns out-of-stock products —
// Guardian should never recommend something a customer can't actually buy.
export function findGuardianProducts(filters: ProductAdviceFilters, sort: ProductAdviceSort = "rating", limit = 3): StorefrontProduct[] {
  const matches = getProducts().filter((p) => {
    if (getAvailableStock(p) <= 0) return false;
    if (filters.excludeId && p.id === filters.excludeId) return false;
    if (filters.category && p.category !== filters.category) return false;
    const price = getEffectivePrice(p);
    if (filters.maxPrice != null && price > filters.maxPrice) return false;
    if (filters.minPrice != null && price <= filters.minPrice) return false;
    return true;
  });

  const sorted = [...matches].sort((a, b) =>
    sort === "price-asc"
      ? getEffectivePrice(a) - getEffectivePrice(b)
      : (getAverageRating(b) ?? 0) - (getAverageRating(a) ?? 0) || getEffectivePrice(a) - getEffectivePrice(b)
  );

  return sorted.slice(0, limit);
}

// Simple, explainable recommendation: highest-rated in-stock products,
// optionally scoped to a category — e.g. for "what do you recommend?". Kept
// as a thin wrapper over findGuardianProducts for callers that only need the
// category-only case.
export function recommendProductsForGuardian(category?: ProductCategory, limit = 3): StorefrontProduct[] {
  return findGuardianProducts({ category }, "rating", limit);
}
