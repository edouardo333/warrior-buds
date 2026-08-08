"use client";

// Storefront — generic "pending payment" instructions card. Dispatches to
// the untouched InteracPaymentCard for Interac (real demo instructions) and
// falls back to a polished placeholder for every other provider (card,
// bitcoin, ethereum, shakepay) — see item 8 of the payment-methods spec.
// Never invents real financial information for the placeholder rails.

import InteracPaymentCard from "./InteracPaymentCard";
import { PAYMENT_PROVIDER_BADGES } from "./PaymentIcons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getProvider } from "@/lib/shop/payment-providers/registry";
import type { PaymentProviderId } from "@/types/shop-payment";

export default function PaymentInstructionsCard({
  providerId,
  orderId,
  total,
}: {
  providerId: string;
  orderId: string;
  total: number;
}) {
  const { locale } = useLanguage();

  if (providerId === "interac") return <InteracPaymentCard orderId={orderId} total={total} />;

  const provider = getProvider(providerId as PaymentProviderId);
  if (!provider) return null;

  const instructions = provider.getInstructions(locale, { id: orderId, total }, "post-order");
  const Badge = PAYMENT_PROVIDER_BADGES[providerId];

  return (
    <div className="rounded-2xl border border-wb-orange/30 bg-wb-orange/5 p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-foreground">{instructions.title}</p>
        {Badge && <Badge />}
      </div>
      <p className="mt-4 text-sm text-foreground/70">{instructions.note}</p>
    </div>
  );
}
