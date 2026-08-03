"use client";

import { PrimaryButton, SecondaryButton } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CartTotals } from "@/lib/shop/cart-engine";
import { getEnabledProviders } from "@/lib/shop/payment-providers/registry";
import type { PaymentProviderId } from "@/types/shop-payment";

export default function PaymentStep({
  totals,
  paymentProviderId,
  onPaymentProviderChange,
  placing,
  onBack,
  onPlaceOrder,
}: {
  totals: CartTotals;
  paymentProviderId: PaymentProviderId;
  onPaymentProviderChange: (id: PaymentProviderId) => void;
  placing: boolean;
  onBack: () => void;
  onPlaceOrder: () => void;
}) {
  const { t, locale } = useLanguage();
  const providers = getEnabledProviders();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.checkout.payment.choose}</h2>
      <div className="flex flex-col gap-3">
        {providers.map((provider) => (
          <label
            key={provider.id}
            className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 text-sm transition-colors ${
              paymentProviderId === provider.id ? "border-wb-orange bg-wb-orange/5 text-foreground" : "border-white/10 bg-white/[0.02] text-foreground/70"
            }`}
          >
            <span className="flex items-center gap-3">
              <input
                type="radio"
                name="payment-provider"
                checked={paymentProviderId === provider.id}
                onChange={() => onPaymentProviderChange(provider.id)}
                className="h-4 w-4 accent-wb-orange"
              />
              {provider.getDisplayName(locale)}
            </span>
            <span className="font-semibold text-foreground">${totals.total.toFixed(2)}</span>
          </label>
        ))}
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
