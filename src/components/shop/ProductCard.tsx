"use client";

import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SmartImage from "@/components/SmartImage";
import ProductBadges from "./ProductBadges";
import ProductImageFallback from "./ProductImageFallback";
import StarRating from "./StarRating";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatBoxPrice, formatPrice, getAverageRating, getCategoryLabel, getEffectivePrice, getInfoPricingFloor, getStockStatus, isFormatPriced, isOnSale, isPriceOnRequest } from "@/lib/shop/product-engine";
import type { StorefrontProduct } from "@/types/product";

// Memoized: product objects come straight from the store and keep their
// identity, so "Load more" or a search keystroke only renders cards that
// actually changed instead of every mounted card.
export default memo(function ProductCard({ product }: { product: StorefrontProduct }) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const href = `/products/${product.slug}`;
  // Viewport prefetch is off for card links: each card entering the viewport
  // fired ~4 route-segment requests, so scrolling the catalog on a phone
  // queued hundreds of them in front of the product images. The route is
  // prefetched on intent instead — pointerenter fires on desktop hover and
  // on touch before the tap's click, focus covers keyboard users.
  const prefetch = () => router.prefetch(href);
  const stockStatus = getStockStatus(product);
  const rating = getAverageRating(product);
  // Format-priced and "price on request" products show a "starting from"
  // or "price on request" line instead of a single price.
  const formatPriced = isFormatPriced(product);
  const priceOnRequest = isPriceOnRequest(product);
  // A tall infographic image is letterboxed whole instead of cropped by the
  // 4:5 card frame (types/product.ts's ProductImage.portrait / aspectRatio).
  const portraitImage = Boolean(product.images[0]?.portrait || product.images[0]?.aspectRatio);
  // Plain price line for Telegram-ordered products: the box price, or
  // "From $X" for a telegramOrder product priced by its display-only
  // infoPricing tiers. Shown as text only — the whole card links to the
  // detail page, which carries the Telegram contact CTA.
  const priceLabel = product.boxPricing
    ? t.productCatalog.card.boxPrice(formatBoxPrice(product.boxPricing.price, locale), product.boxPricing.quantity)
    : product.telegramOrder && product.infoPricing && product.infoPricing.length > 0
      ? t.productCatalog.card.startingFrom(formatPrice(getInfoPricingFloor(product.infoPricing), locale))
      : null;

  return (
    <div
      onPointerEnter={prefetch}
      onFocus={prefetch}
      className="wb-product-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.015] shadow-[0_16px_40px_-24px_rgba(0,0,0,0.7)] hover:border-wb-orange/40 hover:shadow-[0_24px_60px_-24px_rgba(244,103,15,0.35)]"
    >
      <Link href={href} prefetch={false} className={`relative block aspect-[4/5] overflow-hidden${portraitImage ? " bg-black" : ""}`}>
        {/* Last size: the grid stops growing at max-w-7xl, so wide screens
            get a ~300px card, not a quarter of the viewport. */}
        <SmartImage
          src={product.images[0]?.url ?? ""}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 300px"
          className={`wb-product-card__image ${portraitImage ? "object-contain" : "object-cover"}`}
          fallback={<ProductImageFallback label={product.category} className="text-base" />}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-250 group-hover:opacity-100" />
        <ProductBadges badges={product.badges} className="absolute left-3 top-3 z-10" />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Eyebrow: brand, then grade, then (for a product with neither, e.g.
            cigarettes) the category label — never blank when a product has
            no brand/grade, and unchanged for every existing product since
            they all already set one of the first two. */}
        {/* tracking-wider below sm: at widest, a single long word like
            "CONCENTRATES" overran a 320px phone's 2-column card. */}
        <p className="break-words text-[11px] font-semibold uppercase tracking-wider text-foreground/40 sm:tracking-widest">
          {product.brand ?? product.grade ?? getCategoryLabel(product.category, locale)}
        </p>
        <Link
          href={href}
          prefetch={false}
          className="line-clamp-3 text-sm font-semibold leading-snug text-foreground transition-colors duration-250 hover:text-wb-orange"
        >
          {product.name}
        </Link>
        <StarRating rating={rating} />
        {priceLabel ? (
          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <span className="text-balance text-base font-semibold leading-snug text-foreground sm:text-lg">{priceLabel}</span>
          </div>
        ) : (
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
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
            {product.priceUnit && !priceOnRequest && !formatPriced && (
              <span className="whitespace-nowrap text-xs font-semibold text-foreground/60">/ {product.priceUnit[locale]}</span>
            )}
          </div>
        </div>
        )}
        {stockStatus === "out-of-stock" && <p className="text-xs font-medium text-wb-red">{t.productCatalog.card.outOfStock}</p>}
        {stockStatus === "low-stock" && <p className="text-xs font-medium text-wb-yellow">{t.productCatalog.card.lowStock}</p>}
      </div>
    </div>
  );
});
