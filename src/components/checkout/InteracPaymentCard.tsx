"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { interacProvider } from "@/lib/shop/payment-providers/interac";
import { InteracMark } from "./PaymentBrandMark";

export default function InteracPaymentCard({ orderId, total }: { orderId: string; total: number }) {
  const { locale } = useLanguage();
  const instructions = interacProvider.getInstructions(locale, { id: orderId, total });

  return (
    <div className="rounded-2xl border border-wb-orange/30 bg-wb-orange/5 p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-foreground">{instructions.title}</p>
        <InteracMark />
      </div>
      <ol className="mt-4 flex flex-col gap-2 text-sm text-foreground/75">
        {instructions.steps.map((step, i) => (
          <li key={i} className="flex gap-2">
            <span className="shrink-0 font-semibold text-wb-orange">{i + 1}.</span>
            {step}
          </li>
        ))}
      </ol>
      {instructions.note && <p className="mt-4 text-xs text-foreground/50">{instructions.note}</p>}
    </div>
  );
}
