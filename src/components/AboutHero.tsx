"use client";

import { useEffect, useRef } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import SmartImage from "./SmartImage";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AboutHero() {
  const { t } = useLanguage();
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let ticking = false;
    const applyOffset = () => {
      const offset = Math.min(window.scrollY * 0.15, 70);
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(applyOffset);
        ticking = true;
      }
    };
    applyOffset();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative flex min-h-[68svh] w-full items-center overflow-hidden bg-black sm:min-h-[75svh] lg:min-h-[88svh]">
      <div ref={parallaxRef} className="absolute inset-0 overflow-hidden">
        <div className="wb-hero-zoom absolute inset-0 [filter:brightness(1.1)_contrast(1.08)_saturate(1.25)]">
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
      </div>

      {/* Cinematic overlays — layered darkness with warm ember tint */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-br from-wb-red/15 via-transparent to-wb-yellow/10 mix-blend-overlay" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      {/* Soft animated glows */}
      <div className="pointer-events-none absolute -top-16 left-[10%] h-72 w-72 animate-pulse-glow rounded-full bg-wb-red/20 blur-[130px]" />
      <div
        className="pointer-events-none absolute top-1/3 right-[8%] h-80 w-80 animate-pulse-glow rounded-full bg-wb-orange/15 blur-[150px]"
        style={{ animationDelay: "0.8s" }}
      />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-wb-red/20 via-wb-orange/20 to-wb-yellow/20 blur-[160px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 text-center sm:px-10 lg:px-16">
        <div
          className="wb-hero-reveal mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/80 backdrop-blur-sm"
          style={{ animationDelay: "40ms" }}
        >
          <MapPin className="h-3.5 w-3.5 text-wb-orange" strokeWidth={2} />
          {t.about.hero.locationBadge}
        </div>

        <p
          className="wb-hero-reveal mt-6 text-xs font-semibold uppercase tracking-[0.4em] text-wb-orange sm:text-sm"
          style={{ animationDelay: "120ms" }}
        >
          {t.about.hero.eyebrow}
        </p>

        <h1
          className="wb-hero-reveal mt-4 font-display text-6xl leading-[0.92] tracking-wide sm:text-8xl lg:text-[7.5rem]"
          style={{ animationDelay: "200ms" }}
        >
          <span className="wb-text-sweep">
            {t.about.hero.title} {t.about.hero.titleHighlight}
          </span>
        </h1>

        <p
          className="wb-hero-reveal mx-auto mt-6 max-w-xl text-balance text-base text-foreground/70 sm:text-lg"
          style={{ animationDelay: "280ms" }}
        >
          {t.about.hero.subtitle}
        </p>
      </div>

      <div className="wb-scroll-indicator pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-1 text-foreground/50">
        <span className="sr-only">Scroll to explore</span>
        <ChevronDown className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
      </div>
    </section>
  );
}
