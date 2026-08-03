"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import SmartImage from "@/components/SmartImage";
import ProductBadges from "./ProductBadges";
import ProductImageFallback from "./ProductImageFallback";
import StarRating from "./StarRating";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCart, useWishlist } from "@/lib/shop/cart-actions";
import { getAverageRating, getEffectivePrice, getStockStatus, isOnSale } from "@/lib/shop/product-engine";
import type { StorefrontProduct } from "@/types/product";

export default function ProductCard({ product }: { product: StorefrontProduct }) {
  const { t } = useLanguage();
  const { addItem } = useCart();
  const { toggle, isSaved } = useWishlist();
  const stockStatus = getStockStatus(product);
  const rating = getAverageRating(product);
  const saved = isSaved(product.id);

  return (
    <div className="wb-product-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.015] shadow-[0_16px_40px_-24px_rgba(0,0,0,0.7)] hover:border-wb-orange/40 hover:shadow-[0_24px_60px_-24px_rgba(244,103,15,0.35)]">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden">
        <SmartImage
          src={product.images[0]?.url ?? ""}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="wb-product-card__image object-cover"
          fallback={<ProductImageFallback label={product.category} className="text-base" />}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-250 group-hover:opacity-100" />
        <ProductBadges badges={product.badges} className="absolute left-3 top-3 z-10" />
      </Link>
      <button
        type="button"
        onClick={() => toggle(product.id)}
        aria-label={saved ? t.productCatalog.detail.removeFromWishlist : t.productCatalog.detail.addToWishlist}
        className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-250 ${
          saved
            ? "border-wb-red/50 bg-wb-red/80 text-white shadow-[0_0_16px_-2px_rgba(224,32,46,0.7)]"
            : "border-white/15 bg-black/40 text-white/80 hover:border-wb-orange/40 hover:bg-black/60 hover:text-wb-orange"
        }`}
      >
        <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/40">{product.brand}</p>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors duration-250 hover:text-wb-orange"
        >
          {product.name}
        </Link>
        <StarRating rating={rating} />
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="flex items-baseline gap-2">
            {isOnSale(product) && <span className="text-xs text-foreground/40 line-through">${product.price.toFixed(2)}</span>}
            <span className="text-lg font-semibold text-foreground">${getEffectivePrice(product).toFixed(2)}</span>
          </div>
          <button
            type="button"
            disabled={stockStatus === "out-of-stock"}
            onClick={() => addItem(product.id, 1)}
            aria-label={t.productCatalog.card.addToCart}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow text-black shadow-[0_6px_20px_-6px_rgba(244,103,15,0.6)] transition-all duration-250 hover:scale-110 hover:shadow-[0_8px_26px_-4px_rgba(244,103,15,0.75)] active:scale-95 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
        {stockStatus === "out-of-stock" && <p className="text-xs font-medium text-wb-red">{t.productCatalog.card.outOfStock}</p>}
        {stockStatus === "low-stock" && <p className="text-xs font-medium text-wb-yellow">{t.productCatalog.card.lowStock}</p>}
      </div>
    </div>
  );
}
