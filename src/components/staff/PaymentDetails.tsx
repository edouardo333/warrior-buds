"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { getStatusLabel, maskName } from "@/lib/bud-guardian/order-engine";
import { confirmPayment, declinePayment, getPaymentStatusLabel } from "@/lib/bud-guardian/payment-engine";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { maskEmailPartial, maskPhonePartial } from "@/lib/staff/order-actions";
import type { StaffPaymentView } from "@/lib/staff/payment-actions";
import { PAYMENT_STATUS_COLORS, PROVIDER_LABELS } from "./PaymentsTable";

const TEXT = {
  fr: {
    order: "Commande",
    customer: "Client",
    contact: "Contact",
    amount: "Montant",
    provider: "Méthode",
    created: "Créé",
    expires: "Expire",
    orderStatus: "Statut de la commande",
    noOrder: "Commande introuvable — ce paiement fait référence à une commande absente du carnet local.",
    confirm: "Confirmer le paiement",
    decline: "Refuser le paiement",
    alreadyResolved: "Ce paiement est déjà résolu — aucune action requise.",
    history: "Historique",
    close: "Fermer",
  },
  en: {
    order: "Order",
    customer: "Customer",
    contact: "Contact",
    amount: "Amount",
    provider: "Method",
    created: "Created",
    expires: "Expires",
    orderStatus: "Order status",
    noOrder: "Order not found — this payment references an order missing from the local book.",
    confirm: "Confirm payment",
    decline: "Decline payment",
    alreadyResolved: "This payment is already resolved — no action needed.",
    history: "History",
    close: "Close",
  },
} as const;

function formatCurrency(amount: number, locale: "fr" | "en"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function formatDateTime(iso: string, locale: "fr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export default function PaymentDetails({
  payment,
  actor,
  onClose,
}: {
  payment: StaffPaymentView;
  actor: string;
  onClose?: () => void;
}) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const [busy, setBusy] = useState(false);

  const isResolved = payment.effectiveStatus !== "pending";
  const history = [...payment.history].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  function handleConfirm() {
    setBusy(true);
    confirmPayment(payment.id, actor);
    setBusy(false);
  }

  function handleDecline() {
    setBusy(true);
    declinePayment(payment.id, actor);
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-white/50">{payment.id}</p>
          <h2 className="text-lg font-semibold text-white/90">
            {payment.order ? maskName(payment.order.customerName) : t.noOrder}
          </h2>
          {payment.order && (
            <p className="mt-0.5 text-xs text-white/45">
              {t.contact}: {maskPhonePartial(payment.order.phone)} · {maskEmailPartial(payment.order.email)}
            </p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="rounded-full border border-white/10 p-1.5 text-white/60 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.order}</p>
          <p className="mt-1 font-mono text-white/85">{payment.orderId}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.amount}</p>
          <p className="mt-1 text-white/85">{formatCurrency(payment.amount, locale)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.provider}</p>
          <p className="mt-1 text-white/85">{PROVIDER_LABELS[payment.provider][locale]}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.created}</p>
          <p className="mt-1 text-white/85">{formatDateTime(payment.createdAt, locale)}</p>
        </div>
        {payment.expiresAt && (
          <div>
            <p className="text-xs uppercase tracking-wide text-white/45">{t.expires}</p>
            <p className="mt-1 text-white/85">{formatDateTime(payment.expiresAt, locale)}</p>
          </div>
        )}
        {payment.order && (
          <div>
            <p className="text-xs uppercase tracking-wide text-white/45">{t.orderStatus}</p>
            <p className="mt-1 text-white/85">{getStatusLabel(payment.order.status, locale)}</p>
          </div>
        )}
      </div>

      <div>
        {isResolved ? (
          <p className="text-sm text-white/45">{t.alreadyResolved}</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={handleConfirm}
              className="rounded-xl border border-wb-guardian-green/50 bg-wb-guardian-green/10 px-3.5 py-2 text-sm font-medium text-wb-guardian-green disabled:opacity-50"
            >
              {t.confirm}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleDecline}
              className="rounded-xl border border-wb-red/50 bg-wb-red/10 px-3.5 py-2 text-sm font-medium text-wb-red disabled:opacity-50"
            >
              {t.decline}
            </button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{t.history}</h3>
        <ol className="mt-3 flex flex-col gap-0">
          {history.map((entry, index) => {
            const color = PAYMENT_STATUS_COLORS[entry.status];
            const isLast = index === history.length - 1;
            return (
              <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
                {!isLast && <span className="absolute left-[5px] top-3 h-full w-px bg-white/10" />}
                <span
                  className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color.solid, boxShadow: `0 0 0 3px rgba(${color.rgb}, 0.18)` }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white/85">{getPaymentStatusLabel(entry.status, locale)}</span>
                  <span className="text-xs text-white/45">
                    {formatDateTime(entry.at, locale)} · {entry.by}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
