"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Heart, Minus, Plus } from "lucide-react";
import ProductBadges from "./ProductBadges";
import ProductGallery from "./ProductGallery";
import ProductReviews from "./ProductReviews";
import StarRating from "./StarRating";
import { PrimaryButton } from "@/components/forms/FormField";
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

  return (
    <div className="mx-auto max-w-6xl px-5 py-28 sm:px-8">
      <Link href="/products" className="mb-8 inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors hover:text-wb-orange">
        <ArrowLeft className="h-4 w-4" />
        {t.productCatalog.detail.backToShop}
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} fallbackLabel={product.category} />

        <div>
          <p className="text-xs uppercase tracking-widest text-foreground/40">{product.brand}</p>
          <h1 className="mt-2 font-display text-3xl tracking-wide text-foreground sm:text-4xl">{product.name}</h1>
          <div className="mt-3">
            <StarRating rating={rating} size="md" />
          </div>
          <ProductBadges badges={product.badges} className="mt-4" />

          <div className="mt-6 flex items-baseline gap-3">
            {isOnSale(product) && <span className="text-lg text-foreground/40 line-through">${product.price.toFixed(2)}</span>}
            <span className="text-3xl font-semibold text-foreground">${getEffectivePrice(product).toFixed(2)}</span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-foreground/70">{product.shortDescription}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-widest text-foreground/40">{t.productCatalog.detail.category}</dt>
              <dd className="mt-1 text-foreground/85">{getCategoryLabel(product.category, locale)}</dd>
            </div>
            {product.strain && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-foreground/40">{t.productCatalog.detail.strain}</dt>
                <dd className="mt-1 text-foreground/85">{getStrainLabel(product.strain, locale)}</dd>
              </div>
            )}
            {product.thcPercent !== null && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-foreground/40">{t.productCatalog.detail.thc}</dt>
                <dd className="mt-1 text-foreground/85">{product.thcPercent}%</dd>
              </div>
            )}
            {product.cbdPercent !== null && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-foreground/40">{t.productCatalog.detail.cbd}</dt>
                <dd className="mt-1 text-foreground/85">{product.cbdPercent}%</dd>
              </div>
            )}
            {product.weightGrams !== null && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-foreground/40">{t.productCatalog.detail.weight}</dt>
                <dd className="mt-1 text-foreground/85">{product.weightGrams} g</dd>
              </div>
            )}
          </dl>

          {stockStatus === "out-of-stock" ? (
            <p className="mt-6 text-sm font-semibold text-wb-red">{t.productCatalog.detail.outOfStock}</p>
          ) : (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-white/15">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center text-foreground/70 hover:text-wb-orange"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-foreground">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="flex h-10 w-10 items-center justify-center text-foreground/70 hover:text-wb-orange"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <PrimaryButton type="button" onClick={handleAdd} className="flex-1">
                {added ? t.productCatalog.detail.addedToCart : t.productCatalog.detail.addToCart}
              </PrimaryButton>
              <button
                type="button"
                onClick={() => toggle(product.id)}
                aria-label={saved ? t.productCatalog.detail.removeFromWishlist : t.productCatalog.detail.addToWishlist}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  saved ? "border-wb-red bg-wb-red/10 text-wb-red" : "border-white/15 text-foreground/70 hover:border-wb-orange/50 hover:text-wb-orange"
                }`}
              >
                <Heart className="h-5 w-5" fill={saved ? "currentColor" : "none"} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.productCatalog.detail.description}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/70">{product.description}</p>
      </div>

      <div className="mt-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.productCatalog.detail.reviewsTitle}</h2>
        <div className="mt-6 max-w-2xl">
          <ProductReviews reviews={product.reviews} />
        </div>
      </div>
    </div>
  );
}
