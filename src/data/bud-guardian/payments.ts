// Live, mutable payment ledger backing Bud Guardian's V2.2 "Paiements"
// module — both the customer-facing chatbot (lookup + simulate) and the
// /staff/payments employee dashboard (confirm/refuse) share this single
// module-level store, exactly like orders-store.ts is the shared source of
// truth for orders. A PaymentRecord always references an existing order via
// orderId; it never replaces or edits Order.payment (types/order.ts) — that
// field stays owned by V2.1's order/staff surfaces and is only ever updated
// through the existing orders-store.ts, kept in sync by payment-engine.ts.
// Still purely local and simulated: no backend, no real payment rail, no
// network call.

import type { PaymentProvider, PaymentRecord, PaymentTransactionStatus } from "@/types/payment";
import { BUD_GUARDIAN_ORDERS } from "./orders";

const STORAGE_KEY = "wb-guardian-payments-v1";

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function orderTotal(orderId: string): number {
  const order = BUD_GUARDIAN_ORDERS.find((o) => o.id === orderId);
  if (!order) return 0;
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

function seedPayment(
  id: string,
  orderId: string,
  provider: PaymentProvider,
  status: PaymentTransactionStatus,
  createdHoursAgo: number,
  expiresInHours: number | null
): PaymentRecord {
  const createdAt = hoursAgo(createdHoursAgo);
  return {
    id,
    orderId,
    provider,
    amount: orderTotal(orderId),
    status,
    createdAt,
    updatedAt: createdAt,
    expiresAt: expiresInHours === null ? null : hoursFromNow(expiresInHours),
    history: [{ id: `${id}-h1`, status, at: createdAt, by: "Bud Guardian" }],
  };
}

// Fixture — deliberately covers all five PaymentTransactionStatus values,
// plus two orders (WB-10099, WB-10198) left without a payment record so the
// engine's "no payment initiated yet" branch has something to exercise.
const PAYMENT_FIXTURES: PaymentRecord[] = [
  seedPayment("TXN-A1B2C3", "WB-10234", "interac", "received", 3, null),
  seedPayment("TXN-D4E5F6", "WB-10305", "interac", "pending", 0.75, 2),
  seedPayment("TXN-G7H8I9", "WB-10412", "interac", "pending", 1, 6),
  seedPayment("TXN-J1K2L3", "WB-10388", "in_store", "received", 1, null),
  seedPayment("TXN-M4N5O6", "WB-10501", "interac", "received", 120, null),
  seedPayment("TXN-P7Q8R9", "WB-10276", "interac", "cancelled", 72, null),
  seedPayment("TXN-S1T2U3", "WB-10455", "interac", "declined", 8, null),
  seedPayment("TXN-V4W5X6", "WB-10142", "interac", "expired", 1, -0.5),
];

function clonePayments(source: PaymentRecord[]): PaymentRecord[] {
  return source.map((payment) => ({ ...payment, history: payment.history.map((entry) => ({ ...entry })) }));
}

function loadInitial(): PaymentRecord[] {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as PaymentRecord[];
    } catch {
      // Corrupt/unavailable storage — fall back to the fixture below.
    }
  }
  return clonePayments(PAYMENT_FIXTURES);
}

let payments: PaymentRecord[] = loadInitial();
const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
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
      payments = JSON.parse(event.newValue) as PaymentRecord[];
      notify();
    } catch {
      // Ignore malformed cross-tab payloads.
    }
  });
}

export function subscribePayments(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPayments(): PaymentRecord[] {
  return payments;
}

export function findPaymentById(id: string): PaymentRecord | undefined {
  const normalized = id.trim().toUpperCase();
  return payments.find((payment) => payment.id.toUpperCase() === normalized);
}

export function findPaymentsByOrderId(orderId: string): PaymentRecord[] {
  return payments.filter((payment) => payment.orderId === orderId);
}

// Most recent payment attempt for an order — the one lookup/status questions
// should answer against when an order has more than one attempt on file.
export function findLatestPaymentByOrderId(orderId: string): PaymentRecord | undefined {
  return findPaymentsByOrderId(orderId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

export function addPayment(payment: PaymentRecord): void {
  payments = [...payments, payment];
  persist();
  notify();
}

export function replacePayment(id: string, updater: (payment: PaymentRecord) => PaymentRecord): PaymentRecord | undefined {
  let updated: PaymentRecord | undefined;
  payments = payments.map((payment) => {
    if (payment.id !== id) return payment;
    updated = updater(payment);
    return updated;
  });
  if (updated) {
    persist();
    notify();
  }
  return updated;
}
