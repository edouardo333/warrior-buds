// Storefront — checkout business rules: turns a cart into a ShopOrder. Pure
// function over data/shop/{cart-store,order-store,product-store}.ts. Never
// imports from or writes to data/bud-guardian/**, lib/staff/**, or
// components/staff/**.

import { clearCart } from "@/data/shop/cart-store";
import { addOrder } from "@/data/shop/order-store";
import { decrementStock } from "@/data/shop/product-store";
import type { Address } from "@/types/account";
import type { ShippingMethod, ShopOrder } from "@/types/shop-order";
import type { PaymentProviderId } from "@/types/shop-payment";
import { getCartLines, getCartTotals } from "./cart-engine";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

export type CreateOrderInput = {
  accountId: string;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: ShippingMethod;
  paymentProviderId: PaymentProviderId;
};

export function createOrderFromCart(input: CreateOrderInput): ShopOrder | null {
  const lines = getCartLines(input.accountId);
  if (lines.length === 0) return null;

  const totals = getCartTotals(input.accountId);
  const now = new Date().toISOString();
  const order: ShopOrder = {
    id: uid("WB"),
    accountId: input.accountId,
    items: lines.map((l) => ({
      productId: l.product.id,
      name: l.product.name,
      unitPrice: Math.round((l.lineTotal / l.quantity) * 100) / 100,
      quantity: l.quantity,
    })),
    subtotal: totals.subtotal,
    shippingCost: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    status: "pending_payment",
    timeline: [{ status: "pending_payment", at: now }],
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress,
    shippingMethod: input.shippingMethod,
    canadaPostTrackingNumber: null,
    paymentProviderId: input.paymentProviderId,
    createdAt: now,
    updatedAt: now,
  };

  addOrder(order);
  for (const line of lines) decrementStock(line.product.id, line.quantity);
  clearCart(input.accountId);
  return order;
}
