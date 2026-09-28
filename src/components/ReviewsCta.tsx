"use client";

import Reveal from "./Reveal";
import GoogleReviewsPanel from "./GoogleReviewsPanel";

export default function ReviewsCta() {
  return (
    <section className="relative overflow-hidden bg-wb-charcoal px-5 py-14 sm:px-8 lg:py-16">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-wb-red/10 via-wb-orange/15 to-wb-yellow/10 blur-[130px]" />

      <Reveal className="relative mx-auto max-w-4xl">
        <GoogleReviewsPanel variant="page" />
      </Reveal>
    </section>
  );
}
