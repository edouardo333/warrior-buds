"use client";

import { Check, Circle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { buildTrackingSteps } from "@/lib/shop/order-engine";
import type { ShopOrder } from "@/types/shop-order";

export default function OrderTrackingTimeline({ order }: { order: ShopOrder }) {
  const { t, locale } = useLanguage();
  const steps = buildTrackingSteps(order, locale);

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.orderDetail.timeline}</h2>
      <ol className="mt-6 flex flex-col gap-0">
        {steps.map((step, i) => (
          <li key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
            {i < steps.length - 1 && (
              <span className={`absolute left-[15px] top-8 h-full w-px ${step.state === "done" ? "bg-wb-orange" : "bg-white/10"}`} />
            )}
            <span
              className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                step.state === "done"
                  ? "border-wb-orange bg-wb-orange text-black"
                  : step.state === "current"
                    ? "wb-track-step-in animate-pulse-glow border-wb-orange bg-wb-orange/15 text-wb-orange"
                    : "border-white/15 text-white/30"
              }`}
            >
              {step.state === "done" ? <Check className="h-4 w-4" /> : <Circle className="h-2.5 w-2.5 fill-current" />}
            </span>
            <div className="pt-1">
              <p className={`text-sm font-semibold ${step.state === "upcoming" ? "text-foreground/40" : "text-foreground"}`}>{step.label}</p>
              {step.at && <p className="mt-0.5 text-xs text-foreground/50">{new Date(step.at).toLocaleString(locale)}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
