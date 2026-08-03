// Bud Guardian V4.0 — CRM types. A "customer" has no id anywhere else in the
// app: Order (types/order.ts) only ever carries customerName/phone/email per
// record, never a foreign key. CustomerProfile is therefore always a
// *derived* aggregate — built by lib/bud-guardian/customer-engine.ts by
// clustering the existing order book, never a record of its own — kept
// separate from Order/PaymentRecord/RiskAssessment so none of those
// V2/V2.2/V3.0 shapes are ever touched.

import type { PaymentTransactionStatus } from "./payment";
import type { RiskLevel } from "./risk";

export type CustomerStatus = "new" | "regular" | "vip";

export type CustomerSegment = "new" | "active" | "vip" | "at-risk";

export type FavoriteProduct = {
  name: string;
  quantity: number;
  orders: number;
};

export type CustomerProfile = {
  id: string; // synthetic, derived — e.g. "CUST-10234"
  name: string;
  phone: string;
  email: string;
  status: CustomerStatus;
  segment: CustomerSegment;
  orderIds: string[];
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  purchaseFrequencyDays: number | null; // avg days between orders, null if only one order
  firstOrderAt: string;
  lastOrderAt: string;
  favoriteProducts: FavoriteProduct[];
  latestRiskLevel: RiskLevel | null;
  latestRiskScore: number | null;
  latestPaymentStatus: PaymentTransactionStatus | null;
};

export type CustomerFollowUpStatus = "pending" | "done" | "dismissed";

export type CustomerFollowUp = {
  id: string;
  note: string;
  dueAt: string;
  status: CustomerFollowUpStatus;
  createdAt: string;
  createdBy: string;
};

export type CustomerNote = {
  id: string;
  text: string;
  at: string;
  by: string;
};

// Staff-only overlay data — never derived, always explicit. Kept out of
// data/bud-guardian so it can never leak into anything a customer could see.
export type CustomerMeta = {
  notes: CustomerNote[];
  followUps: CustomerFollowUp[];
};
