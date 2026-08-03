"use client";

import { ExternalLink, Star, X } from "lucide-react";
import { getCategoryLabel, getLocationLabel, getRecentBuyers, getStockStatusLabel } from "@/lib/bud-guardian/inventory-engine";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useInventoryMovements, type StaffInventoryProductView } from "@/lib/staff/inventory-actions";
import { STOCK_STATUS_COLORS } from "./InventoryTable";
import InventoryActivityTimeline from "./InventoryActivityTimeline";

const TEXT = {
  fr: {
    stock: "Stock actuel",
    threshold: "Seuil d'alerte",
    supplier: "Fournisseur",
    batch: "Lot",
    location: "Emplacement",
    cost: "Coût d'achat",
    price: "Prix de vente",
    margin: "Marge",
    received: "Date de réception",
    expiration: "Expiration",
    noExpiration: "Aucune",
    recentMovements: "Mouvements récents",
    recentBuyers: "Achats récents (clients)",
    noBuyers: "Aucun achat lié pour l'instant.",
    viewFull: "Voir la fiche complète",
    close: "Fermer",
    riskFlag: "Risque élevé",
  },
  en: {
    stock: "Current stock",
    threshold: "Alert threshold",
    supplier: "Supplier",
    batch: "Batch",
    location: "Location",
    cost: "Purchase cost",
    price: "Selling price",
    margin: "Margin",
    received: "Date received",
    expiration: "Expiration",
    noExpiration: "None",
    recentMovements: "Recent movements",
    recentBuyers: "Recent buyers",
    noBuyers: "No linked purchase yet.",
    viewFull: "View full product page",
    close: "Close",
    riskFlag: "High risk",
  },
} as const;

function formatCurrency(amount: number, locale: "fr" | "en"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function formatDateShort(iso: string, locale: "fr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "medium" }).format(new Date(iso));
}

export default function InventoryProductPanel({
  product,
  onClose,
  onViewFull,
}: {
  product: StaffInventoryProductView;
  onClose?: () => void;
  onViewFull: (id: string) => void;
}) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const movements = useInventoryMovements(product.id).slice(0, 5);
  const buyers = getRecentBuyers(product.id, 5);
  const statusColor = STOCK_STATUS_COLORS[product.stockStatus];

  return (
    <div className="wb-risk-details-in flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-white/50">{product.id}</p>
          <h2 className="text-lg font-semibold text-white/90">{product.name}</h2>
          <p className="mt-0.5 text-xs text-white/45">{getCategoryLabel(product.category, locale)}</p>
          <span
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
            style={{ borderColor: statusColor.solid, background: `rgba(${statusColor.rgb}, 0.14)`, color: statusColor.solid }}
          >
            {getStockStatusLabel(product.stockStatus, locale)}
          </span>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label={t.close} className="rounded-full border border-white/10 p-1.5 text-white/60 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.stock}</p>
          <p className="mt-1 font-semibold text-white/90">{product.quantityOnHand}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.threshold}</p>
          <p className="mt-1 text-white/85">{product.lowStockThreshold}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.supplier}</p>
          <p className="mt-1 text-white/85">{product.supplier}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.batch}</p>
          <p className="mt-1 font-mono text-white/85">{product.batchId}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.location}</p>
          <p className="mt-1 text-white/85">{getLocationLabel(product.location, locale)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.expiration}</p>
          <p className="mt-1 text-white/85">{product.expirationDate ? formatDateShort(product.expirationDate, locale) : t.noExpiration}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.cost}</p>
          <p className="mt-1 text-white/85">{formatCurrency(product.purchaseCost, locale)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.price}</p>
          <p className="mt-1 text-white/85">{formatCurrency(product.sellingPrice, locale)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.margin}</p>
          <p className="mt-1 text-white/85">{Math.round(product.profitMargin * 100)}%</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onViewFull(product.id)}
        className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-medium text-white/70 transition-colors duration-200 hover:border-wb-orange/50 hover:text-white"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        {t.viewFull}
      </button>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{t.recentMovements}</h3>
        <div className="mt-3">
          <InventoryActivityTimeline movements={movements} />
        </div>
      </div>

      <div>
        <h3 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-white/50">
          <Star className="h-3.5 w-3.5" />
          {t.recentBuyers}
        </h3>
        {buyers.length === 0 ? (
          <p className="mt-2 text-sm text-white/45">{t.noBuyers}</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5 text-sm">
            {buyers.map((buyer) => (
              <li
                key={`${buyer.orderId}-${buyer.at}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-white/85">{buyer.customerName}</p>
                  <p className="font-mono text-xs text-white/45">{buyer.orderId}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {buyer.riskFlag && (
                    <span className="rounded-full border border-wb-red/40 bg-wb-red/10 px-2 py-0.5 text-[10px] font-semibold text-wb-red">
                      {t.riskFlag}
                    </span>
                  )}
                  <span className="text-xs text-white/45">{formatDateShort(buyer.at, locale)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
