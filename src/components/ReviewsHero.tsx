"use client";

import Reveal from "./Reveal";
import GoogleLogo from "./GoogleLogo";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ReviewsHero() {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-[48svh] w-full items-center justify-center overflow-hidden bg-black px-6 pt-16 sm:min-h-[54svh]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a0f08_0%,_#050403_55%,_#000000_100%)]" />
      <div className="pointer-events-none absolute -top-24 left-1/3 h-96 w-96 rounded-full bg-wb-red/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-wb-orange/15 blur-[140px]" />

      <Reveal className="relative z-10 mx-auto flex max-w-2xl flex-col items-center pt-16 text-center">
        <GoogleLogo className="h-9 w-9" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">
          {t.reviews.hero.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-5xl tracking-wide text-foreground sm:text-6xl">
          {t.reviews.hero.title}{" "}
          <span className="text-gradient-ember">{t.reviews.hero.titleHighlight}</span>
        </h1>
        <p className="mt-5 max-w-md text-balance text-base text-foreground/60 sm:text-lg">
          {t.reviews.hero.subtitle}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-foreground/80">
          <span className="text-wb-yellow">{SITE.googleRating} ★</span>
          <span className="text-foreground/30">·</span>
          <span>
            {SITE.googleReviewCount} {t.reviews.hero.badgeLabel}
          </span>
        </div>
      </Reveal>
    </section>
  );
}
