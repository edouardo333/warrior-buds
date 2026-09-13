"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import PaymentInstructionsCard from "./PaymentInstructionsCard";
import { PrimaryButton, SecondaryButton } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAccount } from "@/lib/shop/auth-actions";
import { useOrder } from "@/lib/shop/order-actions";
import { sendMockEmail } from "@/lib/shop/mock-email";

export default function OrderConfirmationView({ orderId }: { orderId: string }) {
  const { t, locale } = useLanguage();
  const account = useAccount();
  const order = useOrder(orderId);
  const emailSent = useRef(false);

  useEffect(() => {
    if (!order || emailSent.current) return;
    // Signed-in accounts use their account email; guest orders carry their
    // own contact email (no CustomerAccount exists for them).
    const recipient = account?.email ?? order.guestEmail;
    if (!recipient) return;
    emailSent.current = true;
    // The template wraps this value in its own literal "$" (en: `$${total}`,
    // fr: `${total} $`), so we format the number with the locale's decimal
    // separator only — formatPrice() would add a second currency symbol.
    const formattedTotal = order.total.toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    sendMockEmail(recipient, "order-confirmation", { orderId: order.id, total: formattedTotal }, locale);
  }, [order, account, locale]);

  if (!order) return null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-28 text-center sm:px-8">
      <p className="font-display text-4xl tracking-wide text-foreground">{t.checkout.confirmation.title}</p>
      <p className="mt-4 text-foreground/70">{t.checkout.confirmation.thankYou(order.id)}</p>
      <p className="mt-2 text-sm text-foreground/50">{t.checkout.confirmation.whatNext}</p>

      <div className="mt-8 text-left">
        <PaymentInstructionsCard providerId={order.paymentProviderId} orderId={order.id} total={order.total} />
      </div>

      <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
        <Link href={account ? `/account/orders/${order.id}` : "/track-order"}>
          <PrimaryButton type="button" className="w-full sm:w-auto">
            {t.checkout.confirmation.viewOrder}
          </PrimaryButton>
        </Link>
        <Link href="/products">
          <SecondaryButton type="button" className="w-full sm:w-auto">
            {t.checkout.confirmation.continueShopping}
          </SecondaryButton>
        </Link>
      </div>
    </div>
  );
}
