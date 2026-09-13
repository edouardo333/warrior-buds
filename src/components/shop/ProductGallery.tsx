"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn } from "lucide-react";
import SmartImage from "@/components/SmartImage";
import ProductImageFallback from "./ProductImageFallback";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ProductImage } from "@/types/product";

// Shared by every Product Detail page (Whole Melts and the flower products
// alike) so the click-to-enlarge lightbox is implemented once here instead
// of duplicated per product. Shows only the currently active image (the
// same one already selected via the thumbnail strip below) — no separate
// gallery navigation inside the lightbox.
export default function ProductGallery({ images, fallbackLabel }: { images: ProductImage[]; fallbackLabel: string }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const current = images[active];
  const imageLabel = current?.alt ?? fallbackLabel;

  // Escape-to-close, background scroll lock (with scroll position restored
  // on close), and focus management (close button focused on open, focus
  // returned to the trigger on close) — all cleaned up together whenever
  // the lightbox closes or this component unmounts.
  useEffect(() => {
    if (!lightboxOpen) return;
    const trigger = triggerRef.current;
    const previouslyFocused = (document.activeElement as HTMLElement | null) ?? trigger;
    const scrollY = window.scrollY;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
      (previouslyFocused ?? trigger)?.focus();
    };
  }, [lightboxOpen]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative isolate overflow-hidden rounded-[1.75rem]">
        <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-wb-orange/15 via-wb-red/10 to-transparent blur-2xl" />
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={t.productCatalog.detail.enlargeImage(imageLabel)}
          className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.02] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.75)]"
        >
          <SmartImage
            src={current?.url ?? ""}
            alt={imageLabel}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            fallback={<ProductImageFallback label={fallbackLabel} className="text-2xl" />}
          />
          <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] shadow-[inset_0_0_60px_rgba(0,0,0,0.35)]" />
          <span className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/80 opacity-0 transition-opacity duration-250 group-hover:opacity-100 group-focus-visible:opacity-100">
            <ZoomIn className="h-4 w-4" strokeWidth={2} />
          </span>
        </button>
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

      {lightboxOpen &&
        createPortal(
          // Portaled straight to <body>: ProductDetail renders this gallery
          // inside a Reveal wrapper (components/Reveal.tsx), whose mount
          // animation sets a non-"none" CSS `translate` on that ancestor —
          // which (like `transform`) establishes its own containing block
          // for `position: fixed` descendants. Left un-portaled, this dialog
          // would size/position itself against that small wrapper box
          // instead of the viewport. Portaling escapes it entirely.
          <div role="dialog" aria-modal="true" aria-label={imageLabel} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <button
              type="button"
              aria-label={t.productCatalog.detail.closeImage}
              onClick={() => setLightboxOpen(false)}
              className="absolute inset-0 cursor-zoom-out bg-black/90 backdrop-blur-sm"
            />
            <button
              ref={closeButtonRef}
              type="button"
              aria-label={t.productCatalog.detail.closeImage}
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white/90 transition-colors duration-250 hover:border-wb-orange/50 hover:text-wb-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-wb-orange/60"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
            <div onClick={(e) => e.stopPropagation()} className="relative z-[5] h-[90vh] w-[90vw] max-h-[90vh] max-w-[90vw]">
              <SmartImage
                src={current?.url ?? ""}
                alt={imageLabel}
                fill
                sizes="90vw"
                className="object-contain"
                fallback={<ProductImageFallback label={fallbackLabel} className="text-2xl" />}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
