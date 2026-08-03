"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
import SmartImage from "@/components/SmartImage";
import ProductImageFallback from "@/components/shop/ProductImageFallback";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCart } from "@/lib/shop/cart-actions";

export default function MiniCart() {
  const { t } = useLanguage();
  const { lines, totals, itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t.nav.cartItemsAria(itemCount)}
        className="relative flex h-9 w-9 items-center justify-center text-foreground/80 transition-colors hover:text-wb-orange"
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-wb-orange px-1 text-[10px] font-bold text-black">
            {itemCount}
          </span>
        )}
      </button>

      {open && (
        <div className="wb-dropdown-in absolute right-0 top-full z-50 mt-3 w-80 rounded-2xl border border-white/10 bg-wb-charcoal/95 p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <p className="mb-3 text-sm font-semibold text-foreground">{t.cart.miniCartTitle}</p>
          {lines.length === 0 ? (
            <p className="py-6 text-center text-sm text-foreground/50">{t.cart.empty}</p>
          ) : (
            <>
              <div className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
                {lines.map((line) => (
                  <div key={line.product.id} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10">
                      <SmartImage
                        src={line.product.images[0]?.url ?? ""}
                        alt={line.product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                        fallback={<ProductImageFallback label={line.product.category} className="text-[6px]" />}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground/90">{line.product.name}</p>
                      <p className="text-[11px] text-foreground/50">x{line.quantity}</p>
                    </div>
                    <p className="shrink-0 text-xs font-semibold text-foreground">${line.lineTotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                <span className="text-foreground/60">{t.cart.total}</span>
                <span className="font-semibold text-foreground">${totals.total.toFixed(2)}</span>
              </div>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="mt-4 block rounded-full border border-white/20 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:border-wb-orange/50 hover:text-wb-orange"
              >
                {t.cart.viewCart}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
