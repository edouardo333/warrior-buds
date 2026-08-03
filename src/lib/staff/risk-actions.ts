"use client";

// Bud Guardian V3.0 — staff-side read access for /staff/security. Mirrors
// payment-actions.ts's shape: a cached snapshot merging the risk ledger
// (data/bud-guardian/risk.ts) with each assessment's order and latest
// payment for display, refreshed whenever any of the three shared stores
// change.
//
// Manual validation (approve/reject) lives in risk-engine.ts so every
// mutation goes through the one path — this file only adds the React
// subscription layer on top.

import { useSyncExternalStore } from "react";
import type { Order } from "@/types/order";
import type { PaymentRecord, PaymentTransactionStatus } from "@/types/payment";
import type { RiskAssessment } from "@/types/risk";
import { getRiskAssessments, subscribeRiskAssessments } from "@/data/bud-guardian/risk";
import { findOrderById, subscribeOrders } from "@/data/bud-guardian/orders-store";
import { findLatestPaymentByOrderId, subscribePayments } from "@/data/bud-guardian/payments";
import { getEffectivePaymentStatus } from "@/lib/bud-guardian/payment-engine";

export type StaffRiskView = RiskAssessment & {
  order: Order | null;
  payment: (PaymentRecord & { effectiveStatus: PaymentTransactionStatus }) | null;
};

const listeners = new Set<() => void>();
let snapshotCache: StaffRiskView[] | null = null;

function computeSnapshot(): StaffRiskView[] {
  return getRiskAssessments().map((assessment) => {
    const order = findOrderById(assessment.orderId) ?? null;
    const payment = findLatestPaymentByOrderId(assessment.orderId);
    return {
      ...assessment,
      order,
      payment: payment ? { ...payment, effectiveStatus: getEffectivePaymentStatus(payment) } : null,
    };
  });
}

function getSnapshot(): StaffRiskView[] {
  if (!snapshotCache) snapshotCache = computeSnapshot();
  return snapshotCache;
}

function emit(): void {
  snapshotCache = null;
  for (const listener of listeners) listener();
}

// Risk assessments, orders, and payments can each change independently —
// any one of them should refresh this view.
subscribeRiskAssessments(emit);
subscribeOrders(emit);
subscribePayments(emit);

function subscribeStaffRisk(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStaffRiskAssessments(): StaffRiskView[] {
  return useSyncExternalStore(subscribeStaffRisk, getSnapshot, getSnapshot);
}

export function useStaffRiskAssessment(id: string | null): StaffRiskView | null {
  const assessments = useStaffRiskAssessments();
  if (!id) return null;
  return assessments.find((assessment) => assessment.id === id) ?? null;
}
