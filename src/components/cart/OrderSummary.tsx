"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CartTotals } from "@/lib/shop/cart-engine";

export default function OrderSummary({ totals, children }: { totals: CartTotals; children?: ReactNode }) {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <dl className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-foreground/60">{t.cart.subtotal}</dt>
          <dd className="text-foreground">${totals.subtotal.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-foreground/60">{t.cart.shipping}</dt>
          <dd className="text-foreground">{totals.shipping === 0 ? t.cart.freeShipping : `$${totals.shipping.toFixed(2)}`}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-foreground/60">{t.cart.tax}</dt>
          <dd className="text-foreground">${totals.tax.toFixed(2)}</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-white/10 pt-3 text-base font-semibold">
          <dt className="text-foreground">{t.cart.total}</dt>
          <dd className="text-foreground">${totals.total.toFixed(2)}</dd>
        </div>
      </dl>
      {children}
    </div>
  );
}
