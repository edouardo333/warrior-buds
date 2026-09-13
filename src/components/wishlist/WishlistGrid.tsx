"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import SmartImage from "@/components/SmartImage";
import ProductImageFallback from "@/components/shop/ProductImageFallback";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useWishlist } from "@/lib/shop/cart-actions";
import { formatPrice, getEffectivePrice } from "@/lib/shop/product-engine";

export default function WishlistGrid() {
  const { t, locale } = useLanguage();
  const { items, toggle, moveToCart } = useWishlist();

  return (
    <div className="mx-auto max-w-6xl px-5 py-28 sm:px-8">
      <h1 className="font-display text-4xl tracking-wide text-foreground">{t.wishlist.title}</h1>
      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
          <p className="text-sm text-foreground/60">{t.wishlist.empty}</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105"
          >
            {t.wishlist.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <div key={product.id} className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden">
                <SmartImage
                  src={product.images[0]?.url ?? ""}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                  fallback={<ProductImageFallback label={product.category} className="text-lg" />}
                />
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-semibold text-foreground hover:text-wb-orange">
                  {product.name}
                </Link>
                <p className="text-sm font-semibold text-foreground/80">{formatPrice(getEffectivePrice(product), locale)}</p>
                <div className="mt-auto flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => moveToCart(product.id)}
                    className="flex-1 rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-3 py-2 text-xs font-semibold uppercase tracking-wide text-black transition-transform hover:scale-105"
                  >
                    {t.wishlist.moveToCart}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(product.id)}
                    aria-label={t.wishlist.remove}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-foreground/60 hover:border-wb-red/50 hover:text-wb-red"
                  >
                    <Heart className="h-4 w-4" fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
