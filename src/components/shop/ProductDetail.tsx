"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Droplet,
  Headset,
  Heart,
  Leaf,
  Minus,
  Percent,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Store,
  Tag,
  Weight,
} from "lucide-react";
import ProductBadges from "./ProductBadges";
import ProductGallery from "./ProductGallery";
import ProductReviews from "./ProductReviews";
import ShopCta from "./ShopCta";
import StarRating from "./StarRating";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCart, useWishlist } from "@/lib/shop/cart-actions";
import {
  getAverageRating,
  getCategoryLabel,
  getEffectivePrice,
  getStockStatus,
  getStrainLabel,
  isOnSale,
} from "@/lib/shop/product-engine";
import type { StorefrontProduct } from "@/types/product";

export default function ProductDetail({ product }: { product: StorefrontProduct }) {
  const { t, locale } = useLanguage();
  const { addItem } = useCart();
  const { toggle, isSaved } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const stockStatus = getStockStatus(product);
  const rating = getAverageRating(product);
  const saved = isSaved(product.id);

  function handleAdd() {
    addItem(product.id, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  const specs = [
    { key: "category", icon: Tag, label: t.productCatalog.detail.category, value: getCategoryLabel(product.category, locale) },
    product.strain && { key: "strain", icon: Leaf, label: t.productCatalog.detail.strain, value: getStrainLabel(product.strain, locale) },
    product.thcPercent !== null && { key: "thc", icon: Percent, label: t.productCatalog.detail.thc, value: `${product.thcPercent}%` },
    product.cbdPercent !== null && { key: "cbd", icon: Droplet, label: t.productCatalog.detail.cbd, value: `${product.cbdPercent}%` },
    product.weightGrams !== null && { key: "weight", icon: Weight, label: t.productCatalog.detail.weight, value: `${product.weightGrams} g` },
  ].filter(Boolean) as { key: string; icon: typeof Tag; label: string; value: string }[];

  const trustBadges = [
    { icon: ShieldCheck, label: t.productCatalog.detail.trustSecureCheckout },
    { icon: Store, label: t.productCatalog.detail.trustInStorePickup },
    { icon: Headset, label: t.productCatalog.detail.trustCustomerSupport },
  ];

  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,_#1a0f08_0%,_#050403_45%,_#000000_100%)]" />
      <div className="absolute inset-0 -z-20 bg-noise opacity-[0.035]" />
      <div className="pointer-events-none absolute -top-20 left-[8%] -z-10 h-72 w-72 animate-pulse-glow rounded-full bg-wb-red/10 blur-[120px]" />
      <div
        className="pointer-events-none absolute top-1/4 right-[4%] -z-10 h-80 w-80 animate-pulse-glow rounded-full bg-wb-orange/10 blur-[140px]"
        style={{ animationDelay: "1s" }}
      />

      <div className="mx-auto max-w-6xl px-5 py-28 sm:px-8">
        <Link href="/products" className="mb-8 inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors duration-250 hover:text-wb-orange">
          <ArrowLeft className="h-4 w-4" />
          {t.productCatalog.detail.backToShop}
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <ProductGallery images={product.images} fallbackLabel={product.category} />
          </Reveal>

          <Reveal delay={100}>
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40">{product.brand}</p>
            <h1 className="mt-2 font-display text-3xl tracking-wide text-foreground sm:text-4xl">{product.name}</h1>
            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={rating} size="md" />
            </div>
            <ProductBadges badges={product.badges} className="mt-4" />

            <div className="mt-6 flex items-baseline gap-3">
              {isOnSale(product) && <span className="text-lg text-foreground/40 line-through">${product.price.toFixed(2)}</span>}
              <span className="font-display text-4xl tracking-wide text-gradient-ember">${getEffectivePrice(product).toFixed(2)}</span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-foreground/70">{product.shortDescription}</p>

            {specs.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {specs.map(({ key, icon: Icon, label, value }) => (
                  <div
                    key={key}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-colors duration-250 hover:border-wb-orange/30 hover:bg-white/[0.05]"
                  >
                    <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/40">
                      <Icon className="h-3.5 w-3.5 text-wb-orange/70" strokeWidth={2} />
                      {label}
                    </dt>
                    <dd className="mt-1.5 text-sm font-semibold text-foreground/90">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {stockStatus === "out-of-stock" ? (
              <p className="mt-6 text-sm font-semibold text-wb-red">{t.productCatalog.detail.outOfStock}</p>
            ) : (
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center justify-between rounded-full border border-white/12 bg-white/[0.03] sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-12 w-12 items-center justify-center text-foreground/70 transition-colors duration-250 hover:text-wb-orange"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-foreground">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="flex h-12 w-12 items-center justify-center text-foreground/70 transition-colors duration-250 hover:text-wb-orange"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="group relative isolate flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow bg-[length:200%_100%] bg-left px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-black shadow-[0_10px_30px_-8px_rgba(244,103,15,0.6)] transition-[background-position,box-shadow,transform] duration-500 ease-out hover:scale-[1.02] hover:bg-right hover:shadow-[0_14px_38px_-6px_rgba(244,103,15,0.75)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {added ? t.productCatalog.detail.addedToCart : t.productCatalog.detail.addToCart}
                </button>
                <button
                  type="button"
                  onClick={() => toggle(product.id)}
                  aria-label={saved ? t.productCatalog.detail.removeFromWishlist : t.productCatalog.detail.addToWishlist}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-250 ${
                    saved
                      ? "border-wb-red bg-wb-red/10 text-wb-red shadow-[0_0_16px_-4px_rgba(224,32,46,0.6)]"
                      : "border-white/15 bg-white/[0.03] text-foreground/70 hover:border-wb-orange/50 hover:text-wb-orange"
                  }`}
                >
                  <Heart className="h-5 w-5" fill={saved ? "currentColor" : "none"} />
                </button>
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 gap-2.5 border-t border-white/10 pt-6 sm:grid-cols-3">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-xs text-foreground/60">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-wb-orange">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-16 sm:mt-20">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.productCatalog.detail.description}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/70">{product.description}</p>
          </div>
        </Reveal>

        <Reveal className="mt-10 sm:mt-12">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.productCatalog.detail.reviewsTitle}</h2>
            <div className="mt-6 max-w-2xl">
              <ProductReviews reviews={product.reviews} />
            </div>
          </div>
        </Reveal>

        <ShopCta />
      </div>
    </div>
  );
}
