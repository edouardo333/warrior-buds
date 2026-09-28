"use client";

import { useCallback, useEffect, useRef } from "react";
import SmartImage from "./SmartImage";
import { TelegramIcon } from "./SocialIcons";
import Logo from "./Logo";
import OpeningStatus from "./OpeningStatus";
import GoogleReviewsPanel from "./GoogleReviewsPanel";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// Nudges the button toward the cursor within a small radius, then springs
// back on leave — a "magnetic" feel without pulling in a gesture library.
// Implemented as a single callback ref that wires up (and tears down) its
// own native listeners on the DOM node, so no ref value is ever read during
// render — only from the browser's own mount/event callbacks.
function useMagneticHover<T extends HTMLElement>(strength = 0.25, max = 8) {
  return useCallback(
    (el: T | null) => {
      if (!el) return;

      const onMouseMove = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const relX = event.clientX - (rect.left + rect.width / 2);
        const relY = event.clientY - (rect.top + rect.height / 2);
        const x = Math.max(Math.min(relX * strength, max), -max);
        const y = Math.max(Math.min(relY * strength, max), -max);
        el.style.transform = `translate(${x}px, ${y}px) scale(1.045)`;
      };
      const onMouseLeave = () => {
        el.style.transform = "";
      };

      el.addEventListener("mousemove", onMouseMove);
      el.addEventListener("mouseleave", onMouseLeave);
      return () => {
        el.removeEventListener("mousemove", onMouseMove);
        el.removeEventListener("mouseleave", onMouseLeave);
      };
    },
    [strength, max],
  );
}

export default function Hero() {
  const { t } = useLanguage();
  const parallaxRef = useRef<HTMLDivElement>(null);
  const telegramMagnet = useMagneticHover<HTMLAnchorElement>();

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

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-32 sm:px-10 sm:pt-24 sm:pb-20 lg:px-16 lg:pb-28">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center lg:mx-0 lg:ml-[4%] lg:items-start lg:text-left">
          <Logo
            className="wb-hero-reveal mb-6"
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

          <div className="wb-hero-reveal mt-6 w-full max-w-xl" style={{ animationDelay: "200ms" }}>
            <GoogleReviewsPanel variant="hero" />
          </div>

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

          <div className="wb-hero-reveal mt-9 flex w-full justify-center sm:w-auto lg:justify-start" style={{ animationDelay: "400ms" }}>
            <a
              ref={telegramMagnet}
              href={SITE.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative isolate inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-wb-telegram px-4 py-4 text-center text-sm leading-tight font-bold min-[400px]:px-6 min-[400px]:text-[15px] uppercase tracking-wide text-white shadow-[0_12px_32px_-14px_rgba(42,171,238,0.7)] ring-1 ring-inset ring-white/15 transition-[background-color,box-shadow,transform] duration-300 ease-out hover:bg-wb-telegram-hover hover:shadow-[0_16px_40px_-14px_rgba(42,171,238,0.85)] focus-visible:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wb-telegram-bright sm:w-auto sm:gap-3.5 sm:px-11 sm:py-5 sm:text-lg"
            >
              <span className="pointer-events-none absolute inset-0 -z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <TelegramIcon variant="mono" className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
              {t.hero.ctaTelegram}
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
