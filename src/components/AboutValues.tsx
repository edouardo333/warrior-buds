"use client";

import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const VALUE_META = [
  { key: "quality", number: "01", accent: "text-wb-red", glow: "bg-wb-red/15", border: "hover:border-wb-red/40" },
  { key: "community", number: "02", accent: "text-wb-orange", glow: "bg-wb-orange/15", border: "hover:border-wb-orange/40" },
  { key: "service", number: "03", accent: "text-wb-yellow", glow: "bg-wb-yellow/15", border: "hover:border-wb-yellow/40" },
] as const;

export default function AboutValues() {
  const { t } = useLanguage();

  const VALUES = VALUE_META.map((meta) => ({
    ...meta,
    ...t.about.values.items[meta.key],
  }));

  return (
    <section className="relative overflow-hidden bg-wb-charcoal px-5 py-24 sm:px-8 lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-wb-orange/10 blur-[150px]" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">
              {t.about.values.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
              {t.about.values.title}
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {VALUES.map((value, index) => (
            <Reveal key={value.title} delay={index * 150}>
              <div
                className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-colors duration-300 ${value.border}`}
              >
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full ${value.glow} blur-[80px] transition-transform duration-300 group-hover:scale-125`}
                />
                <span className={`relative font-display text-5xl ${value.accent}`}>
                  {value.number}
                </span>
                <h3 className="relative mt-5 font-display text-2xl tracking-wide text-foreground">
                  {value.title}
                </h3>
                <p className="relative mt-3 text-sm text-foreground/60">
                  {value.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
