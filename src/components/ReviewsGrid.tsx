"use client";

import Reveal from "./Reveal";
import { GOOGLE_REVIEWS } from "@/lib/reviewsData";

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${i < count ? "fill-wb-yellow" : "fill-white/15"}`}
        >
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsGrid() {
  return (
    <section className="relative bg-background px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {GOOGLE_REVIEWS.map((review) => (
              <article
                key={review.id}
                className="mb-5 block w-full break-inside-avoid rounded-2xl border border-white/10 bg-wb-charcoal-light/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-colors duration-300 hover:border-wb-orange/40"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white ${review.avatarClass}`}
                  >
                    {review.avatarInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{review.name}</p>
                    <p className="truncate text-xs text-foreground/45">{review.meta}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Stars count={review.rating} />
                  <span className="text-xs text-foreground/40">{review.timeAgo}</span>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                  {review.text}
                </p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
