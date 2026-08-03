"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getBadgeLabel } from "@/lib/shop/product-engine";
import type { ProductBadge } from "@/types/product";

const BADGE_STYLES: Record<ProductBadge, string> = {
  new: "border-wb-guardian-blue/30 bg-wb-guardian-blue/15 text-wb-guardian-blue",
  "best-seller": "border-wb-orange/30 bg-wb-orange/15 text-wb-orange",
  sale: "border-wb-red/30 bg-wb-red/15 text-wb-red",
  "staff-pick": "border-wb-guardian-green/30 bg-wb-guardian-green/15 text-wb-guardian-green",
  limited: "border-wb-yellow/30 bg-wb-yellow/15 text-wb-yellow",
  "low-stock": "border-white/15 bg-white/10 text-white/70",
};

export default function ProductBadges({ badges, className = "" }: { badges: ProductBadge[]; className?: string }) {
  const { locale } = useLanguage();
  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {badges.map((badge) => (
        <span
          key={badge}
          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm ${BADGE_STYLES[badge]}`}
        >
          {getBadgeLabel(badge, locale)}
        </span>
      ))}
    </div>
  );
}
