"use client";

import SmartImage from "./SmartImage";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AboutCommunity() {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-[60svh] w-full items-center overflow-hidden bg-black sm:min-h-[65svh]">
      <div className="absolute inset-0">
        <SmartImage
          src="/images/hero/hero-outside-night.webp"
          alt="Warrior Buds storefront lit up at night in Kanesatake"
          fill
          sizes="100vw"
          className="object-cover object-[center_30%]"
          fallback={
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#2a1206_0%,_#150a04_55%,_#000000_100%)]">
              <div className="absolute inset-0 bg-noise opacity-[0.05]" />
            </div>
          }
        />
      </div>

      <div className="absolute inset-0 bg-black/75" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/60" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-24 text-center sm:px-10">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">
            {t.about.community.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-wide text-foreground sm:text-5xl lg:text-6xl">
            {t.about.community.titlePrefix}{" "}
            <span className="text-gradient-ember">{t.about.community.titleHighlight}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-foreground/70 sm:text-lg">
            {t.about.community.paragraph}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
