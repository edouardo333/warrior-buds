"use client";

import SmartImage from "./SmartImage";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AboutBeginning() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-background px-5 py-24 sm:px-8 lg:py-32">
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-wb-orange/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        <Reveal>
          <div className="relative h-80 overflow-hidden rounded-3xl border border-white/10 bg-black sm:h-[28rem] lg:h-[34rem]">
            <SmartImage
              src="/images/hero/comment-tout-a-commencé.webp"
              alt="Inside the Warrior Buds dispensary"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-center"
              fallback={
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#2a1206_0%,_#150a04_55%,_#000000_100%)]">
                  <div className="absolute inset-0 bg-noise opacity-[0.05]" />
                </div>
              }
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">
              {t.about.beginning.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
              {t.about.beginning.title}
            </h2>
            <p className="mt-5 max-w-md text-foreground/60">{t.about.beginning.paragraph1}</p>
            <p className="mt-4 max-w-md text-foreground/60">{t.about.beginning.paragraph2}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
