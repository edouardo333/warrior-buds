"use client";

// Bud Guardian V2.2 — staff-side read access for /staff/payments. Mirrors
// order-actions.ts's shape: a cached snapshot merging the shared payment
// ledger (data/bud-guardian/payments.ts) with each payment's order
// (orders-store.ts) for display, refreshed whenever either store changes.
//
// Status mutations (confirm/decline/cancel) live in payment-engine.ts so the
// chatbot's "simulate payment" demo and this staff dashboard go through one
// underlying mutation path. That module stays deliberately role-agnostic —
// it's also how a customer confirms/declines their own simulated demo
// payment from the chatbot, which has no staff session to check.
//
// Bud Guardian V6 — Permissions & Operations Hardening. The staff-only gate
// belongs here, one layer up: staffConfirmPayment/staffDeclinePayment/
// staffCancelPayment check the caller's role against the centralized model
// (permissions.ts) before calling through to payment-engine.ts, and log
// every attempt — allowed or denied — to the shared audit log. The staff UI
// (PaymentDetails.tsx) calls these, never payment-engine.ts's functions
// directly.

import { useSyncExternalStore } from "react";
import type { Order } from "@/types/order";
import type { PaymentRecord, PaymentTransactionStatus } from "@/types/payment";
import type { StaffSession } from "./staff-auth";
import { getPayments, subscribePayments } from "@/data/bud-guardian/payments";
import { findOrderById, subscribeOrders } from "@/data/bud-guardian/orders-store";
import { cancelPayment, confirmPayment, declinePayment, getEffectivePaymentStatus } from "@/lib/bud-guardian/payment-engine";
import { hasPermission } from "./permissions";
import { logAuditEntry } from "./audit-log";

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

// ---------------------------------------------------------------------------
// Gated staff mutations
// ---------------------------------------------------------------------------

function deny(session: StaffSession, action: string, paymentId: string, description: string): void {
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "payments",
    action,
    entityId: paymentId,
    description,
    outcome: "denied",
  });
}

export function staffConfirmPayment(paymentId: string, session: StaffSession): PaymentRecord | undefined {
  if (!hasPermission(session.role, "payment.confirm")) {
    deny(session, "payment.confirm", paymentId, `Confirmation refusée — rôle "${session.role}" insuffisant.`);
    return undefined;
  }
  const updated = confirmPayment(paymentId, session.name);
  if (!updated) return undefined;
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "payments",
    action: "payment.confirm",
    entityId: paymentId,
    description: `Paiement confirmé — ${paymentId}`,
    metadata: { orderId: updated.orderId },
  });
  return updated;
}

export function staffDeclinePayment(paymentId: string, session: StaffSession, reason?: string): PaymentRecord | undefined {
  if (!hasPermission(session.role, "payment.decline")) {
    deny(session, "payment.decline", paymentId, `Refus de paiement refusé — rôle "${session.role}" insuffisant.`);
    return undefined;
  }
  const updated = declinePayment(paymentId, session.name, reason);
  if (!updated) return undefined;
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "payments",
    action: "payment.decline",
    entityId: paymentId,
    description: `Paiement refusé — ${paymentId}`,
    metadata: { orderId: updated.orderId, reason },
  });
  return updated;
}

// No button in the current UI triggers this yet (see V6 audit — cancelPayment
// exists in payment-engine.ts but nothing staff-facing calls it). Gated and
// wired up now anyway so it's ready and consistent with confirm/decline
// rather than left as another unenforced permission.
export function staffCancelPayment(paymentId: string, session: StaffSession): PaymentRecord | undefined {
  if (!hasPermission(session.role, "payment.cancel")) {
    deny(session, "payment.cancel", paymentId, `Annulation de paiement refusée — rôle "${session.role}" insuffisant.`);
    return undefined;
  }
  const updated = cancelPayment(paymentId, session.name);
  if (!updated) return undefined;
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "payments",
    action: "payment.cancel",
    entityId: paymentId,
    description: `Paiement annulé — ${paymentId}`,
    metadata: { orderId: updated.orderId },
  });
  return updated;
}
