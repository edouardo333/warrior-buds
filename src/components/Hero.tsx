"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import SmartImage from "./SmartImage";
import Logo from "./Logo";
import OpeningStatus from "./OpeningStatus";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function StarGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M12 2.5l2.9 6.06 6.6.79-4.9 4.5 1.3 6.55L12 16.9l-5.9 3.5 1.3-6.55-4.9-4.5 6.6-.79L12 2.5z" />
    </svg>
  );
}

// Nudges the button toward the cursor within a small radius, then springs
// back on leave — a "magnetic" feel without pulling in a gesture library.
function useMagneticHover<T extends HTMLElement>(strength = 0.25, max = 8) {
  const ref = useRef<T | null>(null);

  const onMouseMove = (event: ReactMouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);
    const x = Math.max(Math.min(relX * strength, max), -max);
    const y = Math.max(Math.min(relY * strength, max), -max);
    el.style.transform = `translate(${x}px, ${y}px) scale(1.045)`;
  };

  const onMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return { ref, onMouseMove, onMouseLeave };
}

export default function Hero() {
  const { t } = useLanguage();
  const parallaxRef = useRef<HTMLDivElement>(null);
  const primaryMagnet = useMagneticHover<HTMLAnchorElement>();
  const secondaryMagnet = useMagneticHover<HTMLAnchorElement>();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let ticking = false;
    const applyOffset = () => {
      const offset = Math.min(window.scrollY * 0.12, 60);
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
    <section className="relative flex min-h-[72svh] w-full items-center overflow-hidden bg-black sm:min-h-[79svh] lg:min-h-[96svh]">
      {/* Background media — image today, ready for a cinematic video later */}
      <div ref={parallaxRef} className="absolute inset-0 overflow-hidden lg:inset-x-[15%]">
        <div className="wb-hero-zoom absolute inset-0 [filter:brightness(1.12)_contrast(1.08)_saturate(1.3)]">
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
      </div>

      {/* Overlays for legibility — layered darkness rather than a flat tint */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 sm:px-10 sm:pb-20 lg:px-16 lg:pb-28">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center lg:mx-0 lg:ml-[4%] lg:items-start lg:text-left">
          <Logo
            className="wb-hero-reveal wb-hero-logo-glow mb-6"
            imageClassName="h-[11.5rem] sm:h-[14.5rem]"
          />

          <p
            className="wb-hero-reveal text-xs font-semibold uppercase tracking-[0.35em] text-wb-orange sm:text-sm"
            style={{ animationDelay: "80ms" }}
          >
            {t.hero.kicker}
          </p>

          <h1 className="mt-4 font-display text-6xl leading-[0.92] tracking-wide text-foreground sm:text-8xl lg:text-[7rem]">
            WARRIOR <span className="text-gradient-ember">BUDS</span>
          </h1>

          <div className="wb-hero-reveal mt-5 flex items-center gap-2.5" style={{ animationDelay: "200ms" }}>
            <span className="flex items-center gap-0.5 text-wb-yellow" aria-hidden="true">
              <StarGlyph />
              <StarGlyph />
              <StarGlyph />
              <StarGlyph />
              <StarGlyph />
            </span>
            <span className="text-sm font-semibold text-foreground">{SITE.googleRating}</span>
            <span className="text-sm text-foreground/50">{t.trustBar.googleRating}</span>
          </div>
          <p
            className="wb-hero-reveal mt-1 text-xs uppercase tracking-widest text-foreground/45"
            style={{ animationDelay: "240ms" }}
          >
            {t.hero.trustText}
          </p>

          <p
            className="wb-hero-reveal mt-5 text-base font-semibold uppercase tracking-[0.25em] text-foreground/80 sm:text-lg"
            style={{ animationDelay: "280ms" }}
          >
            {t.hero.tagline}
          </p>

          <div className="wb-hero-reveal mt-5" style={{ animationDelay: "320ms" }}>
            <OpeningStatus size="hero" />
          </div>

          <p
            className="wb-hero-reveal mt-6 max-w-lg text-balance text-base text-foreground/70 sm:text-lg"
            style={{ animationDelay: "360ms" }}
          >
            {t.hero.lead}
          </p>

          <div className="wb-hero-reveal mt-9 flex flex-col gap-4 sm:flex-row" style={{ animationDelay: "400ms" }}>
            <Link
              ref={primaryMagnet.ref}
              onMouseMove={primaryMagnet.onMouseMove}
              onMouseLeave={primaryMagnet.onMouseLeave}
              href="/products"
              className="group relative isolate overflow-hidden rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow bg-[length:200%_100%] bg-left px-8 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-black transition-[background-position,box-shadow,transform] duration-500 ease-out hover:bg-right hover:shadow-[0_0_32px_-4px_rgba(244,103,15,0.65)] focus-visible:scale-105"
            >
              <span className="pointer-events-none absolute -inset-1 -z-10 rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60" />
              {t.hero.ctaPrimary}
            </Link>
            <a
              ref={secondaryMagnet.ref}
              onMouseMove={secondaryMagnet.onMouseMove}
              onMouseLeave={secondaryMagnet.onMouseLeave}
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative isolate overflow-hidden rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm transition-[border-color,color,box-shadow,transform] duration-300 ease-out hover:border-wb-orange/60 hover:text-wb-orange hover:shadow-[0_0_28px_-6px_rgba(244,103,15,0.45)] focus-visible:scale-105"
            >
              <span className="pointer-events-none absolute inset-0 -z-10 -translate-x-full bg-gradient-to-r from-transparent via-wb-orange/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              {t.hero.ctaSecondary}
            </a>
          </div>

          <p
            className="wb-hero-reveal mt-7 text-xs uppercase tracking-widest text-foreground/45"
            style={{ animationDelay: "440ms" }}
          >
            {t.hero.finePrint}
          </p>
        </div>
      </div>
    </section>
  );
}
