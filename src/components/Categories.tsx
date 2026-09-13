"use client";

import { Cannabis, Candy, Wind, Gem, Scale, Settings2, Sparkles, Bandage, Cigarette } from "lucide-react";
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
    image: "/images/categories/fleur.png",
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
    image: "/images/categories/comestibles.png",
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
    image: "/images/categories/vapoteuses.png",
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
    image: "/images/categories/concentrés.png",
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
    image: "/images/categories/cbd.png",
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
    image: "/images/categories/champignons.png",
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
    image: "/images/categories/produits topiques.png",
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
    image: "/images/categories/accessoires.png",
  },
  {
    key: "cigarettes",
    icon: <Cigarette className={iconClass} strokeWidth={1.75} />,
    theme: {
      glow: "var(--wb-gold)",
      glowSecondary: "var(--wb-red)",
      gradient: "from-wb-charcoal via-black to-wb-red/10",
    },
    href: "/products?category=cigarettes",
    image: "/images/categories/cigarettes.png",
  },
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

        {/* 9 categories = a clean 3×3 grid at desktop width (lg), no
            leftover/centered last row needed. sm keeps 2 columns (4 rows of
            2 + 1), base stays 1 column. */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_META.map((category, index) => {
            const content = t.categories.items[category.key];
            return (
              <Reveal key={category.key} delay={index * 80}>
                <CategoryCard
                  name={content.name}
                  description={content.description}
                  exploreLabel={t.categories.explore}
                  icon={category.icon}
                  theme={category.theme}
                  href={category.href}
                  imageSrc={category.image}
                  imageAlt={content.alt}
                />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
