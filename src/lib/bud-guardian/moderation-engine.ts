// Bud Guardian V12.2 — Autonomous Abuse Defense: severe-abuse detection plus
// automatic ban enforcement. Warrior Buds Rule #1 is RESPECT — this module
// runs BEFORE guardian-policy.ts, access-control.ts, or any AI/tool call
// (see BudGuardian.tsx), the same "hard, deterministic gate ahead of
// everything else" contract guardian-policy.ts already documents for
// illegal/unsafe content, just one severity class higher: a match here ends
// the conversation with an automatic ban, not merely a refused reply.
//
// Scope — six categories, each requiring an unambiguous, extreme signal
// (multi-word threat/hate phrases, or a curated slur list) — never a single
// ambiguous word or generic profanity:
//   hate                racism / extreme hate speech (slurs)
//   harassment          severe or sexual harassment (explicit threats/demands)
//   intimidation        "I know where you live", "I'll find you", ...
//   violence-threat     credible violence/death threats, incl. against staff/customers
//   destruction-threat  threats to burn/destroy Warrior Buds
//   targeted-abuse      extreme, dehumanizing insults aimed at a person
//
// False positives: normal complaints, criticism, disagreement, harmless
// profanity, quotes, and educational discussion must never trigger a ban.
// Deliberately narrow, multi-word phrase lists (a single loaded word like
// "kill" or "hate" alone is never enough) plus an explicit quote/education
// guard (see hasQuoteMarker/hasDiscussionMarker) keep this from firing on a
// complaint ("your service is terrible"), profanity alone ("this is
// bullshit"), or a quoted/discussed term ("what does the word X mean?").
// Deliberately NOT using search.ts's typo-tolerant findBestMatch, same
// reasoning as guardian-policy.ts's header: fuzzy matching produces real
// false positives on a safety gate.
//
// Identity/persistence: bans are recorded against every
// lib/bud-guardian/guardian-identity.ts identity tied to the browser (device
// id + signed-in account, if any) via data/bud-guardian/ban-store.ts — the
// same localStorage-backed, cross-tab-synced pattern every other Guardian
// store already uses. Staff (mode: "staff") are NEVER auto-banned — only
// detected and audit-logged (see logStaffSevereViolation), per Warrior Buds
// policy: staff accountability without locking staff out of their own tools.

import type { Locale } from "@/lib/i18n/types";
import type { StaffRole } from "@/types/staff-order";
import type { BanHistoryEntry, BanRecord, ModerationCategory } from "@/types/moderation";
import { getBanRecord, upsertBanRecord } from "@/data/bud-guardian/ban-store";
import { logAuditEntry } from "@/data/bud-guardian/audit-log";
import type { GuardianIdentity } from "./guardian-identity";

// ---------------------------------------------------------------------------
// Escalation schedule — 1st offense 1 month, 2nd 3, 3rd 6, 4th 12, 5th 24,
// 6th 36, 7th 48, 8th and beyond 60.
// ---------------------------------------------------------------------------

const ESCALATION_MONTHS = [1, 3, 6, 12, 24, 36, 48, 60] as const;

export function monthsForBanCount(banCount: number): number {
  const index = Math.min(banCount, ESCALATION_MONTHS.length) - 1;
  return ESCALATION_MONTHS[Math.max(0, index)];
}

function addMonths(iso: string, months: number): string {
  const date = new Date(iso);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Exact, word-boundary-only match — see header for why no fuzzy/typo
// tolerance is used on this gate.
function matchesPhrase(paddedText: string, phrase: string): boolean {
  const normalized = normalize(phrase);
  return normalized.length > 0 && paddedText.includes(` ${normalized} `);
}

type CategoryRule = { category: ModerationCategory; phrases: string[] };

const SEVERE_RULES: CategoryRule[] = [
  // --- Credible violence / death threats (incl. against staff/customers) ---
  {
    category: "violence-threat",
    phrases: [
      "je vais te tuer", "je vais vous tuer", "je vais te frapper", "je vais te battre",
      "je vais te faire du mal", "je vais te poignarder", "je vais te defoncer", "je te tue",
      "je vais tuer un employe", "je vais tuer une employee", "je vais tuer un client",
      "je vais abattre", "je vais te descendre", "tu vas mourir", "je vais vous descendre",
      "i will kill you", "i'm going to kill you", "im going to kill you", "gonna kill you", "i'll kill you",
      "i will hurt you", "i will beat you up", "i will stab you", "i will shoot you",
      "i will kill an employee", "i will kill a staff member", "i will kill a customer",
      "i will murder you", "you're going to die", "you are going to die", "i will end your life",
    ],
  },
  // --- Threats to burn/destroy Warrior Buds --------------------------------
  {
    category: "destruction-threat",
    phrases: [
      "je vais bruler votre magasin", "je vais bruler la boutique", "je vais bruler warrior buds",
      "je vais detruire warrior buds", "je vais tout casser dans le magasin", "je vais faire sauter le magasin",
      "je vais incendier votre magasin", "je vais incendier la boutique",
      "i will burn down your store", "i will burn your store down", "i will burn down warrior buds",
      "i will destroy warrior buds", "i will burn this place down", "i'm going to burn this place down",
      "i will blow up your shop", "i will blow up your store", "i will torch your store",
      "i will set your store on fire", "gonna burn this place down",
    ],
  },
  // --- Intimidation ----------------------------------------------------------
  {
    category: "intimidation",
    phrases: [
      "je sais ou tu habites", "je sais ou tu vis", "je vais te retrouver", "je vais venir chez toi",
      "je connais ton adresse", "tu ferais mieux de faire attention", "fais attention a toi",
      "i know where you live", "i know where you work", "i will find you", "i will find where you live",
      "i know your address", "watch your back", "you better watch yourself", "i'm coming to your house",
      "i am coming to your house", "i will come to your house",
    ],
  },
  // --- Severe / sexual harassment -------------------------------------------
  {
    category: "harassment",
    phrases: [
      "je vais te violer", "je veux te violer", "envoie des photos de toi nue", "envoie moi des photos de toi nue",
      "envoie moi des nudes", "je vais te harceler", "je vais te suivre partout",
      "i will rape you", "i want to rape you", "send me nudes", "send nude pictures of yourself",
      "i will stalk you", "i will follow you everywhere",
    ],
  },
  // --- Extreme targeted verbal abuse (dehumanizing, not mere profanity) ----
  {
    category: "targeted-abuse",
    phrases: [
      "tu ne merites pas de vivre", "tu devrais mourir", "j'espere que tu vas mourir", "va mourir toi",
      "tu es une sous merde", "espece de sous merde",
      "you don't deserve to live", "you dont deserve to live", "you should die", "i hope you die",
      "kill yourself you", "you're subhuman", "you are subhuman",
    ],
  },
];

// Racial/ethnic/religious/homophobic slurs — single-token match (unlike the
// multi-word threat phrases above), because these tokens are essentially
// never legitimate in a support conversation. Deliberately a small,
// representative starter list, not an exhaustive lexicon — see the V12.2
// report's "Persistence limitation" note: a production deployment should
// swap this for a maintained, regularly-updated hate-speech list.
const HATE_SLURS = [
  "nigger", "nigga", "negre", "sale negre", "sale arabe", "sale juif", "sale musulman",
  "chink", "spic", "kike", "faggot", "tapette", "sale pd",
];

// ---------------------------------------------------------------------------
// Quote / educational-discussion guard — Rule #1 targets genuine abuse, not
// someone quoting, defining, or discussing a term. A message carrying an
// explicit quote/definition/discussion marker is never auto-banned, even if
// it also contains a flagged phrase.
// ---------------------------------------------------------------------------

const DISCUSSION_MARKERS = [
  "que veut dire", "qu'est ce que ca veut dire", "definition de", "signifie quoi", "ca veut dire quoi",
  "dans le livre", "dans le film", "citation de", "une citation",
  "what does", "means", "definition of", "in the book", "in the movie", "a quote from", "quoting",
  "the word", "the term", "lyrics",
];

function hasQuoteMarker(rawText: string): boolean {
  return /["“”«»]/.test(rawText);
}

function hasDiscussionMarker(paddedText: string): boolean {
  return DISCUSSION_MARKERS.some((marker) => matchesPhrase(paddedText, marker));
}

export type SevereViolation = { category: ModerationCategory; matchedPhrase: string };

// Picks the longest (most specific) matching phrase, mirroring
// guardian-policy.ts's findPolicyTrigger, so overlapping matches always
// resolve to one clear category.
export function detectSevereViolation(text: string): SevereViolation | null {
  const paddedText = ` ${normalize(text)} `;
  if (hasQuoteMarker(text) || hasDiscussionMarker(paddedText)) return null;

  let best: SevereViolation | null = null;
  let bestLength = 0;

  for (const rule of SEVERE_RULES) {
    for (const phrase of rule.phrases) {
      if (!matchesPhrase(paddedText, phrase) || phrase.length <= bestLength) continue;
      best = { category: rule.category, matchedPhrase: phrase };
      bestLength = phrase.length;
    }
  }

  for (const slur of HATE_SLURS) {
    if (!matchesPhrase(paddedText, slur) || slur.length <= bestLength) continue;
    best = { category: "hate", matchedPhrase: slur };
    bestLength = slur.length;
  }

  return best;
}

// ---------------------------------------------------------------------------
// Ban application / lookup
// ---------------------------------------------------------------------------

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isBanActive(record: BanRecord | undefined, now: Date = new Date()): boolean {
  return !!record && new Date(record.expiresAt).getTime() > now.getTime();
}

// The highest banCount already on file across every identity tied to this
// browser (device + account) — so signing in/out on the SAME device can
// never reset or dodge the escalation count (see guardian-identity.ts).
function currentBanCount(identities: GuardianIdentity[]): number {
  let max = 0;
  for (const identity of identities) {
    const record = getBanRecord(`${identity.type}:${identity.id}`);
    if (record && record.banCount > max) max = record.banCount;
  }
  return max;
}

// Returns the first currently-active ban across every identity tied to this
// browser, or null if none is active right now — expired bans are never
// returned here, which is what makes access "auto-restore after expiry"
// with no extra job/cron needed: the record stays on file (for escalation
// history), it just stops being active once expiresAt is in the past.
export function getActiveBan(identities: GuardianIdentity[], now: Date = new Date()): BanRecord | null {
  for (const identity of identities) {
    const record = getBanRecord(`${identity.type}:${identity.id}`);
    if (isBanActive(record, now)) return record!;
  }
  return null;
}

// Auto-bans EVERY identity tied to this browser (device + signed-in account,
// if any) for the same violation, keeping their banCount/expiry in sync —
// see guardian-identity.ts's header for why this is what prevents a simple
// login/logout bypass. Returns the record for the primary identity (the
// signed-in account if there is one, else the device), which is what the UI
// shows.
export function applyAutoBan(identities: GuardianIdentity[], violation: SevereViolation): BanRecord {
  const banCount = currentBanCount(identities) + 1;
  const months = monthsForBanCount(banCount);
  const bannedAt = new Date().toISOString();
  const expiresAt = addMonths(bannedAt, months);

  let primary: BanRecord | null = null;
  for (const identity of identities) {
    const key = `${identity.type}:${identity.id}`;
    const previous = getBanRecord(key);
    const historyEntry: BanHistoryEntry = { id: uid("ban"), at: bannedAt, banCount, category: violation.category, months, expiresAt };
    const record: BanRecord = {
      key,
      type: identity.type,
      identityId: identity.id,
      banCount,
      category: violation.category,
      matchedPhrase: violation.matchedPhrase,
      bannedAt,
      expiresAt,
      history: [...(previous?.history ?? []), historyEntry],
    };
    upsertBanRecord(record);
    if (!primary || identity.type === "account") primary = record;
  }

  logAuditEntry({
    actor: "Bud Guardian",
    role: "system",
    module: "moderation",
    action: "moderation.auto-ban",
    entityId: primary!.key,
    description: `Auto-ban #${banCount} (${violation.category}) — ${months} month(s), expires ${expiresAt}.`,
    metadata: {
      category: violation.category,
      banCount,
      months,
      matchedPhrase: violation.matchedPhrase,
      identities: identities.map((i) => `${i.type}:${i.id}`),
    },
    outcome: "denied",
  });

  return primary!;
}

// Staff are never auto-banned — detected + audit-logged only (see header).
export function logStaffSevereViolation(actor: string, role: StaffRole, violation: SevereViolation): void {
  logAuditEntry({
    actor,
    role,
    module: "moderation",
    action: "moderation.staff-flag",
    entityId: null,
    description: `Severe language detected from staff (${violation.category}) — not banned, audit-logged for review.`,
    metadata: { category: violation.category, matchedPhrase: violation.matchedPhrase },
    outcome: "warning",
  });
}

// ---------------------------------------------------------------------------
// Labels — locale-driven, mirrors every other *-engine.ts label helper.
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<ModerationCategory, Record<Locale, string>> = {
  hate: { fr: "Propos haineux", en: "Hate speech" },
  harassment: { fr: "Harcèlement grave", en: "Severe harassment" },
  intimidation: { fr: "Intimidation", en: "Intimidation" },
  "violence-threat": { fr: "Menace de violence", en: "Violence threat" },
  "destruction-threat": { fr: "Menace envers le commerce", en: "Threat against the business" },
  "targeted-abuse": { fr: "Abus verbal grave", en: "Severe verbal abuse" },
};

export function getModerationCategoryLabel(category: ModerationCategory, locale: Locale): string {
  return CATEGORY_LABELS[category][locale];
}
