// Bud Guardian V8 — Analytics & Business Intelligence engine. Pure,
// explainable derivation over the existing Orders/Payments/Risk/Inventory/
// CRM stores — mirrors risk-engine.ts's and customer-engine.ts's shape
// exactly: no new store, no persisted state, everything recomputed fresh
// from the live data every call. This module never invents data — every
// number here is a sum, count, average, or ratio over records that already
// exist in data/bud-guardian/**, read the same way every other staff
// dashboard reads them (getOrders()/getOrderTotal(), matchProductByItemName,
// CustomerProfile, InventoryMovement…). No AI/ML scoring, no external
// analytics service, no network call — purely local and simulated, like
// every other Bud Guardian module.
//
// Layering: this file sits next to order-engine.ts/risk-engine.ts/
// inventory-engine.ts/customer-engine.ts in lib/bud-guardian — it only
// depends on types/** and this module's own siblings, never on lib/staff/**
// (that would invert the data -> engine -> staff-action -> component
// layering every other module follows). The input arrays below are typed
// with the small extra fields the staff hooks already attach (isAbandoned,
// effectiveStatus, stockStatus) so lib/staff/analytics-actions.ts can pass
// its StaffOrderView[]/StaffPaymentView[]/StaffInventoryProductView[]
// straight through — those types are structurally compatible, no import
// needed in either direction.

import type { Locale } from "@/lib/i18n/types";
import type { Order } from "@/types/order";
import type { PaymentRecord, PaymentTransactionStatus } from "@/types/payment";
import type { RiskAssessment, RiskLevel, RiskValidationStatus } from "@/types/risk";
import type { InventoryCategory, InventoryMovement, InventoryProduct, MovementType, StockStatus } from "@/types/inventory";
import type { CustomerProfile, CustomerSegment } from "@/types/customer";
import { getOrderTotal } from "./order-engine";
import { matchProductByItemName } from "./inventory-engine";

// ---------------------------------------------------------------------------
// Input shapes — base domain types plus the handful of derived fields the
// staff action hooks already compute, so this engine never re-derives them
// (isAbandoned, effectiveStatus, stockStatus each already have exactly one
// owner elsewhere — order-actions.ts, payment-engine.ts, inventory-engine.ts).
// ---------------------------------------------------------------------------

export type AnalyticsOrderInput = Order & { isAbandoned: boolean };
export type AnalyticsPaymentInput = PaymentRecord & { effectiveStatus: PaymentTransactionStatus };
export type AnalyticsRiskInput = RiskAssessment;
export type AnalyticsProductInput = InventoryProduct & { stockStatus: StockStatus };
export type AnalyticsMovementInput = InventoryMovement;
export type AnalyticsCustomerInput = CustomerProfile;

// ---------------------------------------------------------------------------
// Date range
// ---------------------------------------------------------------------------

export type AnalyticsRangeKey = "7d" | "30d" | "90d" | "all";

export const ANALYTICS_RANGE_FLOW: AnalyticsRangeKey[] = ["7d", "30d", "90d", "all"];

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS: Record<Exclude<AnalyticsRangeKey, "all">, number> = { "7d": 7, "30d": 30, "90d": 90 };

function rangeStartMs(range: AnalyticsRangeKey): number | null {
  if (range === "all") return null;
  return Date.now() - RANGE_DAYS[range] * DAY_MS;
}

function withinRange(iso: string, startMs: number | null): boolean {
  if (startMs === null) return true;
  return new Date(iso).getTime() >= startMs;
}

// ---------------------------------------------------------------------------
// Snapshot shape
// ---------------------------------------------------------------------------

export type AnalyticsKpis = {
  revenue: number;
  orderCount: number;
  cancelledCount: number;
  avgOrderValue: number;
  paymentsReceived: number;
  paymentsPendingCount: number;
  paymentsPendingAmount: number;
  openRiskCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  inventoryValue: number;
};

export type RevenuePoint = { dateIso: string; revenue: number; orders: number };

export type RankedEntry = { key: string; label: string; quantity: number; revenue: number };

export type CategoryEntry = { key: InventoryCategory | "other"; revenue: number; quantity: number };

export type CountByKey<K extends string | number> = { key: K; count: number };

export type InventoryPerformance = {
  sellThroughRate: number; // unitsSold / (unitsSold + currentOnHand), 0..1
  unitsSoldInRange: number;
  movementsByType: CountByKey<MovementType>[];
  topMovers: { productId: string; name: string; unitsSold: number }[];
  lowStock: { id: string; name: string; quantityOnHand: number; lowStockThreshold: number }[];
  outOfStock: { id: string; name: string }[];
};

export type CustomerInsights = {
  activeCustomerCount: number;
  returningCount: number;
  newCount: number;
  returningRate: number; // 0..1, of active customers this range
  avgOrderFrequencyDays: number | null;
  avgCustomerValue: number;
  segmentBreakdown: CountByKey<CustomerSegment>[];
  topCustomers: { id: string; name: string; totalSpent: number; orderCount: number }[];
};

export type RiskPaymentAnalytics = {
  riskLevelBreakdown: CountByKey<RiskLevel>[];
  validationBreakdown: CountByKey<RiskValidationStatus>[];
  paymentStatusBreakdown: CountByKey<PaymentTransactionStatus>[];
  declineRate: number; // 0..1
  paymentsInRange: number;
};

export type AnalyticsInsightKind =
  | "out-of-stock"
  | "low-stock"
  | "pending-risk"
  | "pending-payments"
  | "abandoned-orders"
  | "returning-rate-low"
  | "category-concentration"
  | "peak-time"
  | "decline-rate-high";

export type AnalyticsInsight = {
  id: string;
  kind: AnalyticsInsightKind;
  severity: "info" | "warning" | "critical";
  href: string;
  data: Record<string, number | string>;
};

export type AnalyticsSnapshot = {
  range: AnalyticsRangeKey;
  kpis: AnalyticsKpis;
  revenueTrend: RevenuePoint[];
  topProducts: RankedEntry[];
  topCategories: CategoryEntry[];
  peakDays: CountByKey<number>[]; // Monday(0)..Sunday(6)
  peakHours: CountByKey<number>[]; // 0..23
  inventory: InventoryPerformance;
  customers: CustomerInsights;
  riskPayment: RiskPaymentAnalytics;
  insights: AnalyticsInsight[];
};

// ---------------------------------------------------------------------------
// Small local helpers
// ---------------------------------------------------------------------------

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfDayIso(iso: string): string {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// Monday-first weekday index (0=Mon..6=Sun) — JS's native getDay() is
// Sunday-first (0=Sun), remapped here so peakDays reads left-to-right
// starting the work week, matching how staff actually plan shifts.
function mondayFirstDay(iso: string): number {
  const jsDay = new Date(iso).getDay(); // 0=Sun..6=Sat
  return (jsDay + 6) % 7;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------

function computeKpis(
  ordersInRange: AnalyticsOrderInput[],
  paymentsInRange: AnalyticsPaymentInput[],
  riskInRange: AnalyticsRiskInput[],
  products: AnalyticsProductInput[]
): AnalyticsKpis {
  const active = ordersInRange.filter((o) => o.status !== "cancelled");
  const cancelledCount = ordersInRange.length - active.length;
  const revenue = active.reduce((sum, o) => sum + getOrderTotal(o), 0);

  const paymentsReceived = paymentsInRange.filter((p) => p.effectiveStatus === "received").reduce((sum, p) => sum + p.amount, 0);
  const pending = paymentsInRange.filter((p) => p.effectiveStatus === "pending");

  const openRiskCount = riskInRange.filter(
    (a) => a.validation === "pending" && (a.riskLevel === "medium" || a.riskLevel === "high" || a.riskLevel === "critical")
  ).length;

  return {
    revenue,
    orderCount: active.length,
    cancelledCount,
    avgOrderValue: active.length > 0 ? revenue / active.length : 0,
    paymentsReceived,
    paymentsPendingCount: pending.length,
    paymentsPendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
    openRiskCount,
    lowStockCount: products.filter((p) => p.stockStatus === "low-stock").length,
    outOfStockCount: products.filter((p) => p.stockStatus === "out-of-stock").length,
    inventoryValue: products.reduce((sum, p) => sum + p.quantityOnHand * p.purchaseCost, 0),
  };
}

// ---------------------------------------------------------------------------
// Revenue trend — one bucket per calendar day, zero-filled so the chart line
// never skips a day just because nothing sold.
// ---------------------------------------------------------------------------

function computeRevenueTrend(ordersInRange: AnalyticsOrderInput[], range: AnalyticsRangeKey, allOrders: AnalyticsOrderInput[]): RevenuePoint[] {
  const active = ordersInRange.filter((o) => o.status !== "cancelled");
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (const order of active) {
    const key = dayKey(order.createdAt);
    const entry = byDay.get(key) ?? { revenue: 0, orders: 0 };
    entry.revenue += getOrderTotal(order);
    entry.orders += 1;
    byDay.set(key, entry);
  }

  // Determine the span to zero-fill: the requested range window, or — for
  // "all" — from the earliest order on record to today, so the chart never
  // implies history that doesn't exist.
  let start: number;
  const now = Date.now();
  if (range === "all") {
    const earliest = allOrders.reduce((min, o) => Math.min(min, new Date(o.createdAt).getTime()), now);
    start = allOrders.length > 0 ? earliest : now;
  } else {
    start = rangeStartMs(range)!;
  }
  start = new Date(start).setHours(0, 0, 0, 0);
  const end = new Date(now).setHours(0, 0, 0, 0);

  const points: RevenuePoint[] = [];
  for (let t = start; t <= end; t += DAY_MS) {
    const iso = new Date(t).toISOString();
    const entry = byDay.get(dayKey(iso)) ?? { revenue: 0, orders: 0 };
    points.push({ dateIso: startOfDayIso(iso), revenue: entry.revenue, orders: entry.orders });
  }
  return points;
}

// ---------------------------------------------------------------------------
// Top products / categories — matches order item names to inventory
// products via the same matchProductByItemName() hook inventory-engine.ts
// already uses for stock deduction, so "top products" always agrees with
// what actually left the shelf.
// ---------------------------------------------------------------------------

function computeTopProductsAndCategories(
  ordersInRange: AnalyticsOrderInput[]
): { topProducts: RankedEntry[]; topCategories: CategoryEntry[] } {
  const active = ordersInRange.filter((o) => o.status !== "cancelled");
  const byProduct = new Map<string, RankedEntry>();
  const byCategory = new Map<InventoryCategory | "other", CategoryEntry>();

  for (const order of active) {
    for (const item of order.items) {
      const product = matchProductByItemName(item.name);
      const key = product?.id ?? `unmatched:${item.name}`;
      const label = product?.name ?? item.name;
      const lineRevenue = item.quantity * item.unitPrice;

      const productEntry = byProduct.get(key) ?? { key, label, quantity: 0, revenue: 0 };
      productEntry.quantity += item.quantity;
      productEntry.revenue += lineRevenue;
      byProduct.set(key, productEntry);

      const categoryKey = product?.category ?? "other";
      const categoryEntry = byCategory.get(categoryKey) ?? { key: categoryKey, revenue: 0, quantity: 0 };
      categoryEntry.revenue += lineRevenue;
      categoryEntry.quantity += item.quantity;
      byCategory.set(categoryKey, categoryEntry);
    }
  }

  return {
    topProducts: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6),
    topCategories: [...byCategory.values()].sort((a, b) => b.revenue - a.revenue),
  };
}

// ---------------------------------------------------------------------------
// Peak days / hours — order volume by weekday and hour-of-day, for staffing.
// ---------------------------------------------------------------------------

function computePeakTimes(ordersInRange: AnalyticsOrderInput[]): { peakDays: CountByKey<number>[]; peakHours: CountByKey<number>[] } {
  const dayCounts = Array.from({ length: 7 }, (_, key) => ({ key, count: 0 }));
  const hourCounts = Array.from({ length: 24 }, (_, key) => ({ key, count: 0 }));
  for (const order of ordersInRange) {
    dayCounts[mondayFirstDay(order.createdAt)].count += 1;
    hourCounts[new Date(order.createdAt).getHours()].count += 1;
  }
  return { peakDays: dayCounts, peakHours: hourCounts };
}

// ---------------------------------------------------------------------------
// Inventory performance — stock-out ("sale") movements in range vs. current
// on-hand, per product. Read-only over inventory-store's movement log; never
// writes, mirrors inventory-engine.ts's getRecentBuyers in spirit.
// ---------------------------------------------------------------------------

function computeInventoryPerformance(
  movementsInRange: AnalyticsMovementInput[],
  products: AnalyticsProductInput[]
): InventoryPerformance {
  const productById = new Map(products.map((p) => [p.id, p]));
  const soldByProduct = new Map<string, number>();
  const movementsByType = new Map<MovementType, number>();

  for (const movement of movementsInRange) {
    movementsByType.set(movement.type, (movementsByType.get(movement.type) ?? 0) + 1);
    if (movement.type === "stock-out" && movement.reason === "sale") {
      soldByProduct.set(movement.productId, (soldByProduct.get(movement.productId) ?? 0) + Math.abs(movement.quantityDelta));
    }
  }

  const unitsSoldInRange = [...soldByProduct.values()].reduce((sum, v) => sum + v, 0);
  const currentOnHandForSold = [...soldByProduct.keys()].reduce((sum, id) => sum + (productById.get(id)?.quantityOnHand ?? 0), 0);
  const sellThroughRate = unitsSoldInRange + currentOnHandForSold > 0 ? unitsSoldInRange / (unitsSoldInRange + currentOnHandForSold) : 0;

  const topMovers = [...soldByProduct.entries()]
    .map(([productId, unitsSold]) => ({ productId, name: productById.get(productId)?.name ?? productId, unitsSold }))
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 6);

  const movementTypeFlow: MovementType[] = ["stock-in", "stock-out", "adjustment", "transfer"];

  return {
    sellThroughRate,
    unitsSoldInRange,
    movementsByType: movementTypeFlow.map((key) => ({ key, count: movementsByType.get(key) ?? 0 })),
    topMovers,
    lowStock: products
      .filter((p) => p.stockStatus === "low-stock")
      .map((p) => ({ id: p.id, name: p.name, quantityOnHand: p.quantityOnHand, lowStockThreshold: p.lowStockThreshold }))
      .sort((a, b) => a.quantityOnHand - b.quantityOnHand)
      .slice(0, 8),
    outOfStock: products
      .filter((p) => p.stockStatus === "out-of-stock")
      .map((p) => ({ id: p.id, name: p.name })),
  };
}

// ---------------------------------------------------------------------------
// Customer insights — "active this range" = at least one order (any status)
// falling inside the window; status/segment/spend themselves stay the
// lifetime aggregates customer-engine.ts already computes (a VIP doesn't
// stop being a VIP just because they didn't order this week).
// ---------------------------------------------------------------------------

function computeCustomerInsights(
  customers: AnalyticsCustomerInput[],
  orderIdsInRange: Set<string>
): CustomerInsights {
  const active = customers.filter((c) => c.orderIds.some((id) => orderIdsInRange.has(id)));
  const returning = active.filter((c) => c.orderCount > 1);
  const frequencies = active.map((c) => c.purchaseFrequencyDays).filter((v): v is number => v !== null);

  const segmentFlow: CustomerSegment[] = ["new", "active", "vip", "at-risk"];
  const segmentCounts = new Map<CustomerSegment, number>();
  for (const c of active) segmentCounts.set(c.segment, (segmentCounts.get(c.segment) ?? 0) + 1);

  return {
    activeCustomerCount: active.length,
    returningCount: returning.length,
    newCount: active.length - returning.length,
    returningRate: active.length > 0 ? returning.length / active.length : 0,
    avgOrderFrequencyDays: frequencies.length > 0 ? avg(frequencies) : null,
    avgCustomerValue: avg(active.map((c) => c.totalSpent)),
    segmentBreakdown: segmentFlow.map((key) => ({ key, count: segmentCounts.get(key) ?? 0 })),
    topCustomers: [...active]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 6)
      .map((c) => ({ id: c.id, name: c.name, totalSpent: c.totalSpent, orderCount: c.orderCount })),
  };
}

// ---------------------------------------------------------------------------
// Risk / payment analytics
// ---------------------------------------------------------------------------

function computeRiskPaymentAnalytics(
  riskInRange: AnalyticsRiskInput[],
  paymentsInRange: AnalyticsPaymentInput[]
): RiskPaymentAnalytics {
  const riskLevelFlow: RiskLevel[] = ["low", "medium", "high", "critical"];
  const validationFlow: RiskValidationStatus[] = ["pending", "approved", "rejected"];
  const paymentStatusFlow: PaymentTransactionStatus[] = ["pending", "received", "declined", "expired", "cancelled"];

  const riskLevelCounts = new Map<RiskLevel, number>();
  const validationCounts = new Map<RiskValidationStatus, number>();
  for (const a of riskInRange) {
    riskLevelCounts.set(a.riskLevel, (riskLevelCounts.get(a.riskLevel) ?? 0) + 1);
    validationCounts.set(a.validation, (validationCounts.get(a.validation) ?? 0) + 1);
  }

  const paymentStatusCounts = new Map<PaymentTransactionStatus, number>();
  for (const p of paymentsInRange) paymentStatusCounts.set(p.effectiveStatus, (paymentStatusCounts.get(p.effectiveStatus) ?? 0) + 1);
  const declinedCount = paymentStatusCounts.get("declined") ?? 0;

  return {
    riskLevelBreakdown: riskLevelFlow.map((key) => ({ key, count: riskLevelCounts.get(key) ?? 0 })),
    validationBreakdown: validationFlow.map((key) => ({ key, count: validationCounts.get(key) ?? 0 })),
    paymentStatusBreakdown: paymentStatusFlow.map((key) => ({ key, count: paymentStatusCounts.get(key) ?? 0 })),
    declineRate: paymentsInRange.length > 0 ? declinedCount / paymentsInRange.length : 0,
    paymentsInRange: paymentsInRange.length,
  };
}

// ---------------------------------------------------------------------------
// Cross-module insights — explainable rules over the snapshot pieces above,
// each one traceable back to a single fact (a count, a rate). No black-box
// scoring, mirrors risk-engine.ts's factor model in spirit. Text/labels are
// rendered by the component layer (components/staff/AnalyticsInsights.tsx),
// this only decides *whether* an insight fires and *what data* it carries.
// ---------------------------------------------------------------------------

function buildInsights(
  kpis: AnalyticsKpis,
  peakDays: CountByKey<number>[],
  peakHours: CountByKey<number>[],
  topCategories: CategoryEntry[],
  customers: CustomerInsights,
  riskPayment: RiskPaymentAnalytics,
  abandonedCount: number
): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];

  if (kpis.outOfStockCount > 0) {
    insights.push({ id: "out-of-stock", kind: "out-of-stock", severity: "critical", href: "/staff/inventory", data: { count: kpis.outOfStockCount } });
  }
  if (kpis.lowStockCount > 0) {
    insights.push({ id: "low-stock", kind: "low-stock", severity: "warning", href: "/staff/inventory", data: { count: kpis.lowStockCount } });
  }
  if (kpis.openRiskCount > 0) {
    const hasCritical = riskPayment.riskLevelBreakdown.find((r) => r.key === "critical")?.count ?? 0;
    insights.push({
      id: "pending-risk",
      kind: "pending-risk",
      severity: hasCritical > 0 ? "critical" : "warning",
      href: "/staff/security",
      data: { count: kpis.openRiskCount },
    });
  }
  if (kpis.paymentsPendingCount > 0) {
    insights.push({
      id: "pending-payments",
      kind: "pending-payments",
      severity: "info",
      href: "/staff/payments",
      data: { count: kpis.paymentsPendingCount, amount: kpis.paymentsPendingAmount },
    });
  }
  if (abandonedCount > 0) {
    insights.push({ id: "abandoned-orders", kind: "abandoned-orders", severity: "warning", href: "/staff/orders", data: { count: abandonedCount } });
  }
  if (riskPayment.paymentsInRange >= 3 && riskPayment.declineRate > 0.2) {
    insights.push({
      id: "decline-rate-high",
      kind: "decline-rate-high",
      severity: "warning",
      href: "/staff/payments",
      data: { rate: Math.round(riskPayment.declineRate * 100) },
    });
  }
  if (customers.activeCustomerCount >= 3 && customers.returningRate < 0.3) {
    insights.push({
      id: "returning-rate-low",
      kind: "returning-rate-low",
      severity: "info",
      href: "/staff/customers",
      data: { rate: Math.round(customers.returningRate * 100) },
    });
  }
  const totalCategoryRevenue = topCategories.reduce((sum, c) => sum + c.revenue, 0);
  const topCategory = topCategories[0];
  if (topCategory && totalCategoryRevenue > 0 && topCategory.revenue / totalCategoryRevenue > 0.5) {
    insights.push({
      id: "category-concentration",
      kind: "category-concentration",
      severity: "info",
      href: "/staff/analytics",
      data: { category: topCategory.key, share: Math.round((topCategory.revenue / totalCategoryRevenue) * 100) },
    });
  }
  const totalOrdersForPeak = peakDays.reduce((sum, d) => sum + d.count, 0);
  if (totalOrdersForPeak >= 3) {
    const busiestDay = [...peakDays].sort((a, b) => b.count - a.count)[0];
    const busiestHour = [...peakHours].sort((a, b) => b.count - a.count)[0];
    if (busiestDay.count > 0 && busiestHour.count > 0) {
      insights.push({
        id: "peak-time",
        kind: "peak-time",
        severity: "info",
        href: "/staff/analytics",
        data: { day: busiestDay.key, hour: busiestHour.key },
      });
    }
  }

  const severityRank: Record<AnalyticsInsight["severity"], number> = { critical: 0, warning: 1, info: 2 };
  return insights.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function computeAnalyticsSnapshot(
  orders: AnalyticsOrderInput[],
  payments: AnalyticsPaymentInput[],
  assessments: AnalyticsRiskInput[],
  products: AnalyticsProductInput[],
  movements: AnalyticsMovementInput[],
  customers: AnalyticsCustomerInput[],
  range: AnalyticsRangeKey
): AnalyticsSnapshot {
  const startMs = rangeStartMs(range);
  const ordersInRange = orders.filter((o) => withinRange(o.createdAt, startMs));
  const paymentsInRange = payments.filter((p) => withinRange(p.createdAt, startMs));
  const riskInRange = assessments.filter((a) => withinRange(a.createdAt, startMs));
  const movementsInRange = movements.filter((m) => withinRange(m.at, startMs));
  const orderIdsInRange = new Set(ordersInRange.map((o) => o.id));

  const kpis = computeKpis(ordersInRange, paymentsInRange, riskInRange, products);
  const revenueTrend = computeRevenueTrend(ordersInRange, range, orders);
  const { topProducts, topCategories } = computeTopProductsAndCategories(ordersInRange);
  const { peakDays, peakHours } = computePeakTimes(ordersInRange);
  const inventory = computeInventoryPerformance(movementsInRange, products);
  const customerInsights = computeCustomerInsights(customers, orderIdsInRange);
  const riskPayment = computeRiskPaymentAnalytics(riskInRange, paymentsInRange);
  const abandonedCount = ordersInRange.filter((o) => o.isAbandoned).length;

  const insights = buildInsights(kpis, peakDays, peakHours, topCategories, customerInsights, riskPayment, abandonedCount);

  return { range, kpis, revenueTrend, topProducts, topCategories, peakDays, peakHours, inventory, customers: customerInsights, riskPayment, insights };
}

// ---------------------------------------------------------------------------
// Labels — locale-driven, mirrors every other engine's *Label() functions.
// ---------------------------------------------------------------------------

const WEEKDAY_LABELS: Record<Locale, string[]> = {
  fr: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

export function getWeekdayLabel(mondayFirstIndex: number, locale: Locale): string {
  return WEEKDAY_LABELS[locale][mondayFirstIndex] ?? "";
}

export function getHourLabel(hour: number, locale: Locale): string {
  return locale === "fr" ? `${hour}h` : `${hour}:00`;
}

const RANGE_LABELS: Record<AnalyticsRangeKey, Record<Locale, string>> = {
  "7d": { fr: "7 jours", en: "7 days" },
  "30d": { fr: "30 jours", en: "30 days" },
  "90d": { fr: "90 jours", en: "90 days" },
  all: { fr: "Tout", en: "All time" },
};

export function getRangeLabel(range: AnalyticsRangeKey, locale: Locale): string {
  return RANGE_LABELS[range][locale];
}
