"use client";

import { Sparkles, UserCheck, Star, Users, type LucideIcon } from "lucide-react";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FEATURE_META: { key: "curated" | "team" | "customers" | "community"; icon: LucideIcon }[] = [
  { key: "curated", icon: Sparkles },
  { key: "team", icon: UserCheck },
  { key: "customers", icon: Star },
  { key: "community", icon: Users },
];

export default function AboutExperience() {
  const { t } = useLanguage();

  const FEATURES = FEATURE_META.map((meta) => ({
    ...meta,
    ...t.about.experience.items[meta.key],
  }));

  return (
    <section className="relative overflow-hidden bg-background px-5 py-24 sm:px-8 lg:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-wb-red/10 via-wb-orange/10 to-wb-yellow/10 blur-[150px]" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">
              {t.about.experience.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
              {t.about.experience.title}
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={index * 120}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-wb-orange/40 hover:bg-white/[0.05]">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-wb-red/20 via-wb-orange/20 to-wb-yellow/20 blur-[70px] transition-transform duration-300 group-hover:scale-125" />

                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-wb-red via-wb-orange to-wb-yellow text-black transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>

                  <h3 className="relative mt-6 font-display text-xl tracking-wide text-foreground">
                    {feature.title}
                  </h3>
                  <p className="relative mt-3 text-sm text-foreground/60">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
