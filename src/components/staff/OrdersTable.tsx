"use client";

import { getFulfillmentLabel, getOrderTotal, getStatusLabel, maskName } from "@/lib/bud-guardian/order-engine";
import { maskEmailPartial, maskPhonePartial, type StaffOrderView } from "@/lib/staff/order-actions";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { STATUS_COLORS } from "./OrderStatusEditor";

const TEXT = {
  fr: {
    empty: "Aucune commande ne correspond à cette recherche.",
    order: "Commande",
    customer: "Client",
    contact: "Contact",
    status: "Statut",
    total: "Total",
    pickup: "Récupération",
    updated: "Mise à jour",
    abandoned: "Abandonnée",
  },
  en: {
    empty: "No order matches this search.",
    order: "Order",
    customer: "Customer",
    contact: "Contact",
    status: "Status",
    total: "Total",
    pickup: "Pickup",
    updated: "Updated",
    abandoned: "Abandoned",
  },
} as const;

function formatCurrency(amount: number, locale: "fr" | "en"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function formatDate(iso: string, locale: "fr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

function StatusBadge({ order, locale }: { order: StaffOrderView; locale: "fr" | "en" }) {
  const color = STATUS_COLORS[order.status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{ borderColor: color.solid, background: `rgba(${color.rgb}, 0.14)`, color: color.solid }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color.solid }} />
      {getStatusLabel(order.status, locale)}
    </span>
  );
}

export default function OrdersTable({
  orders,
  selectedId,
  onSelect,
}: {
  orders: StaffOrderView[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { locale } = useLanguage();
  const t = TEXT[locale];

  if (orders.length === 0) {
    return <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-white/50">{t.empty}</p>;
  }

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden overflow-x-auto rounded-2xl border border-white/10 sm:block">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase tracking-wide text-white/45">
              <th className="px-4 py-3 font-medium">{t.order}</th>
              <th className="px-4 py-3 font-medium">{t.customer}</th>
              <th className="px-4 py-3 font-medium">{t.contact}</th>
              <th className="px-4 py-3 font-medium">{t.status}</th>
              <th className="px-4 py-3 font-medium">{t.total}</th>
              <th className="px-4 py-3 font-medium">{t.pickup}</th>
              <th className="px-4 py-3 font-medium">{t.updated}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const selected = order.id === selectedId;
              return (
                <tr
                  key={order.id}
                  onClick={() => onSelect(order.id)}
                  className={`cursor-pointer border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.04] ${
                    selected ? "bg-wb-orange/10" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-white/80">
                    {order.id}
                    {order.isAbandoned && (
                      <span className="ml-2 rounded-full border border-wb-red/40 bg-wb-red/10 px-2 py-0.5 text-[10px] font-semibold text-wb-red">
                        {t.abandoned}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/85">{maskName(order.customerName)}</td>
                  <td className="px-4 py-3 text-white/55">
                    <div>{maskPhonePartial(order.phone)}</div>
                    <div className="text-xs">{maskEmailPartial(order.email)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge order={order} locale={locale} />
                  </td>
                  <td className="px-4 py-3 text-white/80">{formatCurrency(getOrderTotal(order), locale)}</td>
                  <td className="px-4 py-3 text-white/60">{getFulfillmentLabel(order.fulfillmentMethod, locale)}</td>
                  <td className="px-4 py-3 text-white/45">{formatDate(order.updatedAt, locale)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        {orders.map((order) => {
          const selected = order.id === selectedId;
          return (
            <button
              key={order.id}
              type="button"
              onClick={() => onSelect(order.id)}
              className={`rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                selected ? "border-wb-orange/50 bg-wb-orange/10" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-white/70">{order.id}</span>
                <StatusBadge order={order} locale={locale} />
              </div>
              <div className="mt-1.5 text-sm font-medium text-white/85">{maskName(order.customerName)}</div>
              <div className="mt-0.5 text-xs text-white/50">{maskPhonePartial(order.phone)}</div>
              <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                <span>{getFulfillmentLabel(order.fulfillmentMethod, locale)}</span>
                <span>{formatCurrency(getOrderTotal(order), locale)}</span>
              </div>
              {order.isAbandoned && (
                <span className="mt-2 inline-block rounded-full border border-wb-red/40 bg-wb-red/10 px-2 py-0.5 text-[10px] font-semibold text-wb-red">
                  {t.abandoned}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
