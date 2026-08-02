"use client";

import Reveal from "./Reveal";
import GoogleLogo from "./GoogleLogo";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ReviewsCta() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-wb-charcoal px-5 py-20 sm:px-8 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-wb-red/10 via-wb-orange/10 to-wb-yellow/10 blur-[150px]" />

      <Reveal className="relative mx-auto max-w-2xl text-center">
        <h2 className="font-display text-4xl tracking-wide text-foreground sm:text-5xl">
          {t.reviews.cta.titlePrefix}{" "}
          <span className="text-gradient-ember">{t.reviews.cta.titleHighlight}</span>
        </h2>
        <p className="mt-4 text-foreground/60">{t.reviews.cta.subtitle}</p>
        <a
          href={SITE.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105"
        >
          <GoogleLogo className="h-4 w-4" />
          {t.reviews.cta.button}
        </a>
      </Reveal>
    </section>
  );
}
