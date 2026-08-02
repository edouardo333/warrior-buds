"use client";

import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 2.5l2.9 6.06 6.6.79-4.9 4.5 1.3 6.55L12 16.9l-5.9 3.5 1.3-6.55-4.9-4.5 6.6-.79L12 2.5z" />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
      <path d="M4 5.5h16a1 1 0 011 1V15a1 1 0 01-1 1H9l-4.5 4V16H4a1 1 0 01-1-1V6.5a1 1 0 011-1z" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
      <path d="M12 21s7-6.4 7-11.5A7 7 0 105 9.5C5 14.6 12 21 12 21z" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

export default function TrustBar() {
  const { t } = useLanguage();

  const TRUST_ITEMS = [
    { icon: StarIcon, primary: `${SITE.googleRating}★`, secondary: t.trustBar.googleRating },
    { icon: ReviewIcon, primary: SITE.googleReviewCount, secondary: t.trustBar.googleReviews },
    { icon: CalendarIcon, primary: t.trustBar.openPrimary, secondary: t.trustBar.openSecondary },
    { icon: ClockIcon, primary: t.trustBar.wholesalePrimary, secondary: t.trustBar.wholesaleSecondary },
    { icon: PinIcon, primary: "Kanesatake", secondary: "Oka" },
  ];

  return (
    <div className="relative z-20 mx-auto -mt-8 max-w-6xl px-5 sm:-mt-12 sm:px-8">
      <div className="grid grid-cols-2 divide-y divide-white/10 rounded-2xl border border-white/10 bg-wb-charcoal/90 shadow-2xl shadow-black/50 backdrop-blur-md sm:grid-cols-5 sm:divide-y-0 sm:divide-x">
        {TRUST_ITEMS.map(({ icon: Icon, primary, secondary }) => (
          <div
            key={secondary}
            className="flex items-center justify-center gap-3 px-4 py-6 text-center sm:flex-col sm:gap-2 sm:text-center"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-wb-red via-wb-orange to-wb-yellow text-black">
              <Icon />
            </span>
            <span className="flex flex-col items-start leading-tight sm:items-center">
              <span className="font-display text-lg tracking-wide text-foreground sm:text-xl">
                {primary}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-widest text-foreground/55">
                {secondary}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
