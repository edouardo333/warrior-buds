// Storefront — reusable payment-provider architecture. Adding a real
// gateway later (Stripe, Moneris, etc.) means adding a new adapter file in
// lib/shop/payment-providers/ that satisfies this contract and registering
// it in registry.ts — never hardcoding provider logic into checkout
// components. Independent of the CRM's PaymentRecord/PaymentProvider
// (types/payment.ts). Never imports from or writes to data/bud-guardian/**,
// lib/staff/**, or components/staff/**.

import type { Locale } from "@/lib/i18n/types";

// "card" | "bitcoin" | "ethereum" | "shakepay" are demo/placeholder rails —
// see lib/shop/payment-providers/{card,bitcoin,ethereum,shakepay}.ts. No
// real processor, wallet, or account is ever connected; getInstructions()
// only ever returns a "coming soon" placeholder for these.
export type PaymentProviderId = "interac" | "cash-pickup" | "card" | "bitcoin" | "ethereum" | "shakepay";

export type PaymentInstructions = {
  title: string;
  steps: string[];
  note: string | null;
};

// "checkout" = still on Step 4 Payment, choosing a method (no order exists
// yet). "post-order" = the order has been placed — Order Confirmation,
// Order Details, /track-order. The demo rails (card/bitcoin/ethereum/
// shakepay) word their placeholder note differently per stage; Interac
// ignores this and always returns its real/demo instructions.
export type PaymentInstructionsStage = "checkout" | "post-order";

export type PaymentProviderAdapter = {
  id: PaymentProviderId;
  enabled: boolean;
  getDisplayName: (locale: Locale) => string;
  getInstructions: (
    locale: Locale,
    order: { id: string; total: number },
    stage?: PaymentInstructionsStage
  ) => PaymentInstructions;
};
