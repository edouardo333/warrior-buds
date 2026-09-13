"use client";

// Storefront — "use client" customer order hooks over
// data/shop/order-store.ts + lib/shop/{checkout-engine,order-engine}.ts.
// Snapshots subscribed via useSyncExternalStore always read the store's
// raw, referentially-stable array (getOrders()); per-account filtering and
// lookups are derived with useMemo. Never imports from or writes to
// data/bud-guardian/**, lib/staff/**, or components/staff/**.

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getOrders, subscribeOrderStore } from "@/data/shop/order-store";
import * as checkoutEngine from "./checkout-engine";
import { useSession } from "./auth-actions";
import type { ShopOrder } from "@/types/shop-order";

const EMPTY_ORDERS: ShopOrder[] = [];

function useRawOrders(): ShopOrder[] {
  return useSyncExternalStore(subscribeOrderStore, getOrders, () => EMPTY_ORDERS);
}

export function useCustomerOrders(): ShopOrder[] {
  const orders = useRawOrders();
  const session = useSession();
  return useMemo(
    () => (session ? orders.filter((o) => o.accountId === session.accountId) : EMPTY_ORDERS),
    [orders, session]
  );
}

export function useOrder(id: string): ShopOrder | undefined {
  const orders = useRawOrders();
  return useMemo(() => orders.find((o) => o.id === id), [orders, id]);
}

export function useOrderActions() {
  const createOrder = useCallback((input: checkoutEngine.CreateOrderInput) => checkoutEngine.createOrderFromCart(input), []);
  return { createOrder };
}

// Public order lookup (order number + email) for the unauthenticated
// /track-order page — deliberately does not require a session. Guest orders
// (accountId === "guest") are matched against `guestEmail` directly since no
// CustomerAccount exists for them; account orders still resolve the email
// through accountLookup as before.
export function findOrderForTracking(orderId: string, email: string, accountLookup: (accountId: string) => { email: string } | undefined) {
  const orders = getOrders();
  const order = orders.find((o) => o.id.toLowerCase() === orderId.trim().toLowerCase());
  if (!order) return undefined;
  const normalizedEmail = email.trim().toLowerCase();
  if (order.guestEmail) {
    return order.guestEmail.toLowerCase() === normalizedEmail ? order : undefined;
  }
  const account = accountLookup(order.accountId);
  if (!account || account.email.toLowerCase() !== normalizedEmail) return undefined;
  return order;
}
