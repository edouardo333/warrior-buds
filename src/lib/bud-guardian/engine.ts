import type { Locale } from "@/lib/i18n/types";
import faqFr from "@/data/bud-guardian/faq.fr";
import faqEn from "@/data/bud-guardian/faq.en";
import type { FaqEntry, FaqTopic, QuickActionId } from "@/data/bud-guardian/types";
import { getStoreStatus } from "@/lib/hours";
import { findBestMatch } from "./search";

const FAQ_BY_LOCALE: Record<Locale, FaqEntry[]> = {
  fr: faqFr,
  en: faqEn,
};

export type GuardianResponse = {
  answer: string;
  suggestions: QuickActionId[];
  found: boolean;
  topic?: FaqTopic;
};

const FALLBACK: Record<Locale, string> = {
  fr: "Désolé, je ne possède pas encore cette information. Vous pouvez appeler Warrior Buds ou nous écrire sur Instagram.",
  en: "Sorry, I don't have that information yet. Please call Warrior Buds or contact us on Instagram.",
};

const FALLBACK_SUGGESTIONS: QuickActionId[] = ["phone", "instagram"];

function resolveAnswer(entry: FaqEntry, locale: Locale): string {
  if (entry.dynamic === "storeStatus") {
    const status = getStoreStatus(new Date(), locale);
    return `${status.primaryLabel} — ${status.secondaryLabel}`;
  }
  return entry.answer;
}

export function getFaqEntry(id: string, locale: Locale): FaqEntry | null {
  return FAQ_BY_LOCALE[locale].find((entry) => entry.id === id) ?? null;
}

export function respondToFaqId(id: string, locale: Locale): GuardianResponse | null {
  const entry = getFaqEntry(id, locale);
  if (!entry) return null;
  return { answer: resolveAnswer(entry, locale), suggestions: entry.suggestions ?? [], found: true, topic: entry.topic };
}

// Conversation memory: when the previous turn landed on a topic, a small
// (<1, so it can only break ties — see findBestMatch) score bonus is given
// to entries sharing that topic. This lets a bare follow-up like "et les
// preroules?" naturally stay on-topic without ever overriding a strictly
// better keyword match elsewhere.
export function respondToQuery(query: string, locale: Locale, lastTopic?: FaqTopic | null): GuardianResponse {
  const entries = FAQ_BY_LOCALE[locale];
  const tieBreakBonus = lastTopic ? (entry: FaqEntry) => (entry.topic === lastTopic ? 0.5 : 0) : undefined;
  const match = findBestMatch(query, entries, tieBreakBonus);

  if (!match) {
    return { answer: FALLBACK[locale], suggestions: FALLBACK_SUGGESTIONS, found: false };
  }

  return { answer: resolveAnswer(match, locale), suggestions: match.suggestions ?? [], found: true, topic: match.topic };
}
