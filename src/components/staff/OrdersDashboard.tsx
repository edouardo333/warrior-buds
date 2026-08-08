"use client";

import { useMemo, useState } from "react";
import type { OrderStatus } from "@/types/order";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StaffSession } from "@/lib/staff/staff-auth";
import { useAuditLog, useStaffOrders, type StaffOrderView } from "@/lib/staff/order-actions";
import { getStatusLabel } from "@/lib/bud-guardian/order-engine";
import OrdersTable from "./OrdersTable";
import OrderDetails from "./OrderDetails";
import StaffShell from "./StaffShell";
import { STATUS_FLOW } from "./OrderStatusEditor";

const TEXT = {
  fr: {
    title: "Bud Guardian — Espace employé",
    subtitle: "Gestion des commandes en temps réel, connectée au chatbot Bud Guardian.",
    searchPlaceholder: "Numéro, nom, téléphone ou courriel…",
    statusAll: "Tous les statuts",
    dateLabel: "Date",
    clearFilters: "Réinitialiser",
    kpis: {
      new: "Nouvelles",
      toConfirm: "À confirmer",
      preparing: "En préparation",
      ready: "Prêtes",
      abandoned: "Abandonnées",
      completed: "Terminées",
    },
    auditTitle: "Journal d'activité employé",
    auditEmpty: "Aucune action enregistrée.",
    selectHint: "Sélectionnez une commande pour voir les détails.",
  },
  en: {
    title: "Bud Guardian — Staff space",
    subtitle: "Real-time order management, connected to the Bud Guardian chatbot.",
    searchPlaceholder: "Order #, name, phone or email…",
    statusAll: "All statuses",
    dateLabel: "Date",
    clearFilters: "Reset",
    kpis: {
      new: "New",
      toConfirm: "To confirm",
      preparing: "Preparing",
      ready: "Ready",
      abandoned: "Abandoned",
      completed: "Completed",
    },
    auditTitle: "Staff activity log",
    auditEmpty: "No action logged yet.",
    selectHint: "Select an order to see its details.",
  },
} as const;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function matchesSearch(order: StaffOrderView, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (order.id.toLowerCase().includes(q)) return true;
  if (order.customerName.toLowerCase().includes(q)) return true;
  const qDigits = digitsOnly(q);
  if (qDigits.length >= 3 && digitsOnly(order.phone).includes(qDigits)) return true;
  if (order.email.toLowerCase().includes(q)) return true;
  return false;
}

function matchesDate(order: StaffOrderView, date: string): boolean {
  if (!date) return true;
  return new Date(order.createdAt).toISOString().slice(0, 10) === date;
}

export default function OrdersDashboard({ session }: { session: StaffSession }) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const orders = useStaffOrders();
  const auditLog = useAuditLog();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      new: orders.filter((o) => o.status === "received").length,
      toConfirm: orders.filter((o) => o.status === "verifying" || o.status === "confirmed").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      ready: orders.filter((o) => o.status === "ready").length,
      abandoned: orders.filter((o) => o.isAbandoned).length,
      completed: orders.filter((o) => o.status === "completed").length,
    }),
    [orders]
  );

  const filtered = useMemo(
    () =>
      orders.filter(
        (order) => matchesSearch(order, search) && (statusFilter === "all" || order.status === statusFilter) && matchesDate(order, dateFilter)
      ),
    [orders, search, statusFilter, dateFilter]
  );

  const selectedOrder = selectedId ? orders.find((o) => o.id === selectedId) ?? null : null;

  const kpiItems: { key: keyof typeof counts; label: string }[] = [
    { key: "new", label: t.kpis.new },
    { key: "toConfirm", label: t.kpis.toConfirm },
    { key: "preparing", label: t.kpis.preparing },
    { key: "ready", label: t.kpis.ready },
    { key: "abandoned", label: t.kpis.abandoned },
    { key: "completed", label: t.kpis.completed },
  ];

  return (
    <StaffShell session={session} active="orders">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-gradient-ember font-display text-3xl tracking-wide sm:text-4xl">{t.title}</h1>
          <p className="mt-1 text-sm text-white/55">{t.subtitle}</p>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kpiItems.map(({ key, label }) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
              <p className="text-2xl font-semibold text-white/90">{counts[key]}</p>
              <p className="mt-0.5 text-xs text-white/50">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none focus:border-wb-orange/60"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none focus:border-wb-orange/60"
          >
            <option value="all" className="bg-wb-charcoal">
              {t.statusAll}
            </option>
            {STATUS_FLOW.map((status) => (
              <option key={status} value={status} className="bg-wb-charcoal">
                {getStatusLabel(status, locale)}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label={t.dateLabel}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none focus:border-wb-orange/60"
          />
          {(search || statusFilter !== "all" || dateFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setDateFilter("");
              }}
              className="text-sm text-white/50 underline-offset-2 hover:text-white/80 hover:underline"
            >
              {t.clearFilters}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <OrdersTable orders={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <div className="lg:col-span-5">
            {selectedOrder ? (
              <OrderDetails order={selectedOrder} session={session} onClose={() => setSelectedId(null)} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-sm text-white/40">
                {t.selectHint}
              </div>
            )}
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
                    — {entry.actor} — {entry.description}
                    {entry.entityId ? ` (${entry.entityId})` : ""}
                    {entry.outcome === "denied" ? " ⛔" : ""}
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
