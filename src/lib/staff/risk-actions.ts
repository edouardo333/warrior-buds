"use client";

// Bud Guardian V3.0 — staff-side read access for /staff/security. Mirrors
// payment-actions.ts's shape: a cached snapshot merging the risk ledger
// (data/bud-guardian/risk.ts) with each assessment's order and latest
// payment for display, refreshed whenever any of the three shared stores
// change.
//
// Automatic re-analysis lives in risk-engine.ts (analyzeAllOrders, wired to
// re-run on every order/payment change) and stays untouched.
//
// Bud Guardian V6 — Permissions & Operations Hardening. Manual validation
// (approve/reject) is staff-only by nature — unlike Payments, there's no
// customer-facing counterpart calling risk-engine.ts's approve/reject — but
// the gate still belongs in this action layer, not the engine, to match the
// same pattern as every other module: staffApproveRiskAssessment/
// staffRejectRiskAssessment check the caller's role (supervisor+, per the
// centralized model in permissions.ts) before calling through, and log
// every attempt to the shared audit log. RiskDetails.tsx calls these, never
// risk-engine.ts's approve/reject directly.

import { useSyncExternalStore } from "react";
import type { Order } from "@/types/order";
import type { PaymentRecord, PaymentTransactionStatus } from "@/types/payment";
import type { RiskAssessment } from "@/types/risk";
import type { StaffSession } from "./staff-auth";
import { getRiskAssessments, subscribeRiskAssessments } from "@/data/bud-guardian/risk";
import { findOrderById, subscribeOrders } from "@/data/bud-guardian/orders-store";
import { findLatestPaymentByOrderId, subscribePayments } from "@/data/bud-guardian/payments";
import { getEffectivePaymentStatus } from "@/lib/bud-guardian/payment-engine";
import { approveRiskAssessment, rejectRiskAssessment } from "@/lib/bud-guardian/risk-engine";
import { hasPermission } from "./permissions";
import { logAuditEntry } from "./audit-log";

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

// ---------------------------------------------------------------------------
// Gated staff mutations
// ---------------------------------------------------------------------------

function deny(session: StaffSession, action: string, assessmentId: string, description: string): void {
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "risk",
    action,
    entityId: assessmentId,
    description,
    outcome: "denied",
  });
}

export function staffApproveRiskAssessment(id: string, session: StaffSession, note?: string): RiskAssessment | undefined {
  if (!hasPermission(session.role, "risk.approve")) {
    deny(session, "risk.approve", id, `Approbation refusée — rôle "${session.role}" insuffisant.`);
    return undefined;
  }
  const updated = approveRiskAssessment(id, session.name, note);
  if (!updated) return undefined;
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "risk",
    action: "risk.approve",
    entityId: id,
    description: `Analyse approuvée — ${id}`,
    metadata: { orderId: updated.orderId, note },
  });
  return updated;
}

export function staffRejectRiskAssessment(id: string, session: StaffSession, note?: string): RiskAssessment | undefined {
  if (!hasPermission(session.role, "risk.reject")) {
    deny(session, "risk.reject", id, `Rejet refusé — rôle "${session.role}" insuffisant.`);
    return undefined;
  }
  const updated = rejectRiskAssessment(id, session.name, note);
  if (!updated) return undefined;
  logAuditEntry({
    actor: session.name,
    role: session.role,
    module: "risk",
    action: "risk.reject",
    entityId: id,
    description: `Analyse rejetée — ${id}`,
    metadata: { orderId: updated.orderId, note },
  });
  return updated;
}
