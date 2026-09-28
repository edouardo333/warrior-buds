"use client";

import Reveal from "@/components/Reveal";
import StoreTelegramButton from "@/components/StoreTelegramButton";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ShopCta() {
  const { t } = useLanguage();
  const cta = t.productCatalog.finalCta;

  return (
    <section className="relative mt-16 overflow-hidden rounded-[2rem] sm:mt-20">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-wb-red/15 via-wb-orange/20 to-wb-yellow/15 blur-[130px]" />

      <Reveal className="relative rounded-[2rem] border border-white/15 bg-white/[0.05] px-6 py-10 text-center shadow-[0_30px_90px_-30px_rgba(0,0,0,0.65)] backdrop-blur-md sm:px-12 sm:py-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">
          {cta.label}
        </span>
        <h2 className="mt-5 font-display text-3xl tracking-wide text-foreground sm:text-4xl">
          {cta.titlePrefix} <span className="text-gradient-ember">{cta.titleHighlight}</span>
        </h2>
        <p className="mt-4 text-foreground/60">{cta.subtitle}</p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row sm:flex-wrap">
          <StoreTelegramButton />
        </div>
      </Reveal>
    </section>
  );
}
