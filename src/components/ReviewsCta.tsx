"use client";

import { ExternalLink } from "lucide-react";
import Reveal from "./Reveal";
import GoogleLogo from "./GoogleLogo";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ReviewsCta() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-wb-charcoal px-5 py-14 sm:px-8 lg:py-16">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-wb-red/10 via-wb-orange/15 to-wb-yellow/10 blur-[130px]" />

      <Reveal className="relative mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-6 rounded-[1.75rem] border border-wb-orange/25 bg-white/[0.04] px-6 py-8 text-center shadow-[0_20px_60px_-25px_rgba(244,103,15,0.35)] backdrop-blur-md transition-shadow duration-500 hover:shadow-[0_20px_70px_-20px_rgba(244,103,15,0.5)] sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-9 sm:text-left">
          <div>
            <h2 className="font-display text-2xl tracking-wide text-foreground sm:text-3xl">
              {t.reviews.cta.titlePrefix}{" "}
              <span className="text-gradient-ember">{t.reviews.cta.titleHighlight}</span>
            </h2>
            <p className="mt-2 text-sm text-foreground/60 sm:text-base">{t.reviews.cta.subtitle}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-medium text-foreground/70 sm:justify-start sm:text-sm">
              <span className="text-wb-yellow">{SITE.googleRating}★</span>
              <span className="text-foreground/25">·</span>
              <span>
                {SITE.googleReviewCount} {t.reviews.cta.reviewsLabel}
              </span>
              <span className="text-foreground/25">·</span>
              <span>{t.reviews.cta.verifiedLabel}</span>
            </div>
          </div>

          <a
            href={SITE.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow bg-[length:200%_100%] bg-left px-7 py-3 text-sm font-semibold uppercase tracking-wide text-black transition-[background-position,box-shadow,transform] duration-500 ease-out hover:scale-105 hover:bg-right hover:shadow-[0_0_30px_-4px_rgba(244,103,15,0.6)] motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            <GoogleLogo className="h-4 w-4" />
            {t.reviews.cta.button}
            <ExternalLink
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
              strokeWidth={2}
            />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
