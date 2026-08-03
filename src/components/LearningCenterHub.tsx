"use client";

import { useState } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import LearningTopicModal from "./LearningTopicModal";
import { LEARNING_CATEGORIES, type LearningCategory, type LearningTopic } from "@/data/learning-center";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ACCENT = {
  red: {
    text: "text-wb-red",
    border: "hover:border-wb-red/40",
    glow: "bg-wb-red/15",
    ring: "border-wb-red/40",
  },
  orange: {
    text: "text-wb-orange",
    border: "hover:border-wb-orange/40",
    glow: "bg-wb-orange/15",
    ring: "border-wb-orange/40",
  },
  yellow: {
    text: "text-wb-yellow",
    border: "hover:border-wb-yellow/40",
    glow: "bg-wb-yellow/15",
    ring: "border-wb-yellow/40",
  },
} as const;

export default function LearningCenterHub() {
  const { locale, t } = useLanguage();
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<{
    category: LearningCategory;
    topic: LearningTopic;
  } | null>(null);

  const activeCategory = LEARNING_CATEGORIES.find((c) => c.slug === activeCategorySlug) ?? null;

  return (
    <section className="relative bg-background px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        {!activeCategory && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LEARNING_CATEGORIES.map((category, index) => {
              const accent = ACCENT[category.accent];
              const Icon = category.icon;
              const isResponsibleUse = category.slug === "responsible-use";
              return (
                <Reveal
                  key={category.slug}
                  delay={index * 70}
                  className={isResponsibleUse ? "lg:col-start-2" : ""}
                >
                  <button
                    type="button"
                    onClick={() => setActiveCategorySlug(category.slug)}
                    className={`group relative block h-64 w-full overflow-hidden rounded-3xl border border-white/10 text-left transition-colors duration-300 sm:h-72 ${accent.border}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-wb-charcoal-light via-black to-wb-charcoal">
                      <div className="absolute inset-0 bg-noise opacity-[0.05]" />
                      <div
                        className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full ${accent.glow} blur-[80px] transition-transform duration-500 group-hover:scale-125`}
                      />
                    </div>

                    <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/40 transition-transform duration-300 group-hover:scale-110`}
                        >
                          <Icon className={`h-6 w-6 ${accent.text}`} />
                        </div>
                        <span className="text-2xl leading-none" aria-hidden>
                          {category.emoji}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display text-2xl tracking-wide text-foreground sm:text-[1.7rem]">
                          {category.title[locale]}
                        </h3>
                        <p className="mt-1.5 text-sm text-foreground/60">{category.description[locale]}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-widest text-foreground/40">
                            {category.topics.length} {t.learningCenter.guidesLabel}
                          </span>
                          <ArrowUpRight
                            className={`h-4 w-4 ${accent.text} transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1`}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        )}

        {activeCategory && (
          <div key={activeCategory.slug} className="wb-guardian-message-in">
            <Reveal>
              <button
                type="button"
                onClick={() => setActiveCategorySlug(null)}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-foreground/60 transition-colors hover:text-wb-orange"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t.learningCenter.backToCategories}
              </button>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                  <activeCategory.icon className={`h-7 w-7 ${ACCENT[activeCategory.accent].text}`} />
                </div>
                <div>
                  <h2 className="font-display text-3xl tracking-wide text-foreground sm:text-4xl">
                    {activeCategory.title[locale]}
                  </h2>
                  <p className="mt-1 text-sm text-foreground/60">{activeCategory.description[locale]}</p>
                </div>
              </div>
            </Reveal>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeCategory.topics.map((topic, index) => {
                const accent = ACCENT[activeCategory.accent];
                return (
                  <Reveal key={topic.slug} delay={index * 60}>
                    <button
                      type="button"
                      onClick={() => setActiveTopic({ category: activeCategory, topic })}
                      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition-colors duration-300 ${accent.border}`}
                    >
                      <div
                        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full ${accent.glow} blur-[60px] opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                      />
                      <h3 className="relative font-display text-xl tracking-wide text-foreground">
                        {topic.title[locale]}
                      </h3>
                      <p className="relative mt-2 flex-1 text-sm leading-relaxed text-foreground/60">
                        {topic.summary[locale]}
                      </p>
                      <span
                        className={`relative mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest ${accent.text} transition-transform duration-300 ease-out group-hover:translate-x-1`}
                      >
                        {t.learningCenter.readGuide}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {activeTopic && (
        <LearningTopicModal
          category={activeTopic.category}
          topic={activeTopic.topic}
          locale={locale}
          closeLabel={t.learningCenter.close}
          disclaimerText={t.learningCenter.disclaimerText}
          onClose={() => setActiveTopic(null)}
        />
      )}
    </section>
  );
}
