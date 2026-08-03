// Bud Guardian V3.0 — Risk Engine. Live, mutable risk-assessment ledger
// backing the /staff/security employee dashboard, mirroring
// data/bud-guardian/payments.ts's shape: a single module-level store,
// persisted to localStorage and mirrored across tabs via the `storage`
// event. Unlike orders/payments, nothing here is ever written by a customer
// or the chatbot — every RiskAssessment is produced by
// lib/bud-guardian/risk-engine.ts's analysis functions and read only by
// staff (plus the manual approve/reject mutations below, also routed
// through risk-engine.ts). Still purely local and simulated: no backend, no
// external AI/fraud service, no network call.

import type { RiskAssessment } from "@/types/risk";

const STORAGE_KEY = "wb-guardian-risk-v1";

function loadInitial(): RiskAssessment[] {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as RiskAssessment[];
    } catch {
      // Corrupt/unavailable storage — fall back to an empty ledger; the risk
      // engine seeds it from the order book on its first analysis pass.
    }
  }
  return [];
}

let assessments: RiskAssessment[] = loadInitial();
const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));
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
      assessments = JSON.parse(event.newValue) as RiskAssessment[];
      notify();
    } catch {
      // Ignore malformed cross-tab payloads.
    }
  });
}

export function subscribeRiskAssessments(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRiskAssessments(): RiskAssessment[] {
  return assessments;
}

export function findRiskAssessmentById(id: string): RiskAssessment | undefined {
  return assessments.find((assessment) => assessment.id === id);
}

export function findRiskAssessmentByOrderId(orderId: string): RiskAssessment | undefined {
  return assessments.find((assessment) => assessment.orderId === orderId);
}

// Bulk replace — used by the engine's analyzeAllOrders() so a full re-scan
// notifies listeners once instead of once per order.
export function setRiskAssessments(next: RiskAssessment[]): void {
  assessments = next;
  persist();
  notify();
}

export function upsertRiskAssessment(assessment: RiskAssessment): void {
  const exists = assessments.some((a) => a.id === assessment.id);
  assessments = exists ? assessments.map((a) => (a.id === assessment.id ? assessment : a)) : [...assessments, assessment];
  persist();
  notify();
}

export function replaceRiskAssessment(id: string, updater: (assessment: RiskAssessment) => RiskAssessment): RiskAssessment | undefined {
  let updated: RiskAssessment | undefined;
  assessments = assessments.map((assessment) => {
    if (assessment.id !== id) return assessment;
    updated = updater(assessment);
    return updated;
  });
  if (updated) {
    persist();
    notify();
  }
  return updated;
}
