"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

const STEPS = ["shipping", "billing", "review", "payment"] as const;
type Step = (typeof STEPS)[number];

export default function CheckoutShell({ step }: { step: Step }) {
  const { t } = useLanguage();
  const activeIndex = STEPS.indexOf(step);

  return (
    <ol className="mt-8 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide sm:gap-4">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-2 sm:gap-4">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${
              i <= activeIndex ? "border-wb-orange bg-wb-orange/15 text-wb-orange" : "border-white/15 text-foreground/40"
            }`}
          >
            {i + 1}
          </span>
          <span className={i <= activeIndex ? "text-foreground/85" : "text-foreground/40"}>{t.checkout.steps[s]}</span>
          {i < STEPS.length - 1 && <span className="h-px w-6 bg-white/15 sm:w-10" />}
        </li>
      ))}
    </ol>
  );
}
