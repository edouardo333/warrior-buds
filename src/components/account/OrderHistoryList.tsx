"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCustomerOrders } from "@/lib/shop/order-actions";
import { getOrderStatusLabel } from "@/lib/shop/order-engine";
import { formatPrice } from "@/lib/shop/product-engine";

export default function OrderHistoryList() {
  const { t, locale } = useLanguage();
  const orders = useCustomerOrders();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl tracking-wide text-foreground">{t.account.orders.title}</h1>
      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-sm text-foreground/60">{t.account.orders.empty}</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105"
          >
            {t.account.orders.shopNow}
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-widest text-foreground/50">
                <th className="pb-3 pr-4">{t.account.orders.orderNumber}</th>
                <th className="pb-3 pr-4">{t.account.orders.placedOn}</th>
                <th className="pb-3 pr-4">{t.account.orders.status}</th>
                <th className="pb-3 pr-4">{t.account.orders.total}</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-white/5">
                  <td className="py-3 pr-4 font-mono text-foreground/90">{order.id}</td>
                  <td className="py-3 pr-4 text-foreground/60">{new Date(order.createdAt).toLocaleDateString(locale)}</td>
                  <td className="py-3 pr-4 text-foreground/60">{getOrderStatusLabel(order.status, locale)}</td>
                  <td className="py-3 pr-4 font-semibold text-foreground">{formatPrice(order.total, locale)}</td>
                  <td className="py-3 text-right">
                    <Link href={`/account/orders/${order.id}`} className="text-wb-orange hover:underline">
                      {t.account.orders.viewDetails}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
