// Live, mutable order book backing both Bud Guardian's chatbot ("Commandes"
// mode, read-only) and the /staff/orders employee dashboard (read/write).
// A single module-level singleton is the one shared source of truth so the
// two surfaces can never disagree about an order's status — per AGENTS spec,
// "Bud Guardian ne doit jamais inventer un statut" and the staff space must
// stay in sync with it instantly.
//
// Seeded from the BUD_GUARDIAN_ORDERS fixture, then persisted to
// localStorage so edits survive reloads, and mirrored across tabs via the
// `storage` event. Still purely local/simulated — no backend, no network.

import type { Order } from "@/types/order";
import { BUD_GUARDIAN_ORDERS } from "./orders";

const STORAGE_KEY = "wb-guardian-orders-v1";

function cloneOrders(source: Order[]): Order[] {
  return source.map((order) => ({
    ...order,
    items: order.items.map((item) => ({ ...item })),
    confirmation: { ...order.confirmation },
    payment: { ...order.payment },
  }));
}

function loadInitial(): Order[] {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Order[];
    } catch {
      // Corrupt/unavailable storage — fall back to the fixture below.
    }
  }
  return cloneOrders(BUD_GUARDIAN_ORDERS);
}

let orders: Order[] = loadInitial();
const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Storage full/unavailable (private browsing) — in-memory state still works.
  }
}

function notify(): void {
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      orders = JSON.parse(event.newValue) as Order[];
      notify();
    } catch {
      // Ignore malformed cross-tab payloads.
    }
  });
}

export function subscribeOrders(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOrders(): Order[] {
  return orders;
}

export function findOrderById(id: string): Order | undefined {
  return orders.find((order) => order.id === id);
}

export function replaceOrder(id: string, updater: (order: Order) => Order): Order | undefined {
  let updated: Order | undefined;
  orders = orders.map((order) => {
    if (order.id !== id) return order;
    updated = updater(order);
    return updated;
  });
  if (updated) {
    persist();
    notify();
  }
  return updated;
}
