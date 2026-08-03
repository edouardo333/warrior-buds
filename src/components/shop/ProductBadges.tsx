"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getBadgeLabel } from "@/lib/shop/product-engine";
import type { ProductBadge } from "@/types/product";

const BADGE_STYLES: Record<ProductBadge, string> = {
  new: "bg-wb-guardian-blue/20 text-wb-guardian-blue",
  "best-seller": "bg-wb-orange/20 text-wb-orange",
  sale: "bg-wb-red/20 text-wb-red",
  "staff-pick": "bg-wb-guardian-green/20 text-wb-guardian-green",
  limited: "bg-wb-yellow/20 text-wb-yellow",
  "low-stock": "bg-white/10 text-white/70",
};

export default function ProductBadges({ badges, className = "" }: { badges: ProductBadge[]; className?: string }) {
  const { locale } = useLanguage();
  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {badges.map((badge) => (
        <span key={badge} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${BADGE_STYLES[badge]}`}>
          {getBadgeLabel(badge, locale)}
        </span>
      ))}
    </div>
  );
}
