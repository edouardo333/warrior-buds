// Bud Guardian V3.0 — Risk Engine. The security "brain" of Bud Guardian:
// pure, explainable analysis of every order (plus its payment history) into
// a RiskAssessment, mirroring order-engine.ts/payment-engine.ts's shape —
// locale-driven labels, synchronous functions, mutations that go through a
// single shared store (data/bud-guardian/risk.ts) so /staff/security is
// always the one source of truth. Reads from the existing order and payment
// stores (data/bud-guardian/orders-store.ts, data/bud-guardian/payments.ts)
// — never writes to either, and never invents an order or payment status of
// its own.
//
// Every factor below is a plain, explainable rule (age/identity flags on
// file, amount/quantity thresholds, duplicate contact info, repeated
// attempts) — no ML model, no external fraud/AI service, no real identity
// check. Analysis re-runs automatically whenever an order or a payment
// changes, so a status edit in /staff/orders or /staff/payments is reflected
// here without staff having to trigger anything manually.

import type { Locale } from "@/lib/i18n/types";
import type { Order } from "@/types/order";
import type { PaymentRecord } from "@/types/payment";
import type {
  RiskActionKind,
  RiskAssessment,
  RiskFactor,
  RiskFactorId,
  RiskHistoryEntry,
  RiskLevel,
  RiskValidationStatus,
} from "@/types/risk";
import { getOrders, subscribeOrders } from "@/data/bud-guardian/orders-store";
import { findPaymentsByOrderId, subscribePayments } from "@/data/bud-guardian/payments";
import {
  findRiskAssessmentByOrderId,
  getRiskAssessments,
  replaceRiskAssessment,
  setRiskAssessments,
  upsertRiskAssessment,
} from "@/data/bud-guardian/risk";
import { getOrderTotal } from "./order-engine";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Thresholds — deliberately simple, explainable rules; no ML, no external
// scoring service.
// ---------------------------------------------------------------------------

const REPEATED_ORDERS_WINDOW_MS = 24 * 60 * 60 * 1000;
const REPEATED_ORDERS_THRESHOLD = 3;
const UNUSUAL_AMOUNT_MULTIPLIER = 2.5;
const LARGE_QUANTITY_THRESHOLD = 15;
const DECLINED_OR_EXPIRED_FRAUD_THRESHOLD = 2;

const FACTOR_WEIGHT: Record<RiskFactorId, number> = {
  "age-unverified": 15,
  "identity-unverified": 10,
  "suspicious-order": 15,
  "unusual-amount": 15,
  "repeated-orders": 15,
  "duplicate-phone": 15,
  "duplicate-email": 15,
  "potential-fraud": 25,
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizedPhone(phone: string): string {
  const digits = digitsOnly(phone);
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

function normalizedEmail(email: string): string {
  return email.trim().toLowerCase();
}

function averageOrderTotal(orders: Order[]): number {
  if (orders.length === 0) return 0;
  return orders.reduce((sum, order) => sum + getOrderTotal(order), 0) / orders.length;
}

// ---------------------------------------------------------------------------
// Individual factor detectors — each returns a RiskFactor or null.
// ---------------------------------------------------------------------------

function detectAgeUnverified(order: Order): RiskFactor | null {
  if (order.confirmation.ageConfirmed) return null;
  return { id: "age-unverified", severity: "high" };
}

function detectIdentityUnverified(order: Order): RiskFactor | null {
  if (order.confirmation.nameConfirmed && order.confirmation.phoneConfirmed) return null;
  return { id: "identity-unverified", severity: "medium" };
}

function detectSuspiciousOrder(order: Order): RiskFactor | null {
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  if (totalQuantity < LARGE_QUANTITY_THRESHOLD) return null;
  return { id: "suspicious-order", severity: "medium", value: totalQuantity };
}

function detectUnusualAmount(order: Order, allOrders: Order[]): RiskFactor | null {
  const avg = averageOrderTotal(allOrders);
  if (avg <= 0) return null;
  const total = getOrderTotal(order);
  if (total < avg * UNUSUAL_AMOUNT_MULTIPLIER) return null;
  return { id: "unusual-amount", severity: "medium", value: total / avg };
}

function detectRepeatedOrders(order: Order, allOrders: Order[]): RiskFactor | null {
  const phone = normalizedPhone(order.phone);
  const email = normalizedEmail(order.email);
  const createdAt = new Date(order.createdAt).getTime();

  const nearby = allOrders.filter((other) => {
    if (other.id === order.id) return false;
    const sameCustomer = normalizedPhone(other.phone) === phone || normalizedEmail(other.email) === email;
    if (!sameCustomer) return false;
    return Math.abs(new Date(other.createdAt).getTime() - createdAt) <= REPEATED_ORDERS_WINDOW_MS;
  });

  if (nearby.length + 1 < REPEATED_ORDERS_THRESHOLD) return null;
  return { id: "repeated-orders", severity: "medium", value: nearby.length + 1 };
}

function detectDuplicatePhone(order: Order, allOrders: Order[]): RiskFactor | null {
  const phone = normalizedPhone(order.phone);
  const otherNames = new Set(
    allOrders
      .filter((other) => other.id !== order.id && normalizedPhone(other.phone) === phone && other.customerName !== order.customerName)
      .map((other) => other.customerName)
  );
  if (otherNames.size === 0) return null;
  return { id: "duplicate-phone", severity: "high", value: otherNames.size + 1 };
}

function detectDuplicateEmail(order: Order, allOrders: Order[]): RiskFactor | null {
  const email = normalizedEmail(order.email);
  const otherNames = new Set(
    allOrders
      .filter((other) => other.id !== order.id && normalizedEmail(other.email) === email && other.customerName !== order.customerName)
      .map((other) => other.customerName)
  );
  if (otherNames.size === 0) return null;
  return { id: "duplicate-email", severity: "high", value: otherNames.size + 1 };
}

function detectPotentialFraud(payments: PaymentRecord[]): RiskFactor | null {
  const declinedOrExpired = payments.filter((payment) => payment.status === "declined" || payment.status === "expired").length;
  if (declinedOrExpired < DECLINED_OR_EXPIRED_FRAUD_THRESHOLD) return null;
  return { id: "potential-fraud", severity: "critical", value: declinedOrExpired };
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function levelForScore(score: number): RiskLevel {
  if (score >= 80) return "low";
  if (score >= 60) return "medium";
  if (score >= 35) return "high";
  return "critical";
}

export type RiskAnalysis = {
  confidenceScore: number;
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  ageVerified: boolean;
  identityVerified: boolean;
};

export function analyzeOrder(order: Order, options: { allOrders?: Order[]; payments?: PaymentRecord[] } = {}): RiskAnalysis {
  const allOrders = options.allOrders ?? getOrders();
  const payments = options.payments ?? findPaymentsByOrderId(order.id);

  const factors = [
    detectAgeUnverified(order),
    detectIdentityUnverified(order),
    detectSuspiciousOrder(order),
    detectUnusualAmount(order, allOrders),
    detectRepeatedOrders(order, allOrders),
    detectDuplicatePhone(order, allOrders),
    detectDuplicateEmail(order, allOrders),
    detectPotentialFraud(payments),
  ].filter((factor): factor is RiskFactor => factor !== null);

  const deduction = factors.reduce((sum, factor) => sum + FACTOR_WEIGHT[factor.id], 0);
  const confidenceScore = Math.max(0, Math.min(100, 100 - deduction));

  return {
    confidenceScore,
    riskLevel: levelForScore(confidenceScore),
    factors,
    ageVerified: order.confirmation.ageConfirmed,
    identityVerified: order.confirmation.nameConfirmed && order.confirmation.phoneConfirmed,
  };
}

// ---------------------------------------------------------------------------
// Store orchestration — builds/persists RiskAssessment records from
// analyzeOrder(), the single path both the automatic re-scan below and any
// manual re-analysis go through.
// ---------------------------------------------------------------------------

function buildAssessment(order: Order, previous: RiskAssessment | undefined, actor: string): RiskAssessment {
  const analysis = analyzeOrder(order);
  const payments = findPaymentsByOrderId(order.id);
  const now = new Date().toISOString();
  const changed = !previous || previous.confidenceScore !== analysis.confidenceScore || previous.riskLevel !== analysis.riskLevel;

  const history = previous ? [...previous.history] : [];
  if (changed) {
    const entry: RiskHistoryEntry = { id: uid("rh"), action: "analyzed", at: now, by: actor };
    history.push(entry);
  }

  return {
    id: previous?.id ?? `RISK-${order.id.replace(/^WB-/, "")}`,
    orderId: order.id,
    paymentId: payments.length ? payments[payments.length - 1].id : null,
    confidenceScore: analysis.confidenceScore,
    riskLevel: analysis.riskLevel,
    factors: analysis.factors,
    ageVerified: analysis.ageVerified,
    identityVerified: analysis.identityVerified,
    validation: previous?.validation ?? "pending",
    createdAt: previous?.createdAt ?? now,
    updatedAt: changed ? now : (previous?.updatedAt ?? now),
    history,
  };
}

export function runRiskAnalysis(order: Order, actor = "Bud Guardian"): RiskAssessment {
  const previous = findRiskAssessmentByOrderId(order.id);
  const assessment = buildAssessment(order, previous, actor);
  upsertRiskAssessment(assessment);
  return assessment;
}

// Every order gets analyzed automatically — on first load, and again
// whenever the shared order or payment stores change — so a status edit in
// /staff/orders or a simulated payment in /staff/payments is reflected here
// without any manual trigger.
export function analyzeAllOrders(actor = "Bud Guardian"): RiskAssessment[] {
  const previousById = new Map(getRiskAssessments().map((assessment) => [assessment.orderId, assessment]));
  const next = getOrders().map((order) => buildAssessment(order, previousById.get(order.id), actor));
  setRiskAssessments(next);
  return next;
}

if (typeof window !== "undefined") {
  analyzeAllOrders();
  subscribeOrders(() => analyzeAllOrders());
  subscribePayments(() => analyzeAllOrders());
}

// ---------------------------------------------------------------------------
// Manual validation — staff approve/reject a flagged assessment. The single
// mutation path /staff/security's UI goes through.
// ---------------------------------------------------------------------------

function setValidation(id: string, status: RiskValidationStatus, actor: string, note?: string): RiskAssessment | undefined {
  return replaceRiskAssessment(id, (assessment) => {
    const at = new Date().toISOString();
    const action: RiskActionKind = status === "approved" ? "approved" : "rejected";
    const entry: RiskHistoryEntry = { id: uid("rh"), action, at, by: actor, note };
    return { ...assessment, validation: status, updatedAt: at, history: [...assessment.history, entry] };
  });
}

export function approveRiskAssessment(id: string, actor: string, note?: string): RiskAssessment | undefined {
  return setValidation(id, "approved", actor, note);
}

export function rejectRiskAssessment(id: string, actor: string, note?: string): RiskAssessment | undefined {
  return setValidation(id, "rejected", actor, note);
}

// ---------------------------------------------------------------------------
// Labels — locale-driven, mirrors getStatusLabel/getPaymentStatusLabel.
// ---------------------------------------------------------------------------

const RISK_LEVEL_LABELS: Record<RiskLevel, Record<Locale, string>> = {
  low: { fr: "Faible", en: "Low" },
  medium: { fr: "Moyen", en: "Medium" },
  high: { fr: "Élevé", en: "High" },
  critical: { fr: "Critique", en: "Critical" },
};

export function getRiskLevelLabel(level: RiskLevel, locale: Locale): string {
  return RISK_LEVEL_LABELS[level][locale];
}

const RISK_FACTOR_LABELS: Record<RiskFactorId, Record<Locale, string>> = {
  "age-unverified": { fr: "Vérification 18+ manquante", en: "Missing 18+ verification" },
  "identity-unverified": { fr: "Identité non vérifiée", en: "Identity not verified" },
  "suspicious-order": { fr: "Commande suspecte", en: "Suspicious order" },
  "unusual-amount": { fr: "Montant inhabituel", en: "Unusual amount" },
  "repeated-orders": { fr: "Commandes répétées", en: "Repeated orders" },
  "duplicate-phone": { fr: "Téléphone réutilisé", en: "Duplicate phone" },
  "duplicate-email": { fr: "Courriel réutilisé", en: "Duplicate email" },
  "potential-fraud": { fr: "Fraude potentielle", en: "Potential fraud" },
};

export function getRiskFactorLabel(id: RiskFactorId, locale: Locale): string {
  return RISK_FACTOR_LABELS[id][locale];
}

// Exposes the same weight the scoring pass above already deducts per factor
// — read-only, so the UI can render "100 - 15 - 10 = 75" without duplicating
// or drifting from FACTOR_WEIGHT.
export function getRiskFactorImpact(id: RiskFactorId): number {
  return FACTOR_WEIGHT[id];
}

const RISK_FACTOR_STATE_LABELS: Record<RiskFactorId, Record<Locale, string>> = {
  "age-unverified": { fr: "Non vérifié", en: "Not verified" },
  "identity-unverified": { fr: "Non vérifiée", en: "Not verified" },
  "suspicious-order": { fr: "Quantité élevée", en: "High quantity" },
  "unusual-amount": { fr: "Montant élevé", en: "High amount" },
  "repeated-orders": { fr: "Fréquence élevée", en: "High frequency" },
  "duplicate-phone": { fr: "Téléphone dupliqué", en: "Duplicate phone" },
  "duplicate-email": { fr: "Courriel dupliqué", en: "Duplicate email" },
  "potential-fraud": { fr: "Paiements refusés", en: "Payments declined" },
};

export function getRiskFactorStateLabel(id: RiskFactorId, locale: Locale): string {
  return RISK_FACTOR_STATE_LABELS[id][locale];
}

const RISK_FACTOR_DETAIL: Record<RiskFactorId, (value: number | undefined, locale: Locale) => string> = {
  "age-unverified": (_value, locale) =>
    locale === "fr" ? "Le client n'a pas confirmé avoir 18 ans ou plus." : "The customer has not confirmed being 18 or older.",
  "identity-unverified": (_value, locale) =>
    locale === "fr" ? "Le nom ou le téléphone n'a pas été confirmé par le client." : "Name or phone has not been confirmed by the customer.",
  "suspicious-order": (value, locale) =>
    locale === "fr" ? `Quantité inhabituellement élevée (${value ?? 0} unités).` : `Unusually large quantity (${value ?? 0} units).`,
  "unusual-amount": (value, locale) =>
    locale === "fr"
      ? `Montant de la commande ${(value ?? 0).toFixed(1)}x la moyenne du magasin.`
      : `Order total is ${(value ?? 0).toFixed(1)}x the store average.`,
  "repeated-orders": (value, locale) =>
    locale === "fr" ? `${value ?? 0} commandes du même contact en moins de 24 h.` : `${value ?? 0} orders from the same contact within 24h.`,
  "duplicate-phone": (value, locale) =>
    locale === "fr" ? `Numéro de téléphone réutilisé sur ${value ?? 0} noms différents.` : `Phone number reused across ${value ?? 0} different names.`,
  "duplicate-email": (value, locale) =>
    locale === "fr" ? `Courriel réutilisé sur ${value ?? 0} noms différents.` : `Email reused across ${value ?? 0} different names.`,
  "potential-fraud": (value, locale) =>
    locale === "fr"
      ? `${value ?? 0} tentatives de paiement refusées ou expirées sur cette commande.`
      : `${value ?? 0} declined or expired payment attempts on this order.`,
};

export function getRiskFactorDetail(factor: RiskFactor, locale: Locale): string {
  return RISK_FACTOR_DETAIL[factor.id](factor.value, locale);
}

const RISK_VALIDATION_LABELS: Record<RiskValidationStatus, Record<Locale, string>> = {
  pending: { fr: "En attente de validation", en: "Pending validation" },
  approved: { fr: "Approuvée", en: "Approved" },
  rejected: { fr: "Rejetée", en: "Rejected" },
};

export function getRiskValidationLabel(status: RiskValidationStatus, locale: Locale): string {
  return RISK_VALIDATION_LABELS[status][locale];
}

const RISK_ACTION_LABELS: Record<RiskActionKind, Record<Locale, string>> = {
  analyzed: { fr: "Analyse automatique", en: "Automatic analysis" },
  approved: { fr: "Approuvée par le personnel", en: "Approved by staff" },
  rejected: { fr: "Rejetée par le personnel", en: "Rejected by staff" },
};

export function getRiskActionLabel(action: RiskActionKind, locale: Locale): string {
  return RISK_ACTION_LABELS[action][locale];
}
