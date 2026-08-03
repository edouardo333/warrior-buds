"use client";

import { MapPin, Phone } from "lucide-react";
import SmartImage from "./SmartImage";
import Reveal from "./Reveal";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ReviewsStoreCta() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-black px-5 py-18 sm:px-8 lg:py-20">
      <div className="absolute inset-0">
        <SmartImage
          src="/images/hero/hero-outside-night.webp"
          alt="Warrior Buds dispensary storefront at night"
          fill
          sizes="100vw"
          className="object-cover object-[center_35%]"
          fallback={
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#2a1206_0%,_#150a04_55%,_#000000_100%)]">
              <div className="absolute inset-0 bg-noise opacity-[0.05]" />
            </div>
          }
        />
      </div>
      <div className="absolute inset-0 bg-black/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/45" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[38rem] -translate-x-1/2 rounded-full bg-wb-orange/10 blur-[140px]" />

      <Reveal className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-wb-orange">
          {t.reviews.storeCta.label}
        </p>
        <h2 className="mt-3 font-display text-3xl tracking-wide text-foreground sm:text-4xl">
          {t.reviews.storeCta.titlePrefix}{" "}
          <span className="text-gradient-ember">{t.reviews.storeCta.titleHighlight}</span>?
        </h2>
        <p className="mt-3 max-w-md text-sm text-foreground/60 sm:text-base">
          {t.reviews.storeCta.subtitle}
        </p>

        <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-medium text-foreground/70 sm:text-sm">
          <span>{t.reviews.storeCta.infoLocation}</span>
          <span className="text-foreground/25">·</span>
          <span>{t.reviews.storeCta.infoHours}</span>
          <span className="text-foreground/25">·</span>
          <span>{t.reviews.storeCta.infoPickup}</span>
        </div>

        <div className="mt-7 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href={SITE.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow bg-[length:200%_100%] bg-left px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-black transition-[background-position,box-shadow,transform] duration-500 ease-out hover:scale-105 hover:bg-right hover:shadow-[0_0_32px_-4px_rgba(244,103,15,0.65)] motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            <MapPin className="h-4 w-4" strokeWidth={2} />
            {t.reviews.storeCta.getDirections}
          </a>
          <a
            href={SITE.phoneHref}
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm transition-[border-color,color,transform] duration-300 ease-out hover:scale-105 hover:border-wb-orange/60 hover:text-wb-orange motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            <Phone className="h-4 w-4" strokeWidth={2} />
            {t.reviews.storeCta.callNow}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
