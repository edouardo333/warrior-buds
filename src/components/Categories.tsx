"use client";

import { Cannabis, Candy, Wind, Gem, Scale, Settings2, Sparkles, Bandage } from "lucide-react";
import CategoryCard from "./CategoryCard";
import Reveal from "./Reveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const iconClass = "h-5 w-5 sm:h-6 sm:w-6";

const CATEGORY_META = [
  {
    key: "flower",
    icon: <Cannabis className={iconClass} strokeWidth={1.75} />,
    theme: {
      glow: "var(--wb-red)",
      glowSecondary: "var(--wb-green)",
      gradient: "from-wb-red/25 via-black to-wb-green/10",
    },
    href: "/products",
  },
  {
    key: "edibles",
    icon: <Candy className={iconClass} strokeWidth={1.75} />,
    theme: {
      glow: "var(--wb-orange)",
      glowSecondary: "var(--wb-orange)",
      gradient: "from-wb-orange/30 via-black to-wb-charcoal",
    },
    href: "/products",
  },
  {
    key: "vapes",
    icon: <Wind className={iconClass} strokeWidth={1.75} />,
    theme: {
      glow: "var(--wb-yellow)",
      glowSecondary: "var(--wb-yellow)",
      gradient: "from-wb-yellow/25 via-black to-wb-charcoal",
    },
    href: "/products",
  },
  {
    key: "concentrates",
    icon: <Gem className={iconClass} strokeWidth={1.75} />,
    theme: {
      glow: "var(--wb-orange)",
      glowSecondary: "var(--wb-red)",
      gradient: "from-wb-orange/35 via-wb-red/15 to-black",
    },
    href: "/products",
  },
  {
    key: "cbd",
    icon: <Scale className={iconClass} strokeWidth={1.75} />,
    theme: {
      glow: "var(--wb-green)",
      glowSecondary: "var(--wb-gold)",
      gradient: "from-wb-green/25 via-black to-wb-gold/10",
    },
    href: "/products",
  },
  {
    key: "mushrooms",
    icon: <Sparkles className={iconClass} strokeWidth={1.75} />,
    theme: {
      glow: "var(--wb-gold)",
      glowSecondary: "var(--wb-green)",
      gradient: "from-wb-gold/25 via-black to-wb-green/10",
    },
    href: "/products",
  },
  {
    key: "topicals",
    icon: <Bandage className={iconClass} strokeWidth={1.75} />,
    theme: {
      glow: "var(--wb-red)",
      glowSecondary: "var(--wb-gold)",
      gradient: "from-wb-red/20 via-black to-wb-gold/10",
    },
    href: "/products?category=topicals",
  },
  {
    key: "accessories",
    icon: <Settings2 className={iconClass} strokeWidth={1.75} />,
    theme: {
      glow: "var(--wb-yellow)",
      glowSecondary: "var(--wb-orange)",
      gradient: "from-wb-yellow/20 via-black to-wb-orange/10",
    },
    href: "/products",
  },
] as const;

// Final row (Topicals + Accessories) has only 2 cards instead of 3. At the
// lg breakpoint the grid switches to 6 columns with every card spanning 2,
// which is mathematically identical in width to 3 columns of 1 (same gap
// arithmetic) but lets the last two cards be offset to sit dead-center of
// the row instead of hugging the left edge.
const CENTER_LAST_ROW: Partial<Record<(typeof CATEGORY_META)[number]["key"], string>> = {
  topicals: "lg:col-start-2",
  accessories: "lg:col-start-4",
};

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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {CATEGORY_META.map((category, index) => {
            const content = t.categories.items[category.key];
            return (
              <Reveal
                key={category.key}
                delay={index * 80}
                className={`lg:col-span-2 ${CENTER_LAST_ROW[category.key] ?? ""}`}
              >
                <CategoryCard
                  name={content.name}
                  description={content.description}
                  exploreLabel={t.categories.explore}
                  icon={category.icon}
                  theme={category.theme}
                  href={category.href}
                />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
