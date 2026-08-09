"use client";

import type { StockStatus } from "@/types/inventory";
import { getCategoryLabel, getStockStatusLabel } from "@/lib/bud-guardian/inventory-engine";
import { formatStaffDateTime } from "@/lib/staff/table-format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StaffInventoryProductView } from "@/lib/staff/inventory-actions";
import StaffTableScroll from "./StaffTableScroll";

export const STOCK_STATUS_COLORS: Record<StockStatus, { solid: string; rgb: string }> = {
  "in-stock": { solid: "#3ce27a", rgb: "60, 226, 122" },
  "low-stock": { solid: "#f8b400", rgb: "248, 180, 0" },
  "out-of-stock": { solid: "#e0202e", rgb: "224, 32, 46" },
};

const TEXT = {
  fr: {
    empty: "Aucun produit ne correspond à cette recherche.",
    product: "Produit",
    category: "Catégorie",
    stock: "Stock",
    supplier: "Fournisseur",
    price: "Prix",
    margin: "Marge",
    updated: "Mise à jour",
    expiringSoon: "Expire bientôt",
  },
  en: {
    empty: "No product matches this search.",
    product: "Product",
    category: "Category",
    stock: "Stock",
    supplier: "Supplier",
    price: "Price",
    margin: "Margin",
    updated: "Updated",
    expiringSoon: "Expiring soon",
  },
} as const;

function formatCurrency(amount: number, locale: "fr" | "en"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function StockBadge({ product, locale }: { product: StaffInventoryProductView; locale: "fr" | "en" }) {
  const color = STOCK_STATUS_COLORS[product.stockStatus];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{ borderColor: color.solid, background: `rgba(${color.rgb}, 0.14)`, color: color.solid }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color.solid }} />
      {getStockStatusLabel(product.stockStatus, locale)}
    </span>
  );
}

export default function InventoryTable({
  products,
  selectedId,
  onSelect,
}: {
  products: StaffInventoryProductView[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { locale } = useLanguage();
  const t = TEXT[locale];

  if (products.length === 0) {
    return <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-white/50">{t.empty}</p>;
  }

  return (
    <>
      {/* Desktop / tablet */}
      <StaffTableScroll>
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase tracking-wide text-white/45">
              <th className="px-4 py-3 font-medium">{t.product}</th>
              <th className="px-4 py-3 font-medium">{t.category}</th>
              <th className="px-4 py-3 font-medium">{t.stock}</th>
              <th className="px-4 py-3 font-medium">{t.supplier}</th>
              <th className="px-4 py-3 font-medium">{t.price}</th>
              <th className="px-4 py-3 font-medium">{t.margin}</th>
              <th className="min-w-[190px] whitespace-nowrap px-4 py-3 font-medium">{t.updated}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const selected = product.id === selectedId;
              return (
                <tr
                  key={product.id}
                  onClick={() => onSelect(product.id)}
                  className={`cursor-pointer border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.04] ${
                    selected ? "bg-wb-orange/10" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-white/50">{product.id}</div>
                    <div className="text-white/85">{product.name}</div>
                    {product.isExpiringSoon && (
                      <span className="mt-1 inline-block rounded-full border border-wb-yellow/40 bg-wb-yellow/10 px-2 py-0.5 text-[10px] font-semibold text-wb-yellow">
                        {t.expiringSoon}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/60">{getCategoryLabel(product.category, locale)}</td>
                  <td className="px-4 py-3">
                    <div className="mb-1 text-white/80">{product.quantityOnHand}</div>
                    <StockBadge product={product} locale={locale} />
                  </td>
                  <td className="px-4 py-3 text-white/60">{product.supplier}</td>
                  <td className="px-4 py-3 text-white/80">{formatCurrency(product.sellingPrice, locale)}</td>
                  <td className="px-4 py-3 text-white/60">{Math.round(product.profitMargin * 100)}%</td>
                  <td className="whitespace-nowrap px-4 py-3 text-white/45">{formatStaffDateTime(product.updatedAt, locale)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </StaffTableScroll>

      {/* Mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        {products.map((product) => {
          const selected = product.id === selectedId;
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelect(product.id)}
              className={`rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                selected ? "border-wb-orange/50 bg-wb-orange/10" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-white/70">{product.id}</span>
                <StockBadge product={product} locale={locale} />
              </div>
              <div className="mt-1.5 text-sm font-medium text-white/85">{product.name}</div>
              <div className="mt-0.5 text-xs text-white/50">
                {getCategoryLabel(product.category, locale)} · {product.supplier}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                <span>{product.quantityOnHand} u.</span>
                <span>{formatCurrency(product.sellingPrice, locale)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
