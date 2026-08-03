"use client";

import type { InventoryMovement, MovementType } from "@/types/inventory";
import { getMovementReasonLabel, getMovementTypeLabel } from "@/lib/bud-guardian/inventory-engine";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { findProductById } from "@/data/bud-guardian/inventory-store";

export const MOVEMENT_TYPE_COLORS: Record<MovementType, { solid: string; rgb: string }> = {
  "stock-in": { solid: "#3ce27a", rgb: "60, 226, 122" },
  "stock-out": { solid: "#f4670f", rgb: "244, 103, 15" },
  adjustment: { solid: "#f8b400", rgb: "248, 180, 0" },
  transfer: { solid: "#2f9bf0", rgb: "47, 155, 240" },
};

const TEXT = {
  fr: { empty: "Aucun mouvement enregistré.", auto: "Automatique" },
  en: { empty: "No movement recorded yet.", auto: "Automatic" },
} as const;

function formatDate(iso: string, locale: "fr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

export default function InventoryActivityTimeline({
  movements,
  showProductName = false,
}: {
  movements: InventoryMovement[];
  showProductName?: boolean;
}) {
  const { locale } = useLanguage();
  const t = TEXT[locale];

  if (movements.length === 0) {
    return <p className="text-sm text-white/45">{t.empty}</p>;
  }

  return (
    <ul className="flex flex-col gap-0">
      {movements.map((movement, index) => {
        const color = MOVEMENT_TYPE_COLORS[movement.type];
        const isLast = index === movements.length - 1;
        const product = showProductName ? findProductById(movement.productId) : null;
        return (
          <li key={movement.id} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast && <span className="absolute left-[5px] top-3 h-full w-px bg-white/10" />}
            <span
              className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color.solid, boxShadow: `0 0 0 3px rgba(${color.rgb}, 0.18)` }}
            />
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-white/85">
                  {getMovementTypeLabel(movement.type, locale)}
                  {showProductName && product ? ` · ${product.name}` : ""}
                </span>
                <span className="font-mono text-xs" style={{ color: color.solid }}>
                  {movement.quantityDelta > 0 ? "+" : ""}
                  {movement.quantityDelta}
                </span>
              </div>
              <span className="text-xs text-white/45">
                {formatDate(movement.at, locale)} · {getMovementReasonLabel(movement.reason, locale)} ·{" "}
                {movement.orderId ? `${movement.orderId} (${t.auto})` : movement.actor}
              </span>
              {movement.note && <span className="mt-0.5 text-xs text-white/40">{movement.note}</span>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
