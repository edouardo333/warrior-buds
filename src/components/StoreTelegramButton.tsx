"use client";

import { TelegramIcon } from "./SocialIcons";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// Telegram companion to the "Get Directions" button in the Visit The Store
// sections (home, products, learning center, reviews). Same pill size and
// hover motion as Get Directions, in Telegram blue; the label wraps instead
// of overflowing on narrow screens (the FR label is long).
export default function StoreTelegramButton() {
  const { t } = useLanguage();

  return (
    <a
      href={SITE.telegramUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.productCatalog.detail.telegramContactAria}
      className="group relative isolate inline-flex min-w-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-wb-telegram px-6 py-3.5 text-center text-sm leading-tight font-semibold uppercase tracking-wide text-balance text-white ring-1 ring-inset ring-white/15 transition-[background-color,box-shadow,transform] duration-500 ease-out hover:-translate-y-1 hover:scale-105 hover:bg-wb-telegram-hover hover:shadow-[0_0_32px_-4px_rgba(42,171,238,0.65)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wb-telegram-bright motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 sm:px-8"
    >
      <TelegramIcon variant="mono" className="h-5 w-5 shrink-0" />
      <span>{t.minimumOrderCta.telegramButton}</span>
    </a>
  );
}
