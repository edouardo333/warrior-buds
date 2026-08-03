"use client";

import { MapPin, Phone } from "lucide-react";
import SmartImage from "./SmartImage";
import Reveal from "./Reveal";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AboutCta() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-black px-5 py-24 sm:px-8 lg:py-32">
      <div className="absolute inset-0">
        <SmartImage
          src="/images/hero/hero-outside-night.webp"
          alt="Warrior Buds dispensary storefront at night"
          fill
          sizes="100vw"
          className="object-cover object-[center_30%]"
          fallback={
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#2a1206_0%,_#150a04_55%,_#000000_100%)]">
              <div className="absolute inset-0 bg-noise opacity-[0.05]" />
            </div>
          }
        />
      </div>
      <div className="absolute inset-0 bg-black/75" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/50" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-wb-red/15 via-wb-orange/15 to-wb-yellow/15 blur-[160px]" />

      <Reveal className="relative mx-auto max-w-3xl rounded-[2rem] border border-white/15 bg-white/[0.05] px-6 py-14 text-center shadow-[0_30px_90px_-30px_rgba(0,0,0,0.65)] backdrop-blur-md sm:px-14 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-wb-orange">
          {t.about.cta.eyebrow}
        </p>
        <h2 className="mt-4 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
          {t.about.cta.titlePrefix}{" "}
          <span className="text-gradient-ember">{t.about.cta.titleHighlight}</span>?
        </h2>
        <p className="mt-4 text-foreground/60">{t.about.cta.subtitle}</p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href={SITE.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow bg-[length:200%_100%] bg-left px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-black transition-[background-position,box-shadow,transform] duration-500 ease-out hover:scale-105 hover:bg-right hover:shadow-[0_0_32px_-4px_rgba(244,103,15,0.65)]"
          >
            <MapPin className="h-4 w-4" strokeWidth={2} />
            {t.about.cta.getDirections}
          </a>
          <a
            href={SITE.phoneHref}
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm transition-[border-color,color,transform] duration-300 ease-out hover:scale-105 hover:border-wb-orange/60 hover:text-wb-orange"
          >
            <Phone className="h-4 w-4" strokeWidth={2} />
            {t.about.cta.callNow}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
