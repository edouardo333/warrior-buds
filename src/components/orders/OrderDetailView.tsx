"use client";

import { useEffect, useRef } from "react";
import PaymentInstructionsCard from "@/components/checkout/PaymentInstructionsCard";
import OrderTrackingTimeline from "./OrderTrackingTimeline";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAccount } from "@/lib/shop/auth-actions";
import { useOrder } from "@/lib/shop/order-actions";
import { getOrderStatusLabel } from "@/lib/shop/order-engine";
import { formatPrice } from "@/lib/shop/product-engine";
import { sendMockEmail } from "@/lib/shop/mock-email";
import type { EmailTemplateId } from "@/types/email";
import type { ShopOrderStatus } from "@/types/shop-order";

const EMAIL_BY_STATUS: Partial<Record<ShopOrderStatus, EmailTemplateId>> = {
  payment_received: "payment-received",
  processing: "order-processing",
  shipped: "order-shipped",
  delivered: "order-delivered",
};

export default function OrderDetailView({ orderId }: { orderId: string }) {
  const { t, locale } = useLanguage();
  const account = useAccount();
  const rawOrder = useOrder(orderId);
  // Security: useOrder() looks the id up across ALL customers' orders with
  // no ownership check (it's also used by the guest checkout confirmation
  // page, which has no account to scope to). This route is reached from
  // /account/orders/[id] behind AccountGuard, which only proves *someone*
  // is signed in, not that this order is theirs — so without this guard any
  // signed-in customer could read another customer's order (address, phone,
  // items, total, payment method) just by guessing/knowing its id. Treat a
  // mismatch exactly like "not found" rather than rendering it.
  const order = rawOrder && account && rawOrder.accountId === account.id ? rawOrder : undefined;
  const lastNotifiedStatus = useRef<string | null>(null);

  useEffect(() => {
    if (!order || !account) return;
    if (lastNotifiedStatus.current === order.status) return;
    lastNotifiedStatus.current = order.status;
    const templateId = EMAIL_BY_STATUS[order.status];
    if (!templateId) return;
    sendMockEmail(account.email, templateId, { orderId: order.id, total: formatPrice(order.total, locale) }, locale);
    if (templateId === "order-shipped" && order.canadaPostTrackingNumber) {
      sendMockEmail(account.email, "tracking-number", { orderId: order.id, trackingNumber: order.canadaPostTrackingNumber }, locale);
    }
  }, [order, account, locale]);

  if (!order) return null;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-foreground">{t.orderDetail.title}</h1>
          <p className="mt-1 font-mono text-sm text-foreground/60">{order.id}</p>
        </div>
        <p className="text-sm font-semibold text-wb-orange">{getOrderStatusLabel(order.status, locale)}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <OrderTrackingTimeline order={order} />
          </div>

          {order.status === "delivered" && <p className="text-sm text-wb-guardian-green">{t.orderDetail.orderComplete}</p>}

          {order.status === "pending_payment" && (
            <PaymentInstructionsCard providerId={order.paymentProviderId} orderId={order.id} total={order.total} />
          )}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.orderDetail.items}</h2>
            <div className="mt-4 flex flex-col gap-3">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-sm">
                  <span className="text-foreground/80">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-semibold text-foreground">{formatPrice(item.unitPrice * item.quantity, locale)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-foreground/60">{t.orderDetail.subtotal}</dt>
                <dd className="text-foreground">{formatPrice(order.subtotal, locale)}</dd>
              </div>
              {order.discount > 0 && order.promoCode && (
                <div className="flex justify-between text-wb-green">
                  <dt>{t.orderDetail.discount(order.promoCode)}</dt>
                  <dd>-{formatPrice(order.discount, locale)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-foreground/60">{t.orderDetail.shippingCost}</dt>
                <dd className="text-foreground">
                  {order.shippingCost === 0 ? t.cart.freeShipping : formatPrice(order.shippingCost, locale)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground/60">{t.orderDetail.tax}</dt>
                <dd className="text-foreground">{formatPrice(order.tax, locale)}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-white/10 pt-3 text-base font-semibold">
                <dt className="text-foreground">{t.orderDetail.total}</dt>
                <dd className="text-foreground">{formatPrice(order.total, locale)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/50">{t.orderDetail.shippingAddress}</h3>
            <p className="mt-2 text-foreground/80">{order.shippingAddress.fullName}</p>
            <p className="text-foreground/60">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
            </p>
            <p className="text-foreground/60">
              {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
            </p>
            <p className="mt-3 text-xs text-foreground/50">
              {t.orderDetail.shippingMethod}: {t.orderDetail.shippingMethods[order.shippingMethod]}
            </p>
            <p className="mt-1 text-xs text-foreground/50">
              {t.orderDetail.trackingNumber}: {order.canadaPostTrackingNumber ?? t.orderDetail.trackingPending}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
