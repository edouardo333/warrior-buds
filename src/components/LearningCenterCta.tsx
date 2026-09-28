"use client";

import Reveal from "./Reveal";
import StoreTelegramButton from "./StoreTelegramButton";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LearningCenterCta() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-black px-5 py-16 sm:px-8 lg:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a0906_0%,_#050403_55%,_#000000_100%)]" />
      <div className="absolute inset-0 bg-noise opacity-[0.04]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-wb-red/25 via-wb-orange/20 to-wb-red/10 blur-[150px]" />

      <Reveal className="relative mx-auto max-w-3xl rounded-[2rem] border border-white/15 bg-white/[0.05] px-6 py-10 text-center shadow-[0_30px_90px_-30px_rgba(0,0,0,0.65)] backdrop-blur-md sm:px-12 sm:py-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">
          {t.learningCenter.cta.label}
        </span>
        <h2 className="mt-5 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
          {t.learningCenter.cta.titlePrefix}{" "}
          <span className="text-gradient-ember">{t.learningCenter.cta.titleHighlight}</span>?
        </h2>
        <p className="mt-4 text-foreground/60">{t.learningCenter.cta.subtitle}</p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row sm:flex-wrap">
          <StoreTelegramButton />
        </div>
      </Reveal>
    </section>
  );
}
