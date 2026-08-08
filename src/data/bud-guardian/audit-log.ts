// Bud Guardian V6 — unified audit-log store. Mirrors every other store in
// this folder (orders-store.ts, payments.ts, risk.ts, inventory-store.ts): a
// single module-level singleton, persisted to localStorage, mirrored across
// tabs via the `storage` event, one write primitive (logAuditEntry).
//
// Before V6, Orders and Inventory each kept their own separate audit log
// (wb-staff-audit-log-v1, wb-staff-inventory-audit-v1) and Payments/Risk/
// Customers had none at all. This store replaces all of that with one log
// shared by every module, migrated once from the two legacy logs so
// existing history isn't lost.
//
// Read/write from both the engine layer (lib/bud-guardian/*-engine.ts, for
// system-generated entries like the inventory unmatched-item warning) and
// the staff action layer (lib/staff/*-actions.ts, for staff-driven
// mutations) — this file has no React and no dependency on either, so it
// can sit under both without inverting the existing data -> engine -> staff
// action -> component layering.

import type { AuditEntry, AuditModule } from "@/types/audit";

const STORAGE_KEY = "wb-staff-audit-log-v2";
const LEGACY_ORDER_KEY = "wb-staff-audit-log-v1";
const LEGACY_INVENTORY_KEY = "wb-staff-inventory-audit-v1";
const AUDIT_LOG_LIMIT = 500;

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// One-time migration from the two pre-V6 per-module logs. Neither legacy
// entry shape recorded a role, so migrated entries carry role: "unknown"
// rather than guessing one.
// ---------------------------------------------------------------------------

type LegacyOrderAuditEntry = { id: string; at: string; by: string; orderId: string | null; action: string };

type LegacyInventoryAuditEntry = {
  id: string;
  at: string;
  by: string;
  productId: string | null;
  productName: string | null;
  actionType: string;
  previousQuantity: number | null;
  newQuantity: number | null;
  delta: number | null;
  reason: string | null;
  action: string;
};

function readLegacy<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function migrateLegacyEntries(): AuditEntry[] {
  const legacyOrders = readLegacy<LegacyOrderAuditEntry>(LEGACY_ORDER_KEY).map(
    (entry): AuditEntry => ({
      id: `mig-${entry.id}`,
      at: entry.at,
      actor: entry.by,
      role: "unknown",
      module: "orders",
      action: "orders.legacy",
      entityId: entry.orderId,
      description: entry.action,
      outcome: "allowed",
    })
  );

  const legacyInventory = readLegacy<LegacyInventoryAuditEntry>(LEGACY_INVENTORY_KEY).map(
    (entry): AuditEntry => ({
      id: `mig-${entry.id}`,
      at: entry.at,
      actor: entry.by,
      role: "unknown",
      module: "inventory",
      action: `inventory.legacy.${entry.actionType}`,
      entityId: entry.productId,
      description: entry.action,
      metadata: {
        productName: entry.productName,
        previousQuantity: entry.previousQuantity,
        newQuantity: entry.newQuantity,
        delta: entry.delta,
        reason: entry.reason,
      },
      outcome: "allowed",
    })
  );

  return [...legacyOrders, ...legacyInventory].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

function loadInitial(): AuditEntry[] {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AuditEntry[];
    } catch {
      // Corrupt/unavailable storage — fall through to a fresh migration below.
    }
    // No v2 log yet on this device — run the one-time migration so existing
    // Orders/Inventory history survives the switch to the shared log.
    return migrateLegacyEntries();
  }
  return [];
}

let entries: AuditEntry[] = loadInitial();
const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full/unavailable (private browsing) — in-memory state still works.
  }
}

// Persist immediately if the initial load produced migrated entries, so the
// migration only ever runs once per device (subsequent loads see STORAGE_KEY
// already populated and skip straight to it).
if (typeof window !== "undefined" && entries.length > 0 && !window.localStorage.getItem(STORAGE_KEY)) {
  persist();
}

function notify(): void {
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      entries = JSON.parse(event.newValue) as AuditEntry[];
      notify();
    } catch {
      // Ignore malformed cross-tab payloads.
    }
  });
}

export function subscribeAuditLog(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAuditLog(): AuditEntry[] {
  return entries;
}

export function getAuditLogForModule(module: AuditModule): AuditEntry[] {
  return entries.filter((entry) => entry.module === module);
}

// Used by the inventory engine's unmatched-item guard (and available to any
// future warn-once-per-entity check) so the same condition isn't logged
// again on every reconciliation pass.
export function hasAuditEntry(module: AuditModule, action: string, entityId: string | null): boolean {
  return entries.some((entry) => entry.module === module && entry.action === action && entry.entityId === entityId);
}

// The single write path every module's action layer (and the inventory
// engine's system-generated warnings) goes through.
export function logAuditEntry(entry: Omit<AuditEntry, "id" | "at">): AuditEntry {
  const full: AuditEntry = { id: uid("audit"), at: new Date().toISOString(), ...entry };
  entries = [full, ...entries].slice(0, AUDIT_LOG_LIMIT);
  persist();
  notify();
  return full;
}
