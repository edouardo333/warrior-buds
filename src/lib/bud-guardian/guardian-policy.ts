// Bud Guardian V9 — centralized policy/rules layer. Single source of truth
// for what Guardian must refuse, shared by the public customer chat
// (BudGuardian.tsx) and the staff copilot (GuardianAssistant.tsx). Runs
// before any other engine, same as access-control.ts, so a refusal can never
// be smuggled in mid-conversation, mid order/payment session, or by
// rephrasing.
//
// Scope: illegal/non-store products (drugs other than the cannabis products
// Warrior Buds actually carries, firearms/weapons), other criminal activity
// (fraud, counterfeiting, hacking), attempts to bypass age/ID verification,
// and self-harm/crisis language Guardian is not equipped to handle. This is
// deliberately separate from access-control.ts (which protects *staff data*
// from the public chat) — this module protects against *unsafe/illegal
// asks*, for both public and staff surfaces.
//
// Cannabis questions themselves are never refused here — those are answered
// (or declined for lack of data) by the FAQ/product engines, which only ever
// describe products/services Warrior Buds' own data actually represents.
//
// Deliberately NOT using search.ts's findBestMatch here: its typo-tolerant
// fuzzy matching (edit-distance <= 1 on tokens of length >= 4) is fine for
// "which FAQ is closest" but wrong for a refusal gate — it produced real
// false positives (e.g. "track" is one substitution from "crack", "smoke"
// contains "coke" as a substring). A safety refusal needs exact,
// word-boundary matching only: no typo tolerance, no partial-word hits.

import type { Locale } from "@/lib/i18n/types";
import type { QuickActionId } from "@/data/bud-guardian/types";

export type PolicyCategory = "illegal-drug" | "weapon" | "criminal" | "age-bypass" | "self-harm";

export type PolicyResponse = {
  answer: string;
  suggestions: QuickActionId[];
  category: PolicyCategory;
  found: true; // always a definite (refusal) answer — drives the same "responding" animation as any other resolved turn
};

type PolicyTrigger = {
  keywords: string[];
  category: PolicyCategory;
  // Item label echoed back in "Warrior Buds does not sell {item}" phrasing —
  // only used by illegal-drug/weapon (the two categories phrased that way).
  item?: { fr: string; en: string };
};

const POLICY_TRIGGERS: PolicyTrigger[] = [
  // --- Illegal drugs (anything Warrior Buds is not licensed to sell) -----
  { category: "illegal-drug", item: { fr: "de cocaïne", en: "cocaine" }, keywords: ["cocaine", "coke", "cocaïne", "crack"] },
  { category: "illegal-drug", item: { fr: "d'héroïne", en: "heroin" }, keywords: ["heroine", "heroin", "héroïne"] },
  {
    category: "illegal-drug",
    item: { fr: "de méthamphétamine", en: "methamphetamine" },
    keywords: ["methamphetamine", "meth", "crystal meth", "metamphetamine", "meth crystal"],
  },
  { category: "illegal-drug", item: { fr: "de fentanyl", en: "fentanyl" }, keywords: ["fentanyl", "fentanyl"] },
  {
    category: "illegal-drug",
    item: { fr: "de MDMA/ecstasy", en: "MDMA/ecstasy" },
    keywords: ["mdma", "ecstasy", "ecsta", "molly"],
  },
  { category: "illegal-drug", item: { fr: "de LSD", en: "LSD" }, keywords: ["lsd", "acide lsd", "acid tab", "buvard"] },
  {
    category: "illegal-drug",
    item: { fr: "de champignons magiques", en: "magic mushrooms" },
    keywords: ["champignons magiques", "champignon magique", "magic mushroom", "magic mushrooms", "psilocybine", "psilocybin", "shrooms"],
  },
  { category: "illegal-drug", item: { fr: "de kétamine", en: "ketamine" }, keywords: ["ketamine", "kétamine", "special k"] },
  {
    category: "illegal-drug",
    item: { fr: "de médicaments sous ordonnance sans ordonnance", en: "prescription drugs without a prescription" },
    keywords: [
      "medicament sans ordonnance", "pilule sans ordonnance", "opioides sans ordonnance", "oxycontin sans ordonnance",
      "prescription drugs without a prescription", "pills without a prescription", "opioids without a prescription", "buy oxycontin",
    ],
  },
  {
    category: "illegal-drug",
    item: { fr: "de drogues illégales", en: "illegal drugs" },
    keywords: [
      "drogue dure", "drogues dures", "drogue illegale", "drogues illegales", "stupefiant", "stupefiants", "narcotique",
      "hard drugs", "illegal drugs", "illegal drug", "street drug", "street drugs", "narcotics",
    ],
  },

  // --- Weapons -------------------------------------------------------------
  {
    category: "weapon",
    item: { fr: "d'armes à feu ou d'armes", en: "firearms or weapons" },
    keywords: [
      "arme a feu", "armes a feu", "fusil", "pistolet", "revolver", "carabine", "munitions", "munition",
      "explosif", "explosifs", "bombe", "grenade", "silencieux",
      "firearm", "firearms", "gun", "guns", "pistol", "rifle", "weapon", "weapons", "ammo", "ammunition",
      "explosive", "explosives", "bomb", "grenade",
    ],
  },

  // --- Other criminal activity ----------------------------------------------
  {
    category: "criminal",
    keywords: [
      "faux billets", "fausse monnaie", "contrefacon", "contrefacons", "marchandise volee", "objets voles",
      "pirater un compte", "voler des donnees", "arnaque", "blanchiment d argent", "trafic humain",
      "counterfeit money", "fake bills", "counterfeit goods", "stolen goods", "steal data", "hack an account",
      "hacking", "money laundering", "human trafficking", "fraud scheme",
    ],
  },

  // --- Age / ID bypass -------------------------------------------------------
  {
    category: "age-bypass",
    keywords: [
      "sans piece d identite", "sans verification d age", "contourner la verification d age", "acheter pour un mineur",
      "commander pour un mineur", "fausse piece d identite", "faux id", "acheter sans preuve d age",
      "without id", "without age verification", "bypass age verification", "buy for a minor", "order for a minor",
      "fake id", "no id required", "skip id check",
    ],
  },

  // --- Self-harm / crisis (Guardian redirects, doesn't attempt to help) ----
  {
    category: "self-harm",
    keywords: [
      "me suicider", "me faire du mal", "en finir avec ma vie", "envie de mourir", "me tuer",
      "suicide", "kill myself", "hurt myself", "end my life", "want to die", "self harm", "self-harm",
    ],
  },
];

const PIVOT = {
  fr: " Je peux toutefois vous aider avec nos produits de cannabis, votre commande ou nos politiques de magasin.",
  en: " I can still help with our cannabis products, your order, or store policies.",
} as const;

function buildAnswer(trigger: PolicyTrigger, locale: Locale): string {
  if (trigger.category === "illegal-drug" && trigger.item) {
    return locale === "fr"
      ? `Non. Warrior Buds ne vend pas ${trigger.item.fr}; c'est une substance contrôlée illégale.${PIVOT.fr}`
      : `No. Warrior Buds does not sell ${trigger.item.en}; it is an illegal controlled substance.${PIVOT.en}`;
  }
  if (trigger.category === "weapon" && trigger.item) {
    return locale === "fr"
      ? `Non. Warrior Buds ne vend pas ${trigger.item.fr}.${PIVOT.fr}`
      : `No. Warrior Buds does not sell ${trigger.item.en}.${PIVOT.en}`;
  }
  if (trigger.category === "criminal") {
    return locale === "fr"
      ? `Non. Warrior Buds ne cautionne aucune activité illégale ou criminelle et je ne peux pas vous aider avec ça.${PIVOT.fr}`
      : `No. Warrior Buds does not support illegal or criminal activity, and I can't help with that.${PIVOT.en}`;
  }
  if (trigger.category === "age-bypass") {
    return locale === "fr"
      ? "Non. Warrior Buds vend uniquement à des adultes ayant l'âge légal, avec une pièce d'identité valide — je ne peux pas vous aider à contourner cette règle."
      : "No. Warrior Buds only sells to legal-age adults with valid ID — I can't help bypass that requirement.";
  }
  // self-harm
  return locale === "fr"
    ? "Je ne suis pas en mesure d'aider avec ça, et je ne suis pas un service d'urgence. Si vous êtes en danger, contactez le 9-1-1 ou une ligne d'écoute (ex. 1-866-APPELLE) immédiatement."
    : "I'm not able to help with that, and I'm not a crisis service. If you're in danger, please contact 911 or a crisis line right away.";
}

const SUGGESTIONS_BY_CATEGORY: Record<PolicyCategory, QuickActionId[]> = {
  "illegal-drug": ["products", "policy-age", "instagram"],
  weapon: ["products", "policy-age", "instagram"],
  criminal: ["policy-general", "instagram"],
  "age-bypass": ["policy-age", "policy-id"],
  "self-harm": [],
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Exact, word-boundary-only match: the normalized keyword must appear as
// whole word(s) in the query, never as a substring inside an unrelated word
// (see the module comment above for why — no fuzzy/typo tolerance here).
function matchesKeyword(paddedQuery: string, keyword: string): boolean {
  const normalized = normalize(keyword);
  return normalized.length > 0 && paddedQuery.includes(` ${normalized} `);
}

// Picks the longest (most specific) matching keyword across every trigger,
// so a query that happens to contain more than one flagged word still gets
// one clear, specific answer rather than whichever trigger is listed first.
function findPolicyTrigger(text: string): PolicyTrigger | null {
  const paddedQuery = ` ${normalize(text)} `;
  let best: PolicyTrigger | null = null;
  let bestLength = 0;
  for (const trigger of POLICY_TRIGGERS) {
    for (const keyword of trigger.keywords) {
      if (!matchesKeyword(paddedQuery, keyword) || keyword.length <= bestLength) continue;
      best = trigger;
      bestLength = keyword.length;
    }
  }
  return best;
}

// Runs first, ahead of every other Guardian engine (FAQ, order/payment
// sessions, product lookup, staff copilot). A match here always wins,
// regardless of conversation state.
export function checkGuardianPolicy(text: string, locale: Locale): PolicyResponse | null {
  const match = findPolicyTrigger(text);
  if (!match) return null;
  return {
    answer: buildAnswer(match, locale),
    suggestions: SUGGESTIONS_BY_CATEGORY[match.category],
    category: match.category,
    found: true,
  };
}
