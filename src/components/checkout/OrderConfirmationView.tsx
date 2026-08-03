"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import InteracPaymentCard from "./InteracPaymentCard";
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
    if (order && account && !emailSent.current) {
      emailSent.current = true;
      sendMockEmail(account.email, "order-confirmation", { orderId: order.id, total: order.total.toFixed(2) }, locale);
    }
  }, [order, account, locale]);

  if (!order) return null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-28 text-center sm:px-8">
      <p className="font-display text-4xl tracking-wide text-foreground">{t.checkout.confirmation.title}</p>
      <p className="mt-4 text-foreground/70">{t.checkout.confirmation.thankYou(order.id)}</p>
      <p className="mt-2 text-sm text-foreground/50">{t.checkout.confirmation.whatNext}</p>

      {order.paymentProviderId === "interac" && (
        <div className="mt-8 text-left">
          <InteracPaymentCard orderId={order.id} total={order.total} />
        </div>
      )}

      <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
        <Link href={`/account/orders/${order.id}`}>
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
