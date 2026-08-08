"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { getCategoryLabel, getLocationLabel, getRecentBuyers, getStockStatusLabel, isExpiringSoon } from "@/lib/bud-guardian/inventory-engine";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StaffSession } from "@/lib/staff/staff-auth";
import { useInventoryMovements, useStaffInventory, useStaffInventoryProduct } from "@/lib/staff/inventory-actions";
import StaffShell from "./StaffShell";
import { STOCK_STATUS_COLORS } from "./InventoryTable";
import InventoryActivityTimeline from "./InventoryActivityTimeline";
import InventoryQuickActions from "./InventoryQuickActions";

const TEXT = {
  fr: {
    back: "Retour à l'inventaire",
    notFound: "Produit introuvable.",
    stock: "Stock actuel",
    threshold: "Seuil d'alerte",
    supplier: "Fournisseur",
    batch: "Lot / Batch",
    location: "Emplacement",
    cost: "Coût d'achat",
    price: "Prix de vente",
    margin: "Marge",
    received: "Date de réception",
    expiration: "Expiration",
    noExpiration: "Aucune",
    expiringSoon: "Expire bientôt",
    history: "Historique des mouvements",
    buyers: "Clients ayant acheté ce produit",
    noBuyers: "Aucun achat lié pour l'instant.",
    riskFlag: "Risque élevé",
    liveStock: "Stock en direct",
  },
  en: {
    back: "Back to inventory",
    notFound: "Product not found.",
    stock: "Current stock",
    threshold: "Alert threshold",
    supplier: "Supplier",
    batch: "Batch / Lot",
    location: "Location",
    cost: "Purchase cost",
    price: "Selling price",
    margin: "Margin",
    received: "Date received",
    expiration: "Expiration",
    noExpiration: "None",
    expiringSoon: "Expiring soon",
    history: "Movement history",
    buyers: "Customers who bought this",
    noBuyers: "No linked purchase yet.",
    riskFlag: "High risk",
    liveStock: "Live stock",
  },
} as const;

function formatCurrency(amount: number, locale: "fr" | "en"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function formatDateShort(iso: string, locale: "fr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "medium" }).format(new Date(iso));
}

export default function InventoryProductPage({ session, productId }: { session: StaffSession; productId: string }) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const router = useRouter();
  const allProducts = useStaffInventory();
  const product = useStaffInventoryProduct(productId);
  const movements = useInventoryMovements(productId);
  const historyRef = useRef<HTMLDivElement>(null);

  if (!product) {
    return (
      <StaffShell session={session} active="inventory">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <Link href="/staff/inventory" className="inline-flex w-fit items-center gap-1.5 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </Link>
          <p className="text-sm text-white/50">{t.notFound}</p>
        </div>
      </StaffShell>
    );
  }

  const statusColor = STOCK_STATUS_COLORS[product.stockStatus];
  const buyers = getRecentBuyers(product.id, 15);

  return (
    <StaffShell session={session} active="inventory">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Link href="/staff/inventory" className="inline-flex w-fit items-center gap-1.5 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-sm text-white/50">{product.id}</p>
            <h1 className="text-gradient-ember font-display text-3xl tracking-wide sm:text-4xl">{product.name}</h1>
            <p className="mt-1 text-sm text-white/55">{getCategoryLabel(product.category, locale)}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium"
              style={{ borderColor: statusColor.solid, background: `rgba(${statusColor.rgb}, 0.14)`, color: statusColor.solid }}
            >
              {getStockStatusLabel(product.stockStatus, locale)} · {product.quantityOnHand}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-white/35">{t.liveStock}</span>
          </div>
        </header>

        {isExpiringSoon(product) && (
          <p className="rounded-xl border border-wb-yellow/40 bg-wb-yellow/10 px-4 py-2.5 text-sm text-wb-yellow">
            {t.expiringSoon} — {product.expirationDate ? formatDateShort(product.expirationDate, locale) : ""}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/45">{t.stock}</p>
            <p className="mt-1 font-semibold text-white/90">{product.quantityOnHand}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/45">{t.threshold}</p>
            <p className="mt-1 text-white/85">{product.lowStockThreshold}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/45">{t.location}</p>
            <p className="mt-1 text-white/85">{getLocationLabel(product.location, locale)}</p>
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
            <p className="text-xs uppercase tracking-wide text-white/45">{t.received}</p>
            <p className="mt-1 text-white/85">{formatDateShort(product.dateReceived, locale)}</p>
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
          <div className="col-span-2 sm:col-span-3">
            <p className="text-xs uppercase tracking-wide text-white/45">{t.margin}</p>
            <p className="mt-1 text-white/85">
              {Math.round(product.profitMargin * 100)}% ({formatCurrency(product.sellingPrice - product.purchaseCost, locale)})
            </p>
          </div>
        </div>

        <InventoryQuickActions
          products={allProducts}
          actor={session.name}
          role={session.role}
          defaultProductId={product.id}
          onViewProduct={(id) => router.push(`/staff/inventory/${id}`)}
          onViewHistory={() => historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div ref={historyRef} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">{t.history}</h2>
            <div className="mt-4 max-h-[420px] overflow-y-auto pr-1">
              <InventoryActivityTimeline movements={movements} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-white/50">
              <Star className="h-3.5 w-3.5" />
              {t.buyers}
            </h2>
            {buyers.length === 0 ? (
              <p className="mt-3 text-sm text-white/45">{t.noBuyers}</p>
            ) : (
              <ul className="mt-3 flex max-h-[420px] flex-col gap-1.5 overflow-y-auto pr-1 text-sm">
                {buyers.map((buyer) => (
                  <li
                    key={`${buyer.orderId}-${buyer.at}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-white/85">{buyer.customerName}</p>
                      <p className="font-mono text-xs text-white/45">
                        {buyer.orderId} · {buyer.quantity} u.
                      </p>
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
      </div>
    </StaffShell>
  );
}
