// Storefront — Bitcoin (BTC) payment provider adapter. DEMO ONLY: this is a
// pre-production build and no real wallet or address is connected here.
// getInstructions() always returns a placeholder note — never invent a real
// BTC address. Wiring a live wallet later means filling this file in, never
// touching checkout components.

import type { PaymentProviderAdapter } from "@/types/shop-payment";

const TEXT = {
  fr: {
    displayName: "Bitcoin (BTC)",
    title: "Payer avec Bitcoin (BTC)",
    noteCheckout: "Les instructions de paiement apparaîtront ici lors du paiement.",
    notePostOrder: "Mode de paiement en démonstration — les instructions finales seront configurées avant le lancement.",
  },
  en: {
    displayName: "Bitcoin (BTC)",
    title: "Pay with Bitcoin (BTC)",
    noteCheckout: "Payment instructions will appear here at checkout.",
    notePostOrder: "Demo payment method — final payment instructions will be configured before launch.",
  },
} as const;

export const bitcoinProvider: PaymentProviderAdapter = {
  id: "bitcoin",
  enabled: true,
  getDisplayName: (locale) => TEXT[locale].displayName,
  getInstructions: (locale, _order, stage = "checkout") => ({
    title: TEXT[locale].title,
    steps: [],
    note: stage === "post-order" ? TEXT[locale].notePostOrder : TEXT[locale].noteCheckout,
  }),
};
