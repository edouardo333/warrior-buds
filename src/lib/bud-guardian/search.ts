// Tiny local keyword matcher — no external API. Normalizes accents/case,
// then scores each candidate by its single best-matching keyword phrase so
// the best FAQ entry wins.

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

function tokenize(value: string): string[] {
  return normalize(value)
    .split(" ")
    .filter((word) => word.length > 1 && !STOPWORDS.has(word));
}

// Best score for a single keyword phrase against the query: an exact phrase
// match wins outright; otherwise every one of the keyword's significant
// (non-stopword) tokens must appear in the query for a weaker match.
function scoreKeyword(normalizedKeyword: string, normalizedQuery: string, queryTokens: string[]): number {
  if (!normalizedKeyword) return 0;

  if (normalizedQuery.includes(normalizedKeyword)) {
    return normalizedKeyword.split(" ").length * 2;
  }

  const significantTokens = normalizedKeyword.split(" ").filter((token) => !STOPWORDS.has(token));
  if (significantTokens.length === 0) return 0;

  const matched = significantTokens.filter((token) => queryTokens.includes(token));
  return matched.length === significantTokens.length ? significantTokens.length : 0;
}

export function findBestMatch<T extends SearchableEntry>(query: string, entries: T[]): T | null {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return null;

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return null;

  let best: T | null = null;
  let bestScore = 0;

  for (const entry of entries) {
    let entryScore = 0;
    for (const keyword of entry.keywords) {
      const keywordScore = scoreKeyword(normalize(keyword), normalizedQuery, queryTokens);
      if (keywordScore > entryScore) entryScore = keywordScore;
    }
    if (entryScore > bestScore) {
      bestScore = entryScore;
      best = entry;
    }
  }

  return bestScore > 0 ? best : null;
}
