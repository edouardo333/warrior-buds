"use client";

import OrderSummary from "@/components/cart/OrderSummary";
import { PrimaryButton, SecondaryButton } from "@/components/forms/FormField";
import PromoCodeField, { type PromoFeedback } from "./PromoCodeField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CartLine, CartTotals } from "@/lib/shop/cart-engine";
import { formatPrice } from "@/lib/shop/product-engine";
import type { Address } from "@/types/account";
import type { ShippingMethod } from "@/types/shop-order";

export default function ReviewStep({
  lines,
  totals,
  discount,
  promoCode,
  promoFeedback,
  onApplyPromo,
  onRemovePromo,
  shippingAddress,
  billingAddress,
  shippingMethod,
  onEditStep,
  onBack,
  onContinue,
}: {
  lines: CartLine[];
  totals: CartTotals;
  discount: number;
  promoCode: string | null;
  promoFeedback: PromoFeedback | null;
  onApplyPromo: (code: string) => void;
  onRemovePromo: () => void;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: ShippingMethod;
  onEditStep: (step: "shipping" | "billing") => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const { t, locale } = useLanguage();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.checkout.review.items}</h2>
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          {lines.map((line) => (
            // Two formats of the same product are separate lines sharing
            // product.id — key by format label too so React never conflates
            // them.
            <div key={`${line.product.id}:${line.selectedFormat?.label ?? ""}`} className="flex items-center justify-between text-sm">
              <span className="text-foreground/80">
                {line.product.name}
                {line.selectedFormat ? ` (${line.selectedFormat.label})` : ""} x{line.quantity}
              </span>
              <span className="font-semibold text-foreground">{formatPrice(line.lineTotal, locale)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/50">{t.checkout.steps.shipping}</h3>
            <button type="button" onClick={() => onEditStep("shipping")} className="text-xs text-wb-orange hover:underline">
              {t.checkout.review.edit}
            </button>
          </div>
          <p className="mt-2 text-sm text-foreground/80">{shippingAddress.fullName}</p>
          <p className="text-sm text-foreground/60">
            {shippingAddress.line1}
            {shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}
          </p>
          <p className="text-sm text-foreground/60">
            {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postalCode}
          </p>
          <p className="mt-2 text-xs text-foreground/50">{t.orderDetail.shippingMethods[shippingMethod]}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/50">{t.checkout.steps.billing}</h3>
            <button type="button" onClick={() => onEditStep("billing")} className="text-xs text-wb-orange hover:underline">
              {t.checkout.review.edit}
            </button>
          </div>
          <p className="mt-2 text-sm text-foreground/80">{billingAddress.fullName}</p>
          <p className="text-sm text-foreground/60">
            {billingAddress.line1}
            {billingAddress.line2 ? `, ${billingAddress.line2}` : ""}
          </p>
          <p className="text-sm text-foreground/60">
            {billingAddress.city}, {billingAddress.province} {billingAddress.postalCode}
          </p>
        </div>
      </div>

      <PromoCodeField appliedCode={promoCode} feedback={promoFeedback} onApply={onApplyPromo} onRemove={onRemovePromo} />

      <OrderSummary totals={totals} discount={discount} promoCode={promoCode} />

      <div className="flex gap-3">
        <SecondaryButton type="button" onClick={onBack} className="px-6 py-2.5 text-xs">
          {t.checkout.back}
        </SecondaryButton>
        <PrimaryButton type="button" onClick={onContinue} className="px-6 py-2.5 text-xs">
          {t.checkout.review.continueBtn}
        </PrimaryButton>
      </div>
    </div>
  );
}
