"use client";

import StarRating from "./StarRating";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ProductReview } from "@/types/product";

export default function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
  const { t, locale } = useLanguage();

  if (reviews.length === 0) {
    return <p className="text-sm text-foreground/50">{t.productCatalog.detail.noReviews}</p>;
  }

  return (
    <ul className="flex flex-col gap-6">
      {reviews.map((review) => (
        <li key={review.id} className="border-b border-white/10 pb-6 last:border-0">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-foreground">{review.author}</p>
            <p className="shrink-0 text-xs text-foreground/40">{new Date(review.createdAt).toLocaleDateString(locale)}</p>
          </div>
          <div className="mt-1">
            <StarRating rating={review.rating} />
          </div>
          <p className="mt-2 text-sm font-medium text-foreground/90">{review.title}</p>
          <p className="mt-1 text-sm text-foreground/60">{review.body}</p>
          {review.verifiedPurchase && <p className="mt-2 text-xs text-wb-guardian-green">{t.productCatalog.detail.verifiedPurchase}</p>}
        </li>
      ))}
    </ul>
  );
}
