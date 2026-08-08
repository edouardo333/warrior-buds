// Bud Guardian V9 — live product grounding for the customer chat. Finally
// wires guardian-shop-hooks.ts (prepared but "NOT WIRED IN YET" since V5)
// into the conversational engine: product questions are answered from the
// real, live storefront catalog (data/shop/product-store.ts via
// lib/shop/product-engine.ts), never invented and never stale relative to
// what the shop actually has in stock.
//
// Deliberately separate from access-control.ts/guardian-policy.ts (which run
// first, upstream of this) and from engine.ts's static FAQ (still the
// fallback for generic "what categories do you carry" questions — this
// module only takes over once a specific product or a recommendation ask is
// detected).

import { getProducts } from "@/data/shop/product-store";
import { getEffectivePrice, getStockStatus, getAverageRating, getCategoryLabel, getStrainLabel } from "@/lib/shop/product-engine";
import { recommendProductsForGuardian } from "./guardian-shop-hooks";
import { findBestMatch, type SearchableEntry } from "./search";
import type { Locale } from "@/lib/i18n/types";
import type { QuickActionId } from "@/data/bud-guardian/types";
import type { ProductCategory, StorefrontProduct } from "@/types/product";

export type ProductQueryResult = {
  answer: string;
  suggestions: QuickActionId[];
  productId?: string; // fed back into conversation memory for follow-ups ("and the price?")
};

function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  flower: ["fleur", "fleurs", "mari", "marijuana", "weed", "herbe", "bud", "buds", "flower", "flowers"],
  "pre-rolls": ["preroule", "preroules", "joint", "joints", "pre-roll", "pre-rolls", "preroll", "prerolls"],
  edibles: ["comestible", "comestibles", "bonbon", "bonbons", "gommes", "edible", "edibles", "gummies", "gummy"],
  concentrates: ["concentre", "concentres", "dab", "dabs", "hash", "shatter", "rosin", "extrait", "extraits", "concentrate", "concentrates", "extract", "extracts"],
  vapes: ["vape", "vapes", "vapo", "vaporisateur", "cartouche", "cartouches", "vaporizer", "cartridge", "cartridges"],
  cbd: ["cbd"],
  accessories: ["accessoire", "accessoires", "accessory", "accessories", "grinder", "papier", "papiers", "rolling paper"],
  topicals: ["topique", "topiques", "creme", "creme cbd", "topical", "topicals", "cream", "balm"],
  mushrooms: ["champignon", "champignons", "mushroom", "mushrooms", "fongique", "fungi", "reishi", "chaga", "cordyceps", "adaptogene"],
};

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
  return locale === "fr"
    ? `${product.name}${strain} : ${price}, ${stockLabel}.`
    : `${product.name}${strain}: ${price}, ${stockLabel}.`;
}

function buildRecommendationAnswer(category: ProductCategory | undefined, locale: Locale): ProductQueryResult {
  const picks = recommendProductsForGuardian(category, 3);
  if (picks.length === 0) {
    return {
      answer: locale === "fr" ? "Je n'ai pas de recommandation disponible pour cette catégorie en ce moment." : "I don't have a recommendation available for that category right now.",
      suggestions: ["products", "cat-products"],
    };
  }
  const intro =
    locale === "fr"
      ? category
        ? `Voici nos meilleurs choix en ${getCategoryLabel(category, locale).toLowerCase()} :`
        : "Voici quelques-uns de nos produits les mieux notés en ce moment :"
      : category
        ? `Here are our top picks in ${getCategoryLabel(category, locale).toLowerCase()}:`
        : "Here are some of our best-rated products right now:";
  const lines = picks.map((p) => `• ${formatProductLine(p, locale)}`);
  return { answer: `${intro}\n${lines.join("\n")}`, suggestions: ["cat-products", "products"], productId: picks[0].id };
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
    };
  }

  if (mode === "availability") {
    const answer =
      stock === "out-of-stock"
        ? locale === "fr" ? `${product.name} est actuellement en rupture de stock.` : `${product.name} is currently out of stock.`
        : stock === "low-stock"
          ? locale === "fr" ? `${product.name} est disponible, mais en stock faible.` : `${product.name} is available, but stock is low.`
          : locale === "fr" ? `Oui, ${product.name} est en stock.` : `Yes, ${product.name} is in stock.`;
    return { answer, suggestions: ["cat-products", "products"], productId: product.id };
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

  return { answer, suggestions: ["cat-products", "products", "order-track"], productId: product.id };
}

type ProductEntry = SearchableEntry & { product: StorefrontProduct };

function buildProductEntries(): ProductEntry[] {
  return getProducts().map((product) => ({
    product,
    keywords: [product.name, product.brand, product.slug.replace(/-/g, " ")],
  }));
}

// Attempts to answer a free-text product question live from the storefront
// catalog. Returns null when the message doesn't look like a product
// question at all (caller falls back to the static FAQ engine).
// `lastProductId` lets a bare follow-up ("and the price?", "is it in
// stock?") resolve back to the product just discussed.
export function respondToProductQuery(text: string, locale: Locale, lastProductId?: string | null): ProductQueryResult | null {
  const isRecommend = findBestMatch(text, RECOMMEND_TRIGGER) !== null;
  const isAvailability = findBestMatch(text, AVAILABILITY_TRIGGER) !== null;
  const isPrice = findBestMatch(text, PRICE_TRIGGER) !== null;

  const normalizedTokens = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const category = detectCategory(normalizedTokens);

  const entries = buildProductEntries();
  const matchedProduct = entries.length > 0 ? findBestMatch(text, entries)?.product : undefined;

  if (isRecommend && !matchedProduct) {
    return buildRecommendationAnswer(category, locale);
  }

  if (matchedProduct) {
    const mode = isPrice ? "price" : isAvailability ? "availability" : "detail";
    return buildProductAnswer(matchedProduct, mode, locale);
  }

  // No named product in this message — resolve short follow-ups against the
  // last product Guardian discussed (conversation memory).
  if ((isPrice || isAvailability) && lastProductId) {
    const product = getProducts().find((p) => p.id === lastProductId);
    if (product) return buildProductAnswer(product, isPrice ? "price" : "availability", locale);
  }

  // A category word alone ("des fleurs?", "any vapes?") without a
  // price/availability/recommend cue still reads as a soft product ask.
  if (category && (isAvailability || isPrice || isRecommend)) {
    return buildRecommendationAnswer(category, locale);
  }

  // Deliberately no fallback here for a bare price/availability cue with no
  // named product, no category and no conversation memory to resolve
  // against — that's ambiguous (could be about shipping, a service fee,
  // etc.) and is better left to the static FAQ engine than answered as if
  // it were about a specific, unidentified product.
  return null;
}
