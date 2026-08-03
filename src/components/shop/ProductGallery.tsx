"use client";

import { useState } from "react";
import SmartImage from "@/components/SmartImage";
import ProductImageFallback from "./ProductImageFallback";
import type { ProductImage } from "@/types/product";

export default function ProductGallery({ images, fallbackLabel }: { images: ProductImage[]; fallbackLabel: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <SmartImage
          src={current?.url ?? ""}
          alt={current?.alt ?? fallbackLabel}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          fallback={<ProductImageFallback label={fallbackLabel} className="text-2xl" />}
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, i) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition-colors ${
                i === active ? "border-wb-orange" : "border-white/10"
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
