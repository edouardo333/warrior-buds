"use client";

// Bud Guardian V5.0 — staff-side read/write access for /staff/inventory.
// Mirrors order-actions.ts's shape: core stock data (products, movements)
// is written through inventory-store.ts, the single source both this
// dashboard and the automatic order-reconciliation pass
// (inventory-engine.ts) read from. A small staff-only audit log lives in
// its own localStorage-backed store here, exactly like order-actions.ts
// keeps its audit log separate from the shared order store.

import { useSyncExternalStore } from "react";
import type { InventoryLocation, InventoryMovement, InventoryProduct, MovementReason, StockStatus } from "@/types/inventory";
import {
  findProductById,
  getInventoryMovements,
  getInventoryProducts,
  getMovementsForProduct,
  subscribeInventory,
} from "@/data/bud-guardian/inventory-store";
import {
  adjustStock,
  getInventoryValue,
  getStockStatus,
  getTodayMovementCount,
  isExpiringSoon,
  receiveStock,
  transferStock,
} from "@/lib/bud-guardian/inventory-engine";

const AUDIT_STORAGE_KEY = "wb-staff-inventory-audit-v1";
const AUDIT_LOG_LIMIT = 200;

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export type InventoryAuditEntry = {
  id: string;
  at: string;
  by: string;
  productId: string | null;
  action: string;
};

function loadAudit(): InventoryAuditEntry[] {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(AUDIT_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as InventoryAuditEntry[];
    } catch {
      // Fall through to an empty log below.
    }
  }
  return [];
}

let auditLog: InventoryAuditEntry[] = loadAudit();
const listeners = new Set<() => void>();
let snapshotCache: StaffInventoryProductView[] | null = null;

function persistAudit(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(auditLog));
  } catch {
    // Storage unavailable — in-memory state still works for this tab.
  }
}

let allMovementsCache: InventoryMovement[] | null = null;
const productMovementsCache = new Map<string, InventoryMovement[]>();

function emit(): void {
  snapshotCache = null;
  allMovementsCache = null;
  productMovementsCache.clear();
  for (const listener of listeners) listener();
}

subscribeInventory(() => emit());

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== AUDIT_STORAGE_KEY) return;
    auditLog = loadAudit();
    emit();
  });
}

function logAudit(by: string, productId: string | null, action: string): void {
  auditLog = [{ id: uid("iaudit"), at: new Date().toISOString(), by, productId, action }, ...auditLog].slice(0, AUDIT_LOG_LIMIT);
  persistAudit();
}

export type StaffInventoryProductView = InventoryProduct & {
  stockStatus: StockStatus;
  isExpiringSoon: boolean;
  profitMargin: number;
};

function computeSnapshot(): StaffInventoryProductView[] {
  return getInventoryProducts().map((product) => ({
    ...product,
    stockStatus: getStockStatus(product),
    isExpiringSoon: isExpiringSoon(product),
    profitMargin: product.sellingPrice > 0 ? (product.sellingPrice - product.purchaseCost) / product.sellingPrice : 0,
  }));
}

function getSnapshot(): StaffInventoryProductView[] {
  if (!snapshotCache) snapshotCache = computeSnapshot();
  return snapshotCache;
}

export function subscribeStaffInventory(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStaffInventory(): StaffInventoryProductView[] {
  return useSyncExternalStore(subscribeStaffInventory, getSnapshot, getSnapshot);
}

export function useStaffInventoryProduct(productId: string | null): StaffInventoryProductView | null {
  const products = useStaffInventory();
  if (!productId) return null;
  return products.find((p) => p.id === productId) ?? null;
}

const EMPTY_MOVEMENTS: InventoryMovement[] = [];

function getMovementsSnapshot(productId?: string): InventoryMovement[] {
  if (!productId) {
    if (!allMovementsCache) allMovementsCache = getInventoryMovements();
    return allMovementsCache;
  }
  let cached = productMovementsCache.get(productId);
  if (!cached) {
    cached = getMovementsForProduct(productId);
    productMovementsCache.set(productId, cached);
  }
  return cached;
}

export function useInventoryMovements(productId?: string): InventoryMovement[] {
  return useSyncExternalStore(
    subscribeStaffInventory,
    () => getMovementsSnapshot(productId),
    () => EMPTY_MOVEMENTS
  );
}

export function useInventoryAuditLog(): InventoryAuditEntry[] {
  return useSyncExternalStore(subscribeStaffInventory, () => auditLog, () => auditLog);
}

export function useInventoryKpis() {
  const products = useStaffInventory();
  const movements = useInventoryMovements();
  return {
    totalProducts: products.length,
    inventoryValue: getInventoryValue(products),
    lowStock: products.filter((p) => p.stockStatus === "low-stock").length,
    outOfStock: products.filter((p) => p.stockStatus === "out-of-stock").length,
    expiringSoon: products.filter((p) => p.isExpiringSoon).length,
    todayMovements: getTodayMovementCount(movements),
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function receiveInventory(productId: string, quantity: number, actor: string, note?: string): void {
  const movement = receiveStock(productId, quantity, actor, { note });
  if (!movement) return;
  const product = findProductById(productId);
  logAudit(actor, productId, `Réception : +${quantity} (${product?.name ?? productId})`);
  emit();
}

export function manualAdjustment(
  productId: string,
  delta: number,
  reason: Extract<MovementReason, "damaged" | "manual-count" | "correction" | "expired">,
  actor: string,
  note?: string
): void {
  const movement = adjustStock(productId, delta, reason, actor, note);
  if (!movement) return;
  const product = findProductById(productId);
  logAudit(actor, productId, `Ajustement : ${delta > 0 ? "+" : ""}${delta} (${product?.name ?? productId})`);
  emit();
}

export function transferInventory(productId: string, destination: InventoryLocation, actor: string, note?: string): void {
  const movement = transferStock(productId, destination, actor, note);
  if (!movement) return;
  const product = findProductById(productId);
  logAudit(actor, productId, `Transfert vers ${destination} (${product?.name ?? productId})`);
  emit();
}
