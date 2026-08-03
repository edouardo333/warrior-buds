"use client";

import Link from "next/link";
import { CreditCard, Heart, MapPin, Package, Settings, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAccount } from "@/lib/shop/auth-actions";
import { useCustomerOrders } from "@/lib/shop/order-actions";
import { getOrderStatusLabel } from "@/lib/shop/order-engine";

const QUICK_LINKS = [
  { key: "profile", href: "/account/profile", icon: User },
  { key: "addresses", href: "/account/addresses", icon: MapPin },
  { key: "paymentMethods", href: "/account/payment-methods", icon: CreditCard },
  { key: "orders", href: "/account/orders", icon: Package },
  { key: "wishlist", href: "/wishlist", icon: Heart },
  { key: "settings", href: "/account/settings", icon: Settings },
] as const;

export default function AccountDashboard() {
  const { t, locale } = useLanguage();
  const account = useAccount();
  const orders = useCustomerOrders();
  const recentOrders = orders.slice(0, 3);

  if (!account) return null;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl tracking-wide text-foreground">{t.account.dashboard.welcomeBack(account.firstName)}</h1>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.account.dashboard.recentOrders}</h2>
          {orders.length > 0 && (
            <Link href="/account/orders" className="text-sm text-foreground/60 transition-colors hover:text-wb-orange">
              {t.account.dashboard.viewAllOrders}
            </Link>
          )}
        </div>
        {recentOrders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
            <p className="text-sm text-foreground/60">{t.account.dashboard.noOrders}</p>
            <Link href="/products" className="mt-4 inline-block rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105">
              {t.account.dashboard.shopNow}
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 transition-colors duration-200 hover:border-wb-orange/40"
                >
                  <div>
                    <p className="font-mono text-sm text-foreground/90">{order.id}</p>
                    <p className="mt-1 text-xs text-foreground/50">{getOrderStatusLabel(order.status, locale)}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">${order.total.toFixed(2)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.account.dashboard.quickLinks}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {QUICK_LINKS.map(({ key, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-6 text-center transition-colors duration-200 hover:border-wb-orange/40 hover:bg-white/[0.04]"
            >
              <Icon className="h-5 w-5 text-wb-orange" />
              <span className="text-sm font-medium text-foreground/85">{t.account.nav[key]}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
