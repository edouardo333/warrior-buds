"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, UserCheck, Users, type LucideIcon } from "lucide-react";
import SmartImage from "./SmartImage";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ICONS: LucideIcon[] = [Sparkles, UserCheck, Users];

export default function WhyWarriorBuds() {
  const { t } = useLanguage();
  const parallaxRef = useRef<HTMLDivElement>(null);

  const REASONS = [
    t.whyWarriorBuds.reasons.selection,
    t.whyWarriorBuds.reasons.service,
    t.whyWarriorBuds.reasons.community,
  ];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const el = parallaxRef.current;
    if (!el) return;

    let ticking = false;
    const applyOffset = () => {
      const rect = el.getBoundingClientRect();
      const distanceFromCenter = rect.top + rect.height / 2 - window.innerHeight / 2;
      const offset = Math.max(Math.min(distanceFromCenter * 0.06, 24), -24);
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(applyOffset);
        ticking = true;
      }
    };
    applyOffset();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative overflow-hidden bg-wb-charcoal px-5 py-24 sm:px-8 lg:py-32">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-wb-red/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-wb-orange/10 blur-[140px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-wb-red/10 via-wb-orange/10 to-wb-yellow/10 blur-[160px]" />

      <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal>
          <div className="group relative h-80 overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] sm:h-[28rem] lg:h-[34rem]">
            <div ref={parallaxRef} className="absolute inset-0 transition-transform duration-500 ease-out">
              <SmartImage
                src="/images/hero/why-warrior-buds.webp"
                alt="Warrior Buds dispensary storefront at night"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="scale-110 object-contain transition-transform duration-700 ease-out group-hover:scale-100 motion-reduce:transition-none motion-reduce:group-hover:scale-110"
                fallback={
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#2a1206_0%,_#150a04_55%,_#000000_100%)]">
                    <div className="absolute inset-0 bg-noise opacity-[0.05]" />
                  </div>
                }
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 transition-[box-shadow] duration-500 group-hover:ring-wb-orange/30" />
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-wb-red/15 via-wb-orange/15 to-wb-yellow/15 blur-[100px]" />

            <p className="relative text-xs font-semibold uppercase tracking-[0.35em] text-wb-orange">
              {t.whyWarriorBuds.eyebrow}
            </p>
            <h2 className="relative mt-3 whitespace-nowrap font-display text-4xl tracking-wide text-foreground sm:text-5xl lg:text-6xl">
              {t.whyWarriorBuds.title}
            </h2>
            <p className="relative mt-5 max-w-md text-foreground/60">{t.whyWarriorBuds.lead}</p>

            <div className="relative mt-9 flex flex-col divide-y divide-white/10 border-t border-white/10">
              {REASONS.map((reason, index) => {
                const Icon = ICONS[index];
                return (
                  <Reveal key={reason.title} delay={280 + index * 130}>
                    <div className="group/row relative overflow-hidden px-1 py-6 transition-colors duration-300 hover:bg-white/[0.03] sm:px-3">
                      <span className="pointer-events-none absolute left-0 top-1/2 h-[55%] w-[3px] -translate-y-1/2 scale-y-0 rounded-full bg-gradient-to-b from-wb-red via-wb-orange to-wb-yellow transition-transform duration-300 ease-out group-hover/row:scale-y-100" />
                      <div className="pointer-events-none absolute -right-6 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-wb-orange/0 blur-[60px] transition-colors duration-500 group-hover/row:bg-wb-orange/15" />
                      <span
                        className="wb-value-number pointer-events-none absolute -right-1 -top-2 select-none font-display text-6xl leading-none text-wb-orange opacity-[0.1]"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="relative flex items-start gap-4 pl-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-wb-red via-wb-orange to-wb-yellow text-black shadow-lg transition-transform duration-300 group-hover/row:scale-110 group-hover/row:rotate-3">
                          <Icon className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <div>
                          <h3 className="font-display text-xl tracking-wide text-foreground">
                            {reason.title}
                          </h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">
                            {reason.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={700}>
              <Link
                href="/about"
                className="group relative isolate mt-10 inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm transition-[border-color,color,box-shadow,transform] duration-300 ease-out hover:scale-105 hover:border-wb-orange/60 hover:text-wb-orange hover:shadow-[0_0_28px_-6px_rgba(244,103,15,0.45)] motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                <span className="pointer-events-none absolute inset-0 -z-10 -translate-x-full bg-gradient-to-r from-transparent via-wb-orange/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                {t.whyWarriorBuds.cta}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2}
                />
              </Link>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
