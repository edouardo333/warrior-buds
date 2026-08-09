"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shop/cart-engine";
import type { CartTotals } from "@/lib/shop/cart-engine";

export default function OrderSummary({
  totals,
  discount = 0,
  promoCode = null,
  children,
}: {
  totals: CartTotals;
  // Applied BUDS5 discount, if any (see lib/shop/promo-engine.ts) — kept
  // separate from `totals` so cart/mini-cart callers that never apply a
  // promo stay unaffected and don't need to know about it.
  discount?: number;
  promoCode?: string | null;
  children?: ReactNode;
}) {
  const { t } = useLanguage();
  const finalTotal = Math.round((totals.total - discount) * 100) / 100;
  // Independent of any promo code — purely "does this cart's subtotal clear
  // the free-shipping bar", so it's shown even when no code was applied.
  const qualifiesForFreeShipping = totals.subtotal > 0 && totals.shipping === 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <dl className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-foreground/60">{t.cart.subtotal}</dt>
          <dd className="text-foreground">${totals.subtotal.toFixed(2)}</dd>
        </div>
        {discount > 0 && promoCode && (
          <div className="flex justify-between text-wb-green">
            <dt>{t.promo.discountLabel(promoCode)}</dt>
            <dd>-${discount.toFixed(2)}</dd>
          </div>
        )}
        <div>
          <div className="flex justify-between">
            <dt className="text-foreground/60">{t.cart.shipping}</dt>
            <dd className="text-foreground">{totals.shipping === 0 ? t.cart.freeShipping : `$${totals.shipping.toFixed(2)}`}</dd>
          </div>
          {qualifiesForFreeShipping && (
            <p className="mt-1 text-xs text-wb-green">{t.promo.freeShippingMessage(String(FREE_SHIPPING_THRESHOLD))}</p>
          )}
        </div>
        <div className="flex justify-between">
          <dt className="text-foreground/60">{t.cart.tax}</dt>
          <dd className="text-foreground">${totals.tax.toFixed(2)}</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-white/10 pt-3 text-base font-semibold">
          <dt className="text-foreground">{t.cart.total}</dt>
          <dd className="text-foreground">${finalTotal.toFixed(2)}</dd>
        </div>
      </dl>
      {children}
    </div>
  );
}
