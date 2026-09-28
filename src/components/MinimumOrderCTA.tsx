"use client";

import { useId } from "react";
import { TelegramIcon } from "./SocialIcons";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// Shared $250 minimum-order banner — the single implementation rendered on
// both the homepage (under the TrustBar) and /products (above the filters).
// Deliberately not wrapped in <Reveal>: it's information the visitor needs
// before shopping, so it's visible immediately rather than on scroll.
export default function MinimumOrderCTA({ className = "" }: { className?: string }) {
  const { t } = useLanguage();
  const cta = t.minimumOrderCta;
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className={className}>
      <div className="relative isolate overflow-hidden rounded-[1.75rem] border border-wb-orange/30 bg-wb-charcoal/95 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.85),0_0_44px_-20px_rgba(244,103,15,0.5)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-wb-orange to-transparent" />
        <div className="pointer-events-none absolute -left-16 top-1/2 -z-10 h-56 w-56 -translate-y-1/2 rounded-full bg-wb-red/20 blur-[100px]" />
        <div className="pointer-events-none absolute -right-10 -bottom-16 -z-10 h-56 w-72 rounded-full bg-wb-orange/15 blur-[110px]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-noise opacity-[0.04]" />

        <div className="flex flex-col items-center gap-5 px-5 py-8 text-center sm:px-10 sm:py-9 lg:flex-row lg:gap-10 lg:px-12 lg:text-left">
          <h2
            id={titleId}
            className="flex shrink-0 flex-col items-center font-display leading-[0.9] tracking-wide text-foreground lg:items-start"
          >
            {cta.titleBefore && <span className="text-2xl sm:text-3xl">{cta.titleBefore}</span>}
            <span className="text-gradient-ember text-7xl sm:text-8xl">{cta.titleAmount}</span>
            {cta.titleAfter && <span className="text-2xl sm:text-3xl">{cta.titleAfter}</span>}
          </h2>

          <div className="hidden w-px self-stretch bg-gradient-to-b from-transparent via-white/15 to-transparent lg:block" />

          {/* Body and button stack even on desktop — side by side, the long
              FR button label squeezed the body copy into a narrow column. */}
          <div className="flex min-w-0 flex-col items-center gap-5 lg:flex-1 lg:items-start">
            <p className="max-w-md text-sm leading-relaxed text-foreground/75 sm:text-base lg:max-w-xl">
              {cta.body}
            </p>

            <a
              href={SITE.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative isolate inline-flex min-h-13 w-full max-w-sm items-center justify-center gap-2.5 overflow-hidden rounded-full bg-wb-telegram px-5 py-3.5 text-center text-sm leading-tight font-bold uppercase tracking-wide text-balance text-white shadow-[0_12px_32px_-14px_rgba(42,171,238,0.7)] ring-1 ring-inset ring-white/15 transition-[background-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:bg-wb-telegram-hover hover:shadow-[0_16px_40px_-14px_rgba(42,171,238,0.85)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wb-telegram-bright motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto sm:max-w-none sm:px-8 sm:text-[15px]"
            >
              <span className="pointer-events-none absolute inset-0 -z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden" />
              <TelegramIcon variant="mono" className="h-6 w-6 shrink-0" />
              <span>{cta.telegramButton}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
