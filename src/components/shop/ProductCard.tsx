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
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors duration-200 hover:border-wb-orange/40">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden">
        <SmartImage
          src={product.images[0]?.url ?? ""}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fallback={<ProductImageFallback label={product.category} className="text-lg" />}
        />
        <ProductBadges badges={product.badges} className="absolute left-3 top-3" />
      </Link>
      <button
        type="button"
        onClick={() => toggle(product.id)}
        aria-label={saved ? t.productCatalog.detail.removeFromWishlist : t.productCatalog.detail.addToWishlist}
        className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
          saved ? "bg-wb-red/80 text-white" : "bg-black/40 text-white/80 hover:bg-black/60"
        }`}
      >
        <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-widest text-foreground/40">{product.brand}</p>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-wb-orange"
        >
          {product.name}
        </Link>
        <StarRating rating={rating} />
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            {isOnSale(product) && <span className="text-xs text-foreground/40 line-through">${product.price.toFixed(2)}</span>}
            <span className="text-base font-semibold text-foreground">${getEffectivePrice(product).toFixed(2)}</span>
          </div>
          <button
            type="button"
            disabled={stockStatus === "out-of-stock"}
            onClick={() => addItem(product.id, 1)}
            aria-label={t.productCatalog.card.addToCart}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow text-black transition-transform duration-200 hover:scale-105 disabled:pointer-events-none disabled:opacity-40"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
        {stockStatus === "out-of-stock" && <p className="text-xs text-wb-red">{t.productCatalog.card.outOfStock}</p>}
        {stockStatus === "low-stock" && <p className="text-xs text-wb-yellow">{t.productCatalog.card.lowStock}</p>}
      </div>
    </div>
  );
}
