"use client";

import Reveal from "../Reveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function FaqHero() {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-[46svh] w-full items-center overflow-hidden bg-black pt-16 sm:min-h-[52svh]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a0f08_0%,_#050403_55%,_#000000_100%)]" />
      <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-wb-red/20 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-wb-orange/15 blur-[130px]" />
      <div className="absolute inset-0 bg-noise opacity-[0.04]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-16 text-center sm:px-10">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-wb-orange sm:text-sm">
            {t.faq.hero.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-6xl tracking-wide text-foreground sm:text-7xl lg:text-8xl">
            {t.faq.hero.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-foreground/70 sm:text-lg">
            {t.faq.hero.subtitle}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
