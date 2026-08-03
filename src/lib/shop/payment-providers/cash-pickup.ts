// Storefront — Cash Pickup payment provider adapter. Modeled now as an
// "optional future" rail per spec, deliberately disabled — adding a real
// pickup flow later only means flipping `enabled` and filling in
// getInstructions(), never touching checkout logic.

import type { PaymentProviderAdapter } from "@/types/shop-payment";

const TEXT = {
  fr: {
    displayName: "Argent comptant à la cueillette (bientôt)",
    title: "Paiement en argent comptant à la cueillette",
    note: "Cette option n'est pas encore disponible.",
  },
  en: {
    displayName: "Cash on Pickup (coming soon)",
    title: "Pay cash at pickup",
    note: "This option isn't available yet.",
  },
} as const;

export const cashPickupProvider: PaymentProviderAdapter = {
  id: "cash-pickup",
  enabled: false,
  getDisplayName: (locale) => TEXT[locale].displayName,
  getInstructions: (locale) => ({ title: TEXT[locale].title, steps: [], note: TEXT[locale].note }),
};
