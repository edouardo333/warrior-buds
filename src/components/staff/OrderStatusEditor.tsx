"use client";

import { useState } from "react";
import type { OrderStatus } from "@/types/order";
import { changeOrderStatus, type StaffOrderView } from "@/lib/staff/order-actions";
import { getStatusLabel } from "@/lib/bud-guardian/order-engine";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export const STATUS_FLOW: OrderStatus[] = [
  "received",
  "verifying",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

export const STATUS_COLORS: Record<OrderStatus, { solid: string; rgb: string }> = {
  received: { solid: "#2f9bf0", rgb: "47, 155, 240" },
  verifying: { solid: "#f8b400", rgb: "248, 180, 0" },
  confirmed: { solid: "#3ce27a", rgb: "60, 226, 122" },
  preparing: { solid: "#f4670f", rgb: "244, 103, 15" },
  ready: { solid: "#30d158", rgb: "48, 209, 88" },
  completed: { solid: "#8a8f98", rgb: "138, 143, 152" },
  cancelled: { solid: "#e0202e", rgb: "224, 32, 46" },
};

const TEXT = {
  fr: {
    title: "Statut de la commande",
    confirmCancel: "Confirmer l'annulation de cette commande ?",
    yes: "Oui, annuler",
    no: "Non",
  },
  en: {
    title: "Order status",
    confirmCancel: "Confirm cancelling this order?",
    yes: "Yes, cancel",
    no: "No",
  },
} as const;

export default function OrderStatusEditor({ order, actor }: { order: StaffOrderView; actor: string }) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const [pendingCancel, setPendingCancel] = useState(false);

  function handlePick(status: OrderStatus) {
    if (status === order.status) return;
    if (status === "cancelled") {
      setPendingCancel(true);
      return;
    }
    changeOrderStatus(order.id, status, actor);
  }

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{t.title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {STATUS_FLOW.map((status) => {
          const active = status === order.status;
          const color = STATUS_COLORS[status];
          return (
            <button
              key={status}
              type="button"
              onClick={() => handlePick(status)}
              className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                active
                  ? { borderColor: color.solid, background: `rgba(${color.rgb}, 0.18)`, color: color.solid }
                  : { borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }
              }
            >
              {getStatusLabel(status, locale)}
            </button>
          );
        })}
      </div>

      {pendingCancel && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-wb-red/40 bg-wb-red/10 px-4 py-3 text-sm">
          <span className="text-white/80">{t.confirmCancel}</span>
          <button
            type="button"
            onClick={() => {
              changeOrderStatus(order.id, "cancelled", actor);
              setPendingCancel(false);
            }}
            className="rounded-lg bg-wb-red px-3 py-1.5 font-semibold text-white"
          >
            {t.yes}
          </button>
          <button
            type="button"
            onClick={() => setPendingCancel(false)}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-white/70"
          >
            {t.no}
          </button>
        </div>
      )}
    </div>
  );
}
