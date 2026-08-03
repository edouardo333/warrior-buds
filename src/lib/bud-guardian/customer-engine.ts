// Bud Guardian V4.0 — CRM engine. Pure, explainable customer intelligence
// built on top of the existing order/payment/risk stores — mirrors
// risk-engine.ts's shape (locale-driven labels, synchronous derivation) but,
// unlike orders/payments/risk, a "customer" has no id of its own anywhere in
// the app. This module never adds a customerId field to Order — it clusters
// the existing order book by shared phone/email (the same signal
// risk-engine.ts's detectDuplicatePhone/Email already treat as "same
// customer") into a synthetic, stable CustomerProfile, recomputed fresh from
// the live stores on every read. No backend, no external CRM, no network
// call — purely local/simulated, like every other Bud Guardian module.

import type { Locale } from "@/lib/i18n/types";
import type { Order } from "@/types/order";
import type { CustomerProfile, CustomerSegment, CustomerStatus, FavoriteProduct } from "@/types/customer";
import { getOrders } from "@/data/bud-guardian/orders-store";
import { findLatestPaymentByOrderId } from "@/data/bud-guardian/payments";
import { findRiskAssessmentByOrderId } from "@/data/bud-guardian/risk";
import { getEffectivePaymentStatus } from "./payment-engine";
import { getOrderTotal, normalizeEmail, normalizePhone } from "./order-engine";

// ---------------------------------------------------------------------------
// Clustering — groups orders that share a normalized phone or email into one
// customer, transitively (order A+B share a phone, B+C share an email -> A,
// B and C are the same customer). A small union-find, not a black box: the
// only signal is "same phone" or "same email", the exact same normalization
// risk-engine.ts already uses for its duplicate-contact factors.
// ---------------------------------------------------------------------------

function clusterOrdersByCustomer(orders: Order[]): Order[][] {
  const parent = orders.map((_, i) => i);

  function find(i: number): number {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  }

  function union(a: number, b: number): void {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootA] = rootB;
  }

  const byPhone = new Map<string, number[]>();
  const byEmail = new Map<string, number[]>();
  orders.forEach((order, index) => {
    const phone = normalizePhone(order.phone);
    const email = normalizeEmail(order.email);
    if (!byPhone.has(phone)) byPhone.set(phone, []);
    byPhone.get(phone)!.push(index);
    if (!byEmail.has(email)) byEmail.set(email, []);
    byEmail.get(email)!.push(index);
  });

  for (const indices of byPhone.values()) for (let k = 1; k < indices.length; k++) union(indices[0], indices[k]);
  for (const indices of byEmail.values()) for (let k = 1; k < indices.length; k++) union(indices[0], indices[k]);

  const clusters = new Map<number, number[]>();
  orders.forEach((_, index) => {
    const root = find(index);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root)!.push(index);
  });

  return [...clusters.values()].map((indices) => indices.map((i) => orders[i]));
}

// ---------------------------------------------------------------------------
// Aggregation — deliberately simple, explainable thresholds; no ML, no
// external scoring service, mirroring risk-engine.ts's approach.
// ---------------------------------------------------------------------------

const VIP_SPEND_THRESHOLD = 400;
const VIP_ORDER_THRESHOLD = 6;
const AT_RISK_DAYS = 45;
const DAY_MS = 24 * 60 * 60 * 1000;

function computeStatus(orderCount: number, totalSpent: number): CustomerStatus {
  if (orderCount <= 1) return "new";
  if (totalSpent >= VIP_SPEND_THRESHOLD || orderCount >= VIP_ORDER_THRESHOLD) return "vip";
  return "regular";
}

// Segmentation reflects recency/engagement (a marketing lens), distinct from
// `status`'s lifecycle lens — "at-risk" here means churn risk (no recent
// order), not fraud risk. Fraud/identity risk stays owned by
// risk-engine.ts's RiskLevel and is only ever surfaced, never mixed in here.
function computeSegment(status: CustomerStatus, lastOrderAt: string): CustomerSegment {
  if (status === "vip") return "vip";
  const daysSinceLastOrder = (Date.now() - new Date(lastOrderAt).getTime()) / DAY_MS;
  if (daysSinceLastOrder >= AT_RISK_DAYS) return "at-risk";
  if (status === "new") return "new";
  return "active";
}

function computeFavoriteProducts(orders: Order[]): FavoriteProduct[] {
  const byName = new Map<string, { quantity: number; orderIds: Set<string> }>();
  for (const order of orders) {
    for (const item of order.items) {
      const entry = byName.get(item.name) ?? { quantity: 0, orderIds: new Set<string>() };
      entry.quantity += item.quantity;
      entry.orderIds.add(order.id);
      byName.set(item.name, entry);
    }
  }
  return [...byName.entries()]
    .map(([name, entry]) => ({ name, quantity: entry.quantity, orders: entry.orderIds.size }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);
}

// Average days between consecutive orders — null when there's only one order
// to compare against, so the UI can show "not enough history yet" instead of
// a misleading 0.
function computePurchaseFrequencyDays(sortedOrders: Order[]): number | null {
  if (sortedOrders.length < 2) return null;
  const first = new Date(sortedOrders[0].createdAt).getTime();
  const last = new Date(sortedOrders[sortedOrders.length - 1].createdAt).getTime();
  return (last - first) / DAY_MS / (sortedOrders.length - 1);
}

function buildCustomerProfile(clusterOrders: Order[]): CustomerProfile {
  const sorted = [...clusterOrders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const earliest = sorted[0];
  const latest = sorted[sorted.length - 1];

  const orderCount = sorted.length;
  const totalSpent = sorted.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const status = computeStatus(orderCount, totalSpent);
  const lastOrderAt = latest.createdAt;

  // Most recent order's payment/risk are what should read as "latest" on a
  // profile — mirrors how risk-actions.ts joins in a single latest payment.
  const latestPayment = findLatestPaymentByOrderId(latest.id);
  const latestRisk = findRiskAssessmentByOrderId(latest.id);

  return {
    id: `CUST-${earliest.id.replace(/^WB-/, "")}`,
    name: latest.customerName,
    phone: latest.phone,
    email: latest.email,
    status,
    segment: computeSegment(status, lastOrderAt),
    orderIds: sorted.map((order) => order.id),
    orderCount,
    totalSpent,
    averageOrderValue: totalSpent / orderCount,
    purchaseFrequencyDays: computePurchaseFrequencyDays(sorted),
    firstOrderAt: earliest.createdAt,
    lastOrderAt,
    favoriteProducts: computeFavoriteProducts(sorted),
    latestRiskLevel: latestRisk?.riskLevel ?? null,
    latestRiskScore: latestRisk?.confidenceScore ?? null,
    latestPaymentStatus: latestPayment ? getEffectivePaymentStatus(latestPayment) : null,
  };
}

export function getCustomerProfiles(): CustomerProfile[] {
  return clusterOrdersByCustomer(getOrders())
    .map(buildCustomerProfile)
    .sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime());
}

export function getCustomerProfileById(id: string): CustomerProfile | undefined {
  return getCustomerProfiles().find((customer) => customer.id === id);
}

// ---------------------------------------------------------------------------
// Labels — locale-driven, mirrors getStatusLabel/getRiskLevelLabel.
// ---------------------------------------------------------------------------

const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, Record<Locale, string>> = {
  new: { fr: "Nouveau", en: "New" },
  regular: { fr: "Régulier", en: "Regular" },
  vip: { fr: "VIP", en: "VIP" },
};

export function getCustomerStatusLabel(status: CustomerStatus, locale: Locale): string {
  return CUSTOMER_STATUS_LABELS[status][locale];
}

const CUSTOMER_SEGMENT_LABELS: Record<CustomerSegment, Record<Locale, string>> = {
  new: { fr: "Nouveau", en: "New" },
  active: { fr: "Actif", en: "Active" },
  vip: { fr: "VIP", en: "VIP" },
  "at-risk": { fr: "À risque", en: "At risk" },
};

export function getCustomerSegmentLabel(segment: CustomerSegment, locale: Locale): string {
  return CUSTOMER_SEGMENT_LABELS[segment][locale];
}
