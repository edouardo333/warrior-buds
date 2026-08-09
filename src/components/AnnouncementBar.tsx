"use client";

// Premium, full-width promo bar rendered above the nav row inside Navbar's
// fixed header (see Navbar.tsx) — shares the same fixed stack so it scrolls
// with the nav rather than being a second, separately-positioned element.
// Solid black background (not the gradient/glass Navbar uses) keeps the
// copy readable over any hero image behind it; the thin red→orange→yellow
// edge is the only brand accent, reusing the existing gradient tokens
// (see globals.css --wb-red/--wb-orange/--wb-yellow) rather than any
// borrowed layout.

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AnnouncementBar() {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-black">
      <div className="mx-auto max-w-7xl px-4 py-1.5 sm:px-8 sm:py-2">
        <p className="text-balance text-center text-[10.5px] font-semibold uppercase leading-snug tracking-wide text-foreground/90 sm:text-xs sm:tracking-[0.15em]">
          {t.announcementBar.message}
        </p>
      </div>
      <div aria-hidden="true" className="h-[2px] w-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow" />
    </div>
  );
}
