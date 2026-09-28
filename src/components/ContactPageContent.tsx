"use client";

import { MapPin } from "lucide-react";
import Reveal from "./Reveal";
import OpeningStatus from "./OpeningStatus";
import { InstagramIcon, LinktreeIcon, TelegramIcon } from "./SocialIcons";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const MAP_QUERY = encodeURIComponent(
  `Warrior Buds Dispensary - 24/7 Wholesale, ${SITE.addressLine1}, ${SITE.addressLine2}`
);
// Centered east of Oka (ll) so Saint-Eustache, Laval, Montréal and Longueuil
// are visible alongside the Warrior Buds marker (q), zoomed out for context.
const MAP_EMBED_SRC = `https://www.google.com/maps?q=${MAP_QUERY}&ll=45.55,-73.8&z=9&output=embed`;

export default function ContactPageContent() {
  const { t } = useLanguage();

  return (
    <>
      {/* Hero */}
      <section className="relative flex w-full items-center justify-center overflow-hidden bg-black px-6 pb-10 pt-16 sm:pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a0f08_0%,_#050403_55%,_#000000_100%)]" />
        <div className="absolute inset-0 bg-noise opacity-[0.04]" />
        <div className="pointer-events-none absolute -top-24 left-1/3 h-96 w-96 animate-pulse-glow rounded-full bg-wb-red/20 blur-[130px]" />
        <div
          className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 animate-pulse-glow rounded-full bg-wb-orange/15 blur-[140px]"
          style={{ animationDelay: "0.8s" }}
        />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-wb-red/10 via-wb-orange/10 to-wb-yellow/10 blur-[150px]" />

        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center pt-16 text-center">
          <div
            className="wb-hero-reveal inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/80 backdrop-blur-sm"
            style={{ animationDelay: "40ms" }}
          >
            <MapPin className="h-3.5 w-3.5 text-wb-orange" strokeWidth={2} />
            {t.contact.hero.locationBadge}
          </div>

          <p
            className="wb-hero-reveal mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange"
            style={{ animationDelay: "120ms" }}
          >
            {t.contact.hero.eyebrow}
          </p>
          <h1
            className="wb-hero-reveal mt-3 font-display text-5xl tracking-wide text-foreground sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "200ms" }}
          >
            {t.contact.hero.title.replace(/\s*Buds$/i, "")}{" "}
            <span className="text-gradient-ember">{t.contact.hero.title.match(/Buds$/i)?.[0]}</span>
          </h1>
          <p
            className="wb-hero-reveal mt-5 max-w-md text-balance text-base text-foreground/60 sm:text-lg"
            style={{ animationDelay: "280ms" }}
          >
            {t.contact.hero.subtitle}
          </p>
          <div className="wb-hero-reveal mt-7" style={{ animationDelay: "360ms" }}>
            <OpeningStatus />
          </div>
        </div>
      </section>

      {/* Map + contact actions */}
      <section className="relative bg-black px-4 pb-20 pt-4 sm:px-8 lg:pb-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="h-[340px] w-full overflow-hidden rounded-3xl border border-wb-orange/20 shadow-[0_0_60px_-15px_rgba(244,103,15,0.35)] sm:h-[440px] lg:h-[560px]">
              <iframe
                src={MAP_EMBED_SRC}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t.contact.map.title}
              />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mx-auto mt-6 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
              <a
                href={SITE.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-wb-telegram px-5 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white ring-1 ring-inset ring-white/15 transition-[background-color,box-shadow,transform] duration-300 ease-out hover:scale-[1.03] hover:bg-wb-telegram-hover hover:shadow-[0_0_28px_-6px_rgba(42,171,238,0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wb-telegram-bright motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                <TelegramIcon variant="mono" className="h-5 w-5 shrink-0" />
                {t.contact.details.telegram}
              </a>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-[linear-gradient(45deg,#833ab4_0%,#c13584_35%,#e1306c_55%,#fd1d1d_75%,#f77737_100%)] px-5 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white transition-[filter,border-color] duration-200 hover:border-white/50 hover:brightness-110"
              >
                <InstagramIcon className="h-4 w-4 shrink-0 [&_path]:fill-white" />
                {t.contact.details.instagram}
              </a>
              <a
                href={SITE.linktreeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-[#43e660] px-5 py-3 text-center text-sm font-semibold uppercase tracking-wide text-[#0b0b0b] transition-[filter,border-color] duration-200 hover:border-black/30 hover:brightness-105"
              >
                <LinktreeIcon className="h-4 w-4 shrink-0 fill-[#0b0b0b]" />
                {t.contact.details.linktree}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
