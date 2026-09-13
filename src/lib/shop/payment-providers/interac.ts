// Storefront — Interac e-Transfer payment provider adapter (active).

import type { PaymentProviderAdapter } from "@/types/shop-payment";
import { formatPrice } from "@/lib/shop/product-engine";

export const INTERAC_PAYMENT_EMAIL = "Pascal42221@gmail.com";

const TEXT = {
  fr: {
    displayName: "Virement Interac",
    title: "Payer par virement Interac",
    steps: (orderId: string, total: number) => [
      "Ouvrez l'application de votre banque et démarrez un virement Interac.",
      `Envoyez ${formatPrice(total, "fr")} CAD à ${INTERAC_PAYMENT_EMAIL}.`,
      `Inscrivez le numéro de commande ${orderId} dans le message du virement.`,
      "Aucune question de sécurité n'est requise — le dépôt automatique est activé.",
    ],
    note: "Votre commande sera traitée dès la réception du virement.",
  },
  en: {
    displayName: "Interac e-Transfer",
    title: "Pay by Interac e-Transfer",
    steps: (orderId: string, total: number) => [
      "Open your banking app and start an Interac e-Transfer.",
      `Send ${formatPrice(total, "en")} CAD to ${INTERAC_PAYMENT_EMAIL}.`,
      `Include the order number ${orderId} in the transfer message.`,
      "No security question is needed — auto-deposit is enabled.",
    ],
    note: "Your order will be processed as soon as the transfer is received.",
  },
} as const;

export const interacProvider: PaymentProviderAdapter = {
  id: "interac",
  enabled: true,
  getDisplayName: (locale) => TEXT[locale].displayName,
  getInstructions: (locale, order) => ({
    title: TEXT[locale].title,
    steps: TEXT[locale].steps(order.id, order.total),
    note: TEXT[locale].note,
  }),
};
