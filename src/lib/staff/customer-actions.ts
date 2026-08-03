"use client";

// Bud Guardian V4.0 — staff-side read/write access for /staff/customers.
// Mirrors order-actions.ts's shape: customer profiles themselves are fully
// derived (customer-engine.ts) from the shared order/payment/risk stores, so
// nothing about a customer's activity is persisted here — only the
// staff-only overlay (internal notes, follow-up reminders) is, in this
// module's own localStorage-backed meta store keyed by the synthetic
// customer id. Kept out of data/bud-guardian, exactly like order-actions.ts
// keeps its meta store out of the chatbot-readable layer, so staff notes can
// never leak into anything a customer could see.

import { useSyncExternalStore } from "react";
import type { CustomerFollowUp, CustomerFollowUpStatus, CustomerMeta, CustomerNote, CustomerProfile } from "@/types/customer";
import { getCustomerProfiles } from "@/lib/bud-guardian/customer-engine";
import { subscribeOrders } from "@/data/bud-guardian/orders-store";
import { subscribePayments } from "@/data/bud-guardian/payments";
import { subscribeRiskAssessments } from "@/data/bud-guardian/risk";

const META_STORAGE_KEY = "wb-staff-customer-meta-v1";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyMeta(): CustomerMeta {
  return { notes: [], followUps: [] };
}

function loadMeta(): Record<string, CustomerMeta> {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(META_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Record<string, CustomerMeta>;
    } catch {
      // Corrupt/unavailable storage — fall back to an empty ledger below.
    }
  }
  return {};
}

let meta: Record<string, CustomerMeta> = loadMeta();
const listeners = new Set<() => void>();
let snapshotCache: StaffCustomerView[] | null = null;

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
  } catch {
    // Storage full/unavailable (private browsing) — in-memory state still works.
  }
}

function emit(): void {
  snapshotCache = null;
  for (const listener of listeners) listener();
}

// A customer profile is derived from orders/payments/risk, so any of those
// changing (a new order, a confirmed payment, a re-scored risk assessment)
// should refresh the CRM view too, without staff having to trigger anything.
subscribeOrders(() => emit());
subscribePayments(() => emit());
subscribeRiskAssessments(() => emit());

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== META_STORAGE_KEY) return;
    meta = loadMeta();
    emit();
  });
}

function getMetaFor(customerId: string): CustomerMeta {
  return meta[customerId] ?? emptyMeta();
}

export type StaffCustomerView = CustomerProfile & { meta: CustomerMeta };

function computeSnapshot(): StaffCustomerView[] {
  return getCustomerProfiles().map((customer) => ({ ...customer, meta: getMetaFor(customer.id) }));
}

function getSnapshot(): StaffCustomerView[] {
  if (!snapshotCache) snapshotCache = computeSnapshot();
  return snapshotCache;
}

function subscribeStaffCustomers(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStaffCustomers(): StaffCustomerView[] {
  return useSyncExternalStore(subscribeStaffCustomers, getSnapshot, getSnapshot);
}

export function useStaffCustomer(customerId: string | null): StaffCustomerView | null {
  const customers = useStaffCustomers();
  if (!customerId) return null;
  return customers.find((customer) => customer.id === customerId) ?? null;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function addCustomerNote(customerId: string, text: string, actor: string): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  const current = getMetaFor(customerId);
  const note: CustomerNote = { id: uid("cnote"), text: trimmed, at: new Date().toISOString(), by: actor };
  meta = { ...meta, [customerId]: { ...current, notes: [...current.notes, note] } };
  persist();
  emit();
}

export function addCustomerFollowUp(customerId: string, note: string, dueAt: string, actor: string): void {
  const trimmed = note.trim();
  if (!trimmed || !dueAt) return;
  const current = getMetaFor(customerId);
  const followUp: CustomerFollowUp = {
    id: uid("cfu"),
    note: trimmed,
    dueAt,
    status: "pending",
    createdAt: new Date().toISOString(),
    createdBy: actor,
  };
  meta = { ...meta, [customerId]: { ...current, followUps: [...current.followUps, followUp] } };
  persist();
  emit();
}

export function setCustomerFollowUpStatus(customerId: string, followUpId: string, status: CustomerFollowUpStatus): void {
  const current = getMetaFor(customerId);
  meta = {
    ...meta,
    [customerId]: {
      ...current,
      followUps: current.followUps.map((followUp) => (followUp.id === followUpId ? { ...followUp, status } : followUp)),
    },
  };
  persist();
  emit();
}
