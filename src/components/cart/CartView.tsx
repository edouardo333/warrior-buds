"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CartLineItem from "./CartLineItem";
import OrderSummary from "./OrderSummary";
import { PrimaryButton } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCart } from "@/lib/shop/cart-actions";

export default function CartView() {
  const { t } = useLanguage();
  const router = useRouter();
  const { lines, totals } = useCart();

  return (
    <div className="mx-auto max-w-5xl px-5 py-28 sm:px-8">
      <h1 className="font-display text-4xl tracking-wide text-foreground">{t.cart.title}</h1>
      {lines.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
          <p className="text-sm text-foreground/60">{t.cart.empty}</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105"
          >
            {t.cart.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6">
            {lines.map((line) => (
              <CartLineItem key={line.product.id} line={line} />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <OrderSummary totals={totals}>
              <PrimaryButton type="button" onClick={() => router.push("/checkout")} className="mt-6 w-full">
                {t.cart.checkout}
              </PrimaryButton>
            </OrderSummary>
            <Link href="/products" className="text-center text-sm text-foreground/60 transition-colors hover:text-wb-orange">
              {t.cart.continueShopping}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
