// Live, mutable inventory ledger backing Bud Guardian's V5.0 "Inventory &
// Operations" module. Mirrors orders-store.ts's shape exactly: a
// module-level singleton, seeded from the BUD_GUARDIAN_INVENTORY /
// BUD_GUARDIAN_INVENTORY_MOVEMENTS fixtures, persisted to localStorage,
// mirrored across tabs via the `storage` event, and exposing a single
// mutation primitive (addMovement) that both manual staff actions and the
// automatic order-reconciliation pass in inventory-engine.ts go through —
// so stock can never drift between what a movement log says and what
// quantityOnHand shows.
//
// A third small store here (order stock links) tracks which orders have
// already had their items deducted, purely so reconciliation stays
// idempotent — see inventory-engine.ts's reconcileOrders().
//
// Still purely local and simulated: no backend, no real supplier feed, no
// network call. Never imports from or writes to orders-store.ts,
// payments.ts, risk.ts, or their staff-actions counterparts — those stay
// completely untouched.

import type { InventoryMovement, InventoryProduct, OrderStockLink } from "@/types/inventory";
import { BUD_GUARDIAN_INVENTORY, BUD_GUARDIAN_INVENTORY_MOVEMENTS } from "./inventory";

const PRODUCTS_KEY = "wb-guardian-inventory-products-v1";
const MOVEMENTS_KEY = "wb-guardian-inventory-movements-v1";
const LINKS_KEY = "wb-guardian-inventory-order-links-v1";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadJson<T>(key: string, fallback: () => T): T {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // Corrupt/unavailable storage — fall back to the seed below.
    }
  }
  return fallback();
}

let products: InventoryProduct[] = loadJson(PRODUCTS_KEY, () => BUD_GUARDIAN_INVENTORY.map((p) => ({ ...p })));
let movements: InventoryMovement[] = loadJson(MOVEMENTS_KEY, () => BUD_GUARDIAN_INVENTORY_MOVEMENTS.map((m) => ({ ...m })));
let orderLinks: Record<string, OrderStockLink> = loadJson(LINKS_KEY, () => ({}));

const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    window.localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
    window.localStorage.setItem(LINKS_KEY, JSON.stringify(orderLinks));
  } catch {
    // Storage full/unavailable (private browsing) — in-memory state still works.
  }
}

function notify(): void {
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (![PRODUCTS_KEY, MOVEMENTS_KEY, LINKS_KEY].includes(event.key ?? "")) return;
    products = loadJson(PRODUCTS_KEY, () => products);
    movements = loadJson(MOVEMENTS_KEY, () => movements);
    orderLinks = loadJson(LINKS_KEY, () => orderLinks);
    notify();
  });
}

export function subscribeInventory(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getInventoryProducts(): InventoryProduct[] {
  return products;
}

export function findProductById(id: string): InventoryProduct | undefined {
  return products.find((p) => p.id === id);
}

export function getInventoryMovements(): InventoryMovement[] {
  return movements;
}

export function getMovementsForProduct(productId: string): InventoryMovement[] {
  return movements.filter((m) => m.productId === productId);
}

export function getOrderStockLinks(): Record<string, OrderStockLink> {
  return orderLinks;
}

export function setOrderStockLink(link: OrderStockLink): void {
  orderLinks = { ...orderLinks, [link.orderId]: link };
  persist();
  notify();
}

export function replaceProduct(id: string, updater: (product: InventoryProduct) => InventoryProduct): InventoryProduct | undefined {
  let updated: InventoryProduct | undefined;
  products = products.map((p) => {
    if (p.id !== id) return p;
    updated = updater(p);
    return updated;
  });
  if (updated) {
    persist();
    notify();
  }
  return updated;
}

// Single mutation primitive for every stock change (receive, adjustment,
// transfer note, or an order-driven sale/return) — keeps quantityOnHand and
// the movement log from ever disagreeing, the same "one write path" rule
// orders-store.ts's replaceOrder() and payments.ts's replacePayment() follow.
export function addMovement(input: Omit<InventoryMovement, "id" | "resultingQuantity" | "at"> & { at?: string }): InventoryMovement | undefined {
  const product = findProductById(input.productId);
  if (!product) return undefined;

  const at = input.at ?? new Date().toISOString();
  const resultingQuantity = Math.max(0, product.quantityOnHand + input.quantityDelta);
  const movementEntry: InventoryMovement = {
    id: uid("mov"),
    productId: input.productId,
    type: input.type,
    quantityDelta: input.quantityDelta,
    resultingQuantity,
    reason: input.reason,
    note: input.note,
    actor: input.actor,
    orderId: input.orderId,
    at,
  };

  movements = [movementEntry, ...movements];
  products = products.map((p) => (p.id === product.id ? { ...p, quantityOnHand: resultingQuantity, updatedAt: at } : p));
  persist();
  notify();
  return movementEntry;
}

export function updateProductLocation(id: string, location: InventoryProduct["location"]): InventoryProduct | undefined {
  return replaceProduct(id, (p) => ({ ...p, location, updatedAt: new Date().toISOString() }));
}
