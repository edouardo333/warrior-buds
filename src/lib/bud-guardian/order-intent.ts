// Bud Guardian V4.1 — bridges free-text order questions ("Puis-je suivre ma
// commande?", "Is my order ready?") to the same order-engine.ts session flow
// the "Commandes" quick actions already use, so the two-factor lookup and
// masking rules apply identically whether the customer clicked a button or
// just typed the question.

import type { OrderIntent } from "./order-engine";
import { findBestMatch, type SearchableEntry } from "./search";

type IntentTrigger = SearchableEntry & { intent: Exclude<OrderIntent, null> };

const ORDER_INTENT_TRIGGERS: IntentTrigger[] = [
  {
    intent: "ready",
    keywords: [
      "ma commande est elle prete", "commande est prete", "commande prete",
      "is my order ready", "order ready",
    ],
  },
  {
    intent: "payment",
    keywords: [
      "probleme de paiement pour ma commande", "probleme avec le paiement de ma commande",
      "payment issue with my order", "problem paying for my order",
    ],
  },
  {
    intent: "resume-cart",
    keywords: ["reprendre mon panier", "reprendre ma commande", "resume my cart", "resume my order"],
  },
  {
    intent: "find",
    keywords: ["retrouver ma commande", "retrouver une commande", "find my order", "find an order"],
  },
  {
    intent: "track",
    keywords: [
      "suivre ma commande", "suivre commande", "statut de ma commande", "ou en est ma commande",
      "track my order", "track order", "order status", "where is my order",
    ],
  },
];

export function detectOrderIntent(text: string): OrderIntent | null {
  const match = findBestMatch(text, ORDER_INTENT_TRIGGERS);
  return match ? match.intent : null;
}
