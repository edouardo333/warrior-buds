"use client";

import { useState, type FormEvent } from "react";
import OrderTrackingTimeline from "./OrderTrackingTimeline";
import PaymentInstructionsCard from "@/components/checkout/PaymentInstructionsCard";
import { FormField, PrimaryButton, fieldClass } from "@/components/forms/FormField";
import { findAccountById } from "@/data/shop/account-store";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { findOrderForTracking } from "@/lib/shop/order-actions";
import { getOrderStatusLabel } from "@/lib/shop/order-engine";
import type { ShopOrder } from "@/types/shop-order";

export default function TrackOrderView() {
  const { t, locale } = useLanguage();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<ShopOrder | null | undefined>(undefined);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const order = findOrderForTracking(orderNumber, email, findAccountById);
    setResult(order ?? null);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-28 sm:px-8">
      <h1 className="font-display text-4xl tracking-wide text-foreground">{t.trackOrder.title}</h1>
      <p className="mt-2 text-sm text-foreground/60">{t.trackOrder.subtitle}</p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:flex-row sm:items-end sm:gap-4"
      >
        <FormField label={t.trackOrder.orderNumber} htmlFor="track-order-number">
          <input
            id="track-order-number"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className={`${fieldClass()} font-mono`}
          />
        </FormField>
        <FormField label={t.trackOrder.email} htmlFor="track-email">
          <input id="track-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass()} />
        </FormField>
        <PrimaryButton type="submit" className="shrink-0">
          {t.trackOrder.submit}
        </PrimaryButton>
      </form>

      {result === null && <p className="mt-6 text-sm text-wb-red">{t.trackOrder.notFound}</p>}

      {result && (
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm text-foreground/90">{result.id}</p>
            <p className="text-sm font-semibold text-wb-orange">{getOrderStatusLabel(result.status, locale)}</p>
          </div>
          <div className="mt-6">
            <OrderTrackingTimeline order={result} />
          </div>
          {result.status === "pending_payment" && (
            <div className="mt-6">
              <PaymentInstructionsCard providerId={result.paymentProviderId} orderId={result.id} total={result.total} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
