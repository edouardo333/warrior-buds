"use client";

// Storefront — BUDS5 promo code entry + feedback for the checkout Review
// step. Purely presentational: eligibility is decided by
// lib/shop/promo-engine.ts (owned by CheckoutView), this component just
// collects the code and surfaces the resulting success/error message.

import { useState } from "react";
import { fieldClass } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export type PromoFeedback = { type: "success" | "error"; message: string };

export default function PromoCodeField({
  appliedCode,
  feedback,
  onApply,
  onRemove,
}: {
  appliedCode: string | null;
  feedback: PromoFeedback | null;
  onApply: (code: string) => void;
  onRemove: () => void;
}) {
  const { t } = useLanguage();
  const [input, setInput] = useState("");

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-wb-green/30 bg-wb-green/5 p-4">
        <p className="text-sm font-semibold text-wb-green">{feedback?.message}</p>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-xs text-foreground/50 underline-offset-2 transition-colors hover:text-wb-orange hover:underline"
        >
          {t.promo.remove}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <label htmlFor="promo-code" className="text-xs font-semibold uppercase tracking-widest text-foreground/50">
        {t.promo.label}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="promo-code"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder={t.promo.placeholder}
          className={fieldClass(feedback?.type === "error")}
        />
        <button
          type="button"
          onClick={() => onApply(input)}
          className="shrink-0 rounded-xl border border-wb-orange/50 bg-wb-orange/10 px-5 text-xs font-semibold uppercase tracking-wide text-wb-orange transition-colors hover:bg-wb-orange/20"
        >
          {t.promo.apply}
        </button>
      </div>
      {feedback?.type === "error" && <p className="mt-2 text-xs text-wb-red">{feedback.message}</p>}
    </div>
  );
}
