"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import SmartImage from "@/components/SmartImage";
import ProductBadges from "./ProductBadges";
import ProductImageFallback from "./ProductImageFallback";
import StarRating from "./StarRating";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCart, useWishlist } from "@/lib/shop/cart-actions";
import { formatPrice, getAverageRating, getCategoryLabel, getEffectivePrice, getInfoPricingFloor, getStockStatus, isFormatPriced, isOnSale, isPriceOnRequest } from "@/lib/shop/product-engine";
import type { StorefrontProduct } from "@/types/product";

export default function ProductCard({ product }: { product: StorefrontProduct }) {
  const { t, locale } = useLanguage();
  const { addItem } = useCart();
  const { toggle, isSaved } = useWishlist();
  const stockStatus = getStockStatus(product);
  const rating = getAverageRating(product);
  const saved = isSaved(product.id);
  // Format-priced products (verified format/size pricing, e.g. regulated
  // cannabis flower — types/product.ts's ProductFormat) require picking a
  // format before Add to Cart is valid, and there's no format selector on
  // this card — so no quick-add-to-cart or wishlist toggle here; shoppers
  // pick a format and add to cart from the product page instead (see
  // ProductDetail.tsx). See product-engine.ts's isFormatPriced header.
  const formatPriced = isFormatPriced(product);
  // No verified price yet (types/product.ts's priceOnRequest): shows the
  // "price on request" wording instead of a price, and — like format-priced
  // products — no quick-add or wishlist control.
  const priceOnRequest = isPriceOnRequest(product);
  const noQuickActions = formatPriced || priceOnRequest;
  // A tall infographic image is letterboxed whole instead of cropped by the
  // 4:5 card frame (types/product.ts's ProductImage.portrait / aspectRatio).
  const portraitImage = Boolean(product.images[0]?.portrait || product.images[0]?.aspectRatio);

  return (
    <div className="wb-product-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.015] shadow-[0_16px_40px_-24px_rgba(0,0,0,0.7)] hover:border-wb-orange/40 hover:shadow-[0_24px_60px_-24px_rgba(244,103,15,0.35)]">
      <Link href={`/products/${product.slug}`} className={`relative block aspect-[4/5] overflow-hidden${portraitImage ? " bg-black" : ""}`}>
        <SmartImage
          src={product.images[0]?.url ?? ""}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`wb-product-card__image ${portraitImage ? "object-contain" : "object-cover"}`}
          fallback={<ProductImageFallback label={product.category} className="text-base" />}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-250 group-hover:opacity-100" />
        <ProductBadges badges={product.badges} className="absolute left-3 top-3 z-10" />
      </Link>
      {!noQuickActions && (
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
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Eyebrow: brand, then grade, then (for a product with neither, e.g.
            cigarettes) the category label — never blank when a product has
            no brand/grade, and unchanged for every existing product since
            they all already set one of the first two. */}
        <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
          {product.brand ?? product.grade ?? getCategoryLabel(product.category, locale)}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors duration-250 hover:text-wb-orange"
        >
          {product.name}
        </Link>
        <StarRating rating={rating} />
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="flex items-baseline gap-2">
            {isOnSale(product) && <span className="text-xs text-foreground/40 line-through">{formatPrice(product.price, locale)}</span>}
            <span className="text-lg font-semibold text-foreground">
              {priceOnRequest
                ? product.infoPricing && product.infoPricing.length > 0
                  ? t.productCatalog.card.startingFrom(formatPrice(getInfoPricingFloor(product.infoPricing), locale))
                  : t.productCatalog.card.priceOnRequest
                : formatPriced
                  ? t.productCatalog.card.startingFrom(formatPrice(getEffectivePrice(product), locale))
                  : formatPrice(getEffectivePrice(product), locale)}
            </span>
          </div>
          {!noQuickActions && (
            <button
              type="button"
              disabled={stockStatus === "out-of-stock"}
              onClick={() => addItem(product.id, 1)}
              aria-label={t.productCatalog.card.addToCart}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow text-black shadow-[0_6px_20px_-6px_rgba(244,103,15,0.6)] transition-all duration-250 hover:scale-110 hover:shadow-[0_8px_26px_-4px_rgba(244,103,15,0.75)] active:scale-95 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
        {stockStatus === "out-of-stock" && <p className="text-xs font-medium text-wb-red">{t.productCatalog.card.outOfStock}</p>}
        {stockStatus === "low-stock" && <p className="text-xs font-medium text-wb-yellow">{t.productCatalog.card.lowStock}</p>}
      </div>
    </div>
  );
}
