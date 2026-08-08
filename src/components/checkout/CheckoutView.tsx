"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BillingStep from "./BillingStep";
import CheckoutIdentityStep from "./CheckoutIdentityStep";
import CheckoutShell from "./CheckoutShell";
import PaymentStep from "./PaymentStep";
import ReviewStep from "./ReviewStep";
import ShippingStep from "./ShippingStep";
import { PrimaryButton } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAccount } from "@/lib/shop/auth-actions";
import { useCart } from "@/lib/shop/cart-actions";
import { useOrderActions } from "@/lib/shop/order-actions";
import type { Address } from "@/types/account";
import type { ShippingMethod } from "@/types/shop-order";
import type { PaymentProviderId } from "@/types/shop-payment";

type Step = "shipping" | "billing" | "review" | "payment";

export default function CheckoutView() {
  const { t } = useLanguage();
  const router = useRouter();
  const account = useAccount();
  const { ownerId, lines, totals } = useCart();
  const { createOrder } = useOrderActions();

  // Guest Checkout — set once a signed-out shopper picks "Continue as
  // Guest" on the identity step below. Never forces /login or /signup.
  const [guestEmail, setGuestEmail] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("shipping");
  const [shippingAddress, setShippingAddress] = useState<Address | null>(account?.addresses.find((a) => a.isDefault) ?? null);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [paymentProviderId, setPaymentProviderId] = useState<PaymentProviderId>("interac");
  const [placing, setPlacing] = useState(false);

  if (lines.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-28 text-center">
        <p className="font-display text-3xl tracking-wide text-foreground">{t.checkout.emptyCartTitle}</p>
        <p className="text-sm text-foreground/60">{t.checkout.emptyCartMessage}</p>
        <Link href="/products">
          <PrimaryButton type="button">{t.checkout.emptyCartCta}</PrimaryButton>
        </Link>
      </div>
    );
  }

  // Neither signed in nor guest-checkout chosen yet — offer the choice
  // instead of redirecting to /login.
  if (!account && !guestEmail) {
    return <CheckoutIdentityStep onGuestContinue={setGuestEmail} />;
  }

  const effectiveBilling = billingSameAsShipping ? shippingAddress : billingAddress;

  function handlePlaceOrder() {
    if (!shippingAddress || !effectiveBilling) return;
    if (!account && !guestEmail) return;
    setPlacing(true);
    const order = createOrder({
      accountId: ownerId,
      guestEmail: account ? null : guestEmail,
      shippingAddress,
      billingAddress: effectiveBilling,
      shippingMethod,
      paymentProviderId,
    });
    setPlacing(false);
    if (order) router.push(`/checkout/confirmation/${order.id}`);
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-28 sm:px-8">
      <h1 className="font-display text-4xl tracking-wide text-foreground">{t.checkout.title}</h1>
      <CheckoutShell step={step} />

      <div className="mt-10">
        {step === "shipping" && (
          <ShippingStep
            account={account}
            selected={shippingAddress}
            onSelect={setShippingAddress}
            shippingMethod={shippingMethod}
            onShippingMethodChange={setShippingMethod}
            onContinue={() => setStep("billing")}
          />
        )}
        {step === "billing" && (
          <BillingStep
            account={account}
            sameAsShipping={billingSameAsShipping}
            onSameAsShippingChange={setBillingSameAsShipping}
            selected={billingAddress}
            onSelect={setBillingAddress}
            onBack={() => setStep("shipping")}
            onContinue={() => setStep("review")}
          />
        )}
        {step === "review" && shippingAddress && effectiveBilling && (
          <ReviewStep
            lines={lines}
            totals={totals}
            shippingAddress={shippingAddress}
            billingAddress={effectiveBilling}
            shippingMethod={shippingMethod}
            onEditStep={setStep}
            onBack={() => setStep("billing")}
            onContinue={() => setStep("payment")}
          />
        )}
        {step === "payment" && (
          <PaymentStep
            totals={totals}
            paymentProviderId={paymentProviderId}
            onPaymentProviderChange={setPaymentProviderId}
            placing={placing}
            onBack={() => setStep("review")}
            onPlaceOrder={handlePlaceOrder}
          />
        )}
      </div>
    </div>
  );
}
