"use client";

import { getStatusLabel } from "@/lib/bud-guardian/order-engine";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StaffOrderView } from "@/lib/staff/order-actions";
import { STATUS_COLORS } from "./OrderStatusEditor";

const TITLE = { fr: "Historique de la commande", en: "Order history" } as const;

function formatDateTime(iso: string, locale: "fr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export default function OrderTimeline({ order }: { order: StaffOrderView }) {
  const { locale } = useLanguage();
  const entries = [...order.staffMeta.timeline].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{TITLE[locale]}</h3>
      <ol className="mt-3 flex flex-col gap-0">
        {entries.map((entry, index) => {
          const color = STATUS_COLORS[entry.status];
          const isLast = index === entries.length - 1;
          return (
            <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
              {!isLast && <span className="absolute left-[5px] top-3 h-full w-px bg-white/10" />}
              <span
                className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color.solid, boxShadow: `0 0 0 3px rgba(${color.rgb}, 0.18)` }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white/85">{getStatusLabel(entry.status, locale)}</span>
                <span className="text-xs text-white/45">
                  {formatDateTime(entry.at, locale)} · {entry.by}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
