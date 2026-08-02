"use client";

import Reveal from "./Reveal";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AboutCta() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-background px-5 py-24 sm:px-8 lg:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-wb-red/10 via-wb-orange/10 to-wb-yellow/10 blur-[150px]" />

      <Reveal className="relative mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center sm:px-14">
        <h2 className="font-display text-4xl tracking-wide text-foreground sm:text-5xl">
          {t.about.cta.titlePrefix}{" "}
          <span className="text-gradient-ember">{t.about.cta.titleHighlight}</span>
        </h2>
        <p className="mt-4 text-foreground/60">{t.about.cta.subtitle}</p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href={SITE.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105"
          >
            {t.footer.getDirections}
          </a>
          <a
            href={SITE.phoneHref}
            className="rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-wb-orange/60 hover:text-wb-orange"
          >
            {t.about.cta.callNow}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
