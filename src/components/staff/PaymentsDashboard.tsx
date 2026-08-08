"use client";

import { useMemo, useState } from "react";
import type { PaymentTransactionStatus } from "@/types/payment";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StaffSession } from "@/lib/staff/staff-auth";
import { useStaffPayments, type StaffPaymentView } from "@/lib/staff/payment-actions";
import { getPaymentStatusLabel } from "@/lib/bud-guardian/payment-engine";
import PaymentsTable from "./PaymentsTable";
import PaymentDetails from "./PaymentDetails";
import StaffShell from "./StaffShell";

const STATUS_FLOW: PaymentTransactionStatus[] = ["pending", "received", "declined", "expired", "cancelled"];

const TEXT = {
  fr: {
    title: "Bud Guardian — Paiements",
    subtitle: "Suivi des paiements simulés, connecté au chatbot Bud Guardian et aux commandes.",
    searchPlaceholder: "Transaction, commande, nom, téléphone ou courriel…",
    statusAll: "Tous les statuts",
    clearFilters: "Réinitialiser",
    kpis: {
      total: "Total",
      pending: "En attente",
      received: "Reçus",
      declined: "Refusés",
      expired: "Expirés",
      cancelled: "Annulés",
    },
    selectHint: "Sélectionnez un paiement pour voir les détails.",
  },
  en: {
    title: "Bud Guardian — Payments",
    subtitle: "Simulated payment tracking, connected to the Bud Guardian chatbot and orders.",
    searchPlaceholder: "Transaction, order, name, phone or email…",
    statusAll: "All statuses",
    clearFilters: "Reset",
    kpis: {
      total: "Total",
      pending: "Pending",
      received: "Received",
      declined: "Declined",
      expired: "Expired",
      cancelled: "Cancelled",
    },
    selectHint: "Select a payment to see its details.",
  },
} as const;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function matchesSearch(payment: StaffPaymentView, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (payment.id.toLowerCase().includes(q)) return true;
  if (payment.orderId.toLowerCase().includes(q)) return true;
  if (payment.order?.customerName.toLowerCase().includes(q)) return true;
  if (payment.order?.email.toLowerCase().includes(q)) return true;
  const qDigits = digitsOnly(q);
  if (qDigits.length >= 3 && payment.order && digitsOnly(payment.order.phone).includes(qDigits)) return true;
  return false;
}

export default function PaymentsDashboard({ session }: { session: StaffSession }) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const payments = useStaffPayments();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentTransactionStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      total: payments.length,
      pending: payments.filter((p) => p.effectiveStatus === "pending").length,
      received: payments.filter((p) => p.effectiveStatus === "received").length,
      declined: payments.filter((p) => p.effectiveStatus === "declined").length,
      expired: payments.filter((p) => p.effectiveStatus === "expired").length,
      cancelled: payments.filter((p) => p.effectiveStatus === "cancelled").length,
    }),
    [payments]
  );

  const filtered = useMemo(
    () => payments.filter((p) => matchesSearch(p, search) && (statusFilter === "all" || p.effectiveStatus === statusFilter)),
    [payments, search, statusFilter]
  );

  const selectedPayment = selectedId ? payments.find((p) => p.id === selectedId) ?? null : null;

  const kpiItems: { key: keyof typeof counts; label: string }[] = [
    { key: "total", label: t.kpis.total },
    { key: "pending", label: t.kpis.pending },
    { key: "received", label: t.kpis.received },
    { key: "declined", label: t.kpis.declined },
    { key: "expired", label: t.kpis.expired },
    { key: "cancelled", label: t.kpis.cancelled },
  ];

  return (
    <StaffShell session={session} active="payments">
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
            onChange={(e) => setStatusFilter(e.target.value as PaymentTransactionStatus | "all")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none focus:border-wb-orange/60"
          >
            <option value="all" className="bg-wb-charcoal">
              {t.statusAll}
            </option>
            {STATUS_FLOW.map((status) => (
              <option key={status} value={status} className="bg-wb-charcoal">
                {getPaymentStatusLabel(status, locale)}
              </option>
            ))}
          </select>
          {(search || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
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
            <PaymentsTable payments={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <div className="lg:col-span-5">
            {selectedPayment ? (
              <PaymentDetails payment={selectedPayment} session={session} onClose={() => setSelectedId(null)} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-sm text-white/40">
                {t.selectHint}
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
