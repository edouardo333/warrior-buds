"use client";

import Reveal from "./Reveal";
import OpeningStatus from "./OpeningStatus";
import ContactForm from "./ContactForm";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const MAP_QUERY = encodeURIComponent(`${SITE.addressLine1}, ${SITE.addressLine2}`);
// Centered east of Oka (ll) so Saint-Eustache, Laval, Montréal and Longueuil
// are visible alongside the Warrior Buds marker (q), zoomed out for context.
const MAP_EMBED_SRC = `https://www.google.com/maps?q=${MAP_QUERY}&ll=45.55,-73.8&z=9&output=embed`;

export default function ContactPageContent() {
  const { t } = useLanguage();

  const INFO_STRIP = [
    t.contact.infoStrip.openDaily,
    t.contact.infoStrip.location,
    t.contact.infoStrip.ageRestriction,
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[48svh] w-full items-center justify-center overflow-hidden bg-black px-6 pt-16 sm:min-h-[54svh]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a0f08_0%,_#050403_55%,_#000000_100%)]" />
        <div className="pointer-events-none absolute -top-24 left-1/3 h-96 w-96 rounded-full bg-wb-red/20 blur-[130px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-wb-orange/15 blur-[140px]" />

        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center pt-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">
            {t.contact.hero.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-5xl tracking-wide text-foreground sm:text-6xl">
            {t.contact.hero.title}
          </h1>
          <p className="mt-5 max-w-md text-balance text-base text-foreground/60 sm:text-lg">
            {t.contact.hero.subtitle}
          </p>
          <div className="mt-6">
            <OpeningStatus />
          </div>
        </div>
      </section>

      {/* Details + Map */}
      <section className="relative bg-black px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-[1560px] gap-14 lg:grid-cols-[3fr_6.5fr] lg:items-start lg:gap-10">
          <Reveal>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">
                {t.contact.details.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
                {t.contact.details.title}
              </h2>

              <div className="mt-8 flex flex-col gap-6 border-t border-white/10 pt-8">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/50">
                    {t.contact.details.addressLabel}
                  </h3>
                  <a
                    href={SITE.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block"
                  >
                    <address className="flex flex-col gap-0.5 text-lg not-italic text-foreground transition-colors hover:text-wb-orange">
                      <span>{SITE.addressLine1}</span>
                      <span>{SITE.addressLine2}</span>
                    </address>
                  </a>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/50">
                    {t.contact.details.phoneLabel}
                  </h3>
                  <a
                    href={SITE.phoneHref}
                    className="mt-2 inline-block text-lg text-foreground transition-colors hover:text-wb-orange"
                  >
                    {SITE.phoneDisplay}
                  </a>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/50">
                    {t.contact.details.hoursLabel}
                  </h3>
                  <p className="mt-2 text-lg font-semibold uppercase tracking-wide text-foreground">
                    {t.contact.details.openDaily}
                  </p>
                  <p className="text-foreground/70">{t.contact.details.hoursValue}</p>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <a
                  href={SITE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105"
                >
                  {t.contact.details.getDirections}
                </a>
                <a
                  href={SITE.phoneHref}
                  className="rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-wb-orange/60 hover:text-wb-orange"
                >
                  {t.contact.details.callNow}
                </a>
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-wb-orange/60 hover:text-wb-orange"
                >
                  {t.contact.details.instagram}
                </a>
                <a
                  href={SITE.linktreeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-wb-orange/60 hover:text-wb-orange"
                >
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

      {/* Message Form */}
      <section className="relative overflow-hidden bg-wb-charcoal px-5 py-20 sm:px-8 lg:py-28">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-wb-red/10 blur-[140px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-wb-orange/10 blur-[140px]" />

        <Reveal className="relative mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">
              {t.contact.form.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
              {t.contact.form.title}
            </h2>
          </div>
          <ContactForm />
        </Reveal>
      </section>

      {/* Info Strip */}
      <section className="relative bg-black px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-3">
          {INFO_STRIP.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-wb-charcoal/60 px-6 py-8 text-center"
            >
              <p className="font-display text-xl tracking-wide text-foreground sm:text-2xl">
                {item.title}
              </p>
              <p className="mt-2 text-sm uppercase tracking-wide text-foreground/55">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
