"use client";

import SmartImage from "./SmartImage";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AboutHero() {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-[62svh] w-full items-center overflow-hidden bg-black sm:min-h-[70svh] lg:min-h-[80svh]">
      <div className="absolute inset-0">
        <SmartImage
          src="/images/hero/hero-outside-night.webp"
          alt="Warrior Buds dispensary storefront at night"
          fill
          preload
          sizes="100vw"
          className="object-cover object-[center_20%]"
          fallback={
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#2a1206_0%,_#150a04_45%,_#000000_100%)]">
              <div className="absolute inset-0 bg-noise opacity-[0.05]" />
              <div className="absolute -top-24 left-1/4 h-[28rem] w-[28rem] rounded-full bg-wb-red/20 blur-[140px]" />
              <div className="absolute top-1/4 right-0 h-[32rem] w-[32rem] rounded-full bg-wb-orange/15 blur-[160px]" />
              <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-wb-yellow/10 blur-[140px]" />
            </div>
          }
        />
      </div>

      {/* Overlays for legibility — layered darkness rather than a flat tint */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-wb-red/20 via-wb-orange/20 to-wb-yellow/20 blur-[160px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 text-center sm:px-10 lg:px-16">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-wb-orange sm:text-sm">
          {t.about.hero.eyebrow}
        </p>
        <h1 className="mt-4 font-display text-6xl leading-[0.92] tracking-wide text-foreground sm:text-8xl lg:text-[7.5rem]">
          {t.about.hero.title} <span className="text-gradient-ember">{t.about.hero.titleHighlight}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base text-foreground/70 sm:text-lg">
          {t.about.hero.subtitle}
        </p>
      </div>
    </section>
  );
}
