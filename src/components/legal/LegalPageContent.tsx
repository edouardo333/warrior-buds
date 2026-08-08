"use client";

import Link from "next/link";
import { ArrowRight, ArrowUp, Phone } from "lucide-react";
import Reveal from "@/components/Reveal";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type LegalPageContentProps = {
  page: "privacy" | "terms" | "cookies";
};

// Shared renderer for /privacy-policy, /terms-and-conditions and
// /cookie-policy — each page just names which translated LegalDocument to
// render (t.legal.privacy / .terms / .cookies) and gets the same premium
// black/red/orange treatment, numbered sections, on-page nav and contact
// CTA. Looking the doc up from `t` here (instead of taking it as a prop)
// keeps it reactive to the language switcher, same pattern as
// PlaceholderSection's `t.placeholders[page]`.
export default function LegalPageContent({ page }: LegalPageContentProps) {
  const { t } = useLanguage();
  const legal = t.legal;
  const doc = legal[page];

  return (
    <>
      {/* Header */}
      <section id="top" className="relative overflow-hidden bg-black px-5 pb-16 pt-32 sm:px-8 sm:pt-40 lg:pb-20 lg:pt-48">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a0f08_0%,_#050403_55%,_#000000_100%)]" />
        <div className="absolute inset-0 bg-noise opacity-[0.04]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-wb-orange/10 blur-[150px]" />

        <Reveal className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">{doc.eyebrow}</p>
          <h1 className="mt-3 font-display text-5xl tracking-wide text-foreground sm:text-6xl">{doc.title}</h1>
          <p className="mt-5 text-balance text-base text-foreground/60 sm:text-lg">{doc.intro}</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-foreground/60 backdrop-blur-sm">
            {legal.lastUpdatedLabel}
            <span className="text-foreground/85">{doc.lastUpdated}</span>
          </p>
        </Reveal>
      </section>

      {/* Body */}
      <section className="relative bg-black px-5 pb-20 sm:px-8 lg:pb-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.75fr_2fr] lg:items-start lg:gap-16">
          {/* On-page nav — desktop only; sections are short enough on mobile
              to just scroll through. */}
          <Reveal className="hidden lg:block">
            <nav className="sticky top-24 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-wb-orange">{legal.onThisPage}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {doc.sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-sm text-foreground/60 transition-colors duration-200 hover:text-wb-orange"
                    >
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          {/* Sections */}
          <div className="min-w-0">
            {doc.sections.map((section, index) => (
              <Reveal key={section.id} delay={Math.min(index * 40, 240)}>
                <div id={section.id} className="scroll-mt-24 py-8 first:pt-0">
                  <h2 className="font-display text-2xl tracking-wide text-foreground sm:text-3xl">
                    <span className="text-gradient-ember">{index + 1}.</span> {section.title}
                  </h2>
                  <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-foreground/70 sm:text-base">
                    {section.blocks.map((block, blockIndex) => {
                      if (block.type === "p") {
                        return (
                          <p key={blockIndex} className="text-balance">
                            {block.text}
                          </p>
                        );
                      }
                      if (block.type === "list") {
                        return (
                          <ul key={blockIndex} className="flex flex-col gap-2.5">
                            {block.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex gap-3">
                                <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-wb-orange" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      return (
                        <div
                          key={blockIndex}
                          className="rounded-xl border border-dashed border-wb-orange/40 bg-wb-orange/[0.06] px-4 py-3.5"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-wb-orange">
                            {legal.todoLabel}
                          </p>
                          <p className="mt-1.5">{block.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {index < doc.sections.length - 1 && <div className="divider-ember" />}
              </Reveal>
            ))}

            <a
              href="#top"
              className="mt-10 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-foreground/50 transition-colors duration-200 hover:text-wb-orange"
            >
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} />
              {legal.backToTopLabel}
            </a>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative overflow-hidden bg-wb-charcoal px-5 py-20 sm:px-8 lg:py-24">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-wb-orange/10 blur-[150px]" />
        <Reveal className="relative mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">{legal.contactEyebrow}</p>
          <h2 className="mt-3 font-display text-3xl tracking-wide text-foreground sm:text-4xl">{legal.contactTitle}</h2>
          <p className="mt-3 text-sm text-foreground/60 sm:text-base">{legal.contactSubtitle}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105"
            >
              {legal.contactCta}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <a
              href={SITE.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-wb-orange/60 hover:text-wb-orange"
            >
              <Phone className="h-4 w-4" strokeWidth={2} />
              {SITE.phoneDisplay}
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
