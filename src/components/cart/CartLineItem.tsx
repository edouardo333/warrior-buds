"use client";

import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import SmartImage from "@/components/SmartImage";
import ProductImageFallback from "@/components/shop/ProductImageFallback";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCart } from "@/lib/shop/cart-actions";
import type { CartLine } from "@/lib/shop/cart-engine";
import { formatPrice } from "@/lib/shop/product-engine";

export default function CartLineItem({ line }: { line: CartLine }) {
  const { t, locale } = useLanguage();
  const { updateQuantity, removeItem } = useCart();
  // Undefined for an ordinary product — every call below passes it straight
  // through as the cart line's identity (types/cart.ts's
  // selectedFormatLabel), so a format-priced line only ever updates/removes
  // itself, never the sibling line of the same product in a different format.
  const formatLabel = line.selectedFormat?.label;

  return (
    <div className="flex items-center gap-4 border-b border-white/10 py-5 last:border-0">
      <Link href={`/products/${line.product.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10">
        <SmartImage
          src={line.product.images[0]?.url ?? ""}
          alt={line.product.name}
          fill
          sizes="80px"
          className="object-cover"
          fallback={<ProductImageFallback label={line.product.category} className="text-[8px]" />}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${line.product.slug}`}
          className="text-sm font-semibold leading-snug text-foreground transition-colors hover:text-wb-orange"
        >
          {line.product.name}
        </Link>
        {formatLabel ? (
          <p className="mt-1 text-xs font-semibold text-wb-orange">{t.cart.formatLabel(formatLabel)}</p>
        ) : (
          <p className="mt-1 text-xs text-foreground/50">{line.product.brand}</p>
        )}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center rounded-full border border-white/15">
            <button
              type="button"
              onClick={() => updateQuantity(line.product.id, line.quantity - 1, formatLabel)}
              className="flex h-8 w-8 items-center justify-center text-foreground/70 hover:text-wb-orange"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-7 text-center text-xs font-semibold text-foreground">{line.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(line.product.id, line.quantity + 1, formatLabel)}
              className="flex h-8 w-8 items-center justify-center text-foreground/70 hover:text-wb-orange"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button type="button" onClick={() => removeItem(line.product.id, formatLabel)} className="text-xs text-foreground/50 hover:text-wb-red">
            {t.cart.remove}
          </button>
        </div>
      </div>
      <p className="shrink-0 text-sm font-semibold text-foreground">{formatPrice(line.lineTotal, locale)}</p>
    </div>
  );
}
