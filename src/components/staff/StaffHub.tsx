"use client";

import {
  AlertTriangle,
  Bell,
  Boxes,
  CalendarClock,
  CreditCard,
  PackageX,
  ShieldAlert,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StaffSession } from "@/lib/staff/staff-auth";
import { useStaffOrders, type StaffOrderView } from "@/lib/staff/order-actions";
import { useStaffPayments, type StaffPaymentView } from "@/lib/staff/payment-actions";
import { useStaffRiskAssessments, type StaffRiskView } from "@/lib/staff/risk-actions";
import { useInventoryKpis, useStaffInventory, type StaffInventoryProductView } from "@/lib/staff/inventory-actions";
import { useAuditLog } from "@/lib/staff/audit-log";
import { getStatusLabel } from "@/lib/bud-guardian/order-engine";
import { getRiskLevelLabel } from "@/lib/bud-guardian/risk-engine";
import { useAnimatedNumber } from "@/lib/bud-guardian/useAnimatedNumber";
import StaffShell from "./StaffShell";

const TEXT = {
  fr: {
    title: "Bud Guardian — Espace employé",
    subtitle: "Vue d'ensemble des opérations, dérivée en direct des commandes, paiements, risque et inventaire.",
    kpis: {
      todayOrders: "Commandes aujourd'hui",
      needsAttention: "Commandes à traiter",
      pendingPayments: "Paiements en attente",
      openRisk: "Risque moyen+ à valider",
      lowStock: "Stock faible",
      outOfStock: "Rupture de stock",
      expiringSoon: "Expire bientôt",
    },
    attention: "Attention requise",
    allClear: "Rien à signaler — tous les modules sont à jour.",
    sections: {
      abandoned: "Commandes abandonnées",
      pendingPayments: "Paiements en attente",
      criticalRisk: "Analyses de risque élevé/critique à valider",
      outOfStock: "Produits en rupture de stock",
      unmatched: "Articles de commande non associés à un produit",
    },
    more: (n: number) => `+${n} de plus`,
    cards: {
      orders: { title: "Commandes", desc: "Gestion des commandes en temps réel, connectée au chatbot Bud Guardian." },
      payments: { title: "Paiements", desc: "Suivi des paiements simulés, connecté aux commandes." },
      security: { title: "Risk Engine", desc: "Analyse automatique du risque de chaque commande." },
      customers: { title: "Clients", desc: "Intelligence client connectée aux commandes, paiements et au Risk Engine." },
      inventory: { title: "Inventaire", desc: "Gestion du stock et des mouvements, connectée aux commandes et aux paiements." },
      analytics: { title: "Analytique", desc: "Tableau de bord d'affaires — revenus, ventes, inventaire et clients, en direct." },
      team: { title: "Personnel", desc: "Répertoire du personnel, rôles, statuts et matrice des permissions." },
    },
  },
  en: {
    title: "Bud Guardian — Staff space",
    subtitle: "Live operational overview, derived from orders, payments, risk, and inventory.",
    kpis: {
      todayOrders: "Today's orders",
      needsAttention: "Orders needing attention",
      pendingPayments: "Pending payments",
      openRisk: "Medium+ risk to validate",
      lowStock: "Low stock",
      outOfStock: "Out of stock",
      expiringSoon: "Expiring soon",
    },
    attention: "Attention needed",
    allClear: "Nothing to flag — every module is caught up.",
    sections: {
      abandoned: "Abandoned orders",
      pendingPayments: "Pending payments",
      criticalRisk: "High/critical risk assessments to validate",
      outOfStock: "Out-of-stock products",
      unmatched: "Order items not matched to a product",
    },
    more: (n: number) => `+${n} more`,
    cards: {
      orders: { title: "Orders", desc: "Real-time order management, connected to the Bud Guardian chatbot." },
      payments: { title: "Payments", desc: "Simulated payment tracking, connected to orders." },
      security: { title: "Risk Engine", desc: "Automatic per-order risk analysis." },
      customers: { title: "Customers", desc: "Customer intelligence connected to orders, payments and the Risk Engine." },
      inventory: { title: "Inventory", desc: "Stock and movement management, connected to orders and payments." },
      analytics: { title: "Analytics", desc: "Live business dashboard — revenue, sales, inventory and customers." },
      team: { title: "Staff", desc: "Staff directory, roles, statuses, and the permission matrix." },
    },
  },
} as const;

const CARDS = [
  { key: "orders", href: "/staff/orders" },
  { key: "payments", href: "/staff/payments" },
  { key: "security", href: "/staff/security" },
  { key: "customers", href: "/staff/customers" },
  { key: "inventory", href: "/staff/inventory" },
  { key: "analytics", href: "/staff/analytics" },
  { key: "team", href: "/staff/team" },
] as const;

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function KpiCard({ label, icon: Icon, solid, rgb, value }: { label: string; icon: LucideIcon; solid: string; rgb: string; value: number }) {
  const animated = useAnimatedNumber(value, 800, 0);
  return (
    <div className="group flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105"
        style={{ background: `rgba(${rgb}, 0.14)`, color: solid }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-2xl font-semibold text-white/90">{Math.round(animated)}</p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  );
}

function AttentionSection({
  title,
  items,
  more,
}: {
  title: string;
  items: { key: string; href: string; label: string }[];
  more: (n: number) => string;
}) {
  if (items.length === 0) return null;
  const shown = items.slice(0, 5);
  const rest = items.length - shown.length;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
        {title} · {items.length}
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {shown.map((item) => (
          <li key={item.key}>
            <a href={item.href} className="text-sm text-white/70 underline-offset-2 hover:text-wb-orange hover:underline">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      {rest > 0 && <p className="mt-1 text-xs text-white/35">{more(rest)}</p>}
    </div>
  );
}

export default function StaffHub({ session }: { session: StaffSession }) {
  const { locale } = useLanguage();
  const t = TEXT[locale];

  // Every KPI/attention item below is derived from the exact same hooks the
  // Orders/Payments/Risk/Inventory dashboards already use — no parallel
  // business logic, just aggregation of data those modules already compute.
  const orders: StaffOrderView[] = useStaffOrders();
  const payments: StaffPaymentView[] = useStaffPayments();
  const assessments: StaffRiskView[] = useStaffRiskAssessments();
  const products: StaffInventoryProductView[] = useStaffInventory();
  const inventoryKpis = useInventoryKpis();
  const inventoryAudit = useAuditLog("inventory");

  const todayOrders = orders.filter((o) => isToday(o.createdAt));
  const needsAttention = orders.filter((o) => o.status === "received" || o.status === "verifying" || o.isAbandoned);
  const pendingPayments = payments.filter((p) => p.effectiveStatus === "pending");
  const openRisk = assessments.filter(
    (a) => a.validation === "pending" && (a.riskLevel === "medium" || a.riskLevel === "high" || a.riskLevel === "critical")
  );
  const criticalRisk = assessments.filter((a) => a.validation === "pending" && (a.riskLevel === "high" || a.riskLevel === "critical"));
  const abandonedOrders = orders.filter((o) => o.isAbandoned);
  const outOfStock = products.filter((p) => p.stockStatus === "out-of-stock");
  const unmatchedWarnings = inventoryAudit.filter((entry) => entry.action === "inventory.unmatchedItem" && entry.outcome === "warning");

  const kpiItems: { key: string; label: string; icon: LucideIcon; solid: string; rgb: string; value: number }[] = [
    { key: "todayOrders", label: t.kpis.todayOrders, icon: Bell, solid: "#2f9bf0", rgb: "47, 155, 240", value: todayOrders.length },
    { key: "needsAttention", label: t.kpis.needsAttention, icon: TriangleAlert, solid: "#f8b400", rgb: "248, 180, 0", value: needsAttention.length },
    { key: "pendingPayments", label: t.kpis.pendingPayments, icon: CreditCard, solid: "#f4670f", rgb: "244, 103, 15", value: pendingPayments.length },
    { key: "openRisk", label: t.kpis.openRisk, icon: ShieldAlert, solid: "#e0202e", rgb: "224, 32, 46", value: openRisk.length },
    { key: "lowStock", label: t.kpis.lowStock, icon: Boxes, solid: "#f8b400", rgb: "248, 180, 0", value: inventoryKpis.lowStock },
    { key: "outOfStock", label: t.kpis.outOfStock, icon: PackageX, solid: "#e0202e", rgb: "224, 32, 46", value: inventoryKpis.outOfStock },
    { key: "expiringSoon", label: t.kpis.expiringSoon, icon: CalendarClock, solid: "#8a8f98", rgb: "138, 143, 152", value: inventoryKpis.expiringSoon },
  ];

  const attentionSections = [
    {
      title: t.sections.abandoned,
      items: abandonedOrders.map((o) => ({ key: o.id, href: "/staff/orders", label: `${o.id} — ${getStatusLabel(o.status, locale)}` })),
    },
    {
      title: t.sections.pendingPayments,
      items: pendingPayments.map((p) => ({ key: p.id, href: "/staff/payments", label: `${p.id} — ${p.orderId}` })),
    },
    {
      title: t.sections.criticalRisk,
      items: criticalRisk.map((a) => ({ key: a.id, href: "/staff/security", label: `${a.id} — ${getRiskLevelLabel(a.riskLevel, locale)}` })),
    },
    {
      title: t.sections.outOfStock,
      items: outOfStock.map((p) => ({ key: p.id, href: "/staff/inventory", label: p.name })),
    },
    {
      title: t.sections.unmatched,
      items: unmatchedWarnings.map((entry) => ({
        key: entry.id,
        href: "/staff/inventory",
        label: `${entry.entityId ?? ""} — ${entry.description}`,
      })),
    },
  ];
  const hasAttentionItems = attentionSections.some((section) => section.items.length > 0);

  return (
    <StaffShell session={session} active="dashboard">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header>
          <h1 className="text-gradient-ember font-display text-3xl tracking-wide sm:text-4xl">{t.title}</h1>
          <p className="mt-1 text-sm text-white/55">{t.subtitle}</p>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {kpiItems.map(({ key, label, icon, solid, rgb, value }) => (
            <KpiCard key={key} label={label} icon={icon} solid={solid} rgb={rgb} value={value} />
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="flex items-center gap-1.5 font-display text-lg tracking-wide text-white/85">
            <AlertTriangle className="h-4 w-4 text-wb-orange" />
            {t.attention}
          </h2>
          {hasAttentionItems ? (
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {attentionSections.map((section) => (
                <AttentionSection key={section.title} title={section.title} items={section.items} more={t.more} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/45">{t.allClear}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map(({ key, href }) => (
            <a
              key={key}
              href={href}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8 transition-colors duration-200 hover:border-wb-orange/50 hover:bg-white/[0.05]"
            >
              <h2 className="font-display text-xl tracking-wide text-white/90 group-hover:text-wb-orange">{t.cards[key].title}</h2>
              <p className="mt-2 text-sm text-white/55">{t.cards[key].desc}</p>
            </a>
          ))}
        </div>
      </div>
    </StaffShell>
  );
}
