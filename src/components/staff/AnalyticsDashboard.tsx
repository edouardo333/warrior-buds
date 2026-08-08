"use client";

// Bud Guardian V8 — Analytics & Business Intelligence. Every number on this
// page is derived, live, from the same stores every other staff module
// already reads (Orders, Payments, Risk Engine, Inventory, Customers) via
// lib/staff/analytics-actions.ts's useAnalyticsSnapshot() ->
// lib/bud-guardian/analytics-engine.ts. No parallel data, no fixtures of its
// own — this module only aggregates and visualizes what already exists.
//
// Read-only: every signed-in role can view Analytics, same as every other
// module (see lib/staff/permissions.ts's header — view access was never
// gated by role). Nothing here mutates any store, so there's nothing to gate
// and nothing to log to the shared audit log.

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  CreditCard,
  DollarSign,
  PackageX,
  Receipt,
  ShieldAlert,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import type { InventoryCategory } from "@/types/inventory";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Locale } from "@/lib/i18n/types";
import type { StaffSession } from "@/lib/staff/staff-auth";
import { useAnalyticsSnapshot } from "@/lib/staff/analytics-actions";
import { ANALYTICS_RANGE_FLOW, getHourLabel, getRangeLabel, getWeekdayLabel, type AnalyticsRangeKey } from "@/lib/bud-guardian/analytics-engine";
import { getCategoryLabel } from "@/lib/bud-guardian/inventory-engine";
import { getRiskLevelLabel } from "@/lib/bud-guardian/risk-engine";
import { getPaymentStatusLabel } from "@/lib/bud-guardian/payment-engine";
import { getCustomerSegmentLabel } from "@/lib/bud-guardian/customer-engine";
import { useAnimatedNumber } from "@/lib/bud-guardian/useAnimatedNumber";
import { RISK_LEVEL_COLORS } from "./RiskTable";
import { BarList, TrendAreaChart, VerticalBarChart, type BarListItem } from "./AnalyticsCharts";
import AnalyticsInsights from "./AnalyticsInsights";
import GuardianAssistant from "./GuardianAssistant";
import StaffShell from "./StaffShell";

const TEXT = {
  fr: {
    title: "Bud Guardian — Analytique",
    subtitle: "Vue d'affaires en direct, dérivée des commandes, paiements, risque, inventaire et clients.",
    rangeLabel: "Période",
    kpis: {
      revenue: "Revenus",
      orders: "Commandes",
      avgOrderValue: "Panier moyen",
      paymentsReceived: "Paiements reçus",
      paymentsPending: "Paiements en attente",
      openRisk: "Risque à valider",
      lowStock: "Stock faible",
      outOfStock: "Rupture de stock",
      inventoryValue: "Valeur d'inventaire",
    },
    insightsTitle: "Perspectives — Attention requise",
    revenueTrendTitle: "Tendance des revenus",
    revenueTrendEmpty: "Aucune commande sur cette période.",
    topProductsTitle: "Produits les plus vendus",
    topProductsEmpty: "Aucune vente associée sur cette période.",
    topCategoriesTitle: "Catégories les plus vendues",
    topCategoriesEmpty: "Aucune vente sur cette période.",
    peakTitle: "Achalandage — jours et heures de pointe",
    peakDaysLabel: "Commandes par jour de la semaine",
    peakHoursLabel: "Commandes par heure",
    inventoryTitle: "Performance de l'inventaire",
    sellThrough: "Taux d'écoulement",
    unitsSold: "Unités vendues",
    topMovers: "Produits les plus mouvementés",
    topMoversEmpty: "Aucun mouvement de vente sur cette période.",
    movementsByType: "Mouvements par type",
    lowStockList: "Produits en stock faible",
    outOfStockList: "Produits en rupture",
    noneToShow: "Rien à signaler.",
    customersTitle: "Clientèle",
    activeCustomers: "Clients actifs",
    returningRate: "Taux de clients récurrents",
    avgFrequency: "Fréquence moyenne d'achat",
    avgFrequencyUnit: (n: number) => `${n.toFixed(0)} jours`,
    avgFrequencyUnknown: "Pas assez de données",
    avgCustomerValue: "Valeur moyenne client",
    segmentBreakdown: "Répartition des segments",
    topCustomers: "Meilleurs clients",
    topCustomersEmpty: "Aucun client actif sur cette période.",
    riskPaymentTitle: "Risque et paiements",
    riskLevelBreakdown: "Répartition du risque",
    validationBreakdown: "Statut de validation",
    paymentStatusBreakdown: "Statut des paiements",
    declineRate: "Taux de refus",
    movementTypeLabels: {
      "stock-in": "Entrées",
      "stock-out": "Sorties",
      adjustment: "Ajustements",
      transfer: "Transferts",
    },
    validationLabels: { pending: "En attente", approved: "Approuvé", rejected: "Rejeté" },
    otherCategory: "Non classé",
  },
  en: {
    title: "Bud Guardian — Analytics",
    subtitle: "Live business overview, derived from orders, payments, risk, inventory and customers.",
    rangeLabel: "Range",
    kpis: {
      revenue: "Revenue",
      orders: "Orders",
      avgOrderValue: "Avg. order value",
      paymentsReceived: "Payments received",
      paymentsPending: "Pending payments",
      openRisk: "Risk to validate",
      lowStock: "Low stock",
      outOfStock: "Out of stock",
      inventoryValue: "Inventory value",
    },
    insightsTitle: "Insights — Attention needed",
    revenueTrendTitle: "Revenue trend",
    revenueTrendEmpty: "No orders in this range.",
    topProductsTitle: "Top-selling products",
    topProductsEmpty: "No matched sales in this range.",
    topCategoriesTitle: "Top-selling categories",
    topCategoriesEmpty: "No sales in this range.",
    peakTitle: "Traffic — peak days & hours",
    peakDaysLabel: "Orders by day of week",
    peakHoursLabel: "Orders by hour",
    inventoryTitle: "Inventory performance",
    sellThrough: "Sell-through rate",
    unitsSold: "Units sold",
    topMovers: "Top movers",
    topMoversEmpty: "No sale movements in this range.",
    movementsByType: "Movements by type",
    lowStockList: "Low-stock products",
    outOfStockList: "Out-of-stock products",
    noneToShow: "Nothing to flag.",
    customersTitle: "Customers",
    activeCustomers: "Active customers",
    returningRate: "Returning-customer rate",
    avgFrequency: "Avg. purchase frequency",
    avgFrequencyUnit: (n: number) => `${n.toFixed(0)} days`,
    avgFrequencyUnknown: "Not enough data",
    avgCustomerValue: "Avg. customer value",
    segmentBreakdown: "Segment breakdown",
    topCustomers: "Top customers",
    topCustomersEmpty: "No active customers in this range.",
    riskPaymentTitle: "Risk & payments",
    riskLevelBreakdown: "Risk level breakdown",
    validationBreakdown: "Validation status",
    paymentStatusBreakdown: "Payment status",
    declineRate: "Decline rate",
    movementTypeLabels: {
      "stock-in": "Stock in",
      "stock-out": "Stock out",
      adjustment: "Adjustments",
      transfer: "Transfers",
    },
    validationLabels: { pending: "Pending", approved: "Approved", rejected: "Rejected" },
    otherCategory: "Uncategorized",
  },
} as const;

function formatCurrency(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function formatCompactCurrency(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD", notation: "compact" }).format(amount);
}

function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

function categoryOrOtherLabel(key: InventoryCategory | "other", locale: Locale, otherLabel: string): string {
  return key === "other" ? otherLabel : getCategoryLabel(key, locale);
}

function KpiCard({ label, icon: Icon, solid, rgb, value, isCurrency, locale }: {
  label: string;
  icon: LucideIcon;
  solid: string;
  rgb: string;
  value: number;
  isCurrency?: boolean;
  locale: Locale;
}) {
  const animated = useAnimatedNumber(value, 800, 0);
  return (
    <div className="group flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105"
        style={{ background: `rgba(${rgb}, 0.14)`, color: solid }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-2xl font-semibold text-white/90">{isCurrency ? formatCurrency(animated, locale) : Math.round(animated)}</p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3">
      <p className="text-lg font-semibold text-white/90">{value}</p>
      <p className="mt-0.5 text-[11px] text-white/50">{label}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h2 className="font-display text-lg tracking-wide text-white/85">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function SimpleList({ items, emptyLabel, href }: { items: { key: string; label: string; sublabel?: string }[]; emptyLabel: string; href: string }) {
  if (items.length === 0) return <p className="text-sm text-white/40">{emptyLabel}</p>;
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item.key}>
          <a href={href} className="flex items-baseline justify-between gap-2 text-sm text-white/70 hover:text-wb-orange">
            <span className="truncate">{item.label}</span>
            {item.sublabel && <span className="shrink-0 text-xs text-white/40">{item.sublabel}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function AnalyticsDashboard({ session }: { session: StaffSession }) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const [range, setRange] = useState<AnalyticsRangeKey>("30d");
  const snapshot = useAnalyticsSnapshot(range);

  const kpiItems: { key: keyof typeof snapshot.kpis; label: string; icon: LucideIcon; solid: string; rgb: string; isCurrency?: boolean }[] = [
    { key: "revenue", label: t.kpis.revenue, icon: DollarSign, solid: "#f4670f", rgb: "244, 103, 15", isCurrency: true },
    { key: "orderCount", label: t.kpis.orders, icon: Receipt, solid: "#2f9bf0", rgb: "47, 155, 240" },
    { key: "avgOrderValue", label: t.kpis.avgOrderValue, icon: DollarSign, solid: "#3ce27a", rgb: "60, 226, 122", isCurrency: true },
    { key: "paymentsReceived", label: t.kpis.paymentsReceived, icon: CreditCard, solid: "#3ce27a", rgb: "60, 226, 122", isCurrency: true },
    { key: "paymentsPendingCount", label: t.kpis.paymentsPending, icon: CreditCard, solid: "#8a8f98", rgb: "138, 143, 152" },
    { key: "openRiskCount", label: t.kpis.openRisk, icon: ShieldAlert, solid: "#e0202e", rgb: "224, 32, 46" },
    { key: "lowStockCount", label: t.kpis.lowStock, icon: Boxes, solid: "#f8b400", rgb: "248, 180, 0" },
    { key: "outOfStockCount", label: t.kpis.outOfStock, icon: PackageX, solid: "#e0202e", rgb: "224, 32, 46" },
    { key: "inventoryValue", label: t.kpis.inventoryValue, icon: Warehouse, solid: "#2f9bf0", rgb: "47, 155, 240", isCurrency: true },
  ];

  const revenuePoints = useMemo(() => snapshot.revenueTrend.map((p) => ({ dateIso: p.dateIso, value: p.revenue })), [snapshot.revenueTrend]);

  const topProductItems: BarListItem[] = useMemo(
    () => snapshot.topProducts.map((p) => ({ key: p.key, label: p.label, value: p.revenue })),
    [snapshot.topProducts]
  );

  const topCategoryItems: BarListItem[] = useMemo(
    () => snapshot.topCategories.map((c) => ({ key: c.key, label: categoryOrOtherLabel(c.key, locale, t.otherCategory), value: c.revenue })),
    [snapshot.topCategories, locale, t.otherCategory]
  );

  const peakDayItems = useMemo(
    () => snapshot.peakDays.map((d) => ({ key: d.key, label: getWeekdayLabel(d.key, locale), value: d.count })),
    [snapshot.peakDays, locale]
  );

  const peakHourItems = useMemo(
    () => snapshot.peakHours.map((h) => ({ key: h.key, label: h.key % 3 === 0 ? getHourLabel(h.key, locale) : "", value: h.count })),
    [snapshot.peakHours, locale]
  );

  const topMoverItems: BarListItem[] = useMemo(
    () => snapshot.inventory.topMovers.map((m) => ({ key: m.productId, label: m.name, value: m.unitsSold })),
    [snapshot.inventory.topMovers]
  );

  const movementTypeItems = useMemo(
    () => snapshot.inventory.movementsByType.map((m) => ({ key: m.key, label: t.movementTypeLabels[m.key], value: m.count })),
    [snapshot.inventory.movementsByType, t.movementTypeLabels]
  );

  const segmentItems: BarListItem[] = useMemo(
    () => snapshot.customers.segmentBreakdown.map((s) => ({ key: s.key, label: getCustomerSegmentLabel(s.key, locale), value: s.count })),
    [snapshot.customers.segmentBreakdown, locale]
  );

  const topCustomerItems: BarListItem[] = useMemo(
    () => snapshot.customers.topCustomers.map((c) => ({ key: c.id, label: c.name, value: c.totalSpent })),
    [snapshot.customers.topCustomers]
  );

  const riskLevelItems: BarListItem[] = useMemo(
    () =>
      snapshot.riskPayment.riskLevelBreakdown.map((r) => ({
        key: r.key,
        label: getRiskLevelLabel(r.key, locale),
        value: r.count,
        color: RISK_LEVEL_COLORS[r.key].solid,
      })),
    [snapshot.riskPayment.riskLevelBreakdown, locale]
  );

  const validationItems: BarListItem[] = useMemo(
    () => snapshot.riskPayment.validationBreakdown.map((v) => ({ key: v.key, label: t.validationLabels[v.key], value: v.count })),
    [snapshot.riskPayment.validationBreakdown, t.validationLabels]
  );

  const paymentStatusItems: BarListItem[] = useMemo(
    () => snapshot.riskPayment.paymentStatusBreakdown.map((p) => ({ key: p.key, label: getPaymentStatusLabel(p.key, locale), value: p.count })),
    [snapshot.riskPayment.paymentStatusBreakdown, locale]
  );

  return (
    <StaffShell session={session} active="analytics">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-gradient-ember font-display text-3xl tracking-wide sm:text-4xl">{t.title}</h1>
            <p className="mt-1 text-sm text-white/55">{t.subtitle}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/40">{t.rangeLabel}</span>
            <div className="flex flex-wrap gap-1.5">
              {ANALYTICS_RANGE_FLOW.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRange(key)}
                  aria-pressed={range === key}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 ${
                    range === key ? "border-wb-orange/60 bg-wb-orange/10 text-wb-orange" : "border-white/15 text-white/60 hover:border-wb-orange/50 hover:text-white"
                  }`}
                >
                  {getRangeLabel(key, locale)}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
          {kpiItems.map(({ key, label, icon, solid, rgb, isCurrency }) => (
            <KpiCard key={key} label={label} icon={icon} solid={solid} rgb={rgb} value={snapshot.kpis[key]} isCurrency={isCurrency} locale={locale} />
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="flex items-center gap-1.5 font-display text-lg tracking-wide text-white/85">
            <AlertTriangle className="h-4 w-4 text-wb-orange" />
            {t.insightsTitle}
          </h2>
          <div className="mt-4">
            <AnalyticsInsights insights={snapshot.insights} />
          </div>
        </div>

        <GuardianAssistant snapshot={snapshot} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Panel title={t.revenueTrendTitle}>
              <TrendAreaChart points={revenuePoints} locale={locale} formatValue={(v) => formatCurrency(v, locale)} emptyLabel={t.revenueTrendEmpty} />
            </Panel>
          </div>
          <div className="lg:col-span-5">
            <Panel title={t.peakTitle}>
              <div className="flex flex-col gap-5">
                <div>
                  <p className="mb-2 text-xs font-medium text-white/50">{t.peakDaysLabel}</p>
                  <VerticalBarChart items={peakDayItems} formatValue={(v) => `${v}`} />
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-white/50">{t.peakHoursLabel}</p>
                  <div className="overflow-x-auto">
                    <div className="min-w-[520px]">
                      <VerticalBarChart items={peakHourItems} formatValue={(v) => `${v}`} compact />
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel title={t.topProductsTitle}>
            <BarList items={topProductItems} formatValue={(v) => formatCurrency(v, locale)} emptyLabel={t.topProductsEmpty} />
          </Panel>
          <Panel title={t.topCategoriesTitle}>
            <BarList items={topCategoryItems} formatValue={(v) => formatCurrency(v, locale)} emptyLabel={t.topCategoriesEmpty} />
          </Panel>
        </div>

        <Panel title={t.inventoryTitle}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label={t.sellThrough} value={formatPercent(snapshot.inventory.sellThroughRate)} />
            <MiniStat label={t.unitsSold} value={`${snapshot.inventory.unitsSoldInRange}`} />
            <MiniStat label={t.kpis.lowStock} value={`${snapshot.kpis.lowStockCount}`} />
            <MiniStat label={t.kpis.outOfStock} value={`${snapshot.kpis.outOfStockCount}`} />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-medium text-white/50">{t.topMovers}</p>
              <BarList items={topMoverItems} formatValue={(v) => `${v}`} emptyLabel={t.topMoversEmpty} color="#3ce27a" />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-white/50">{t.movementsByType}</p>
              <VerticalBarChart items={movementTypeItems} formatValue={(v) => `${v}`} color="#2f9bf0" />
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-xs font-medium text-white/50">{t.lowStockList}</p>
                <SimpleList
                  items={snapshot.inventory.lowStock.map((p) => ({ key: p.id, label: p.name, sublabel: `${p.quantityOnHand}/${p.lowStockThreshold}` }))}
                  emptyLabel={t.noneToShow}
                  href="/staff/inventory"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-white/50">{t.outOfStockList}</p>
                <SimpleList
                  items={snapshot.inventory.outOfStock.map((p) => ({ key: p.id, label: p.name }))}
                  emptyLabel={t.noneToShow}
                  href="/staff/inventory"
                />
              </div>
            </div>
          </div>
        </Panel>

        <Panel title={t.customersTitle}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label={t.activeCustomers} value={`${snapshot.customers.activeCustomerCount}`} />
            <MiniStat label={t.returningRate} value={formatPercent(snapshot.customers.returningRate)} />
            <MiniStat
              label={t.avgFrequency}
              value={snapshot.customers.avgOrderFrequencyDays === null ? t.avgFrequencyUnknown : t.avgFrequencyUnit(snapshot.customers.avgOrderFrequencyDays)}
            />
            <MiniStat label={t.avgCustomerValue} value={formatCompactCurrency(snapshot.customers.avgCustomerValue, locale)} />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-white/50">{t.segmentBreakdown}</p>
              <BarList items={segmentItems} formatValue={(v) => `${v}`} emptyLabel={t.noneToShow} color="#2f9bf0" />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-white/50">{t.topCustomers}</p>
              <BarList items={topCustomerItems} formatValue={(v) => formatCurrency(v, locale)} emptyLabel={t.topCustomersEmpty} />
            </div>
          </div>
        </Panel>

        <Panel title={t.riskPaymentTitle}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MiniStat label={t.declineRate} value={formatPercent(snapshot.riskPayment.declineRate)} />
            <MiniStat label={t.kpis.openRisk} value={`${snapshot.kpis.openRiskCount}`} />
            <MiniStat label={t.kpis.paymentsPending} value={`${snapshot.kpis.paymentsPendingCount}`} />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-medium text-white/50">{t.riskLevelBreakdown}</p>
              <BarList items={riskLevelItems} formatValue={(v) => `${v}`} emptyLabel={t.noneToShow} />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-white/50">{t.validationBreakdown}</p>
              <BarList items={validationItems} formatValue={(v) => `${v}`} emptyLabel={t.noneToShow} color="#8a8f98" />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-white/50">{t.paymentStatusBreakdown}</p>
              <BarList items={paymentStatusItems} formatValue={(v) => `${v}`} emptyLabel={t.noneToShow} color="#3ce27a" />
            </div>
          </div>
        </Panel>
      </div>
    </StaffShell>
  );
}
