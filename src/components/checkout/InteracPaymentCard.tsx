"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { interacProvider } from "@/lib/shop/payment-providers/interac";

function InteracLogo() {
  return (
    <svg viewBox="0 0 120 32" className="h-6 w-auto shrink-0" aria-label="Interac" role="img">
      <rect width="120" height="32" rx="6" fill="#FDB913" />
      <text x="60" y="21" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="14" fill="#000">
        INTERAC
      </text>
    </svg>
  );
}

export default function InteracPaymentCard({ orderId, total }: { orderId: string; total: number }) {
  const { locale } = useLanguage();
  const instructions = interacProvider.getInstructions(locale, { id: orderId, total });

  return (
    <div className="rounded-2xl border border-wb-orange/30 bg-wb-orange/5 p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-foreground">{instructions.title}</p>
        <InteracLogo />
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
