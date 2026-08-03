"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, CalendarClock, DollarSign, Package, PackageX, TriangleAlert, type LucideIcon } from "lucide-react";
import type { InventoryCategory, StockStatus } from "@/types/inventory";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StaffSession } from "@/lib/staff/staff-auth";
import { useInventoryAuditLog, useInventoryKpis, useInventoryMovements, useStaffInventory } from "@/lib/staff/inventory-actions";
import { getCategoryLabel, getStockStatusLabel } from "@/lib/bud-guardian/inventory-engine";
import { useAnimatedNumber } from "@/lib/bud-guardian/useAnimatedNumber";
import StaffShell from "./StaffShell";
import InventoryTable, { STOCK_STATUS_COLORS } from "./InventoryTable";
import InventoryProductPanel from "./InventoryProductPanel";
import InventoryQuickActions from "./InventoryQuickActions";
import InventoryActivityTimeline from "./InventoryActivityTimeline";

const CATEGORY_FLOW: InventoryCategory[] = ["flower", "pre-rolls", "edibles", "concentrates", "vapes", "accessories", "topicals"];
const STOCK_STATUS_FLOW: StockStatus[] = ["in-stock", "low-stock", "out-of-stock"];

const TEXT = {
  fr: {
    title: "Bud Guardian — Inventaire",
    subtitle: "Gestion du stock et des mouvements, connectée aux commandes et aux paiements.",
    searchPlaceholder: "Nom, SKU ou fournisseur…",
    categoryAll: "Toutes les catégories",
    statusAll: "Tous les statuts",
    clearFilters: "Réinitialiser",
    selectHint: "Sélectionnez un produit pour voir les détails.",
    kpis: {
      total: "Produits",
      value: "Valeur d'inventaire",
      low: "Stock faible",
      out: "Rupture de stock",
      expiring: "Expire bientôt",
      today: "Mouvements aujourd'hui",
    },
    timelineTitle: "Chronologie d'activité d'inventaire",
    auditTitle: "Journal d'activité employé",
    auditEmpty: "Aucune action enregistrée.",
  },
  en: {
    title: "Bud Guardian — Inventory",
    subtitle: "Stock and movement management, connected to orders and payments.",
    searchPlaceholder: "Name, SKU or supplier…",
    categoryAll: "All categories",
    statusAll: "All statuses",
    clearFilters: "Reset",
    selectHint: "Select a product to see its details.",
    kpis: {
      total: "Products",
      value: "Inventory value",
      low: "Low stock",
      out: "Out of stock",
      expiring: "Expiring soon",
      today: "Today's movements",
    },
    timelineTitle: "Inventory activity timeline",
    auditTitle: "Staff activity log",
    auditEmpty: "No action logged yet.",
  },
} as const;

function formatCurrency(amount: number, locale: "fr" | "en"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function KpiCard({
  label,
  icon: Icon,
  solid,
  rgb,
  value,
  isCurrency,
  locale,
}: {
  label: string;
  icon: LucideIcon;
  solid: string;
  rgb: string;
  value: number;
  isCurrency?: boolean;
  locale: "fr" | "en";
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

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export default function InventoryDashboard({ session }: { session: StaffSession }) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const router = useRouter();
  const products = useStaffInventory();
  const kpis = useInventoryKpis();
  const allMovements = useInventoryMovements();
  const auditLog = useInventoryAuditLog();
  const timelineRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          product.name.toLowerCase().includes(q) ||
          product.id.toLowerCase().includes(q) ||
          product.supplier.toLowerCase().includes(q) ||
          (digitsOnly(q).length >= 2 && product.batchId.toLowerCase().includes(q));
        const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
        const matchesStatus = statusFilter === "all" || product.stockStatus === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
      }),
    [products, search, categoryFilter, statusFilter]
  );

  const selectedProduct = selectedId ? products.find((p) => p.id === selectedId) ?? null : null;

  function goToProduct(id: string) {
    router.push(`/staff/inventory/${id}`);
  }

  function scrollToTimeline() {
    timelineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const kpiItems: { key: keyof typeof kpis; label: string; icon: LucideIcon; solid: string; rgb: string; isCurrency?: boolean }[] = [
    { key: "totalProducts", label: t.kpis.total, icon: Package, solid: "#f4670f", rgb: "244, 103, 15" },
    { key: "inventoryValue", label: t.kpis.value, icon: DollarSign, solid: "#2f9bf0", rgb: "47, 155, 240", isCurrency: true },
    { key: "lowStock", label: t.kpis.low, icon: TriangleAlert, solid: STOCK_STATUS_COLORS["low-stock"].solid, rgb: STOCK_STATUS_COLORS["low-stock"].rgb },
    { key: "outOfStock", label: t.kpis.out, icon: PackageX, solid: STOCK_STATUS_COLORS["out-of-stock"].solid, rgb: STOCK_STATUS_COLORS["out-of-stock"].rgb },
    { key: "expiringSoon", label: t.kpis.expiring, icon: CalendarClock, solid: "#f8b400", rgb: "248, 180, 0" },
    { key: "todayMovements", label: t.kpis.today, icon: Activity, solid: "#3ce27a", rgb: "60, 226, 122" },
  ];

  return (
    <StaffShell session={session} active="inventory">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-gradient-ember font-display text-3xl tracking-wide sm:text-4xl">{t.title}</h1>
          <p className="mt-1 text-sm text-white/55">{t.subtitle}</p>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kpiItems.map(({ key, label, icon, solid, rgb, isCurrency }) => (
            <KpiCard key={key} label={label} icon={icon} solid={solid} rgb={rgb} value={kpis[key]} isCurrency={isCurrency} locale={locale} />
          ))}
        </div>

        <InventoryQuickActions
          products={products}
          actor={session.name}
          defaultProductId={selectedId}
          onViewProduct={goToProduct}
          onViewHistory={scrollToTimeline}
        />

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none focus:border-wb-orange/60"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as InventoryCategory | "all")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none focus:border-wb-orange/60"
          >
            <option value="all" className="bg-wb-charcoal">
              {t.categoryAll}
            </option>
            {CATEGORY_FLOW.map((category) => (
              <option key={category} value={category} className="bg-wb-charcoal">
                {getCategoryLabel(category, locale)}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StockStatus | "all")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none focus:border-wb-orange/60"
          >
            <option value="all" className="bg-wb-charcoal">
              {t.statusAll}
            </option>
            {STOCK_STATUS_FLOW.map((status) => (
              <option key={status} value={status} className="bg-wb-charcoal">
                {getStockStatusLabel(status, locale)}
              </option>
            ))}
          </select>
          {(search || categoryFilter !== "all" || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setStatusFilter("all");
              }}
              className="text-sm text-white/50 underline-offset-2 hover:text-white/80 hover:underline"
            >
              {t.clearFilters}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <InventoryTable products={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <div className="lg:col-span-5">
            {selectedProduct ? (
              <InventoryProductPanel
                key={selectedProduct.id}
                product={selectedProduct}
                onClose={() => setSelectedId(null)}
                onViewFull={goToProduct}
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-sm text-white/40">
                {t.selectHint}
              </div>
            )}
          </div>
        </div>

        <div ref={timelineRef} className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
          <h2 className="font-display text-lg tracking-wide text-white/85">{t.timelineTitle}</h2>
          <div className="mt-4 max-h-[420px] overflow-y-auto pr-1">
            <InventoryActivityTimeline movements={allMovements.slice(0, 25)} showProductName />
          </div>
        </div>

        <details className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
          <summary className="cursor-pointer text-sm font-semibold text-white/60">{t.auditTitle}</summary>
          <div className="mt-3 max-h-64 overflow-y-auto text-xs text-white/45">
            {auditLog.length === 0 ? (
              <p>{t.auditEmpty}</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {auditLog.map((entry) => (
                  <li key={entry.id}>
                    {new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "short", timeStyle: "medium" }).format(
                      new Date(entry.at)
                    )}{" "}
                    — {entry.by} — {entry.action}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>
      </div>
    </StaffShell>
  );
}
