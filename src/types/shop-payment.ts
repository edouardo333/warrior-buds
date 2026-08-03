// Storefront — reusable payment-provider architecture. Adding a real
// gateway later (Stripe, Moneris, etc.) means adding a new adapter file in
// lib/shop/payment-providers/ that satisfies this contract and registering
// it in registry.ts — never hardcoding provider logic into checkout
// components. Independent of the CRM's PaymentRecord/PaymentProvider
// (types/payment.ts). Never imports from or writes to data/bud-guardian/**,
// lib/staff/**, or components/staff/**.

import type { Locale } from "@/lib/i18n/types";

export type PaymentProviderId = "interac" | "cash-pickup";

export type PaymentInstructions = {
  title: string;
  steps: string[];
  note: string | null;
};

export type PaymentProviderAdapter = {
  id: PaymentProviderId;
  enabled: boolean;
  getDisplayName: (locale: Locale) => string;
  getInstructions: (locale: Locale, order: { id: string; total: number }) => PaymentInstructions;
};
