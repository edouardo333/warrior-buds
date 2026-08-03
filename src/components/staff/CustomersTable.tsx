"use client";

import type { CustomerSegment, CustomerStatus } from "@/types/customer";
import { getCustomerSegmentLabel, getCustomerStatusLabel } from "@/lib/bud-guardian/customer-engine";
import { maskName } from "@/lib/bud-guardian/order-engine";
import { maskEmailPartial, maskPhonePartial } from "@/lib/staff/order-actions";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StaffCustomerView } from "@/lib/staff/customer-actions";

export const CUSTOMER_STATUS_COLORS: Record<CustomerStatus, { solid: string; rgb: string }> = {
  new: { solid: "#2f9bf0", rgb: "47, 155, 240" },
  regular: { solid: "#8a8f98", rgb: "138, 143, 152" },
  vip: { solid: "#f8b400", rgb: "248, 180, 0" },
};

export const CUSTOMER_SEGMENT_COLORS: Record<CustomerSegment, { solid: string; rgb: string }> = {
  new: { solid: "#2f9bf0", rgb: "47, 155, 240" },
  active: { solid: "#3ce27a", rgb: "60, 226, 122" },
  vip: { solid: "#f8b400", rgb: "248, 180, 0" },
  "at-risk": { solid: "#e0202e", rgb: "224, 32, 46" },
};

const TEXT = {
  fr: {
    empty: "Aucun client ne correspond à cette recherche.",
    customer: "Client",
    contact: "Contact",
    status: "Statut",
    segment: "Segment",
    orders: "Commandes",
    spent: "Total dépensé",
    lastVisit: "Dernière visite",
  },
  en: {
    empty: "No customer matches this search.",
    customer: "Customer",
    contact: "Contact",
    status: "Status",
    segment: "Segment",
    orders: "Orders",
    spent: "Total spent",
    lastVisit: "Last visit",
  },
} as const;

function formatCurrency(amount: number, locale: "fr" | "en"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function formatDate(iso: string, locale: "fr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

function StatusBadge({ status, locale }: { status: CustomerStatus; locale: "fr" | "en" }) {
  const color = CUSTOMER_STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{ borderColor: color.solid, background: `rgba(${color.rgb}, 0.14)`, color: color.solid }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color.solid }} />
      {getCustomerStatusLabel(status, locale)}
    </span>
  );
}

function SegmentBadge({ segment, locale }: { segment: CustomerSegment; locale: "fr" | "en" }) {
  const color = CUSTOMER_SEGMENT_COLORS[segment];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{ borderColor: color.solid, background: `rgba(${color.rgb}, 0.14)`, color: color.solid }}
    >
      {getCustomerSegmentLabel(segment, locale)}
    </span>
  );
}

export default function CustomersTable({
  customers,
  selectedId,
  onSelect,
}: {
  customers: StaffCustomerView[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { locale } = useLanguage();
  const t = TEXT[locale];

  if (customers.length === 0) {
    return <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-white/50">{t.empty}</p>;
  }

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden overflow-x-auto rounded-2xl border border-white/10 sm:block">
        <table className="w-full min-w-[780px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase tracking-wide text-white/45">
              <th className="px-4 py-3 font-medium">{t.customer}</th>
              <th className="px-4 py-3 font-medium">{t.contact}</th>
              <th className="px-4 py-3 font-medium">{t.status}</th>
              <th className="px-4 py-3 font-medium">{t.segment}</th>
              <th className="px-4 py-3 font-medium">{t.orders}</th>
              <th className="px-4 py-3 font-medium">{t.spent}</th>
              <th className="px-4 py-3 font-medium">{t.lastVisit}</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const selected = customer.id === selectedId;
              return (
                <tr
                  key={customer.id}
                  onClick={() => onSelect(customer.id)}
                  className={`cursor-pointer border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.04] ${
                    selected ? "bg-wb-orange/10" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-white/85">
                    {maskName(customer.name)}
                    <div className="font-mono text-xs text-white/40">{customer.id}</div>
                  </td>
                  <td className="px-4 py-3 text-white/55">
                    <div>{maskPhonePartial(customer.phone)}</div>
                    <div className="text-xs">{maskEmailPartial(customer.email)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={customer.status} locale={locale} />
                  </td>
                  <td className="px-4 py-3">
                    <SegmentBadge segment={customer.segment} locale={locale} />
                  </td>
                  <td className="px-4 py-3 text-white/80">{customer.orderCount}</td>
                  <td className="px-4 py-3 text-white/80">{formatCurrency(customer.totalSpent, locale)}</td>
                  <td className="px-4 py-3 text-white/45">{formatDate(customer.lastOrderAt, locale)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        {customers.map((customer) => {
          const selected = customer.id === selectedId;
          return (
            <button
              key={customer.id}
              type="button"
              onClick={() => onSelect(customer.id)}
              className={`rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                selected ? "border-wb-orange/50 bg-wb-orange/10" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-white/70">{customer.id}</span>
                <StatusBadge status={customer.status} locale={locale} />
              </div>
              <div className="mt-1.5 text-sm font-medium text-white/85">{maskName(customer.name)}</div>
              <div className="mt-0.5 text-xs text-white/50">{maskPhonePartial(customer.phone)}</div>
              <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                <SegmentBadge segment={customer.segment} locale={locale} />
                <span>{formatCurrency(customer.totalSpent, locale)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
