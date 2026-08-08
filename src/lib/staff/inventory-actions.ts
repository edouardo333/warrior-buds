"use client";

// Bud Guardian V5.0 — staff-side read/write access for /staff/inventory.
// Mirrors order-actions.ts's shape: core stock data (products, movements)
// is written through inventory-store.ts, the single source both this
// dashboard and the automatic order-reconciliation pass
// (inventory-engine.ts) read from.
//
// Bud Guardian V6 — Permissions & Operations Hardening. The role gate on
// manual stock writes (receive, adjustment, transfer) is unchanged in
// substance — manager/supervisor/admin only, employees keep full read
// access — but now goes through the centralized model (permissions.ts)
// instead of a standalone canAdjustInventory() in staff-auth.ts, and this
// file's own separate audit log is gone in favour of the shared one
// (data/bud-guardian/audit-log.ts), its history migrated in automatically.

import { useSyncExternalStore } from "react";
import type { InventoryLocation, InventoryMovement, MovementReason, StockStatus } from "@/types/inventory";
import type { StaffRole } from "@/types/staff-order";
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
import { hasPermission } from "./permissions";
import { logAuditEntry, useAuditLog as useModuleAuditLog } from "./audit-log";
import type { InventoryProduct } from "@/types/inventory";

let allMovementsCache: InventoryMovement[] | null = null;
const productMovementsCache = new Map<string, InventoryMovement[]>();
let snapshotCache: StaffInventoryProductView[] | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  snapshotCache = null;
  allMovementsCache = null;
  productMovementsCache.clear();
  for (const listener of listeners) listener();
}

subscribeInventory(() => emit());

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

// Inventory-scoped view over the shared audit log — same import name as
// before V6 so InventoryDashboard.tsx needs no changes beyond the entry
// shape it reads.
export function useInventoryAuditLog() {
  return useModuleAuditLog("inventory");
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

const ADJUSTMENT_ACTION: Record<Extract<MovementReason, "damaged" | "manual-count" | "correction" | "expired">, string> = {
  damaged: "inventory.damaged",
  expired: "inventory.expired",
  correction: "inventory.correction",
  "manual-count": "inventory.manualAdjustment",
};

function deny(actor: string, role: StaffRole, action: string, productId: string, description: string): void {
  logAuditEntry({
    actor,
    role,
    module: "inventory",
    action,
    entityId: productId,
    description,
    outcome: "denied",
  });
}

// All three mutations below are gated on hasPermission(role, ...): regular
// employees can still read every inventory view (useStaffInventory,
// useInventoryMovements, etc.) but any write is a safe no-op for them. This
// is enforced here — the single path every staff-facing write goes through —
// not just hidden in the UI, so it holds even if a form is reached directly.

export function receiveInventory(productId: string, quantity: number, actor: string, role: StaffRole, note?: string): void {
  if (!hasPermission(role, "inventory.receive")) {
    deny(actor, role, "inventory.receive", productId, `Réception refusée — rôle "${role}" insuffisant.`);
    return;
  }
  const previousQuantity = findProductById(productId)?.quantityOnHand ?? null;
  const movement = receiveStock(productId, quantity, actor, { note });
  if (!movement) return;
  const product = findProductById(productId);
  logAuditEntry({
    actor,
    role,
    module: "inventory",
    action: "inventory.receive",
    entityId: productId,
    description: `Réception : +${quantity} (${product?.name ?? productId})`,
    metadata: { productName: product?.name ?? null, previousQuantity, newQuantity: movement.resultingQuantity, delta: movement.quantityDelta, reason: movement.reason },
  });
  emit();
}

export function manualAdjustment(
  productId: string,
  delta: number,
  reason: Extract<MovementReason, "damaged" | "manual-count" | "correction" | "expired">,
  actor: string,
  role: StaffRole,
  note?: string
): void {
  if (!hasPermission(role, "inventory.adjust")) {
    deny(actor, role, "inventory.adjust", productId, `Ajustement refusé — rôle "${role}" insuffisant.`);
    return;
  }
  const previousQuantity = findProductById(productId)?.quantityOnHand ?? null;
  const movement = adjustStock(productId, delta, reason, actor, note);
  if (!movement) return;
  const product = findProductById(productId);
  logAuditEntry({
    actor,
    role,
    module: "inventory",
    action: ADJUSTMENT_ACTION[reason],
    entityId: productId,
    description: `Ajustement : ${delta > 0 ? "+" : ""}${delta} (${product?.name ?? productId})`,
    metadata: { productName: product?.name ?? null, previousQuantity, newQuantity: movement.resultingQuantity, delta: movement.quantityDelta, reason: movement.reason },
  });
  emit();
}

export function transferInventory(productId: string, destination: InventoryLocation, actor: string, role: StaffRole, note?: string): void {
  if (!hasPermission(role, "inventory.transfer")) {
    deny(actor, role, "inventory.transfer", productId, `Transfert refusé — rôle "${role}" insuffisant.`);
    return;
  }
  const previousQuantity = findProductById(productId)?.quantityOnHand ?? null;
  const movement = transferStock(productId, destination, actor, note);
  if (!movement) return;
  const product = findProductById(productId);
  logAuditEntry({
    actor,
    role,
    module: "inventory",
    action: "inventory.transfer",
    entityId: productId,
    description: `Transfert vers ${destination} (${product?.name ?? productId})`,
    metadata: { productName: product?.name ?? null, previousQuantity, newQuantity: movement?.resultingQuantity ?? previousQuantity, delta: movement?.quantityDelta ?? 0, destination },
  });
  emit();
}
