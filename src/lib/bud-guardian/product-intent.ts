// Bud Guardian V11 — Smart Product Advisor. Builds on V9's live catalog
// grounding (this file) by understanding budget/price ("under $30", "moins
// de 30$"), relative price ("cheaper than X", "plus cher que X"), "similar
// to X", and "X vs Y" comparisons — all still answered ONLY from the real,
// live storefront catalog (data/shop/product-store.ts via
// lib/shop/product-engine.ts and guardian-shop-hooks.ts's
// findGuardianProducts), never invented and never stale relative to what the
// shop actually has in stock.
//
// V11 also adds short-lived conversation memory for the category/budget the
// customer is shopping within (ProductAdviceContext, threaded through by
// ai-provider.ts/BudGuardian.tsx exactly like the pre-existing lastTopic/
// lastProductId memory) so a bare follow-up like "Vapes" after Guardian asks
// "which category?" resolves as "vapes under $30", not a fresh, contextless
// question.
//
// Deliberately separate from access-control.ts/guardian-policy.ts (which run
// first, upstream of this) and from engine.ts's static FAQ (still the
// fallback for generic "what categories do you carry" questions — this
// module only takes over once a specific product, comparison, or
// recommendation ask is detected).

import { getProducts } from "@/data/shop/product-store";
import { getEffectivePrice, getStockStatus, getAverageRating, getCategoryLabel, getStrainLabel } from "@/lib/shop/product-engine";
import { findGuardianProducts } from "./guardian-shop-hooks";
import { findBestMatch, type SearchableEntry } from "./search";
import type { Locale } from "@/lib/i18n/types";
import type { QuickActionId } from "@/data/bud-guardian/types";
import type { ProductCategory, StorefrontProduct } from "@/types/product";

export type ProductQueryResult = {
  answer: string;
  suggestions: QuickActionId[];
  productId?: string; // fed back into conversation memory for follow-ups ("and the price?")
  category?: ProductCategory; // V11 — fed back into conversation memory ("Vapes" after "under $30")
  // V11 — fed back into conversation memory (the budget ceiling, if any).
  // undefined = leave the caller's remembered budget untouched; null = V11.1
  // explicit signal to CLEAR it (the customer clearly moved on to a new
  // product topic — see the isNewTopic check in respondToProductQuery);
  // a number = remember this new ceiling.
  maxPrice?: number | null;
  // V12 — the full ordered list of product ids shown this turn (recommend/
  // similar/no-result-fallback/compare), fed back into conversation memory
  // so cart-intent.ts can resolve "add the second one"/"the cheapest one"
  // against what Guardian actually just showed, never an invented list.
  // Omitted (not just empty) for single-product answers — see cart-intent.ts.
  productIds?: string[];
};

// V11 — the slots Guardian carries across turns for product advice. Mirrors
// engine.ts's lastTopic / the pre-existing lastProductId: simple "sticky
// until replaced" memory, not a strict per-topic scope — good enough for the
// short, linear shopping conversations this widget handles.
export type ProductAdviceContext = {
  lastProductId?: string | null;
  lastCategory?: ProductCategory | null;
  lastMaxPrice?: number | null;
};

// V12 — exported so cart-intent.ts's cart-total/line-item answers use the
// exact same currency formatting as every product-advice answer here,
// instead of a second, possibly-divergent implementation.
export function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

// Keyword lists also cover the Products page category mega-dropdown
// taxonomy (lib/shop/category-tree.ts) so a customer typing a subcategory
// term ("AAAA", "budder", "rolling tray") still resolves to the right flat
// category here, even though that taxonomy's grading/subtype nodes aren't
// tracked as their own field on StorefrontProduct.
const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  flower: [
    "fleur", "fleurs", "mari", "marijuana", "weed", "herbe", "bud", "buds", "flower", "flowers",
    "aaaa", "aaa", "aa weed", "budget buds", "craft cannabis", "shake", "trim",
  ],
  "pre-rolls": ["preroule", "preroules", "joint", "joints", "pre-roll", "pre-rolls", "preroll", "prerolls"],
  edibles: [
    "comestible", "comestibles", "bonbon", "bonbons", "gommes", "edible", "edibles", "gummies", "gummy",
    "candy", "capsule", "capsules", "chocolate bar", "baked goods", "tincture", "tinctures", "teinture", "teintures",
  ],
  concentrates: [
    "concentre", "concentres", "dab", "dabs", "hash", "shatter", "rosin", "extrait", "extraits", "concentrate", "concentrates", "extract", "extracts",
    "budder", "caviar", "distillate", "distillat", "kief", "live resin", "thca", "thca diamond", "diamant",
  ],
  vapes: ["vape", "vapes", "vapo", "vaporisateur", "cartouche", "cartouches", "vaporizer", "cartridge", "cartridges"],
  cbd: ["cbd"],
  accessories: [
    "accessoire", "accessoires", "accessory", "accessories", "grinder", "papier", "papiers", "rolling paper",
    "filter tip", "filter tips", "rolling tray", "rolling trays", "plateau", "plateau a rouler",
  ],
  topicals: ["topique", "topiques", "creme", "creme cbd", "topical", "topicals", "cream", "balm"],
  mushrooms: ["champignon", "champignons", "mushroom", "mushrooms", "fongique", "fungi", "reishi", "chaga", "cordyceps", "adaptogene"],
};

function normalizeText(value: string): string[] {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function detectCategory(normalizedTokens: string[]): ProductCategory | undefined {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [ProductCategory, string[]][]) {
    if (keywords.some((kw) => normalizedTokens.includes(kw))) return category;
  }
  return undefined;
}

const RECOMMEND_TRIGGER: SearchableEntry[] = [
  {
    keywords: [
      "recommande", "recommandes", "recommandez", "conseille", "conseilles", "conseillez", "suggestion", "suggerez",
      "que me conseillez vous", "quoi essayer", "meilleur produit", "meilleurs produits", "populaire", "populaires",
      "recommend", "recommendation", "suggest", "suggestion", "what do you recommend", "best product", "best products",
      "top product", "top products", "popular", "bestseller", "best seller",
    ],
  },
];

const AVAILABILITY_TRIGGER: SearchableEntry[] = [
  {
    keywords: [
      "en stock", "disponible", "disponibilite", "reste t il", "il en reste", "avez vous", "vous avez",
      "in stock", "available", "availability", "do you have", "is there any left", "any left",
    ],
  },
];

const PRICE_TRIGGER: SearchableEntry[] = [
  {
    keywords: ["prix", "cout", "coute", "coûte", "combien", "tarif", "price", "cost", "how much"],
  },
];

// ---------------------------------------------------------------------------
// V11 — budget/price parsing. Locale-agnostic (numbers read the same in FR
// and EN); only the surrounding keywords differ, so both are matched in one
// pass. `max` is inclusive ("under/at most $X"), `min` is EXCLUSIVE
// ("over/more than $X" should not re-include a product priced at exactly $X).
// ---------------------------------------------------------------------------

type BudgetRange = { max?: number; min?: number };

const NUMBER_TOKEN = String.raw`\$?\s?(\d+(?:[.,]\d{1,2})?)\s?\$?`;

const UNDER_RE = new RegExp(
  String.raw`(?:sous|moins\s+de|max(?:imum)?(?:\s+de)?|budget\s+de|jusqu.?\s?[aà]|en\s+dessous\s+de|cheaper\s+than|moins\s+cher(?:e)?s?\s+que|under|below|less\s+than|up\s+to|no\s+more\s+than)\s*${NUMBER_TOKEN}`,
  "i"
);
const UNDER_SUFFIX_RE = new RegExp(String.raw`${NUMBER_TOKEN}\s*(?:ou\s+moins|or\s+less|or\s+under|max(?:imum)?)\b`, "i");
const OVER_RE = new RegExp(
  String.raw`(?:plus\s+de|au\s+dessus\s+de|minimum(?:\s+de)?|au\s+moins|more\s+expensive\s+than|plus\s+cher(?:e)?s?\s+que|over|above|more\s+than|at\s+least)\s*${NUMBER_TOKEN}`,
  "i"
);
const OVER_SUFFIX_RE = new RegExp(String.raw`${NUMBER_TOKEN}\s*(?:ou\s+plus|or\s+more|and\s+up)\b`, "i");
const BARE_PRICE_RE = new RegExp(
  String.raw`\$\s?(\d+(?:[.,]\d{1,2})?)|(\d+(?:[.,]\d{1,2})?)\s?\$|(\d+(?:[.,]\d{1,2})?)\s?(?:dollars?|dollar|cad)\b`,
  "i"
);

function parseBudget(text: string): BudgetRange | null {
  const lower = text.toLowerCase();
  let max: number | null = null;
  let min: number | null = null;

  const underMatch = lower.match(UNDER_RE) ?? lower.match(UNDER_SUFFIX_RE);
  if (underMatch) max = parseFloat(underMatch[1].replace(",", "."));

  const overMatch = lower.match(OVER_RE) ?? lower.match(OVER_SUFFIX_RE);
  if (overMatch) min = parseFloat(overMatch[1].replace(",", "."));

  // No explicit direction keyword — a bare "$30"/"30$"/"30 dollars" mention
  // is read as a soft budget ceiling, the common casual phrasing ("vapes
  // 30$?"). Only applies when no matched product is found later (see
  // respondToProductQuery), so it never overrides a specific price question.
  if (max === null && min === null) {
    const bareMatch = lower.match(BARE_PRICE_RE);
    if (bareMatch) {
      const raw = bareMatch[1] ?? bareMatch[2] ?? bareMatch[3];
      if (raw) max = parseFloat(raw.replace(",", "."));
    }
  }

  if (max === null && min === null) return null;
  return { max: max ?? undefined, min: min ?? undefined };
}

function formatBudgetLabel(budget: BudgetRange, locale: Locale): string {
  if (budget.max != null && budget.min != null) {
    return locale === "fr"
      ? `entre ${formatPrice(budget.min, locale)} et ${formatPrice(budget.max, locale)}`
      : `between ${formatPrice(budget.min, locale)} and ${formatPrice(budget.max, locale)}`;
  }
  if (budget.max != null) return locale === "fr" ? `sous ${formatPrice(budget.max, locale)}` : `under ${formatPrice(budget.max, locale)}`;
  if (budget.min != null) return locale === "fr" ? `au-dessus de ${formatPrice(budget.min, locale)}` : `over ${formatPrice(budget.min, locale)}`;
  return "";
}

// ---------------------------------------------------------------------------
// V11 — comparison / similar / relative-price phrasing. Every capture group
// is resolved against the real catalog via findBestMatch (see findProduct in
// respondToProductQuery) — an unrecognized name simply falls through to the
// next check rather than being invented.
// ---------------------------------------------------------------------------

const VS_RE = /^(.+?)\s+(?:vs\.?|versus|contre)\s+(.+)$/i;
const BETWEEN_RE = /(?:between|entre)\s+(.+?)\s+(?:and|et)\s+(.+)$/i;
const COMPARE_AND_RE = /(?:compare|comparer|comparez)\s+(.+?)\s+(?:and|et|avec)\s+(.+)$/i;

const SIMILAR_RE =
  /(?:similar(?:s)?\s+to|comparable\s+to|similaire(?:s)?\s+(?:a|à)|comparable(?:s)?\s+(?:a|à)|semblable(?:s)?\s+(?:a|à)|pareil(?:le)?s?\s+(?:a|à))\s+(.+)$/i;

const CHEAPER_THAN_RE =
  /(?:cheaper\s+than|less\s+expensive\s+than|more\s+affordable\s+than|moins\s+cher(?:e)?s?\s+que|moins\s+couteux(?:se)?\s+que|moins\s+dispendieux(?:se)?\s+que|plus\s+abordable(?:s)?\s+que)\s+(.+)$/i;
const MORE_EXPENSIVE_THAN_RE =
  /(?:more\s+expensive\s+than|pricier\s+than|plus\s+cher(?:e)?s?\s+que|plus\s+couteux(?:se)?\s+que|plus\s+dispendieux(?:se)?\s+que)\s+(.+)$/i;

// Bare (no explicit anchor name) "cheaper"/"more expensive" — a follow-up on
// whatever product/category Guardian just discussed (see ProductAdviceContext).
const BARE_CHEAPER_RE =
  /\b(cheaper|less expensive|more affordable|a cheaper (?:one|option)|moins cher|moins cheres?|moins couteux|moins couteuse|meilleur marche|moins dispendieux|plus abordable)\b/i;
const BARE_PRICIER_RE =
  /\b(more expensive|pricier|a pricier (?:one|option)|plus cher|plus cheres?|plus couteux|plus couteuse|plus dispendieux)\b/i;

function cleanCapture(raw: string): string {
  return raw.replace(/[?!.]+$/g, "").trim();
}

function formatProductLine(product: StorefrontProduct, locale: Locale): string {
  const stock = getStockStatus(product);
  const stockLabel =
    stock === "out-of-stock"
      ? locale === "fr" ? "en rupture de stock" : "out of stock"
      : stock === "low-stock"
        ? locale === "fr" ? "stock faible" : "low stock"
        : locale === "fr" ? "en stock" : "in stock";
  const price = formatPrice(getEffectivePrice(product), locale);
  const strain = product.strain ? ` — ${getStrainLabel(product.strain, locale)}` : "";
  const thc = product.thcPercent != null ? ` · THC ${product.thcPercent}%` : "";
  const cbd = product.cbdPercent != null ? ` · CBD ${product.cbdPercent}%` : "";
  return locale === "fr"
    ? `${product.name}${strain} : ${price}${thc}${cbd}, ${stockLabel}.`
    : `${product.name}${strain}: ${price}${thc}${cbd}, ${stockLabel}.`;
}

// Only sets the field when there is real information to remember — omitting
// it (vs. explicitly nulling it) means the caller's sticky memory is left
// untouched, same contract as the pre-existing lastProductId handling in
// BudGuardian.tsx.
function memoryFields(category?: ProductCategory, budget?: BudgetRange | null): Pick<ProductQueryResult, "category" | "maxPrice"> {
  const fields: Pick<ProductQueryResult, "category" | "maxPrice"> = {};
  if (category) fields.category = category;
  if (budget?.max != null) fields.maxPrice = budget.max;
  return fields;
}

type RecommendOpts = {
  excludeId?: string;
  sort?: "rating" | "price-asc";
  anchor?: { name: string; direction: "cheaper" | "more-expensive" };
};

function buildRecommendationIntro(category: ProductCategory | undefined, budget: BudgetRange | null, locale: Locale, anchor?: RecommendOpts["anchor"]): string {
  if (anchor) {
    return locale === "fr"
      ? anchor.direction === "cheaper"
        ? `Voici des options moins chères que ${anchor.name} :`
        : `Voici des options plus chères que ${anchor.name} :`
      : anchor.direction === "cheaper"
        ? `Here are some options cheaper than ${anchor.name}:`
        : `Here are some options more expensive than ${anchor.name}:`;
  }
  const catLabel = category ? getCategoryLabel(category, locale).toLowerCase() : null;
  const budgetLabel = budget ? formatBudgetLabel(budget, locale) : "";
  if (catLabel && budgetLabel) return locale === "fr" ? `Voici nos ${catLabel} ${budgetLabel} :` : `Here are our ${catLabel} ${budgetLabel}:`;
  if (catLabel) return locale === "fr" ? `Voici nos meilleurs choix en ${catLabel} :` : `Here are our top picks in ${catLabel}:`;
  if (budgetLabel) return locale === "fr" ? `Voici ce qui est disponible ${budgetLabel} :` : `Here's what's available ${budgetLabel}:`;
  return locale === "fr" ? "Voici quelques-uns de nos produits les mieux notés en ce moment :" : "Here are some of our best-rated products right now:";
}

// V11 — no-result handling: never a dead end. Relaxes the budget first
// (same category, cheapest real options), then the category (cheapest
// overall), always grounded in the real catalog — never an invented product.
function buildNoResultFallback(category: ProductCategory | undefined, budget: BudgetRange | null, locale: Locale, excludeId: string | undefined): ProductQueryResult {
  const memory = memoryFields(category, budget);

  if (category) {
    const cheapestInCategory = findGuardianProducts({ category, excludeId }, "price-asc", 2);
    if (cheapestInCategory.length > 0) {
      const budgetLabel = budget ? ` ${formatBudgetLabel(budget, locale)}` : "";
      const catLabel = getCategoryLabel(category, locale).toLowerCase();
      const intro =
        locale === "fr"
          ? `Rien en ${catLabel}${budgetLabel} en ce moment. Voici les options les plus abordables dans cette catégorie :`
          : `Nothing in ${catLabel}${budgetLabel} right now. Here are the most affordable options in that category:`;
      const lines = cheapestInCategory.map((p) => `• ${formatProductLine(p, locale)}`);
      return {
        answer: `${intro}\n${lines.join("\n")}`,
        suggestions: ["cat-products", "products"],
        productId: cheapestInCategory[0].id,
        productIds: cheapestInCategory.map((p) => p.id),
        ...memory,
      };
    }
    return {
      answer:
        locale === "fr"
          ? `Nous n'avons pas de produits en ${getCategoryLabel(category, locale).toLowerCase()} disponibles en ce moment.`
          : `We don't have any ${getCategoryLabel(category, locale).toLowerCase()} available right now.`,
      suggestions: ["cat-products", "products"],
      ...memory,
    };
  }

  if (budget?.max != null) {
    const cheapestOverall = findGuardianProducts({ excludeId }, "price-asc", 2);
    if (cheapestOverall.length > 0) {
      const intro =
        locale === "fr"
          ? `Rien sous ${formatPrice(budget.max, locale)} en ce moment. Nos options les plus abordables :`
          : `Nothing under ${formatPrice(budget.max, locale)} right now. Our most affordable options:`;
      const lines = cheapestOverall.map((p) => `• ${formatProductLine(p, locale)}`);
      return {
        answer: `${intro}\n${lines.join("\n")}`,
        suggestions: ["cat-products", "products"],
        productId: cheapestOverall[0].id,
        productIds: cheapestOverall.map((p) => p.id),
        ...memory,
      };
    }
  }

  return {
    answer:
      locale === "fr"
        ? "Je n'ai trouvé aucun produit correspondant à cette demande. Voulez-vous voir tout le catalogue?"
        : "I couldn't find a matching product for that. Would you like to see the full catalog?",
    suggestions: ["cat-products", "products"],
  };
}

function buildRecommendationAnswer(category: ProductCategory | undefined, budget: BudgetRange | null, locale: Locale, opts: RecommendOpts = {}): ProductQueryResult {
  const picks = findGuardianProducts({ category, maxPrice: budget?.max, minPrice: budget?.min, excludeId: opts.excludeId }, opts.sort ?? "rating", 3);
  const memory = memoryFields(category, budget);

  if (picks.length > 0) {
    const intro = buildRecommendationIntro(category, budget, locale, opts.anchor);
    const lines = picks.map((p) => `• ${formatProductLine(p, locale)}`);
    return {
      answer: `${intro}\n${lines.join("\n")}`,
      suggestions: ["cat-products", "products"],
      productId: picks[0].id,
      productIds: picks.map((p) => p.id),
      ...memory,
    };
  }

  return buildNoResultFallback(category, budget, locale, opts.excludeId);
}

function buildRelativePriceAnswer(anchor: StorefrontProduct, direction: "cheaper" | "more-expensive", locale: Locale): ProductQueryResult {
  const anchorPrice = getEffectivePrice(anchor);
  const budget: BudgetRange = direction === "cheaper" ? { max: anchorPrice - 0.01 } : { min: anchorPrice };
  return buildRecommendationAnswer(anchor.category, budget, locale, {
    excludeId: anchor.id,
    sort: direction === "cheaper" ? "price-asc" : undefined,
    anchor: { name: anchor.name, direction },
  });
}

// V11 — "similar to X": same category, weighted toward the same strain and
// brand, then by closeness in price — a simple, explainable notion of
// "similar" built only from fields the catalog actually has.
function buildSimilarAnswer(anchor: StorefrontProduct, locale: Locale): ProductQueryResult {
  const anchorPrice = getEffectivePrice(anchor);
  const candidates = getProducts().filter((p) => p.id !== anchor.id && p.stock > 0 && p.category === anchor.category);
  const scored = candidates
    .map((p) => ({
      product: p,
      score:
        (p.strain && anchor.strain && p.strain === anchor.strain ? 2 : 0) +
        (p.brand === anchor.brand ? 1 : 0) +
        Math.max(0, 2 - Math.abs(getEffectivePrice(p) - anchorPrice) / 15),
    }))
    .sort((a, b) => b.score - a.score || (getAverageRating(b.product) ?? 0) - (getAverageRating(a.product) ?? 0));
  const picks = scored.slice(0, 3).map((s) => s.product);

  if (picks.length === 0) {
    return {
      answer:
        locale === "fr"
          ? `Je n'ai pas d'autre produit similaire à ${anchor.name} en stock en ce moment.`
          : `I don't have another product similar to ${anchor.name} in stock right now.`,
      suggestions: ["cat-products", "products"],
      productId: anchor.id,
      category: anchor.category,
    };
  }

  const intro = locale === "fr" ? `Produits similaires à ${anchor.name} :` : `Products similar to ${anchor.name}:`;
  const lines = picks.map((p) => `• ${formatProductLine(p, locale)}`);
  return {
    answer: `${intro}\n${lines.join("\n")}`,
    suggestions: ["cat-products", "products"],
    productId: picks[0].id,
    productIds: picks.map((p) => p.id),
    category: anchor.category,
  };
}

function formatComparisonLine(product: StorefrontProduct, locale: Locale): string {
  const stock = getStockStatus(product);
  const stockLabel =
    stock === "out-of-stock"
      ? locale === "fr" ? "en rupture de stock" : "out of stock"
      : stock === "low-stock"
        ? locale === "fr" ? "stock faible" : "low stock"
        : locale === "fr" ? "en stock" : "in stock";
  const price = formatPrice(getEffectivePrice(product), locale);
  const rating = getAverageRating(product);
  const ratingLabel = rating !== null ? `${rating}/5` : locale === "fr" ? "pas encore noté" : "not yet rated";
  return locale === "fr" ? `${product.name} : ${price}, note ${ratingLabel}, ${stockLabel}.` : `${product.name}: ${price}, rated ${ratingLabel}, ${stockLabel}.`;
}

// V11 — "X vs Y": a factual side-by-side (price/rating/stock only, all real
// catalog fields) plus a one-line verdict. The verdict is deliberately about
// value/popularity only — never a medical or effect-based claim (see
// guardian-policy.ts's header on the same rule for the rest of Guardian).
function buildComparisonAnswer(a: StorefrontProduct, b: StorefrontProduct, locale: Locale): ProductQueryResult {
  const priceA = getEffectivePrice(a);
  const priceB = getEffectivePrice(b);
  const ratingA = getAverageRating(a);
  const ratingB = getAverageRating(b);

  let verdict: string;
  if (ratingA !== null && ratingB !== null && ratingA !== ratingB) {
    const higher = ratingA > ratingB ? a : b;
    verdict = locale === "fr" ? `${higher.name} a la meilleure note client.` : `${higher.name} has the higher customer rating.`;
  } else if (priceA !== priceB) {
    const cheaper = priceA < priceB ? a : b;
    verdict = locale === "fr" ? `${cheaper.name} est l'option la plus abordable.` : `${cheaper.name} is the more affordable option.`;
  } else {
    verdict =
      locale === "fr"
        ? "Les deux se valent côté prix et popularité — le choix dépend de vos préférences."
        : "They're evenly matched on price and popularity — it comes down to personal preference.";
  }

  const intro = `${a.name} vs ${b.name}:`;
  const answer = `${intro}\n• ${formatComparisonLine(a, locale)}\n• ${formatComparisonLine(b, locale)}\n${verdict}`;
  return { answer, suggestions: ["cat-products", "products"], productId: a.id, productIds: [a.id, b.id], category: a.category };
}

function buildProductAnswer(product: StorefrontProduct, mode: "price" | "availability" | "detail", locale: Locale): ProductQueryResult {
  const price = formatPrice(getEffectivePrice(product), locale);
  const stock = getStockStatus(product);
  const rating = getAverageRating(product);

  if (mode === "price") {
    return {
      answer: locale === "fr" ? `${product.name} est à ${price}.` : `${product.name} is ${price}.`,
      suggestions: ["cat-products", "order-track"],
      productId: product.id,
      category: product.category,
    };
  }

  if (mode === "availability") {
    const answer =
      stock === "out-of-stock"
        ? locale === "fr" ? `${product.name} est actuellement en rupture de stock.` : `${product.name} is currently out of stock.`
        : stock === "low-stock"
          ? locale === "fr" ? `${product.name} est disponible, mais en stock faible.` : `${product.name} is available, but stock is low.`
          : locale === "fr" ? `Oui, ${product.name} est en stock.` : `Yes, ${product.name} is in stock.`;
    return { answer, suggestions: ["cat-products", "products"], productId: product.id, category: product.category };
  }

  const strain = product.strain ? `${getStrainLabel(product.strain, locale)} — ` : "";
  const thc = product.thcPercent !== null ? (locale === "fr" ? `THC ${product.thcPercent}%` : `THC ${product.thcPercent}%`) : null;
  const cbd = product.cbdPercent !== null ? `CBD ${product.cbdPercent}%` : null;
  const potency = [thc, cbd].filter(Boolean).join(" · ");
  const ratingLine = rating !== null ? (locale === "fr" ? ` Note moyenne : ${rating}/5.` : ` Average rating: ${rating}/5.`) : "";
  const stockLine =
    stock === "out-of-stock"
      ? locale === "fr" ? " Actuellement en rupture de stock." : " Currently out of stock."
      : stock === "low-stock"
        ? locale === "fr" ? " Stock faible." : " Stock is low."
        : "";

  const answer =
    locale === "fr"
      ? `${strain}${product.name} : ${price}${potency ? ` (${potency})` : ""}. ${product.shortDescription}${ratingLine}${stockLine}`
      : `${strain}${product.name}: ${price}${potency ? ` (${potency})` : ""}. ${product.shortDescription}${ratingLine}${stockLine}`;

  return { answer, suggestions: ["cat-products", "products", "order-track"], productId: product.id, category: product.category };
}

type ProductEntry = SearchableEntry & { product: StorefrontProduct };

function buildProductEntries(): ProductEntry[] {
  return getProducts().map((product) => ({
    product,
    keywords: [product.name, product.brand, product.slug.replace(/-/g, " ")],
  }));
}

// V12 — exported so cart-intent.ts can resolve a named product ("add the OG
// Kush", "enlève le Blue Dream") against the exact same live catalog
// search this module already uses, instead of re-implementing product
// name matching a second time.
export function findProductByText(query: string): StorefrontProduct | undefined {
  const entries = buildProductEntries();
  return entries.length > 0 ? findBestMatch(query, entries)?.product : undefined;
}

const ASK_CATEGORY: Record<Locale, string> = {
  fr: "Bien sûr — quelle catégorie vous intéresse : fleurs, pré-roulés, comestibles, concentrés, vapes, CBD, accessoires, topiques ou champignons?",
  en: "Sure — which category are you interested in: flower, pre-rolls, edibles, concentrates, vapes, CBD, accessories, topicals, or mushrooms?",
};

// Attempts to answer a free-text product question live from the storefront
// catalog. Returns null when the message doesn't look like a product
// question at all (caller falls back to the static FAQ engine).
// `context` lets a bare follow-up ("and the price?", "is it in stock?",
// "Vapes", "cheaper?") resolve against whatever Guardian last discussed.
export function respondToProductQuery(text: string, locale: Locale, context: ProductAdviceContext = {}): ProductQueryResult | null {
  const { lastProductId, lastCategory, lastMaxPrice } = context;

  const entries = buildProductEntries();
  const findProduct = (query: string): StorefrontProduct | undefined => (entries.length > 0 ? findBestMatch(query, entries)?.product : undefined);

  // 1. "X vs Y" / "between X and Y" / "compare X and Y" — the most specific
  // intent, checked first so a product name containing "vs"-adjacent words
  // never gets misread as something else.
  const compareMatch = text.match(VS_RE) ?? text.match(BETWEEN_RE) ?? text.match(COMPARE_AND_RE);
  if (compareMatch) {
    const left = findProduct(cleanCapture(compareMatch[1]));
    const right = findProduct(cleanCapture(compareMatch[2]));
    if (left && right && left.id !== right.id) return buildComparisonAnswer(left, right, locale);
  }

  // 2. "similar to X"
  const similarMatch = text.match(SIMILAR_RE);
  if (similarMatch) {
    const anchor = findProduct(cleanCapture(similarMatch[1]));
    if (anchor) return buildSimilarAnswer(anchor, locale);
  }

  // 3. "cheaper than X" / "more expensive than X" (named anchor)
  const cheaperMatch = text.match(CHEAPER_THAN_RE);
  if (cheaperMatch) {
    const anchor = findProduct(cleanCapture(cheaperMatch[1]));
    if (anchor) return buildRelativePriceAnswer(anchor, "cheaper", locale);
  }
  const pricierMatch = text.match(MORE_EXPENSIVE_THAN_RE);
  if (pricierMatch) {
    const anchor = findProduct(cleanCapture(pricierMatch[1]));
    if (anchor) return buildRelativePriceAnswer(anchor, "more-expensive", locale);
  }

  const isRecommend = findBestMatch(text, RECOMMEND_TRIGGER) !== null;
  const isAvailability = findBestMatch(text, AVAILABILITY_TRIGGER) !== null;
  const isPrice = findBestMatch(text, PRICE_TRIGGER) !== null;

  const normalizedTokens = normalizeText(text);
  const category = detectCategory(normalizedTokens);
  const budget = parseBudget(text);

  // 4. Bare "cheaper"/"more expensive" — no anchor name in this message, so
  // resolve against conversation memory: the last specific product
  // discussed, else the category (this turn's or remembered) plus the
  // remembered budget as the pivot price.
  const bareCheaper = BARE_CHEAPER_RE.test(text);
  const barePricier = !bareCheaper && BARE_PRICIER_RE.test(text);
  if (bareCheaper || barePricier) {
    const anchorProduct = lastProductId ? getProducts().find((p) => p.id === lastProductId) : undefined;
    if (anchorProduct) return buildRelativePriceAnswer(anchorProduct, bareCheaper ? "cheaper" : "more-expensive", locale);

    const scopeCategory = category ?? lastCategory ?? undefined;
    if (scopeCategory) {
      const pivotBudget: BudgetRange | null = lastMaxPrice != null ? (bareCheaper ? { max: lastMaxPrice } : { min: lastMaxPrice }) : null;
      return buildRecommendationAnswer(scopeCategory, pivotBudget, locale, { sort: bareCheaper ? "price-asc" : undefined });
    }
  }

  const matchedProduct = findProduct(text);
  if (matchedProduct) {
    const mode = isPrice ? "price" : isAvailability ? "availability" : "detail";
    return buildProductAnswer(matchedProduct, mode, locale);
  }

  // No named product in this message — resolve short follow-ups against the
  // last product Guardian discussed, but only when this message isn't
  // itself scoping to a different category/budget (those take priority
  // below).
  if ((isPrice || isAvailability) && lastProductId && !category && !budget) {
    const product = getProducts().find((p) => p.id === lastProductId);
    if (product) return buildProductAnswer(product, isPrice ? "price" : "availability", locale);
  }

  // 5. Category and/or budget — the core "smart advisor" path. A category
  // mention alone is enough signal when the message IS essentially just the
  // category (a short reply, or one made while a budget is already pending
  // — see the ASK_CATEGORY branch below); inside a longer unrelated
  // sentence it still needs a price/availability/recommend cue, same
  // discipline V9 used, so e.g. "do you deliver flower to my province?"
  // stays with the FAQ engine instead of being hijacked into a recommendation.
  const isBareCategoryReply = normalizedTokens.length <= 3;
  if (category && (isAvailability || isPrice || isRecommend || lastMaxPrice != null || isBareCategoryReply)) {
    // V11.1 — a full-sentence mention of a DIFFERENT category than the one
    // Guardian was last shopping ("do you have gummies?" after a "vapes
    // under $30" conversation) is a clear topic switch: the remembered
    // budget belonged to the old category and must not silently filter the
    // new one. A bare one/two-word reply ("vapes") keeps riding the pending
    // budget as before — that's the genuine "under $30" -> "vapes" follow-up.
    const isNewTopic = !!lastCategory && category !== lastCategory && !isBareCategoryReply;
    const effectiveBudget = budget ?? (!isNewTopic && lastMaxPrice != null ? { max: lastMaxPrice } : null);
    const result = buildRecommendationAnswer(category, effectiveBudget, locale);
    // No budget carried into this answer, but the caller still remembers a
    // stale one — actively clear it (not just "leave untouched") so it
    // can't leak into the turn after this one either.
    if (isNewTopic && result.maxPrice === undefined) result.maxPrice = null;
    return result;
  }

  if (budget) {
    if (lastCategory) return buildRecommendationAnswer(lastCategory, budget, locale);
    if (isAvailability || isRecommend) return buildRecommendationAnswer(undefined, budget, locale);
    // Budget mentioned with nothing to scope it to yet — ask which
    // category, remembering the budget itself for the follow-up turn.
    return { answer: ASK_CATEGORY[locale], suggestions: ["cat-products", "help-choose"], maxPrice: budget.max };
  }

  if (isRecommend) {
    return buildRecommendationAnswer(lastCategory ?? undefined, null, locale);
  }

  // Deliberately no fallback here for anything else — that's better left to
  // the static FAQ engine than answered as if it were about a specific,
  // unidentified product.
  return null;
}
