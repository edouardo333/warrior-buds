// Storefront — Credit/Debit Card payment provider adapter. DEMO ONLY: this
// is a pre-production build and no real card processor is connected here.
// getInstructions() always returns a placeholder note — never invent real
// processor details. Wiring a live processor later means filling this file
// in, never touching checkout components.

import type { PaymentProviderAdapter } from "@/types/shop-payment";

const TEXT = {
  fr: {
    displayName: "Carte de crédit / débit",
    title: "Payer par carte de crédit ou débit",
    noteCheckout: "Les instructions de paiement apparaîtront ici lors du paiement.",
    notePostOrder: "Mode de paiement en démonstration — les instructions finales seront configurées avant le lancement.",
  },
  en: {
    displayName: "Credit / Debit Card",
    title: "Pay by Credit or Debit Card",
    noteCheckout: "Payment instructions will appear here at checkout.",
    notePostOrder: "Demo payment method — final payment instructions will be configured before launch.",
  },
} as const;

export const cardProvider: PaymentProviderAdapter = {
  id: "card",
  enabled: true,
  getDisplayName: (locale) => TEXT[locale].displayName,
  getInstructions: (locale, _order, stage = "checkout") => ({
    title: TEXT[locale].title,
    steps: [],
    note: stage === "post-order" ? TEXT[locale].notePostOrder : TEXT[locale].noteCheckout,
  }),
};
