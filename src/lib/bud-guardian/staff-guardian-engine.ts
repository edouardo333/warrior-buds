// Bud Guardian V9 — staff copilot engine, powering GuardianAssistant.tsx on
// /staff/analytics. Answers questions about KPIs/insights/priorities using
// exactly the data every staff dashboard already computes
// (analytics-engine.ts's AnalyticsSnapshot, same as AnalyticsDashboard.tsx
// and AnalyticsInsights.tsx read) — no parallel data, no invented numbers.
//
// Permissions: per lib/staff/permissions.ts's header, VIEW access to every
// module (Orders, Payments, Risk, Inventory, Customers, Staff, Analytics)
// is uniform across every signed-in role — only WRITE actions are
// role-gated, and this engine never writes anything. So the only gate this
// module needs is "is there a staff session at all", enforced by its caller
// (GuardianAssistant.tsx is only ever mounted inside StaffShell, which
// already requires a session) — never render/mount it outside a staff
// route. It never sees or answers with public-customer-chat data shapes.
//
// The same guardian-policy.ts refusal layer applies here too: Bud Guardian
// refuses the same illegal/unsafe asks regardless of which surface — a
// staff session is not an exemption.

import type { Locale } from "@/lib/i18n/types";
import type { AnalyticsSnapshot } from "./analytics-engine";
import { getRangeLabel, getWeekdayLabel, getHourLabel } from "./analytics-engine";
import { getCategoryLabel } from "./inventory-engine";
import { getRiskLevelLabel } from "./risk-engine";
import { getPaymentStatusLabel } from "./payment-engine";
import { getCustomerSegmentLabel } from "./customer-engine";
import { getStaffMembers } from "@/data/bud-guardian/staff-directory";
import { checkGuardianPolicy } from "./guardian-policy";
import { findBestMatch, type SearchableEntry } from "./search";

export type StaffGuardianResponse = { answer: string; found: boolean };

function money(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function pct(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

type Intent =
  | "overview"
  | "revenue"
  | "payments"
  | "risk"
  | "inventory"
  | "customers"
  | "top-products"
  | "peak"
  | "staff";

type IntentTrigger = SearchableEntry & { intent: Intent };

const INTENT_TRIGGERS: IntentTrigger[] = [
  {
    intent: "overview",
    keywords: [
      "resume", "sommaire", "apercu", "priorites", "priorite", "attention", "quoi surveiller",
      "insights", "perspectives", "anomalies", "situation",
      "summary", "overview", "priorities", "priority", "what needs attention", "insight", "insights", "recap",
    ],
  },
  {
    intent: "revenue",
    keywords: [
      "revenu", "revenus", "chiffre d affaires", "ventes", "panier moyen", "commandes annulees",
      "revenue", "sales", "average order", "avg order value", "cancelled orders",
    ],
  },
  {
    intent: "payments",
    keywords: [
      "paiement", "paiements", "paiements en attente", "taux de refus",
      "payment", "payments", "pending payment", "pending payments", "decline rate",
    ],
  },
  {
    intent: "risk",
    keywords: ["risque", "score de risque", "analyses de risque", "risk", "risk score", "risk assessment", "risk level"],
  },
  {
    intent: "inventory",
    keywords: [
      "stock", "inventaire", "rupture", "stock faible", "valeur d inventaire", "ecoulement",
      "inventory", "out of stock", "low stock", "inventory value", "sell through", "sell-through",
    ],
  },
  {
    intent: "customers",
    keywords: [
      "client", "clients", "clientele", "taux de retour", "clients recurrents",
      "customer", "customers", "returning rate", "repeat customer", "repeat customers",
    ],
  },
  {
    intent: "top-products",
    keywords: [
      "meilleurs produits", "produits les plus vendus", "top produits",
      "top products", "best sellers", "best-selling", "bestsellers",
    ],
  },
  {
    intent: "peak",
    keywords: ["achalandage", "heure de pointe", "jour le plus", "peak", "busiest", "busy time", "peak hours", "peak day"],
  },
  {
    intent: "staff",
    keywords: ["personnel", "employes", "equipe", "staff", "team", "employees"],
  },
];

function buildOverview(snapshot: AnalyticsSnapshot, locale: Locale): string {
  const { kpis, insights, range } = snapshot;
  const rangeLabel = getRangeLabel(range, locale);
  const head =
    locale === "fr"
      ? `Sur ${rangeLabel} : ${money(kpis.revenue, locale)} de revenus sur ${kpis.orderCount} commande(s), panier moyen ${money(kpis.avgOrderValue, locale)}.`
      : `Over ${rangeLabel}: ${money(kpis.revenue, locale)} in revenue across ${kpis.orderCount} order(s), average order ${money(kpis.avgOrderValue, locale)}.`;

  if (insights.length === 0) {
    return `${head}\n${locale === "fr" ? "Aucune anomalie détectée — tous les modules sont en bon état." : "Nothing to flag — every module looks healthy."}`;
  }

  const top = insights.slice(0, 4).map((i) => `• ${describeInsight(i, locale)}`);
  const lead = locale === "fr" ? "Priorités à surveiller :" : "Priorities to watch:";
  return `${head}\n${lead}\n${top.join("\n")}`;
}

function describeInsight(insight: AnalyticsSnapshot["insights"][number], locale: Locale): string {
  const d = insight.data;
  switch (insight.kind) {
    case "out-of-stock":
      return locale === "fr" ? `${d.count} produit(s) en rupture de stock.` : `${d.count} product(s) out of stock.`;
    case "low-stock":
      return locale === "fr" ? `${d.count} produit(s) en stock faible.` : `${d.count} product(s) running low.`;
    case "pending-risk":
      return locale === "fr" ? `${d.count} analyse(s) de risque en attente de validation.` : `${d.count} risk assessment(s) waiting on validation.`;
    case "pending-payments":
      return locale === "fr"
        ? `${d.count} paiement(s) en attente, ${money(Number(d.amount), locale)}.`
        : `${d.count} pending payment(s), ${money(Number(d.amount), locale)}.`;
    case "abandoned-orders":
      return locale === "fr" ? `${d.count} commande(s) abandonnée(s).` : `${d.count} abandoned order(s).`;
    case "returning-rate-low":
      return locale === "fr" ? `Taux de clients récurrents faible (${d.rate}%).` : `Low repeat-customer rate (${d.rate}%).`;
    case "category-concentration":
      return locale === "fr"
        ? `${d.share}% des revenus proviennent de « ${categoryOrOther(String(d.category), locale)} ».`
        : `${d.share}% of revenue comes from "${categoryOrOther(String(d.category), locale)}".`;
    case "peak-time":
      return locale === "fr"
        ? `Période de pointe : ${getWeekdayLabel(Number(d.day), locale)} vers ${getHourLabel(Number(d.hour), locale)}.`
        : `Busiest window: ${getWeekdayLabel(Number(d.day), locale)} around ${getHourLabel(Number(d.hour), locale)}.`;
    case "decline-rate-high":
      return locale === "fr" ? `Taux de refus de paiement élevé (${d.rate}%).` : `Payment decline rate is elevated (${d.rate}%).`;
    default:
      return "";
  }
}

function categoryOrOther(key: string, locale: Locale) {
  if (key === "other") return locale === "fr" ? "non classé" : "uncategorized";
  return getCategoryLabel(key as Parameters<typeof getCategoryLabel>[0], locale);
}

function buildRevenue(snapshot: AnalyticsSnapshot, locale: Locale): string {
  const { kpis, range } = snapshot;
  const rangeLabel = getRangeLabel(range, locale);
  return locale === "fr"
    ? `Revenus (${rangeLabel}) : ${money(kpis.revenue, locale)} sur ${kpis.orderCount} commande(s) (${kpis.cancelledCount} annulée(s)). Panier moyen : ${money(kpis.avgOrderValue, locale)}.`
    : `Revenue (${rangeLabel}): ${money(kpis.revenue, locale)} across ${kpis.orderCount} order(s) (${kpis.cancelledCount} cancelled). Average order: ${money(kpis.avgOrderValue, locale)}.`;
}

function buildPayments(snapshot: AnalyticsSnapshot, locale: Locale): string {
  const { kpis, riskPayment } = snapshot;
  return locale === "fr"
    ? `Paiements reçus : ${money(kpis.paymentsReceived, locale)}. En attente : ${kpis.paymentsPendingCount} (${money(kpis.paymentsPendingAmount, locale)}). Taux de refus : ${pct(riskPayment.declineRate)}.`
    : `Payments received: ${money(kpis.paymentsReceived, locale)}. Pending: ${kpis.paymentsPendingCount} (${money(kpis.paymentsPendingAmount, locale)}). Decline rate: ${pct(riskPayment.declineRate)}.`;
}

function buildRisk(snapshot: AnalyticsSnapshot, locale: Locale): string {
  const { kpis, riskPayment } = snapshot;
  const breakdown = riskPayment.riskLevelBreakdown
    .filter((b) => b.count > 0)
    .map((b) => `${getRiskLevelLabel(b.key, locale)}: ${b.count}`)
    .join(", ");
  return locale === "fr"
    ? `${kpis.openRiskCount} analyse(s) de risque en attente de validation.${breakdown ? ` Répartition — ${breakdown}.` : ""}`
    : `${kpis.openRiskCount} risk assessment(s) waiting on validation.${breakdown ? ` Breakdown — ${breakdown}.` : ""}`;
}

function buildInventory(snapshot: AnalyticsSnapshot, locale: Locale): string {
  const { kpis, inventory } = snapshot;
  const movers = inventory.topMovers.slice(0, 3).map((m) => m.name).join(", ");
  return locale === "fr"
    ? `Stock faible : ${kpis.lowStockCount}. Rupture : ${kpis.outOfStockCount}. Valeur d'inventaire : ${money(kpis.inventoryValue, locale)}. Taux d'écoulement : ${pct(inventory.sellThroughRate)}.${movers ? ` Produits les plus mouvementés : ${movers}.` : ""}`
    : `Low stock: ${kpis.lowStockCount}. Out of stock: ${kpis.outOfStockCount}. Inventory value: ${money(kpis.inventoryValue, locale)}. Sell-through: ${pct(inventory.sellThroughRate)}.${movers ? ` Top movers: ${movers}.` : ""}`;
}

function buildCustomers(snapshot: AnalyticsSnapshot, locale: Locale): string {
  const { customers } = snapshot;
  return locale === "fr"
    ? `${customers.activeCustomerCount} client(s) actif(s), taux de récurrence ${pct(customers.returningRate)} (${customers.returningCount} récurrent(s), ${customers.newCount} nouveau(x)). Valeur moyenne par client : ${money(customers.avgCustomerValue, locale)}.`
    : `${customers.activeCustomerCount} active customer(s), returning rate ${pct(customers.returningRate)} (${customers.returningCount} returning, ${customers.newCount} new). Average customer value: ${money(customers.avgCustomerValue, locale)}.`;
}

function buildTopProducts(snapshot: AnalyticsSnapshot, locale: Locale): string {
  const top = snapshot.topProducts.slice(0, 5);
  if (top.length === 0) return locale === "fr" ? "Aucune vente sur cette période." : "No sales in this period.";
  const lines = top.map((p, i) => `${i + 1}. ${p.label} — ${p.quantity} ${locale === "fr" ? "unités" : "units"}, ${money(p.revenue, locale)}`);
  return `${locale === "fr" ? "Produits les plus vendus :" : "Top-selling products:"}\n${lines.join("\n")}`;
}

function buildPeak(snapshot: AnalyticsSnapshot, locale: Locale): string {
  const topDay = [...snapshot.peakDays].sort((a, b) => b.count - a.count)[0];
  const topHour = [...snapshot.peakHours].sort((a, b) => b.count - a.count)[0];
  if (!topDay || !topHour) return locale === "fr" ? "Pas assez de données pour cette période." : "Not enough data for this period.";
  return locale === "fr"
    ? `Le plus achalandé : ${getWeekdayLabel(topDay.key, locale)}, autour de ${getHourLabel(topHour.key, locale)}.`
    : `Busiest: ${getWeekdayLabel(topDay.key, locale)}, around ${getHourLabel(topHour.key, locale)}.`;
}

function buildStaff(locale: Locale): string {
  const members = getStaffMembers();
  const active = members.filter((m) => m.status === "active").length;
  const suspended = members.length - active;
  return locale === "fr"
    ? `${members.length} membre(s) du personnel — ${active} actif(s), ${suspended} suspendu(s).`
    : `${members.length} staff member(s) — ${active} active, ${suspended} suspended.`;
}

const FALLBACK: Record<Locale, string> = {
  fr: "Je peux vous parler des revenus, paiements, risque, inventaire, clientèle, produits vedettes, achalandage ou du personnel — ou vous donner un résumé complet des priorités.",
  en: "I can talk through revenue, payments, risk, inventory, customers, top products, busiest times, or staff — or give you a full priorities summary.",
};

// paymentStatusBreakdown / getPaymentStatusLabel and getCustomerSegmentLabel
// are kept available for a future finer-grained breakdown without another
// import pass — referenced here so a follow-up intent can format them the
// same way every dashboard table already does.
export function describePaymentStatusBreakdown(snapshot: AnalyticsSnapshot, locale: Locale): string {
  return snapshot.riskPayment.paymentStatusBreakdown
    .filter((b) => b.count > 0)
    .map((b) => `${getPaymentStatusLabel(b.key, locale)}: ${b.count}`)
    .join(", ");
}

export function describeCustomerSegments(snapshot: AnalyticsSnapshot, locale: Locale): string {
  return snapshot.customers.segmentBreakdown
    .filter((b) => b.count > 0)
    .map((b) => `${getCustomerSegmentLabel(b.key, locale)}: ${b.count}`)
    .join(", ");
}

export function respondToStaffQuery(text: string, locale: Locale, snapshot: AnalyticsSnapshot): StaffGuardianResponse {
  const policyBlock = checkGuardianPolicy(text, locale);
  if (policyBlock) return { answer: policyBlock.answer, found: true };

  const match = findBestMatch(text, INTENT_TRIGGERS);
  if (!match) return { answer: FALLBACK[locale], found: false };

  switch (match.intent) {
    case "overview":
      return { answer: buildOverview(snapshot, locale), found: true };
    case "revenue":
      return { answer: buildRevenue(snapshot, locale), found: true };
    case "payments":
      return { answer: buildPayments(snapshot, locale), found: true };
    case "risk":
      return { answer: buildRisk(snapshot, locale), found: true };
    case "inventory":
      return { answer: buildInventory(snapshot, locale), found: true };
    case "customers":
      return { answer: buildCustomers(snapshot, locale), found: true };
    case "top-products":
      return { answer: buildTopProducts(snapshot, locale), found: true };
    case "peak":
      return { answer: buildPeak(snapshot, locale), found: true };
    case "staff":
      return { answer: buildStaff(locale), found: true };
    default:
      return { answer: FALLBACK[locale], found: false };
  }
}
