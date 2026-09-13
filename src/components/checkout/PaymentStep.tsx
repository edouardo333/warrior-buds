"use client";

import { PAYMENT_PROVIDER_BADGES } from "./PaymentIcons";
import { PrimaryButton, SecondaryButton } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CartTotals } from "@/lib/shop/cart-engine";
import { formatPrice } from "@/lib/shop/product-engine";
import { getEnabledProviders } from "@/lib/shop/payment-providers/registry";
import type { PaymentProviderId } from "@/types/shop-payment";

export default function PaymentStep({
  totals,
  discount = 0,
  paymentProviderId,
  onPaymentProviderChange,
  placing,
  onBack,
  onPlaceOrder,
}: {
  totals: CartTotals;
  discount?: number;
  paymentProviderId: PaymentProviderId;
  onPaymentProviderChange: (id: PaymentProviderId) => void;
  placing: boolean;
  onBack: () => void;
  onPlaceOrder: () => void;
}) {
  const { t, locale } = useLanguage();
  const finalTotal = Math.round((totals.total - discount) * 100) / 100;
  const providers = getEnabledProviders();
  const selectedProvider = providers.find((p) => p.id === paymentProviderId);
  // Interac's note references the real order — only surface it after the
  // order exists (order-detail/confirmation). Every other rail's note is a
  // static "coming soon" placeholder safe to preview here.
  const showPlaceholderNote = selectedProvider && selectedProvider.id !== "interac";

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.checkout.payment.choose}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {providers.map((provider) => {
          const Badge = PAYMENT_PROVIDER_BADGES[provider.id];
          const selected = paymentProviderId === provider.id;
          return (
            <label
              key={provider.id}
              className={`group relative flex cursor-pointer items-center gap-4 rounded-2xl border bg-black/40 p-4 text-sm transition-all duration-200 ${
                selected
                  ? "border-wb-orange bg-wb-orange/10 shadow-[0_0_0_1px_rgba(244,103,15,0.4),0_0_24px_-6px_rgba(244,103,15,0.55)]"
                  : "border-white/10 hover:border-wb-orange/40 hover:bg-white/[0.04]"
              }`}
            >
              <input
                type="radio"
                name="payment-provider"
                checked={selected}
                onChange={() => onPaymentProviderChange(provider.id)}
                className="sr-only"
              />
              {Badge && <Badge />}
              <span className={`flex-1 font-medium ${selected ? "text-foreground" : "text-foreground/75"}`}>
                {provider.getDisplayName(locale)}
              </span>
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  selected ? "border-wb-orange" : "border-white/25"
                }`}
              >
                {selected && <span className="h-2 w-2 rounded-full bg-wb-orange" />}
              </span>
            </label>
          );
        })}
      </div>

      {showPlaceholderNote && selectedProvider && (
        <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <span className="mt-0.5 shrink-0 rounded-full border border-wb-orange/40 bg-wb-orange/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-wb-orange">
            {t.checkout.payment.demoBadge}
          </span>
          <p className="text-xs text-foreground/50">
            {selectedProvider.getInstructions(locale, { id: "", total: 0 }, "checkout").note}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm">
        <span className="text-foreground/60">{t.orderDetail.total}</span>
        <span className="font-semibold text-foreground">{formatPrice(finalTotal, locale)}</span>
      </div>

      <div className="flex gap-3">
        <SecondaryButton type="button" onClick={onBack} disabled={placing} className="px-6 py-2.5 text-xs">
          {t.checkout.back}
        </SecondaryButton>
        <PrimaryButton type="button" onClick={onPlaceOrder} disabled={placing} className="px-6 py-2.5 text-xs">
          {placing ? t.checkout.payment.placing : t.checkout.payment.placeOrder}
        </PrimaryButton>
      </div>
    </div>
  );
}
