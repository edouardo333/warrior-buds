"use client";

import Link from "next/link";
import SmartImage from "./SmartImage";
import Logo from "./Logo";
import OpeningStatus from "./OpeningStatus";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-[72svh] w-full items-center overflow-hidden bg-black sm:min-h-[79svh] lg:min-h-[96svh]">
      {/* Background media — image today, ready for a cinematic video later */}
      <div className="absolute inset-0 lg:inset-x-[15%]">
        <SmartImage
          src="/images/hero/hero-outside-night.webp"
          alt="Warrior Buds dispensary storefront at night"
          fill
          preload
          sizes="100vw"
          className="object-cover object-[center_15%] lg:object-center"
          fallback={
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#2a1206_0%,_#150a04_45%,_#000000_100%)]">
              <div className="absolute inset-0 bg-noise opacity-[0.05]" />
              <div className="absolute -top-24 left-1/4 h-[28rem] w-[28rem] rounded-full bg-wb-red/20 blur-[140px]" />
              <div className="absolute top-1/4 right-0 h-[32rem] w-[32rem] rounded-full bg-wb-orange/15 blur-[160px]" />
              <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-wb-yellow/10 blur-[140px]" />
            </div>
          }
        />
        {/* Future: <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" /> */}
      </div>

      {/* Overlays for legibility — layered darkness rather than a flat tint */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center lg:mx-0 lg:ml-[4%] lg:items-start lg:text-left">
          <Logo className="mb-7" imageClassName="h-[13.75rem] sm:h-[17.5rem]" />

          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-wb-orange sm:text-sm">
            {t.hero.kicker}
          </p>

          <h1 className="mt-4 font-display text-6xl leading-[0.92] tracking-wide text-foreground sm:text-8xl lg:text-[7rem]">
            WARRIOR <span className="text-gradient-ember">BUDS</span>
          </h1>

          <p className="mt-3 text-base font-semibold uppercase tracking-[0.25em] text-foreground/80 sm:text-lg">
            {t.hero.tagline}
          </p>

          <div className="mt-6">
            <OpeningStatus />
          </div>

          <p className="mt-6 max-w-lg text-balance text-base text-foreground/70 sm:text-lg">
            {t.hero.lead}
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/products"
              className="rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-8 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105"
            >
              {t.hero.ctaPrimary}
            </Link>
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm transition-colors duration-200 hover:border-wb-orange/60 hover:text-wb-orange"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>

          <p className="mt-7 text-xs uppercase tracking-widest text-foreground/45">
            {t.hero.finePrint}
          </p>
        </div>
      </div>
    </section>
  );
}
