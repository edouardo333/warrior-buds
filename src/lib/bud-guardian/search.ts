// Tiny local keyword matcher — no external API. Normalizes accents/case,
// canonicalizes common synonyms/slang, tolerates small typos, then scores
// each candidate by its single best-matching keyword phrase so the best FAQ
// entry wins.

import { SYNONYMS } from "@/data/bud-guardian/synonyms";

export type SearchableEntry = { keywords: string[] };

// Filler words that appear across many unrelated keyword phrases (e.g. "when
// do you open" / "when do you close" both contain "do you"). Stripping them
// before scoring stops shared filler words from inflating unrelated entries.
const STOPWORDS = new Set([
  "le", "la", "les", "l", "de", "des", "du", "un", "une", "et", "est", "es",
  "vous", "je", "tu", "il", "elle", "nous", "on", "ca", "que", "qui", "quoi",
  "pour", "avec", "dans", "sur", "ce", "cet", "cette", "ces", "a", "au", "aux",
  "en", "y", "ne", "pas", "se", "sa", "son", "ses", "votre", "vos",
  "the", "an", "is", "are", "do", "does", "did", "you", "your", "i", "we",
  "us", "to", "of", "in", "on", "for", "with", "and", "or", "what", "when",
  "where", "how", "which", "that", "this", "there", "have", "has", "can",
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

// Maps colloquial/slang terms to the canonical word used across the FAQ
// keyword lists (e.g. "mari"/"weed" -> "fleur") so a query written in
// everyday language still matches entries authored in canonical terms.
function canonicalize(token: string): string {
  return SYNONYMS[token] ?? token;
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(" ")
    .filter((word) => word.length > 1 && !STOPWORDS.has(word))
    .map(canonicalize);
}

// Cheap spelling tolerance: classic edit-distance, capped early since we
// only ever need to know whether the distance is <= 1.
function levenshteinAtMost1(a: string, b: string): boolean {
  if (a === b) return true;
  const lenDiff = a.length - b.length;
  if (lenDiff > 1 || lenDiff < -1) return false;

  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  let i = 0;
  let j = 0;
  let edits = 0;

  while (i < shorter.length && j < longer.length) {
    if (shorter[i] === longer[j]) {
      i++;
      j++;
      continue;
    }
    edits++;
    if (edits > 1) return false;
    if (shorter.length === longer.length) {
      // substitution
      i++;
      j++;
    } else {
      // insertion/deletion in the longer string
      j++;
    }
  }
  return true;
}

// A query token "fuzzy-matches" a keyword token if identical, or — for
// tokens long enough that a typo is unlikely to create an accidental
// collision with an unrelated word — within one edit.
function fuzzyTokenMatch(queryToken: string, keywordToken: string): boolean {
  if (queryToken === keywordToken) return true;
  if (keywordToken.length < 4 || queryToken.length < 4) return false;
  return levenshteinAtMost1(queryToken, keywordToken);
}

function tokenInQuery(keywordToken: string, queryTokens: string[]): boolean {
  return queryTokens.some((queryToken) => fuzzyTokenMatch(queryToken, keywordToken));
}

// Best score for a single keyword phrase against the query: an exact phrase
// match wins outright; otherwise every one of the keyword's significant
// (non-stopword) tokens must appear in the query (allowing synonyms and
// small typos) for a weaker match.
function scoreKeyword(normalizedKeyword: string, normalizedQuery: string, queryTokens: string[]): number {
  if (!normalizedKeyword) return 0;

  if (normalizedQuery.includes(normalizedKeyword)) {
    return normalizedKeyword.split(" ").length * 2;
  }

  const significantTokens = normalizedKeyword
    .split(" ")
    .filter((token) => !STOPWORDS.has(token))
    .map(canonicalize);
  if (significantTokens.length === 0) return 0;

  const matched = significantTokens.filter((token) => tokenInQuery(token, queryTokens));
  return matched.length === significantTokens.length ? significantTokens.length : 0;
}

// `tieBreakBonus`, when given, adds a fractional (<1) bonus to entries that
// match some contextual preference (e.g. conversation memory's last topic).
// Being fractional, it can only break a tie between otherwise-equal integer
// scores — it never lets a contextually-preferred entry beat a strictly
// better keyword match.
export function findBestMatch<T extends SearchableEntry>(
  query: string,
  entries: T[],
  tieBreakBonus?: (entry: T) => number
): T | null {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return null;

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return null;

  let best: T | null = null;
  let bestScore = 0;
  let bestEffectiveScore = 0;

  for (const entry of entries) {
    let entryScore = 0;
    for (const keyword of entry.keywords) {
      const keywordScore = scoreKeyword(normalize(keyword), normalizedQuery, queryTokens);
      if (keywordScore > entryScore) entryScore = keywordScore;
    }
    if (entryScore === 0) continue;

    const effectiveScore = entryScore + (tieBreakBonus ? tieBreakBonus(entry) : 0);
    if (effectiveScore > bestEffectiveScore) {
      bestScore = entryScore;
      bestEffectiveScore = effectiveScore;
      best = entry;
    }
  }

  return bestScore > 0 ? best : null;
}
