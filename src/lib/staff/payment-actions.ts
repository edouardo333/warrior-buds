"use client";

// Bud Guardian V2.2 — staff-side read access for /staff/payments. Mirrors
// order-actions.ts's shape: a cached snapshot merging the shared payment
// ledger (data/bud-guardian/payments.ts) with each payment's order
// (orders-store.ts) for display, refreshed whenever either store changes.
//
// Status mutations (confirm/decline) live in payment-engine.ts so the
// chatbot's "simulate payment" demo and this staff dashboard go through one
// mutation path — this file only adds the React subscription layer on top.

import { useSyncExternalStore } from "react";
import type { Order } from "@/types/order";
import type { PaymentRecord, PaymentTransactionStatus } from "@/types/payment";
import { getPayments, subscribePayments } from "@/data/bud-guardian/payments";
import { findOrderById, subscribeOrders } from "@/data/bud-guardian/orders-store";
import { getEffectivePaymentStatus } from "@/lib/bud-guardian/payment-engine";

export type StaffPaymentView = PaymentRecord & {
  order: Order | null;
  effectiveStatus: PaymentTransactionStatus;
};

const listeners = new Set<() => void>();
let snapshotCache: StaffPaymentView[] | null = null;

function computeSnapshot(): StaffPaymentView[] {
  return getPayments().map((payment) => ({
    ...payment,
    order: findOrderById(payment.orderId) ?? null,
    effectiveStatus: getEffectivePaymentStatus(payment),
  }));
}

function getSnapshot(): StaffPaymentView[] {
  if (!snapshotCache) snapshotCache = computeSnapshot();
  return snapshotCache;
}

function emit(): void {
  snapshotCache = null;
  for (const listener of listeners) listener();
}

// Payments and orders can each change independently (a staff edit to an
// order's fulfillment status, say) — either one should refresh this view.
subscribePayments(emit);
subscribeOrders(emit);

function subscribeStaffPayments(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStaffPayments(): StaffPaymentView[] {
  return useSyncExternalStore(subscribeStaffPayments, getSnapshot, getSnapshot);
}

export function useStaffPayment(paymentId: string | null): StaffPaymentView | null {
  const payments = useStaffPayments();
  if (!paymentId) return null;
  return payments.find((payment) => payment.id === paymentId) ?? null;
}
