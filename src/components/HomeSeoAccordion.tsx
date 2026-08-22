"use client";

// Homepage — SEO/information accordion, placed between WhyWarriorBuds and
// HomeFinalCta (app/page.tsx). Commercial/product/local discovery content
// only (see data/homepage-seo.ts for the "why this isn't the Learning
// Center or FAQ" rationale). Visual language follows the existing
// WhyWarriorBuds panel (dark charcoal, ember gradient accents) and the FAQ
// accordion's proven interaction (grid-template-rows height animation, no
// DOM measuring) — nothing new invented here, both patterns already exist
// elsewhere in the app.

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import Reveal from "./Reveal";
import { HOME_SEO_ACCORDION } from "@/data/homepage-seo";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// French titles ending in "?" have a space before the mark (proper French
// typography), which is a valid wrap point — on narrow screens that can
// leave a lone "?" orphaned on its own line. Swapping just that trailing
// space for a real non-breaking one ( ) glues it to the last word
// instead. No-op for English and for titles with no trailing punctuation.
function glueTrailingPunctuation(text: string): string {
  return text.replace(/ ([?!:;])$/, " $1");
}

export default function HomeSeoAccordion() {
  const { t, locale } = useLanguage();
  const [openSlugs, setOpenSlugs] = useState<Set<string>>(new Set([HOME_SEO_ACCORDION[0]?.slug ?? ""]));

  function toggle(slug: string) {
    setOpenSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <section className="relative overflow-hidden bg-wb-charcoal px-5 py-24 sm:px-8 lg:py-28">
      <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-wb-orange/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-wb-red/10 blur-[140px]" />

      <div className="relative mx-auto max-w-4xl">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-wb-orange">{t.homeSeo.eyebrow}</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl tracking-wide text-foreground sm:text-4xl lg:text-5xl">
            {t.homeSeo.title}
          </h2>
          <div className="mx-auto mt-5 flex max-w-2xl flex-col gap-3 text-sm leading-relaxed text-foreground/60 sm:text-base">
            {t.homeSeo.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col gap-3">
          {HOME_SEO_ACCORDION.map((item, index) => {
            const open = openSlugs.has(item.slug);
            const title = item.title[locale];
            return (
              <Reveal key={item.slug} delay={Math.min(index, 6) * 40}>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-300 hover:border-wb-orange/30">
                  <button
                    type="button"
                    onClick={() => toggle(item.slug)}
                    aria-expanded={open}
                    aria-label={open ? t.homeSeo.collapse(title) : t.homeSeo.expand(title)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-wb-red via-wb-orange to-wb-yellow text-black">
                      <item.icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <span className="flex-1 font-display text-base tracking-wide text-foreground sm:text-lg">
                      {glueTrailingPunctuation(title)}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-wb-orange transition-transform duration-300 ${
                        open ? "rotate-180" : ""
                      }`}
                      strokeWidth={2}
                    />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-3 px-5 pb-6 pl-[5rem] text-sm leading-relaxed text-foreground/65 sm:px-6 sm:pl-[5.25rem] sm:text-[0.9rem]">
                        {item.body[locale].map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                        {item.list && (
                          <ul className="flex flex-col gap-1.5">
                            {item.list[locale].map((entry) => (
                              <li key={entry} className="flex items-start gap-2">
                                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-wb-orange" aria-hidden="true" />
                                <span>{entry}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {item.links && item.links.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-x-5 gap-y-2">
                            {item.links.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-wb-orange transition-colors hover:text-wb-yellow"
                              >
                                {link.label[locale]}
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
