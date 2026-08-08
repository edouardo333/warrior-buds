// Storefront — payment provider registry. Adding a new gateway later is a
// new adapter file plus one line here — checkout/account components always
// iterate this registry, never a hardcoded provider.

import type { PaymentProviderAdapter, PaymentProviderId } from "@/types/shop-payment";
import { bitcoinProvider } from "./bitcoin";
import { cardProvider } from "./card";
import { cashPickupProvider } from "./cash-pickup";
import { ethereumProvider } from "./ethereum";
import { interacProvider } from "./interac";
import { shakepayProvider } from "./shakepay";

export const PAYMENT_PROVIDERS: PaymentProviderAdapter[] = [
  interacProvider,
  cardProvider,
  bitcoinProvider,
  ethereumProvider,
  shakepayProvider,
  cashPickupProvider,
];

export function getProvider(id: PaymentProviderId): PaymentProviderAdapter | undefined {
  return PAYMENT_PROVIDERS.find((p) => p.id === id);
}

export function getEnabledProviders(): PaymentProviderAdapter[] {
  return PAYMENT_PROVIDERS.filter((p) => p.enabled);
}
