"use client";

import type { OrderConfirmationFlags, PaymentMethod, PaymentStatus } from "@/types/order";
import { getPaymentStatusLabel } from "@/lib/bud-guardian/order-engine";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { setConfirmationFlag, setPaymentStatus, type StaffOrderView } from "@/lib/staff/order-actions";
import { hasPermission, minRoleFor } from "@/lib/staff/permissions";
import { getRoleLabel, type StaffSession } from "@/lib/staff/staff-auth";

const TITLE = { fr: "Confirmations client", en: "Customer confirmations" } as const;
const PAYMENT_TITLE = { fr: "Paiement", en: "Payment" } as const;
const METHOD_LABEL = { fr: "Méthode", en: "Method" } as const;
const NO_METHOD = { fr: "Aucune", en: "None" } as const;
const RESTRICTED = {
  fr: (role: string) => `Modification manuelle réservée aux rôles ${role} et plus.`,
  en: (role: string) => `Manual edit reserved for ${role} and above.`,
} as const;

const FLAGS: { key: keyof OrderConfirmationFlags; label: { fr: string; en: string } }[] = [
  { key: "nameConfirmed", label: { fr: "Identité confirmée", en: "Identity confirmed" } },
  { key: "phoneConfirmed", label: { fr: "Téléphone confirmé", en: "Phone confirmed" } },
  { key: "ageConfirmed", label: { fr: "18 ans ou plus", en: "18 years or older" } },
  { key: "fulfillmentConfirmed", label: { fr: "Méthode de récupération confirmée", en: "Pickup method confirmed" } },
];

const PAYMENT_STATUSES: PaymentStatus[] = ["not_started", "pending", "awaiting_confirmation", "failed", "paid_in_store"];
const PAYMENT_METHODS: PaymentMethod[] = ["interac", "cash", "in_store_card"];

const METHOD_LABELS: Record<PaymentMethod, { fr: string; en: string }> = {
  interac: { fr: "Interac", en: "Interac" },
  cash: { fr: "Argent comptant", en: "Cash" },
  in_store_card: { fr: "Carte en boutique", en: "In-store card" },
};

export default function CustomerConfirmation({ order, session }: { order: StaffOrderView; session: StaffSession }) {
  const { locale } = useLanguage();
  const canOverridePayment = hasPermission(session.role, "order.overridePaymentStatus");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{TITLE[locale]}</h3>
        <div className="mt-2 flex flex-col gap-2">
          {FLAGS.map(({ key, label }) => {
            const checked = order.confirmation[key];
            return (
              <label key={key} className="flex cursor-pointer items-center gap-2.5 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setConfirmationFlag(order.id, key, e.target.checked, session)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 accent-wb-orange"
                />
                {label[locale]}
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{PAYMENT_TITLE[locale]}</h3>
        <div className="mt-2 flex flex-wrap gap-3">
          <select
            value={order.payment.status}
            disabled={!canOverridePayment}
            onChange={(e) => setPaymentStatus(order.id, e.target.value as PaymentStatus, order.payment.method, session)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-wb-orange/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status} className="bg-wb-charcoal">
                {getPaymentStatusLabel(status, locale)}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-white/60">
            {METHOD_LABEL[locale]}
            <select
              value={order.payment.method ?? ""}
              disabled={!canOverridePayment}
              onChange={(e) =>
                setPaymentStatus(order.id, order.payment.status, (e.target.value || null) as PaymentMethod | null, session)
              }
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-wb-orange/60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <option value="" className="bg-wb-charcoal">
                {NO_METHOD[locale]}
              </option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method} className="bg-wb-charcoal">
                  {METHOD_LABELS[method][locale]}
                </option>
              ))}
            </select>
          </label>
        </div>
        {!canOverridePayment && (
          <p className="mt-2 text-xs text-white/35">{RESTRICTED[locale](getRoleLabel(minRoleFor("order.overridePaymentStatus"), locale))}</p>
        )}
      </div>
    </div>
  );
}
