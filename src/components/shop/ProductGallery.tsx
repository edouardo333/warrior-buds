"use client";

import { useState } from "react";
import SmartImage from "@/components/SmartImage";
import ProductImageFallback from "./ProductImageFallback";
import type { ProductImage } from "@/types/product";

export default function ProductGallery({ images, fallbackLabel }: { images: ProductImage[]; fallbackLabel: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative isolate overflow-hidden rounded-[1.75rem]">
        <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-wb-orange/15 via-wb-red/10 to-transparent blur-2xl" />
        <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.02] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.75)]">
          <SmartImage
            src={current?.url ?? ""}
            alt={current?.alt ?? fallbackLabel}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            fallback={<ProductImageFallback label={fallbackLabel} className="text-2xl" />}
          />
          <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] shadow-[inset_0_0_60px_rgba(0,0,0,0.35)]" />
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2.5">
          {images.map((image, i) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={image.alt}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition-all duration-250 ${
                i === active
                  ? "border-wb-orange shadow-[0_0_16px_-2px_rgba(244,103,15,0.6)]"
                  : "border-white/10 opacity-60 hover:border-white/25 hover:opacity-100"
              }`}
            >
              <SmartImage
                src={image.url}
                alt={image.alt}
                fill
                sizes="64px"
                className="object-cover"
                fallback={<ProductImageFallback label={fallbackLabel} className="text-[8px]" />}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
