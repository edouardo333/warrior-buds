"use client";

import { Gem, Users, Brain, type LucideIcon } from "lucide-react";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const VALUE_META: {
  key: "quality" | "community" | "service";
  number: string;
  icon: LucideIcon;
  accent: string;
  glow: string;
  border: string;
  numberTint: string;
}[] = [
  {
    key: "quality",
    number: "01",
    icon: Gem,
    accent: "text-wb-red",
    glow: "bg-wb-red/15",
    border: "hover:border-wb-red/40",
    numberTint: "text-wb-red",
  },
  {
    key: "community",
    number: "02",
    icon: Users,
    accent: "text-wb-orange",
    glow: "bg-wb-orange/15",
    border: "hover:border-wb-orange/40",
    numberTint: "text-wb-orange",
  },
  {
    key: "service",
    number: "03",
    icon: Brain,
    accent: "text-wb-yellow",
    glow: "bg-wb-yellow/15",
    border: "hover:border-wb-yellow/40",
    numberTint: "text-wb-yellow",
  },
];

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
          {VALUES.map((value, index) => {
            const Icon = value.icon;
            return (
              <Reveal key={value.title} delay={index * 150}>
                <div
                  className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.05] ${value.border}`}
                >
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full ${value.glow} blur-[80px] transition-transform duration-500 group-hover:scale-125`}
                  />

                  <span
                    className={`wb-value-number pointer-events-none absolute -right-3 -top-6 select-none font-display text-[7rem] leading-none ${value.numberTint} opacity-[0.14] transition-transform duration-500 group-hover:scale-110`}
                    aria-hidden="true"
                  >
                    {value.number}
                  </span>

                  <div
                    className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-wb-red via-wb-orange to-wb-yellow text-black shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>

                  <h3 className="relative mt-6 font-display text-2xl tracking-wide text-foreground">
                    {value.title}
                  </h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-foreground/60">
                    {value.description}
                  </p>

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow transition-transform duration-500 ease-out group-hover:scale-x-100" />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
