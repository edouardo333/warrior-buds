"use client";

import CategoryCard from "./CategoryCard";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-full w-full">
      <path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16z" strokeLinejoin="round" />
      <path d="M6 18L18 6" strokeLinecap="round" />
    </svg>
  );
}

function GummyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-full w-full">
      <path d="M8 3.5c-2.5 0-4.5 2-4.5 4.5 0 1 .3 1.9.9 2.6-1.4 1-2.4 2.7-2.4 4.6 0 3 2.4 5.3 5.3 5.3 1.8 0 3.4-.9 4.3-2.3.9 1.4 2.5 2.3 4.3 2.3 2.9 0 5.3-2.4 5.3-5.3 0-1.9-1-3.6-2.4-4.6.6-.7.9-1.6.9-2.6 0-2.5-2-4.5-4.5-4.5-1.3 0-2.5.6-3.3 1.5-.8-.9-2-1.5-3.3-1.5-1.3 0-2.5.6-3.3 1.5" strokeLinejoin="round" />
    </svg>
  );
}

function VapeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-full w-full">
      <rect x="9.5" y="3" width="5" height="13" rx="2" />
      <path d="M12 16v2.5M8.5 21.5h7M4 8c1.5 1 1.5 3 0 4M20 8c-1.5 1-1.5 3 0 4" strokeLinecap="round" />
    </svg>
  );
}

function DropletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-full w-full">
      <path d="M12 3c4 5 7 9 7 12.5A7 7 0 015 15.5C5 12 8 8 12 3z" strokeLinejoin="round" />
    </svg>
  );
}

function BalanceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-full w-full">
      <path d="M12 3v18M6 7l-3.5 6.5a3.5 3.5 0 007 0L6 7zM18 7l-3.5 6.5a3.5 3.5 0 007 0L18 7zM6 7h12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-full w-full">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v2.4M12 18.6V21M4.9 6.9l1.7 1.7M17.4 15.4l1.7 1.7M3 12h2.4M18.6 12H21M4.9 17.1l1.7-1.7M17.4 8.6l1.7-1.7" strokeLinecap="round" />
    </svg>
  );
}

const CATEGORY_META = [
  { key: "flower", fallbackGradient: "from-wb-red/60 via-black to-wb-charcoal", icon: <LeafIcon /> },
  { key: "edibles", fallbackGradient: "from-wb-orange/60 via-black to-wb-charcoal", icon: <GummyIcon /> },
  { key: "vapes", fallbackGradient: "from-wb-yellow/50 via-black to-wb-charcoal", icon: <VapeIcon /> },
  { key: "concentrates", fallbackGradient: "from-wb-red/50 via-wb-orange/25 to-black", icon: <DropletIcon /> },
  { key: "cbd", fallbackGradient: "from-foreground/10 via-wb-charcoal to-black", icon: <BalanceIcon /> },
  { key: "accessories", fallbackGradient: "from-wb-charcoal-light via-black to-wb-charcoal", icon: <GearIcon /> },
] as const;

export default function Categories() {
  const { t } = useLanguage();

  return (
    <section className="relative bg-background px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wb-orange">
            {t.categories.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
            {t.categories.title}
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_META.map((category, index) => {
            const content = t.categories.items[category.key];
            return (
              <Reveal key={category.key} delay={index * 80}>
                <CategoryCard
                  name={content.name}
                  description={content.description}
                  exploreLabel={t.categories.explore}
                  fallbackGradient={category.fallbackGradient}
                  icon={category.icon}
                />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
