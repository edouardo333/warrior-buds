"use client";

// Storefront — /faq interactive search + accordion. Client-side only:
// filters the static FAQ_CATEGORIES content (data/faq.ts) by the current
// locale's question/answer text, no network calls. Accordion items use the
// CSS grid-template-rows trick (0fr → 1fr) for a smooth height animation
// without measuring DOM heights in JS.

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Search, X } from "lucide-react";
import Reveal from "../Reveal";
import { FAQ_CATEGORIES, type FaqItem } from "@/data/faq";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Locale } from "@/lib/i18n/types";

function matchesQuery(item: FaqItem, query: string, locale: Locale): boolean {
  if (!query) return true;
  const haystack = `${item.question[locale]} ${item.answer[locale]}`.toLowerCase();
  return haystack.includes(query);
}

// French questions end with a space before "?" (proper French typography),
// which is a valid wrap point — on narrow screens that can leave a lone "?"
// orphaned on its own line. Swapping just that trailing space for a
// non-breaking one glues it to the last word instead. No-op for English,
// which has no space before its terminal punctuation.
function glueTrailingPunctuation(text: string): string {
  return text.replace(/ ([?!:;])$/, " $1");
}

// Sticky header (Navbar) height a jump-to click should clear.
const SCROLL_OFFSET = 96;

export default function FaqExplorer() {
  const { t, locale } = useLanguage();
  const [query, setQuery] = useState("");
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const visibleCategories = useMemo(() => {
    if (!isSearching) return FAQ_CATEGORIES;
    return FAQ_CATEGORIES.map((category) => ({
      ...category,
      items: category.items.filter((item) => matchesQuery(item, normalizedQuery, locale)),
    })).filter((category) => category.items.length > 0);
  }, [isSearching, normalizedQuery, locale]);

  const totalResults = useMemo(
    () => visibleCategories.reduce((sum, category) => sum + category.items.length, 0),
    [visibleCategories]
  );

  function toggleItem(key: string) {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function scrollToCategory(slug: string) {
    const el = document.getElementById(`faq-${slug}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <section className="relative bg-background px-5 py-14 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.faq.search.placeholder}
              aria-label={t.faq.search.ariaLabel}
              className="w-full rounded-full border border-white/10 bg-white/[0.03] py-4 pl-12 pr-12 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors duration-200 focus:border-wb-orange/50 focus:bg-white/[0.05]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={t.faq.search.clear}
                className="absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-foreground/40 transition-colors hover:text-wb-orange"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {isSearching && (
            <p className="mt-3 px-2 text-xs font-semibold uppercase tracking-widest text-foreground/40">
              {t.faq.search.resultsCount(totalResults)}
            </p>
          )}
        </Reveal>

        {!isSearching && (
          <Reveal delay={80} className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-widest text-foreground/40">
              {t.faq.jumpToLabel}
            </span>
            {FAQ_CATEGORIES.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => scrollToCategory(category.slug)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-foreground/70 transition-colors duration-200 hover:border-wb-orange/40 hover:text-wb-orange"
              >
                {category.title[locale]}
              </button>
            ))}
          </Reveal>
        )}

        <div className="mt-10 flex flex-col gap-14">
          {visibleCategories.map((category) => (
            <div key={category.slug} id={`faq-${category.slug}`} className="scroll-mt-28">
              <Reveal>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                    <category.icon className="h-5 w-5 text-wb-orange" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl tracking-wide text-foreground sm:text-3xl">
                      {category.title[locale]}
                    </h2>
                    <p className="text-sm text-foreground/50">{category.description[locale]}</p>
                  </div>
                </div>
              </Reveal>

              <div className="mt-5 flex flex-col gap-3">
                {category.items.map((item, index) => {
                  const key = `${category.slug}:${item.slug}`;
                  const open = isSearching || openKeys.has(key);
                  return (
                    <Reveal key={key} delay={Math.min(index, 6) * 40}>
                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors duration-300 hover:border-wb-orange/30">
                        <button
                          type="button"
                          onClick={() => toggleItem(key)}
                          aria-expanded={open}
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                        >
                          <span className="text-sm font-medium text-foreground/90 sm:text-base">
                            {glueTrailingPunctuation(item.question[locale])}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-wb-orange transition-transform duration-300 ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <div
                          className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="px-5 pb-5 text-sm leading-relaxed text-foreground/65">
                              <p className="whitespace-pre-line">{item.answer[locale]}</p>
                              {item.links && item.links.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
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
          ))}
        </div>

        {isSearching && visibleCategories.length === 0 && (
          <Reveal className="mt-10 flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-14 text-center">
            <p className="font-display text-2xl tracking-wide text-foreground">{t.faq.search.noResultsTitle}</p>
            <p className="max-w-sm text-sm text-foreground/60">{t.faq.search.noResultsSubtitle}</p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-4 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-foreground/80 transition-colors hover:border-wb-orange/50 hover:text-wb-orange"
            >
              {t.faq.search.clear}
            </button>
          </Reveal>
        )}
      </div>
    </section>
  );
}
