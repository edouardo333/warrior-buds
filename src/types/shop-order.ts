// Storefront — customer Order types. Distinct lifecycle and shape from the
// CRM's Order (types/order.ts, staff-facing) — never imports from or writes
// to that file, data/bud-guardian/orders-store.ts, or lib/staff/**.

import type { Address } from "./account";

export type ShopOrderStatus =
  | "pending_payment"
  | "payment_received"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type ShopOrderItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type ShopOrderTimelineEntry = {
  status: ShopOrderStatus;
  at: string;
};

export type ShippingMethod = "standard" | "expedited" | "pickup";

export type ShopOrder = {
  id: string; // e.g. "WB-100234"
  // "guest" (data/shop/cart-store.ts GUEST_OWNER_ID) for orders placed
  // through Guest Checkout — no CustomerAccount exists for those, contact
  // info instead lives in `guestEmail` below.
  accountId: string;
  // Contact email for guest orders (accountId === "guest"), used for the
  // mock order-confirmation email and for /track-order lookups. Always null
  // for orders placed by a signed-in account — use the account's email.
  guestEmail: string | null;
  items: ShopOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  // BUDS5 first-order discount actually applied at order creation (see
  // lib/shop/promo-engine.ts) — 0 / null when no code was applied.
  discount: number;
  promoCode: string | null;
  total: number;
  status: ShopOrderStatus;
  timeline: ShopOrderTimelineEntry[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: ShippingMethod;
  // Placeholder only, per spec — no real Canada Post integration exists.
  canadaPostTrackingNumber: string | null;
  paymentProviderId: string;
  createdAt: string;
  updatedAt: string;
};
