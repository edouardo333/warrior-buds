"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

type PlaceholderSectionProps = {
  page: "gallery" | "products" | "learningCenter";
};

export default function PlaceholderSection({ page }: PlaceholderSectionProps) {
  const { t } = useLanguage();
  const content = t.placeholders[page];

  return (
    <section className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-black px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a0f08_0%,_#050403_55%,_#000000_100%)]" />
      <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-wb-red/20 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-wb-orange/15 blur-[130px]" />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center pt-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">
          {t.placeholders.comingSoon}
        </p>
        <h1 className="mt-3 font-display text-5xl tracking-wide text-foreground sm:text-6xl">
          {content.title}
        </h1>
        <p className="mt-6 max-w-md text-balance text-base text-foreground/60 sm:text-lg">
          {content.description}
        </p>
      </div>
    </section>
  );
}
