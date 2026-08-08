// Storefront — Shakepay payment provider adapter. DEMO ONLY: this is a
// pre-production build and no real Shakepay account or credentials are
// connected here. getInstructions() always returns a placeholder note —
// never invent real account details. Wiring a live integration later means
// filling this file in, never touching checkout components.

import type { PaymentProviderAdapter } from "@/types/shop-payment";

const TEXT = {
  fr: {
    displayName: "Shakepay",
    title: "Payer avec Shakepay",
    noteCheckout: "Les instructions de paiement apparaîtront ici lors du paiement.",
    notePostOrder: "Mode de paiement en démonstration — les instructions finales seront configurées avant le lancement.",
  },
  en: {
    displayName: "Shakepay",
    title: "Pay with Shakepay",
    noteCheckout: "Payment instructions will appear here at checkout.",
    notePostOrder: "Demo payment method — final payment instructions will be configured before launch.",
  },
} as const;

export const shakepayProvider: PaymentProviderAdapter = {
  id: "shakepay",
  enabled: true,
  getDisplayName: (locale) => TEXT[locale].displayName,
  getInstructions: (locale, _order, stage = "checkout") => ({
    title: TEXT[locale].title,
    steps: [],
    note: stage === "post-order" ? TEXT[locale].notePostOrder : TEXT[locale].noteCheckout,
  }),
};
