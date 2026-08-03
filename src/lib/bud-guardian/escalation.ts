// Bud Guardian V4.1 — human escalation. Detects frustration, a reported
// failed payment, a lost/unfindable order, or an explicit request for a
// person, and responds with a single, honest set of options: call, message
// on Instagram, or request a callback — Bud Guardian cannot place real
// phone calls itself, and this module never invents that it can.

import type { Locale } from "@/lib/i18n/types";
import type { QuickActionId } from "@/data/bud-guardian/types";
import { findBestMatch, type SearchableEntry } from "./search";

export type EscalationResponse = {
  answer: string;
  suggestions: QuickActionId[];
  found: boolean;
};

const ESCALATION_TRIGGERS: SearchableEntry[] = [
  // Frustration signals
  {
    keywords: [
      "frustre", "frustree", "fache", "fachee", "enerve", "enervee", "pas content", "pas contente",
      "insatisfait", "insatisfaite", "plainte", "nul", "inacceptable", "ca ne marche pas du tout",
      "frustrated", "angry", "upset", "annoyed", "complaint", "terrible", "worst", "unacceptable",
    ],
  },
  // Failed payment
  {
    keywords: [
      "paiement a echoue", "paiement echoue", "paiement refuse", "paiement ne fonctionne pas",
      "mon virement n a pas fonctionne", "mon interac n a pas fonctionne",
      "payment failed", "payment didn't work", "payment did not work", "my payment was declined", "interac didn't go through",
    ],
  },
  // Can't find / lost order
  {
    keywords: [
      "je ne trouve pas ma commande", "je ne trouve plus ma commande", "impossible de trouver ma commande",
      "ma commande a disparu", "cant find my order", "can't find my order", "i lost my order", "my order is missing",
    ],
  },
  // Explicit request for a person, beyond the basic smalltalk FAQ phrasing
  {
    keywords: [
      "je veux parler a quelqu un", "je veux parler a une personne", "j ai besoin de parler a quelqu un",
      "besoin d aide urgente", "urgent",
      "i need to talk to someone", "i need a human", "connect me with a person", "i need help urgently",
    ],
  },
];

const ESCALATION_MESSAGE: Record<Locale, string> = {
  fr:
    "Je comprends, désolé pour ce désagrément. Le plus rapide est d'appeler Warrior Buds ou de nous écrire sur Instagram — vous pouvez aussi demander un rappel. À noter : Bud Guardian ne peut pas encore effectuer de vrais appels téléphoniques.",
  en:
    "I understand, sorry for the trouble. The fastest way is to call Warrior Buds or message us on Instagram — you can also request a callback. Note: Bud Guardian can't place real phone calls yet.",
};

const ESCALATION_SUGGESTIONS: QuickActionId[] = ["order-call", "instagram", "human-callback"];

export function detectEscalation(text: string, locale: Locale): EscalationResponse | null {
  const match = findBestMatch(text, ESCALATION_TRIGGERS);
  if (!match) return null;
  return { answer: ESCALATION_MESSAGE[locale], suggestions: ESCALATION_SUGGESTIONS, found: true };
}
