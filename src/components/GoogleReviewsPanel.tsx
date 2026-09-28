"use client";

import { ExternalLink } from "lucide-react";
import GoogleLogo from "./GoogleLogo";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// The "See What Everyone's Saying" Google Reviews card. `page` is the
// full-size Reviews-page layout; `hero` is the compact fit for the Home hero
// column (always stacked, full-width CTA on mobile).
const STYLES = {
  page: {
    card: "items-center gap-6 rounded-[1.75rem] px-6 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-9 sm:text-left",
    title: "text-2xl sm:text-3xl",
    subtitle: "mt-2 text-sm sm:text-base",
    meta: "mt-3 justify-center text-xs sm:justify-start sm:text-sm",
    cta: "inline-flex px-7 py-3 hover:scale-105",
  },
  hero: {
    card: "w-full items-stretch gap-5 rounded-3xl px-5 py-6 text-center sm:px-8 lg:px-7 lg:text-left",
    title: "text-xl sm:text-2xl",
    subtitle: "mt-1.5 text-sm",
    meta: "mt-2.5 justify-center text-xs sm:text-sm lg:justify-start",
    cta: "flex w-full justify-center px-5 py-3 text-center sm:w-auto sm:self-center lg:self-start hover:scale-[1.03]",
  },
} as const;

export default function GoogleReviewsPanel({ variant = "page" }: { variant?: keyof typeof STYLES }) {
  const { t } = useLanguage();
  const s = STYLES[variant];

  return (
    <div
      className={`flex flex-col border border-wb-orange/25 bg-white/[0.04] shadow-[0_20px_60px_-25px_rgba(244,103,15,0.35)] backdrop-blur-md transition-shadow duration-500 hover:shadow-[0_20px_70px_-20px_rgba(244,103,15,0.5)] ${s.card}`}
    >
      <div className="min-w-0">
        <h2 className={`font-display tracking-wide text-foreground ${s.title}`}>
          {t.reviews.cta.titlePrefix}{" "}
          <span className="text-gradient-ember">{t.reviews.cta.titleHighlight}</span>
        </h2>
        <p className={`text-foreground/60 ${s.subtitle}`}>{t.reviews.cta.subtitle}</p>
        <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-foreground/70 ${s.meta}`}>
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
        className={`group shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow bg-[length:200%_100%] bg-left text-sm font-semibold uppercase tracking-wide text-black transition-[background-position,box-shadow,transform] duration-500 ease-out hover:bg-right hover:shadow-[0_0_30px_-4px_rgba(244,103,15,0.6)] motion-reduce:transition-none motion-reduce:hover:scale-100 ${s.cta}`}
      >
        <GoogleLogo className="h-4 w-4 shrink-0" />
        {t.reviews.cta.button}
        <ExternalLink
          className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
          strokeWidth={2}
        />
      </a>
    </div>
  );
}
