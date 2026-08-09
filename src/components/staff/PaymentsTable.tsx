"use client";

import type { PaymentProvider, PaymentTransactionStatus } from "@/types/payment";
import { getPaymentStatusLabel } from "@/lib/bud-guardian/payment-engine";
import { maskName } from "@/lib/bud-guardian/order-engine";
import { formatStaffDateTime } from "@/lib/staff/table-format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StaffPaymentView } from "@/lib/staff/payment-actions";
import StaffTableScroll from "./StaffTableScroll";

export const PAYMENT_STATUS_COLORS: Record<PaymentTransactionStatus, { solid: string; rgb: string }> = {
  pending: { solid: "#f8b400", rgb: "248, 180, 0" },
  received: { solid: "#30d158", rgb: "48, 209, 88" },
  declined: { solid: "#e0202e", rgb: "224, 32, 46" },
  expired: { solid: "#8a8f98", rgb: "138, 143, 152" },
  cancelled: { solid: "#6b7280", rgb: "107, 114, 128" },
};

export const PROVIDER_LABELS: Record<PaymentProvider, { fr: string; en: string }> = {
  interac: { fr: "Interac", en: "Interac" },
  stripe: { fr: "Stripe", en: "Stripe" },
  square: { fr: "Square", en: "Square" },
  moneris: { fr: "Moneris", en: "Moneris" },
  clover: { fr: "Clover", en: "Clover" },
  in_store: { fr: "Comptoir", en: "In-store" },
  qr_code: { fr: "Code QR", en: "QR code" },
};

const TEXT = {
  fr: {
    empty: "Aucun paiement ne correspond à cette recherche.",
    transaction: "Transaction",
    order: "Commande",
    customer: "Client",
    status: "Statut",
    amount: "Montant",
    provider: "Méthode",
    updated: "Mise à jour",
    noOrder: "Commande introuvable",
  },
  en: {
    empty: "No payment matches this search.",
    transaction: "Transaction",
    order: "Order",
    customer: "Customer",
    status: "Status",
    amount: "Amount",
    provider: "Method",
    updated: "Updated",
    noOrder: "Order not found",
  },
} as const;

function formatCurrency(amount: number, locale: "fr" | "en"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function StatusBadge({ payment, locale }: { payment: StaffPaymentView; locale: "fr" | "en" }) {
  const color = PAYMENT_STATUS_COLORS[payment.effectiveStatus];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{ borderColor: color.solid, background: `rgba(${color.rgb}, 0.14)`, color: color.solid }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color.solid }} />
      {getPaymentStatusLabel(payment.effectiveStatus, locale)}
    </span>
  );
}

export default function PaymentsTable({
  payments,
  selectedId,
  onSelect,
}: {
  payments: StaffPaymentView[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { locale } = useLanguage();
  const t = TEXT[locale];

  if (payments.length === 0) {
    return <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-white/50">{t.empty}</p>;
  }

  return (
    <>
      {/* Desktop / tablet */}
      <StaffTableScroll>
        <table className="w-full min-w-[800px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase tracking-wide text-white/45">
              <th className="px-4 py-3 font-medium">{t.transaction}</th>
              <th className="px-4 py-3 font-medium">{t.order}</th>
              <th className="px-4 py-3 font-medium">{t.customer}</th>
              <th className="px-4 py-3 font-medium">{t.status}</th>
              <th className="px-4 py-3 font-medium">{t.amount}</th>
              <th className="px-4 py-3 font-medium">{t.provider}</th>
              <th className="min-w-[190px] whitespace-nowrap px-4 py-3 font-medium">{t.updated}</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => {
              const selected = payment.id === selectedId;
              return (
                <tr
                  key={payment.id}
                  onClick={() => onSelect(payment.id)}
                  className={`cursor-pointer border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.04] ${
                    selected ? "bg-wb-orange/10" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-white/80">{payment.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/70">{payment.orderId}</td>
                  <td className="px-4 py-3 text-white/85">{payment.order ? maskName(payment.order.customerName) : t.noOrder}</td>
                  <td className="px-4 py-3">
                    <StatusBadge payment={payment} locale={locale} />
                  </td>
                  <td className="px-4 py-3 text-white/80">{formatCurrency(payment.amount, locale)}</td>
                  <td className="px-4 py-3 text-white/60">{PROVIDER_LABELS[payment.provider][locale]}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-white/45">{formatStaffDateTime(payment.updatedAt, locale)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </StaffTableScroll>

      {/* Mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        {payments.map((payment) => {
          const selected = payment.id === selectedId;
          return (
            <button
              key={payment.id}
              type="button"
              onClick={() => onSelect(payment.id)}
              className={`rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                selected ? "border-wb-orange/50 bg-wb-orange/10" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-white/70">{payment.id}</span>
                <StatusBadge payment={payment} locale={locale} />
              </div>
              <div className="mt-1.5 text-sm font-medium text-white/85">
                {payment.order ? maskName(payment.order.customerName) : t.noOrder}
              </div>
              <div className="mt-0.5 font-mono text-xs text-white/50">{payment.orderId}</div>
              <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                <span>{PROVIDER_LABELS[payment.provider][locale]}</span>
                <span>{formatCurrency(payment.amount, locale)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
