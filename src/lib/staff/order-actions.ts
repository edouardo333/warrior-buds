"use client";

// Bud Guardian V2.1 — staff-side mutations for /staff/orders.
//
// Core order fields (status, confirmation flags, payment) are written
// through orders-store.ts, the single source both the employee dashboard and
// the Bud Guardian chatbot read from — so a status change here is visible in
// the chatbot's order tracking on the very next lookup, with no risk of the
// two disagreeing.
//
// Everything internal-only — timeline, notes, audit log, reminder log,
// manual "abandoned" flag — lives in a separate meta store, keyed by order
// id, that the chatbot never imports. That keeps staff notes and names out
// of anything a customer could ever see.

import { useSyncExternalStore } from "react";
import type { Order, OrderConfirmationFlags, OrderStatus, PaymentMethod, PaymentStatus } from "@/types/order";
import type { AuditLogEntry, InternalNote, OrderStaffMeta, ReminderKind } from "@/types/staff-order";
import { findOrderById, getOrders, replaceOrder, subscribeOrders } from "@/data/bud-guardian/orders-store";
import { isOrderAbandoned } from "@/lib/bud-guardian/order-engine";

const META_STORAGE_KEY = "wb-staff-order-meta-v1";
const AUDIT_STORAGE_KEY = "wb-staff-audit-log-v1";
const AUDIT_LOG_LIMIT = 200;

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

function loadAudit(): AuditLogEntry[] {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(AUDIT_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AuditLogEntry[];
    } catch {
      // Fall through to an empty log below.
    }
  }
  return [];
}

let meta: Record<string, OrderStaffMeta> = loadMeta();
let auditLog: AuditLogEntry[] = loadAudit();
const listeners = new Set<() => void>();
let snapshotCache: StaffOrderView[] | null = null;

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
    window.localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(auditLog));
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
    if (event.key !== META_STORAGE_KEY && event.key !== AUDIT_STORAGE_KEY) return;
    meta = loadMeta();
    auditLog = loadAudit();
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

function logAudit(by: string, orderId: string | null, action: string): void {
  auditLog = [{ id: uid("audit"), at: new Date().toISOString(), by, orderId, action }, ...auditLog].slice(0, AUDIT_LOG_LIMIT);
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

export function changeOrderStatus(orderId: string, status: OrderStatus, actor: string): void {
  const updated = replaceOrder(orderId, (order) => ({ ...order, status, updatedAt: new Date().toISOString() }));
  if (!updated) return;
  const orderMeta = getMetaFor(orderId);
  meta = {
    ...meta,
    [orderId]: { ...orderMeta, timeline: [...orderMeta.timeline, { id: uid("tl"), status, at: updated.updatedAt, by: actor }] },
  };
  logAudit(actor, orderId, `Statut changé : ${status}`);
  persist();
  emit();
}

export function setConfirmationFlag(orderId: string, flag: keyof OrderConfirmationFlags, value: boolean, actor: string): void {
  const updated = replaceOrder(orderId, (order) => ({
    ...order,
    confirmation: { ...order.confirmation, [flag]: value },
    updatedAt: new Date().toISOString(),
  }));
  if (!updated) return;
  logAudit(actor, orderId, `Confirmation "${flag}" ${value ? "cochée" : "décochée"}`);
  persist();
  emit();
}

export function setPaymentStatus(orderId: string, status: PaymentStatus, method: PaymentMethod | null, actor: string): void {
  const updated = replaceOrder(orderId, (order) => ({
    ...order,
    payment: { status, method },
    updatedAt: new Date().toISOString(),
  }));
  if (!updated) return;
  logAudit(actor, orderId, `Paiement mis à jour : ${status}`);
  persist();
  emit();
}

export function addInternalNote(orderId: string, text: string, actor: string): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  const orderMeta = getMetaFor(orderId);
  const note: InternalNote = { id: uid("note"), text: trimmed, at: new Date().toISOString(), by: actor };
  meta = { ...meta, [orderId]: { ...orderMeta, notes: [...orderMeta.notes, note] } };
  logAudit(actor, orderId, "Note interne ajoutée");
  persist();
  emit();
}

export function markOrderAbandoned(orderId: string, actor: string): void {
  const orderMeta = getMetaFor(orderId);
  meta = { ...meta, [orderId]: { ...orderMeta, manuallyAbandoned: true } };
  logAudit(actor, orderId, "Commande marquée comme abandonnée");
  persist();
  emit();
}

export function restoreAbandonedOrder(orderId: string, actor: string): void {
  const orderMeta = getMetaFor(orderId);
  meta = { ...meta, [orderId]: { ...orderMeta, manuallyAbandoned: false } };
  logAudit(actor, orderId, "Commande restaurée");
  persist();
  emit();
}

export function sendReminder(orderId: string, kind: ReminderKind, actor: string): void {
  const orderMeta = getMetaFor(orderId);
  const reminder = { id: uid("rem"), kind, at: new Date().toISOString(), by: actor };
  meta = { ...meta, [orderId]: { ...orderMeta, reminders: [...orderMeta.reminders, reminder] } };
  logAudit(actor, orderId, `Rappel simulé envoyé : ${kind}`);
  persist();
  emit();
}

export function useAuditLog(): AuditLogEntry[] {
  return useSyncExternalStore(
    subscribeStaffOrders,
    () => auditLog,
    () => auditLog
  );
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
