// Bud Guardian V3.0 — Risk Engine types. Models a standalone, explainable
// fraud-signal ledger (RiskAssessment) tied to an Order via orderId, and —
// when a payment exists — to a PaymentRecord via paymentId. Kept separate
// from both types/order.ts and types/payment.ts so neither of those
// V2/V2.1/V2.2 shapes is ever touched; every assessment is derived read-only
// from the existing order/payment stores. Purely local and simulated: no
// backend, no external fraud/AI service, no real identity check.

export type RiskLevel = "low" | "medium" | "high" | "critical";

// Each factor is a plain, explainable signal — no black-box scoring. `value`
// carries the metric behind it (a quantity, a multiplier, a count…) so the
// UI can render a locale-aware detail string via risk-engine.ts's
// getRiskFactorDetail(), instead of baking English-only text into stored
// data — every other surface in this app is bilingual, and persisted risk
// data should be too.
export type RiskFactorId =
  | "age-unverified"
  | "identity-unverified"
  | "suspicious-order"
  | "unusual-amount"
  | "repeated-orders"
  | "duplicate-phone"
  | "duplicate-email"
  | "potential-fraud";

export type RiskFactor = {
  id: RiskFactorId;
  severity: RiskLevel;
  value?: number;
};

export type RiskValidationStatus = "pending" | "approved" | "rejected";

export type RiskActionKind = "analyzed" | "approved" | "rejected";

export type RiskHistoryEntry = {
  id: string;
  action: RiskActionKind;
  at: string;
  by: string;
  note?: string;
};

export type RiskAssessment = {
  id: string; // e.g. "RISK-10234"
  orderId: string;
  paymentId: string | null;
  confidenceScore: number; // 0-100, higher = more trustworthy
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  ageVerified: boolean;
  identityVerified: boolean;
  validation: RiskValidationStatus;
  createdAt: string;
  updatedAt: string;
  history: RiskHistoryEntry[];
};
