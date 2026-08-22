"use client";

import { MapPin, Phone, Clock, AtSign, Link2, ChevronDown, ShieldCheck, MessageCircle, Mail } from "lucide-react";
import Reveal from "./Reveal";
import OpeningStatus from "./OpeningStatus";
import ContactForm from "./ContactForm";
import { OPEN_BUD_GUARDIAN_EVENT } from "./bud-guardian/events";
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

  const INFO_STRIP = [
    { ...t.contact.infoStrip.openDaily, icon: Clock },
    { ...t.contact.infoStrip.location, icon: MapPin },
    { ...t.contact.infoStrip.ageRestriction, icon: ShieldCheck },
  ];

  // Opens the existing Bud Guardian widget mounted in the root layout
  // (see BudGuardian.tsx) — no separate chat UI is created here.
  const handleOpenBudGuardian = () => {
    window.dispatchEvent(new Event(OPEN_BUD_GUARDIAN_EVENT));
  };

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[56svh] w-full items-center justify-center overflow-hidden bg-black px-6 pt-16 sm:min-h-[62svh] lg:min-h-[68svh]">
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
            {t.contact.hero.title}
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

        <div className="wb-scroll-indicator pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-1 text-foreground/50">
          <span className="sr-only">Scroll to explore</span>
          <ChevronDown className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </div>
      </section>

      {/* Details + Map */}
      <section className="relative bg-black px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-[1560px] gap-14 lg:grid-cols-[3fr_6.5fr] lg:items-start lg:gap-10">
          <Reveal>
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 shadow-[0_30px_80px_-40px_rgba(244,103,15,0.35)] backdrop-blur-md transition-colors duration-500 hover:border-wb-orange/25 sm:p-9">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-wb-red/15 via-wb-orange/15 to-wb-yellow/10 blur-[90px]" />
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <p className="relative text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">
                {t.contact.details.eyebrow}
              </p>
              <h2 className="relative mt-3 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
                {t.contact.details.title}
              </h2>

              <div className="relative mt-8 flex flex-col gap-6 border-t border-white/10 pt-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-wb-red via-wb-orange to-wb-yellow text-black">
                    <MapPin className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/50">
                      {t.contact.details.addressLabel}
                    </h3>
                    <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block">
                      <address className="flex flex-col gap-0.5 text-lg not-italic text-foreground transition-colors hover:text-wb-orange">
                        <span>{SITE.addressLine1}</span>
                        <span>{SITE.addressLine2}</span>
                      </address>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-wb-red via-wb-orange to-wb-yellow text-black">
                    <Phone className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/50">
                      {t.contact.details.phoneLabel}
                    </h3>
                    <a
                      href={SITE.phoneHref}
                      className="mt-1 inline-block text-lg text-foreground transition-colors hover:text-wb-orange"
                    >
                      {SITE.phoneDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-wb-red via-wb-orange to-wb-yellow text-black">
                    <Clock className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/50">
                      {t.contact.details.hoursLabel}
                    </h3>
                    <p className="mt-1 text-lg font-semibold uppercase tracking-wide text-foreground">
                      {t.contact.details.openDaily}
                    </p>
                    <p className="text-foreground/70">{t.contact.details.hoursValue}</p>
                  </div>
                </div>
              </div>

              <div className="relative mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <a
                  href={SITE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow bg-[length:200%_100%] bg-left px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-black transition-[background-position,box-shadow,transform] duration-500 ease-out hover:scale-105 hover:bg-right hover:shadow-[0_0_28px_-4px_rgba(244,103,15,0.6)]"
                >
                  <MapPin className="h-4 w-4" strokeWidth={2} />
                  {t.contact.details.getDirections}
                </a>
                <a
                  href={SITE.phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-wb-orange/60 hover:text-wb-orange"
                >
                  <Phone className="h-4 w-4" strokeWidth={2} />
                  {t.contact.details.callNow}
                </a>
              </div>

              <div className="relative mt-4 grid grid-cols-2 gap-3">
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-foreground/70 transition-colors duration-200 hover:border-wb-orange/50 hover:text-wb-orange"
                >
                  <AtSign className="h-3.5 w-3.5" strokeWidth={2} />
                  {t.contact.details.instagram}
                </a>
                <a
                  href={SITE.linktreeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-foreground/70 transition-colors duration-200 hover:border-wb-orange/50 hover:text-wb-orange"
                >
                  <Link2 className="h-3.5 w-3.5" strokeWidth={2} />
                  {t.contact.details.linktree}
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="h-[450px] overflow-hidden rounded-3xl border border-wb-orange/20 shadow-[0_0_60px_-15px_rgba(244,103,15,0.35)] lg:h-[680px]">
              <iframe
                src={MAP_EMBED_SRC}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t.contact.map.title}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Support / Bud Guardian */}
      <section className="relative bg-black px-5 pb-4 sm:px-8">
        <Reveal className="relative mx-auto max-w-[1560px]">
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 shadow-[0_30px_80px_-40px_rgba(244,103,15,0.35)] backdrop-blur-md transition-colors duration-500 hover:border-wb-orange/25 sm:p-9">
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-wb-red/15 via-wb-orange/15 to-wb-yellow/10 blur-[90px]" />
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">
                  {t.contact.support.eyebrow}
                </p>
                <h2 className="mt-3 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
                  {t.contact.support.title}
                </h2>
                <p className="mt-4 max-w-xl text-foreground/70">{t.contact.support.description}</p>
              </div>

              <div className="flex shrink-0 flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
                <button
                  type="button"
                  onClick={handleOpenBudGuardian}
                  className="group/btn relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow bg-[length:200%_100%] bg-left px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-black transition-[background-position,box-shadow,transform] duration-500 ease-out hover:scale-105 hover:bg-right hover:shadow-[0_0_28px_-4px_rgba(244,103,15,0.6)]"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2} />
                  {t.contact.support.chatCta}
                </button>
                {/* TODO(warrior-buds): SITE.email / SITE.emailHref are a TEMP
                    placeholder inbox — replace with the real Warrior Buds
                    professional email address before launch (see src/lib/site.ts). */}
                <a
                  href={SITE.emailHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-wb-orange/60 hover:text-wb-orange"
                >
                  <Mail className="h-4 w-4" strokeWidth={2} />
                  {t.contact.support.emailCta}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Message Form */}
      <section className="relative overflow-hidden bg-wb-charcoal px-5 py-20 sm:px-8 lg:py-28">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-wb-red/10 blur-[140px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-wb-orange/10 blur-[140px]" />

        <Reveal className="relative mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.05] px-6 py-10 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.65)] backdrop-blur-md sm:px-12 sm:py-14">
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-wb-red/15 via-wb-orange/15 to-wb-yellow/15 blur-[130px]" />

            <div className="relative text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-wb-orange">
                {t.contact.form.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
                {t.contact.form.title}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-foreground/60 sm:text-base">
                {t.contact.form.subtitle}
              </p>
            </div>
            <div className="relative">
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Info Strip */}
      <section className="relative overflow-hidden bg-black px-5 py-16 sm:px-8">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-wb-orange/5 blur-[150px]" />

        <div className="relative mx-auto grid max-w-6xl gap-5 sm:grid-cols-3">
          {INFO_STRIP.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 120}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-wb-charcoal/60 px-6 py-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-wb-orange/40 hover:bg-wb-charcoal/80">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-wb-red/15 via-wb-orange/15 to-wb-yellow/15 blur-[60px] transition-transform duration-300 group-hover:scale-125" />

                  <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-wb-red via-wb-orange to-wb-yellow text-black transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>

                  <p className="relative mt-4 font-display text-xl tracking-wide text-foreground sm:text-2xl">
                    {item.title}
                  </p>
                  <p className="relative mt-2 text-sm uppercase tracking-wide text-foreground/55">
                    {item.subtitle}
                  </p>

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow transition-transform duration-500 ease-out group-hover:scale-x-100" />
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-black px-5 py-24 sm:px-8 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a0f08_0%,_#050403_55%,_#000000_100%)]" />
        <div className="absolute inset-0 bg-noise opacity-[0.04]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-wb-red/15 via-wb-orange/15 to-wb-yellow/15 blur-[160px]" />

        <Reveal className="relative mx-auto max-w-3xl rounded-[2rem] border border-white/15 bg-white/[0.05] px-6 py-14 text-center shadow-[0_30px_90px_-30px_rgba(0,0,0,0.65)] backdrop-blur-md sm:px-14 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-wb-orange">
            {t.contact.finalCta.label}
          </p>
          <h2 className="mt-4 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
            {t.contact.finalCta.titlePrefix}{" "}
            <span className="text-gradient-ember">{t.contact.finalCta.titleHighlight}</span>?
          </h2>
          <p className="mt-4 text-foreground/60">{t.contact.finalCta.subtitle}</p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow bg-[length:200%_100%] bg-left px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-black transition-[background-position,box-shadow,transform] duration-500 ease-out hover:scale-105 hover:bg-right hover:shadow-[0_0_32px_-4px_rgba(244,103,15,0.65)]"
            >
              <MapPin className="h-4 w-4" strokeWidth={2} />
              {t.contact.finalCta.getDirections}
            </a>
            <a
              href={SITE.phoneHref}
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm transition-[border-color,color,transform] duration-300 ease-out hover:scale-105 hover:border-wb-orange/60 hover:text-wb-orange"
            >
              <Phone className="h-4 w-4" strokeWidth={2} />
              {t.contact.finalCta.callNow}
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
