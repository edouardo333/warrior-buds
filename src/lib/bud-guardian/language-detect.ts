// Bud Guardian V9 — lightweight per-message language detection so a
// customer can switch FR/EN mid-conversation and Guardian follows along in
// its free-text replies, without touching the site's own UI language toggle
// (LanguageContext) — that stays exactly as the customer set it, and still
// governs quick-action button labels, the input placeholder, etc. Only
// Guardian's generated answer text follows the detected language.
//
// Heuristic, not a real language model: scores a short list of common
// FR-only / EN-only marker words plus accented characters. Deliberately
// conservative — a tie or a very short/ambiguous message (e.g. an order
// number, "ok", an emoji) falls back to the caller's current UI locale
// rather than guessing wrong.

import type { Locale } from "@/lib/i18n/types";

const FR_MARKERS = new Set([
  "le", "la", "les", "un", "une", "des", "du", "de", "et", "est", "es", "suis", "avez", "vous", "je", "tu",
  "nous", "on", "ca", "que", "qui", "quoi", "pour", "avec", "dans", "sur", "ce", "cet", "cette", "ces",
  "au", "aux", "ne", "pas", "se", "votre", "vos", "combien", "coute", "coûte", "merci", "bonjour", "salut",
  "oui", "svp", "aujourd", "demain", "commande", "boutique", "ouvert", "ferme", "achete", "acheter", "peux",
  "puis", "pourquoi", "comment", "quand", "ou", "où", "voudrais", "aimerais", "besoin",
  // V11.1 — short, standalone French product/category words (product-intent.ts's
  // CATEGORY_KEYWORDS normalizes the same accented forms, e.g. "préroulés" ->
  // "preroules"). These have no English homograph, so they're safe unambiguous
  // FR signals even alone, unlike bilingual catalog words such as "vape"/"cbd".
  "fleur", "fleurs", "preroule", "preroules", "cartouche", "cartouches", "concentre", "concentres",
  "comestible", "comestibles",
]);

const EN_MARKERS = new Set([
  "the", "a", "an", "is", "are", "am", "you", "your", "i", "we", "do", "does", "did", "to", "of", "in", "on",
  "for", "with", "and", "or", "what", "when", "where", "how", "which", "that", "this", "there", "have", "has",
  "can", "please", "thanks", "thank", "hello", "hi", "hey", "yes", "today", "tomorrow", "order", "store",
  "open", "closed", "buy", "want", "would", "like", "need", "cost", "price",
]);

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const MIN_CONFIDENT_LENGTH = 4; // shorter inputs (ids, "ok", "oui") stay on the current UI locale

// Returns the detected locale, or null when the message is too short/mixed
// to confidently override the current UI locale.
export function detectMessageLocale(text: string): Locale | null {
  const raw = text.trim();
  if (raw.length < MIN_CONFIDENT_LENGTH) return null;

  const hasFrenchAccent = /[àâäéèêëîïôöùûüçœ]/i.test(raw);

  const tokens = normalize(raw).split(" ").filter(Boolean);
  if (tokens.length === 0) return null;

  let frScore = hasFrenchAccent ? 1 : 0;
  let enScore = 0;
  for (const token of tokens) {
    if (FR_MARKERS.has(token)) frScore++;
    if (EN_MARKERS.has(token)) enScore++;
  }

  if (frScore === 0 && enScore === 0) return null;
  if (frScore === enScore) return null;
  return frScore > enScore ? "fr" : "en";
}

// Resolves the locale Guardian should *reply in* for this turn: the
// confidently-detected language of the message, falling back to the site's
// current UI locale when detection is inconclusive.
export function resolveReplyLocale(text: string, uiLocale: Locale): Locale {
  return detectMessageLocale(text) ?? uiLocale;
}
