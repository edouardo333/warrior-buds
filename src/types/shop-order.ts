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
  accountId: string;
  items: ShopOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
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
