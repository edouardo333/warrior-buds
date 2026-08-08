"use client";

// Bud Guardian V2.1 — staff-side mutations for /staff/orders.
//
// Core order fields (status, confirmation flags, payment) are written
// through orders-store.ts, the single source both the employee dashboard and
// the Bud Guardian chatbot read from — so a status change here is visible in
// the chatbot's order tracking on the very next lookup, with no risk of the
// two disagreeing.
//
// Everything internal-only — timeline, notes, reminder log, manual
// "abandoned" flag — lives in a separate meta store, keyed by order id, that
// the chatbot never imports. That keeps staff notes and names out of
// anything a customer could ever see.
//
// Bud Guardian V6 — Permissions & Operations Hardening. Every mutation here
// now takes the caller's full StaffSession (not just an actor name string)
// so it can both label who did it AND check whether their role is allowed
// to. Sensitive actions (cancel, restore-abandoned, backward status moves,
// manual payment-status override) are checked against the centralized
// model in permissions.ts and reject — as a safe no-op, not a UI-only
// hide — when the role doesn't qualify. The audit log itself moved to a
// module shared with every other domain (data/bud-guardian/audit-log.ts);
// this file's own pre-V6 log is gone, its history migrated in automatically.

import { useSyncExternalStore } from "react";
import type { Order, OrderConfirmationFlags, OrderStatus, PaymentMethod, PaymentStatus } from "@/types/order";
import type { InternalNote, OrderStaffMeta, ReminderKind } from "@/types/staff-order";
import type { StaffSession } from "./staff-auth";
import { findOrderById, getOrders, replaceOrder, subscribeOrders } from "@/data/bud-guardian/orders-store";
import { isOrderAbandoned, isForwardOrSameStatus } from "@/lib/bud-guardian/order-engine";
import { hasPermission } from "./permissions";
import { logAuditEntry, useAuditLog as useModuleAuditLog } from "./audit-log";

const META_STORAGE_KEY = "wb-staff-order-meta-v1";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyMeta(order: Order): OrderStaffMeta {
  return {
    timeline: [{ id: uid("tl"), status: order.status, at: order.createdAt, by: "Bud Guardian" }],
    notes: [],
    reminders: [],
    manuallyAbandoned: false,
  };
}

function loadMeta(): Record<string, OrderStaffMeta> {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(META_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Record<string, OrderStaffMeta>;
    } catch {
      // Fall through to a fresh seed below.
    }
  }
  const seeded: Record<string, OrderStaffMeta> = {};
  for (const order of getOrders()) seeded[order.id] = emptyMeta(order);
  return seeded;
}

let meta: Record<string, OrderStaffMeta> = loadMeta();
const listeners = new Set<() => void>();
let snapshotCache: StaffOrderView[] | null = null;

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
  } catch {
    // Storage unavailable — in-memory state still works for this tab.
  }
}

function emit(): void {
  snapshotCache = null;
  for (const listener of listeners) listener();
}

// Keeps the dashboard's snapshot fresh when orders change from elsewhere —
// another tab, or (indirectly) the chatbot's own writes, if any are ever added.
subscribeOrders(() => emit());

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== META_STORAGE_KEY) return;
    meta = loadMeta();
    emit();
  });
}

function getMetaFor(orderId: string): OrderStaffMeta {
  const existing = meta[orderId];
  if (existing) return existing;
  const order = findOrderById(orderId);
  const created = order ? emptyMeta(order) : { timeline: [], notes: [], reminders: [], manuallyAbandoned: false };
  meta = { ...meta, [orderId]: created };
  return created;
}

export type StaffOrderView = Order & { staffMeta: OrderStaffMeta; isAbandoned: boolean };

function computeSnapshot(): StaffOrderView[] {
  return getOrders().map((order) => {
    const orderMeta = getMetaFor(order.id);
    return { ...order, staffMeta: orderMeta, isAbandoned: orderMeta.manuallyAbandoned || isOrderAbandoned(order) };
  });
}

function getSnapshot(): StaffOrderView[] {
  if (!snapshotCache) snapshotCache = computeSnapshot();
  return snapshotCache;
}

export function subscribeStaffOrders(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStaffOrders(): StaffOrderView[] {
  return useSyncExternalStore(subscribeStaffOrders, getSnapshot, getSnapshot);
}

export function useStaffOrder(orderId: string | null): StaffOrderView | null {
  const orders = useStaffOrders();
  if (!orderId) return null;
  return orders.find((order) => order.id === orderId) ?? null;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

// Shared "denied" path: log it (so a blocked attempt is traceable, not just
// silently nothing) and return without touching the store. Every gated
// mutation below funnels through this instead of duplicating the pattern.
function denyOrder(session: StaffSession, action: string, orderId: string, description: string): void {
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "orders",
    action,
    entityId: orderId,
    description,
    outcome: "denied",
  });
}

export function changeOrderStatus(orderId: string, status: OrderStatus, session: StaffSession): void {
  const current = findOrderById(orderId);
  if (!current) return;

  if (status === "cancelled") {
    if (!hasPermission(session.role, "order.cancel")) {
      denyOrder(session, "order.cancel", orderId, `Annulation refusée — rôle "${session.role}" insuffisant.`);
      return;
    }
  } else if (!isForwardOrSameStatus(current.status, status)) {
    if (!hasPermission(session.role, "order.statusRegress")) {
      denyOrder(session, "order.statusRegress", orderId, `Retour de statut refusé (${current.status} → ${status}) — rôle "${session.role}" insuffisant.`);
      return;
    }
  }

  const updated = replaceOrder(orderId, (order) => ({ ...order, status, updatedAt: new Date().toISOString() }));
  if (!updated) return;
  const orderMeta = getMetaFor(orderId);
  meta = {
    ...meta,
    [orderId]: { ...orderMeta, timeline: [...orderMeta.timeline, { id: uid("tl"), status, at: updated.updatedAt, by: session.name }] },
  };
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "orders",
    action: status === "cancelled" ? "order.cancel" : "order.status.changed",
    entityId: orderId,
    description: `Statut changé : ${status}`,
    metadata: { from: current.status, to: status },
  });
  persist();
  emit();
}

export function setConfirmationFlag(orderId: string, flag: keyof OrderConfirmationFlags, value: boolean, session: StaffSession): void {
  const updated = replaceOrder(orderId, (order) => ({
    ...order,
    confirmation: { ...order.confirmation, [flag]: value },
    updatedAt: new Date().toISOString(),
  }));
  if (!updated) return;
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "orders",
    action: "order.confirmationFlag",
    entityId: orderId,
    description: `Confirmation "${flag}" ${value ? "cochée" : "décochée"}`,
    metadata: { flag, value },
  });
  persist();
  emit();
}

export function setPaymentStatus(orderId: string, status: PaymentStatus, method: PaymentMethod | null, session: StaffSession): void {
  if (!hasPermission(session.role, "order.overridePaymentStatus")) {
    denyOrder(session, "order.overridePaymentStatus", orderId, `Modification manuelle du paiement refusée — rôle "${session.role}" insuffisant.`);
    return;
  }
  const updated = replaceOrder(orderId, (order) => ({
    ...order,
    payment: { status, method },
    updatedAt: new Date().toISOString(),
  }));
  if (!updated) return;
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "orders",
    action: "order.overridePaymentStatus",
    entityId: orderId,
    description: `Paiement mis à jour : ${status}`,
    metadata: { status, method },
  });
  persist();
  emit();
}

export function addInternalNote(orderId: string, text: string, session: StaffSession): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  const orderMeta = getMetaFor(orderId);
  const note: InternalNote = { id: uid("note"), text: trimmed, at: new Date().toISOString(), by: session.name };
  meta = { ...meta, [orderId]: { ...orderMeta, notes: [...orderMeta.notes, note] } };
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "orders",
    action: "order.note.added",
    entityId: orderId,
    description: "Note interne ajoutée",
  });
  persist();
  emit();
}

export function markOrderAbandoned(orderId: string, session: StaffSession): void {
  const orderMeta = getMetaFor(orderId);
  meta = { ...meta, [orderId]: { ...orderMeta, manuallyAbandoned: true } };
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "orders",
    action: "order.markAbandoned",
    entityId: orderId,
    description: "Commande marquée comme abandonnée",
  });
  persist();
  emit();
}

export function restoreAbandonedOrder(orderId: string, session: StaffSession): void {
  if (!hasPermission(session.role, "order.restoreAbandoned")) {
    denyOrder(session, "order.restoreAbandoned", orderId, `Restauration refusée — rôle "${session.role}" insuffisant.`);
    return;
  }
  const orderMeta = getMetaFor(orderId);
  meta = { ...meta, [orderId]: { ...orderMeta, manuallyAbandoned: false } };
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "orders",
    action: "order.restoreAbandoned",
    entityId: orderId,
    description: "Commande restaurée",
  });
  persist();
  emit();
}

export function sendReminder(orderId: string, kind: ReminderKind, session: StaffSession): void {
  const orderMeta = getMetaFor(orderId);
  const reminder = { id: uid("rem"), kind, at: new Date().toISOString(), by: session.name };
  meta = { ...meta, [orderId]: { ...orderMeta, reminders: [...orderMeta.reminders, reminder] } };
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "orders",
    action: "order.reminder.sent",
    entityId: orderId,
    description: `Rappel simulé envoyé : ${kind}`,
    metadata: { kind },
  });
  persist();
  emit();
}

// Orders-scoped view over the shared audit log — same import name as before
// V6 so OrdersDashboard.tsx needs no changes beyond the entry shape it reads.
export function useAuditLog() {
  return useModuleAuditLog("orders");
}

// ---------------------------------------------------------------------------
// Partial masking — phone/email are never shown unmasked in the staff UI
// either; staff verify identity through the customer's own confirmation, not
// by having the full number/address on screen.
// ---------------------------------------------------------------------------

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function maskPhonePartial(phone: string): string {
  const digits = digitsOnly(phone);
  if (digits.length < 6) return "•••-•••-••••";
  const areaCode = digits.slice(0, 3);
  const last2 = digits.slice(-2);
  return `${areaCode}-•••-••${last2}`;
}

export function maskEmailPartial(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "••••••";
  const visible = user.slice(0, Math.min(2, user.length));
  const hiddenCount = Math.max(user.length - visible.length, 2);
  return `${visible}${"•".repeat(hiddenCount)}@${domain}`;
}
