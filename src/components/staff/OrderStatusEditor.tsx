"use client";

import { useState } from "react";
import type { OrderStatus } from "@/types/order";
import { changeOrderStatus, type StaffOrderView } from "@/lib/staff/order-actions";
import { getStatusLabel, isForwardOrSameStatus, ORDER_STATUS_FLOW } from "@/lib/bud-guardian/order-engine";
import { hasPermission, minRoleFor } from "@/lib/staff/permissions";
import { getRoleLabel, type StaffSession } from "@/lib/staff/staff-auth";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// Re-exported for OrdersDashboard.tsx's status filter dropdown — the
// canonical order now lives in order-engine.ts (shared with the permission
// model's regression check) so both places can never drift apart.
export const STATUS_FLOW: OrderStatus[] = [...ORDER_STATUS_FLOW, "cancelled"];

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
    restricted: (role: string) => `Réservé aux rôles ${role} et plus.`,
  },
  en: {
    title: "Order status",
    confirmCancel: "Confirm cancelling this order?",
    yes: "Yes, cancel",
    no: "No",
    restricted: (role: string) => `Reserved for ${role} and above.`,
  },
} as const;

export default function OrderStatusEditor({ order, session }: { order: StaffOrderView; session: StaffSession }) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const [pendingCancel, setPendingCancel] = useState(false);

  const canCancel = hasPermission(session.role, "order.cancel");
  const canRegress = hasPermission(session.role, "order.statusRegress");

  function isDisabled(status: OrderStatus): boolean {
    if (status === order.status) return false;
    if (status === "cancelled") return !canCancel;
    if (!isForwardOrSameStatus(order.status, status)) return !canRegress;
    return false;
  }

  function handlePick(status: OrderStatus) {
    if (status === order.status || isDisabled(status)) return;
    if (status === "cancelled") {
      setPendingCancel(true);
      return;
    }
    changeOrderStatus(order.id, status, session);
  }

  const restrictionNotice = !canCancel
    ? t.restricted(getRoleLabel(minRoleFor("order.cancel"), locale))
    : !canRegress
      ? t.restricted(getRoleLabel(minRoleFor("order.statusRegress"), locale))
      : null;

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{t.title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {STATUS_FLOW.map((status) => {
          const active = status === order.status;
          const disabled = isDisabled(status);
          const color = STATUS_COLORS[status];
          return (
            <button
              key={status}
              type="button"
              disabled={disabled}
              title={disabled ? restrictionNotice ?? undefined : undefined}
              onClick={() => handlePick(status)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
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

      {restrictionNotice && <p className="mt-2 text-xs text-white/35">{restrictionNotice}</p>}

      {pendingCancel && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-wb-red/40 bg-wb-red/10 px-4 py-3 text-sm">
          <span className="text-white/80">{t.confirmCancel}</span>
          <button
            type="button"
            onClick={() => {
              changeOrderStatus(order.id, "cancelled", session);
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
