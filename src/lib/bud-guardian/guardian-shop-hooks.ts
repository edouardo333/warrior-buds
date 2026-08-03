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
import { getAverageRating, getEffectivePrice } from "@/lib/shop/product-engine";
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

// Simple, explainable recommendation: highest-rated in-stock products,
// optionally scoped to a category — e.g. for "what do you recommend?".
export function recommendProductsForGuardian(category?: ProductCategory, limit = 3): StorefrontProduct[] {
  return getProducts()
    .filter((p) => p.stock > 0 && (!category || p.category === category))
    .sort((a, b) => (getAverageRating(b) ?? 0) - (getAverageRating(a) ?? 0) || getEffectivePrice(a) - getEffectivePrice(b))
    .slice(0, limit);
}
