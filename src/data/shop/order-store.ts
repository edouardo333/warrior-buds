// Storefront — mock customer order store. Distinct from
// data/bud-guardian/orders-store.ts (the CRM's staff-facing order book) —
// never imports from or writes to it, or to lib/staff/**,
// components/staff/**. Same shape as the other Storefront stores:
// localStorage-backed, cross-tab sync, pub/sub, single mutation primitive.

import type { ShopOrder, ShopOrderStatus } from "@/types/shop-order";

const ORDERS_KEY = "wb-shop-orders-v1";

function loadJson<T>(key: string, fallback: () => T): T {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // Corrupt/unavailable storage — fall back to the default below.
    }
  }
  return fallback();
}

let orders: ShopOrder[] = loadJson(ORDERS_KEY, () => []);

const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // Storage full/unavailable (private browsing) — in-memory state still works.
  }
}

function notify(): void {
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== ORDERS_KEY) return;
    orders = loadJson(ORDERS_KEY, () => orders);
    notify();
  });
}

export function subscribeOrderStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOrders(): ShopOrder[] {
  return orders;
}

export function getOrdersForAccount(accountId: string): ShopOrder[] {
  return orders.filter((o) => o.accountId === accountId);
}

export function findOrderById(id: string): ShopOrder | undefined {
  return orders.find((o) => o.id === id);
}

export function addOrder(order: ShopOrder): void {
  orders = [order, ...orders];
  persist();
  notify();
}

export function replaceOrder(id: string, updater: (order: ShopOrder) => ShopOrder): ShopOrder | undefined {
  let updated: ShopOrder | undefined;
  orders = orders.map((o) => {
    if (o.id !== id) return o;
    updated = updater(o);
    return updated;
  });
  if (updated) {
    persist();
    notify();
  }
  return updated;
}

// Single mutation primitive for lifecycle transitions — keeps `status` and
// `timeline` from ever disagreeing.
export function advanceOrderStatus(id: string, status: ShopOrderStatus, at?: string): ShopOrder | undefined {
  return replaceOrder(id, (order) => ({
    ...order,
    status,
    updatedAt: at ?? new Date().toISOString(),
    timeline: [...order.timeline, { status, at: at ?? new Date().toISOString() }],
  }));
}

export function setTrackingNumber(id: string, trackingNumber: string): ShopOrder | undefined {
  return replaceOrder(id, (order) => ({ ...order, canadaPostTrackingNumber: trackingNumber, updatedAt: new Date().toISOString() }));
}
