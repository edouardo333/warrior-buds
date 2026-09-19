// Bud Guardian V12 — Shopping & Cart Assistant, LocalHeuristicProvider path.
// Understands natural-language cart commands ("add the second one", "make
// it two", "remove that product", equivalent FR phrasing) and executes them
// through the SAME cart business rules the real Cart page uses
// (lib/shop/cart-engine.ts over data/shop/cart-store.ts) — never a parallel
// cart implementation. This mirrors product-intent.ts's contract exactly:
// live data only, nothing invented, and it's the LOCAL counterpart to the
// external provider's add_to_cart/remove_from_cart/... tools (see
// guardian-tools.ts/tool-executor.ts) — same rules, same underlying store,
// two different "how does the AI decide what to call" front ends.
//
// Safety/scope (see AGENTS instructions and guardian-tools.ts's header):
// this module can only ever mutate the SIGNED-IN or GUEST caller's own cart
// (ownerId is threaded in by the caller — ai-provider.ts/BudGuardian.tsx,
// same owner resolution as lib/shop/cart-actions.ts's useOwnerId()). It never
// touches orders, payments, accounts, or inventory records, and it never
// completes a purchase — checkout/payment stays an explicit action the
// customer takes themselves on the real Cart/Checkout pages.
//
// Stock validation: every add/quantity-increase is capped at the product's
// real live stock (never lets the cart hold more than what's actually
// available), same discipline the Product Detail page's own quantity
// stepper already enforces (components/shop/ProductDetail.tsx).

import type { Locale } from "@/lib/i18n/types";
import type { QuickActionId } from "@/data/bud-guardian/types";
import type { StorefrontProduct } from "@/types/product";
import { getProducts } from "@/data/shop/product-store";
import { getAvailableStock, getEffectivePrice, isFormatPriced, isPriceOnRequest } from "@/lib/shop/product-engine";
import {
  getCartLines,
  getCartTotals,
  addToCart as addToCartEngine,
  updateCartQuantity as updateCartQuantityEngine,
  removeFromCart as removeFromCartEngine,
  clearCartItems,
} from "@/lib/shop/cart-engine";
import { findProductByText, formatPrice } from "./product-intent";

export type CartAdviceContext = {
  ownerId: string;
  // The last product Guardian discussed/acted on — resolves bare references
  // ("it", "that product", "make it two") the same way product-intent.ts's
  // lastProductId does.
  lastProductId?: string | null;
  // V12 — the ordered list of products from the last recommendation/search
  // Guardian showed (see product-intent.ts's ProductQueryResult.productIds),
  // so "add the second one"/"the cheapest one" resolves against what was
  // actually shown, never an invented list.
  lastRecommendedProductIds?: string[] | null;
};

export type CartQueryResult = {
  answer: string;
  suggestions: QuickActionId[];
  productId?: string; // fed back into conversation memory, same contract as product-intent.ts
};

const CART_SUGGESTIONS: QuickActionId[] = ["cat-products", "products"];

// ---------------------------------------------------------------------------
// Intent detection — deliberately regex/verb based (not the fuzzy FAQ
// matcher) so a generic word like "add" only ever triggers a cart action
// when it's paired with the word "cart"/"panier" OR an actually-resolvable
// product reference (named product, ordinal, superlative, or a pronoun with
// a real lastProductId to resolve against) — see resolveReferencedProduct.
// A phrase that resolves to nothing falls through to `null` so the caller
// (ai-provider.ts) can still try the static FAQ engine instead of a wrong
// "which product?" reply for an unrelated message.
// ---------------------------------------------------------------------------

const CART_WORD_RE = /\b(cart|panier)\b/i;

const CLEAR_CART_RE =
  /\b(vide|vider|efface|effacer|reinitialise|reinitialiser)\b[^.!?]*\b(panier)\b|\b(clear|empty|reset)\b[^.!?]*\b(cart)\b|remove everything( from (my|the) cart)?|enleve tout( de mon panier)?/i;

// \bajoutes?\b covers both the plain imperative ("ajoute") and the
// grammatically-correct euphonic form used before "en"/"y" ("ajoutes-en
// trois") — same verb, just the standard French liaison spelling.
const ADD_VERB_RE =
  /\b(add|buy|purchase|get me|i'?ll take|i will take|put)\b|\bajoutes?\b|\bajoutez\b|\bajouter\b|\bachete\b|\bacheter\b|\bje (le |la |)prends\b|\bcommande\b|\bcommander\b/i;

const REMOVE_VERB_RE =
  /\b(remove|delete|take out)\b|\benleve\b|\benlever\b|\bretire\b|\bretirer\b|\bsupprime\b|\bsupprimer\b/i;

const SET_QUANTITY_RE =
  /\bmake it (\d{1,3}|one|two|three|four|five|six|seven|eight|nine|ten)\b|\bset (the )?quantity\b|\bchange (the )?quantity\b|\bupdate (the )?quantity\b|\bincrease (the )?quantity\b|\bdecrease (the )?quantity\b|\bone more\b|\btwo more\b|\banother one\b|\badd one more\b|\badd another one\b|\bencore un(e)?\b|\bun(e)? de plus\b|\bmets?[- ]?en (deux|trois|quatre|cinq|\d)\b|\bchange(r)? la quantite\b|\bmodifier la quantite\b|\bajuste(r)? la quantite\b|\bmettre la quantite\b/i;

// FR quantity-reference — the "en" partitive pronoun attached to an add verb
// ("ajoute-en 3", "ajoutes-en deux", "ajoutez-en 3") means "add N of it/them",
// i.e. an ADD (increment), not a "set to N" like SET_QUANTITY_RE's own
// "mets-en deux" handles (see that regex's header comment for why bare "en"
// isn't a safe BARE_REF_RE match on its own). Scoped to the add verb + "en"
// specifically so it stays as unambiguous as the existing "mets-en" case,
// never a generic license to fall back to lastProductId.
const ADD_EN_PARTITIVE_RE = /\b(ajoutes?|ajoutez)[- ]?en\b/i;

const CHEAPEST_RE = /\bthe cheapest( one)?\b|\bcheapest\b|\ble moins cher\b|\bla moins chere\b|\ble moins couteux\b/i;
const PRICIEST_RE = /\bthe most expensive( one)?\b|\bmost expensive\b|\bpriciest( one)?\b|\ble plus cher\b|\bla plus chere\b/i;

const LAST_ORDINAL_RE = /\b(the )?last( one)?\b|\b(le |la )?dernier(e)?\b/i;
const ORDINAL_DIGIT_RE = /\b(\d{1,2})(?:st|nd|rd|th|er|re|e|eme)\b/i;
const ORDINAL_WORDS: Record<string, number> = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5,
  premier: 1, premiere: 1, deuxieme: 2, troisieme: 3, quatrieme: 4, cinquieme: 5,
};

// Bare pronoun references — deliberately excludes French "le"/"la" object
// pronouns ("ajoute-le"): those are also plain articles ("ajoute la taxe"),
// so including them would resolve unrelated sentences against
// lastProductId. "ça"/"ce produit"/"celui-là" are unambiguous enough to be
// safe. Tested against already accent-stripped text (see stripDiacritics).
const BARE_REF_RE =
  /\b(it|that one|that product|this one|this product|that|this)\b|\bca\b|\bcelui[- ]la\b|\bcelle[- ]la\b|\bce produit\b|\bcet article\b/i;

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, sept: 7, huit: 8, neuf: 9, dix: 10,
};

// Strips diacritics only (keeps case, spacing, punctuation) so every regex
// above — authored without accents — matches accented French input the same
// way it matches English ("enlève" -> "enleve", "quantité" -> "quantite").
// Same technique product-intent.ts/search.ts already use for FR matching.
function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function normalizeSimple(value: string): string {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ");
}

// Bare quantity number: prefers a spelled-out number word, and for a bare
// digit skips one immediately adjacent to a currency/unit marker so "add
// product for $30" doesn't misread the price as a quantity.
function parseQuantity(text: string): number | null {
  const digitMatch = text.match(/\b(\d{1,3})\b/);
  if (digitMatch && digitMatch.index != null) {
    const start = digitMatch.index;
    const end = start + digitMatch[1].length;
    const before = text[start - 1];
    const after = text.slice(end, end + 4);
    const isPriceLike = before === "$" || /^\s*(\$|cad|%|g|mg)/i.test(after);
    if (!isPriceLike) {
      const n = parseInt(digitMatch[1], 10);
      if (n > 0 && n <= 96) return n;
    }
  }

  const tokens = normalizeSimple(text).split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (NUMBER_WORDS[token] != null) return NUMBER_WORDS[token];
  }
  return null;
}

// Returns a 1-based index, or -1 for "the last one"/"le dernier".
function parseOrdinalIndex(text: string): number | null {
  if (LAST_ORDINAL_RE.test(text)) return -1;
  const digitMatch = text.match(ORDINAL_DIGIT_RE);
  if (digitMatch) {
    const n = parseInt(digitMatch[1], 10);
    if (n > 0) return n;
  }
  const normalized = normalizeSimple(text);
  for (const [word, idx] of Object.entries(ORDINAL_WORDS)) {
    if (new RegExp(`\\b${word}\\b`).test(normalized)) return idx;
  }
  return null;
}

// Resolves what product a cart command refers to, in priority order:
// 1. an ordinal ("the second one") against the given candidate list,
// 2. a superlative ("the cheapest one") against that same list,
// 3. a product named outright in the text (live catalog search),
// 4. a bare pronoun ("it", "that product") against lastProductId.
// Returns undefined — never a guess — when none of these resolve, so the
// caller can ask a clarifying question instead of acting on the wrong item.
function resolveReferencedProduct(text: string, lastProductId: string | null, candidateIds: string[] | null): StorefrontProduct | undefined {
  if (candidateIds && candidateIds.length > 0) {
    const ordinalIdx = parseOrdinalIndex(text);
    if (ordinalIdx !== null) {
      const idx = ordinalIdx === -1 ? candidateIds.length - 1 : ordinalIdx - 1;
      const id = candidateIds[idx];
      const product = id ? getProducts().find((p) => p.id === id) : undefined;
      if (product) return product;
    }

    if (CHEAPEST_RE.test(text) || PRICIEST_RE.test(text)) {
      const candidates = candidateIds
        .map((id) => getProducts().find((p) => p.id === id))
        .filter((p): p is StorefrontProduct => !!p);
      if (candidates.length > 0) {
        // Price-on-request products have no real price to rank by.
        const sorted = candidates.filter((p) => !isPriceOnRequest(p)).sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
        if (sorted.length > 0) return CHEAPEST_RE.test(text) ? sorted[0] : sorted[sorted.length - 1];
      }
    }
  }

  const named = findProductByText(text);
  if (named) return named;

  if (BARE_REF_RE.test(text) && lastProductId) {
    return getProducts().find((p) => p.id === lastProductId);
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// Answer builders — every one reads the cart fresh after mutating it, so the
// total quoted back is always the real, current cart-engine total, never a
// locally-recomputed guess.
// ---------------------------------------------------------------------------

function formatCartLine(product: StorefrontProduct, quantity: number, locale: Locale): string {
  const price = formatPrice(getEffectivePrice(product), locale);
  return locale === "fr" ? `${product.name} × ${quantity} — ${price} l'unité` : `${product.name} × ${quantity} — ${price} each`;
}

function buildViewCartAnswer(ownerId: string, locale: Locale): CartQueryResult {
  const lines = getCartLines(ownerId);
  if (lines.length === 0) {
    return { answer: locale === "fr" ? "Votre panier est vide pour le moment." : "Your cart is empty right now.", suggestions: CART_SUGGESTIONS };
  }

  const totals = getCartTotals(ownerId);
  const itemLines = lines.map((l) => `• ${formatCartLine(l.product, l.quantity, locale)}`);
  const shippingLabel = totals.shipping === 0 ? (locale === "fr" ? "gratuite" : "free") : formatPrice(totals.shipping, locale);
  const totalLine =
    locale === "fr"
      ? `Sous-total : ${formatPrice(totals.subtotal, locale)} · Livraison : ${shippingLabel} · Taxes : ${formatPrice(totals.tax, locale)} · Total : ${formatPrice(totals.total, locale)}`
      : `Subtotal: ${formatPrice(totals.subtotal, locale)} · Shipping: ${shippingLabel} · Tax: ${formatPrice(totals.tax, locale)} · Total: ${formatPrice(totals.total, locale)}`;
  const intro = locale === "fr" ? "Voici votre panier :" : "Here's your cart:";

  return { answer: `${intro}\n${itemLines.join("\n")}\n${totalLine}`, suggestions: CART_SUGGESTIONS, productId: lines[0].product.id };
}

function buildClearCartAnswer(ownerId: string, locale: Locale): CartQueryResult {
  const wasEmpty = getCartLines(ownerId).length === 0;
  clearCartItems(ownerId);
  return {
    answer: wasEmpty
      ? locale === "fr" ? "Votre panier était déjà vide." : "Your cart was already empty."
      : locale === "fr" ? "Votre panier a été vidé." : "Your cart has been cleared.",
    suggestions: CART_SUGGESTIONS,
  };
}

function buildRemoveAnswer(ownerId: string, product: StorefrontProduct, locale: Locale): CartQueryResult {
  const wasInCart = getCartLines(ownerId).some((l) => l.product.id === product.id);
  if (!wasInCart) {
    return {
      answer: locale === "fr" ? `${product.name} n'était pas dans votre panier.` : `${product.name} wasn't in your cart.`,
      suggestions: CART_SUGGESTIONS,
      productId: product.id,
    };
  }

  removeFromCartEngine(ownerId, product.id);
  const totals = getCartTotals(ownerId);
  const answer =
    locale === "fr"
      ? `${product.name} a été retiré de votre panier. Nouveau total : ${formatPrice(totals.total, locale)}.`
      : `${product.name} has been removed from your cart. New total: ${formatPrice(totals.total, locale)}.`;
  return { answer, suggestions: CART_SUGGESTIONS, productId: product.id };
}

function buildAddAnswer(ownerId: string, product: StorefrontProduct, requestedQuantity: number, locale: Locale): CartQueryResult {
  // Format-priced products (verified format/size pricing, e.g. regulated
  // cannabis flower — types/product.ts's ProductFormat) require picking a
  // size/format before Add to Cart is even enabled (see ProductDetail.tsx
  // and product-engine.ts's isFormatPriced header) — a chat turn has no
  // format selection UI, so Guardian can't complete this itself and instead
  // points the shopper to the product page to pick a format there.
  // buildSetQuantityAnswer falls back to this function for a product not yet
  // in the cart, so this guard covers that path too.
  // A priceOnRequest product (types/product.ts) has no verified price and is
  // never purchasable online, so Guardian can't add it either.
  if (isPriceOnRequest(product)) {
    return {
      answer:
        locale === "fr"
          ? `${product.name} n'est pas encore offert à l'achat en ligne — son prix est sur demande. Contactez-nous ou visitez la boutique pour plus de détails.`
          : `${product.name} can't be added to your cart online yet — its price is on request. Contact us or visit the store for details.`,
      suggestions: CART_SUGGESTIONS,
      productId: product.id,
    };
  }

  if (isFormatPriced(product)) {
    return {
      answer:
        locale === "fr"
          ? `${product.name} est vendu par format — visitez sa page produit pour choisir un format et l'ajouter à votre panier.`
          : `${product.name} is sold by format — visit its product page to pick a format and add it to your cart.`,
      suggestions: CART_SUGGESTIONS,
      productId: product.id,
    };
  }

  const availableStock = getAvailableStock(product);
  if (availableStock <= 0) {
    return {
      answer: locale === "fr" ? `Désolé, ${product.name} est actuellement en rupture de stock.` : `Sorry, ${product.name} is currently out of stock.`,
      suggestions: CART_SUGGESTIONS,
      productId: product.id,
    };
  }

  const existingQty = getCartLines(ownerId).find((l) => l.product.id === product.id)?.quantity ?? 0;
  if (existingQty >= availableStock) {
    return {
      answer:
        locale === "fr"
          ? `Vous avez déjà la quantité maximale en stock de ${product.name} (${product.stock}) dans votre panier.`
          : `You already have the maximum available quantity of ${product.name} (${product.stock}) in your cart.`,
      suggestions: CART_SUGGESTIONS,
      productId: product.id,
    };
  }

  const allowedToAdd = Math.min(requestedQuantity, availableStock - existingQty);
  addToCartEngine(ownerId, product.id, allowedToAdd);
  const totals = getCartTotals(ownerId);
  const cappedNote =
    allowedToAdd < requestedQuantity
      ? locale === "fr" ? ` (limité au stock disponible : ${product.stock})` : ` (limited to available stock: ${product.stock})`
      : "";
  const answer =
    locale === "fr"
      ? `J'ai ajouté ${allowedToAdd} × ${product.name} à votre panier${cappedNote}. Nouveau total : ${formatPrice(totals.total, locale)}.`
      : `I added ${allowedToAdd} × ${product.name} to your cart${cappedNote}. New total: ${formatPrice(totals.total, locale)}.`;
  return { answer, suggestions: CART_SUGGESTIONS, productId: product.id };
}

function buildSetQuantityAnswer(ownerId: string, product: StorefrontProduct, requestedQuantity: number, locale: Locale): CartQueryResult {
  const inCart = getCartLines(ownerId).some((l) => l.product.id === product.id);

  if (requestedQuantity <= 0) {
    return buildRemoveAnswer(ownerId, product, locale);
  }

  // Not in the cart yet — "make it two" with nothing there reads most
  // naturally as "add two", not an error.
  if (!inCart) {
    return buildAddAnswer(ownerId, product, requestedQuantity, locale);
  }

  const availableStock = getAvailableStock(product);
  if (availableStock <= 0) {
    return {
      answer: locale === "fr" ? `Désolé, ${product.name} est actuellement en rupture de stock.` : `Sorry, ${product.name} is currently out of stock.`,
      suggestions: CART_SUGGESTIONS,
      productId: product.id,
    };
  }

  const clamped = Math.min(requestedQuantity, availableStock);
  updateCartQuantityEngine(ownerId, product.id, clamped);
  const totals = getCartTotals(ownerId);
  const cappedNote =
    clamped < requestedQuantity
      ? locale === "fr" ? ` (limité au stock disponible : ${product.stock})` : ` (limited to available stock: ${product.stock})`
      : "";
  const answer =
    locale === "fr"
      ? `Quantité mise à jour : ${clamped} × ${product.name}${cappedNote}. Nouveau total : ${formatPrice(totals.total, locale)}.`
      : `Quantity updated: ${clamped} × ${product.name}${cappedNote}. New total: ${formatPrice(totals.total, locale)}.`;
  return { answer, suggestions: CART_SUGGESTIONS, productId: product.id };
}

function buildClarifyAnswer(locale: Locale): CartQueryResult {
  return { answer: locale === "fr" ? "Quel produit voulez-vous dire?" : "Which product do you mean?", suggestions: CART_SUGGESTIONS };
}

// Attempts to answer/execute a free-text cart command from the customer's
// live cart. Returns null when the message doesn't look like a cart command
// at all (caller falls back to product-intent.ts / the static FAQ engine).
export function respondToCartQuery(text: string, locale: Locale, context: CartAdviceContext): CartQueryResult | null {
  const { ownerId, lastProductId = null, lastRecommendedProductIds = null } = context;

  // Every regex below is authored without accents (see stripDiacritics's
  // header) — normalize once here so FR input ("enlève", "quantité") matches
  // exactly like its unaccented EN counterpart. findProductByText (called
  // from resolveReferencedProduct) does its own equivalent normalization
  // internally, so passing already-stripped text through is harmless.
  const normalized = stripDiacritics(text);

  // 1. Clear cart — checked first so "clear my cart" never gets misread as
  // a "remove" of some named/ordinal product.
  if (CLEAR_CART_RE.test(normalized)) {
    return buildClearCartAnswer(ownerId, locale);
  }

  const mentionsCart = CART_WORD_RE.test(normalized);
  const cartProductIds = getCartLines(ownerId).map((l) => l.product.id);

  // 2. Remove — resolved against what's actually IN the cart first.
  if (REMOVE_VERB_RE.test(normalized)) {
    const product = resolveReferencedProduct(normalized, lastProductId, cartProductIds.length > 0 ? cartProductIds : lastRecommendedProductIds);
    if (product) return buildRemoveAnswer(ownerId, product, locale);
    if (mentionsCart) return buildClarifyAnswer(locale);
  }

  // 3. Add — resolved against the last recommendation/search list first
  // ("add the second one" refers to what Guardian just showed), falling
  // back to a named product or a bare pronoun. A named product in THIS
  // message always wins (resolveReferencedProduct checks it before any
  // pronoun/context fallback) — the FR "en" partitive fallback below only
  // ever kicks in once that's come up empty.
  if (ADD_VERB_RE.test(normalized)) {
    const product =
      resolveReferencedProduct(normalized, lastProductId, lastRecommendedProductIds) ??
      (ADD_EN_PARTITIVE_RE.test(normalized) && lastProductId ? getProducts().find((p) => p.id === lastProductId) : undefined);
    if (product) {
      const quantity = parseQuantity(normalized) ?? 1;
      return buildAddAnswer(ownerId, product, quantity, locale);
    }
    if (mentionsCart) return buildClarifyAnswer(locale);
  }

  // 4. Set/adjust quantity — resolved against the cart first (you can only
  // change the quantity of something already in it, except the "make it
  // two" with nothing there yet case handled inside buildSetQuantityAnswer).
  // Unlike add/remove, an unresolved reference here falls back to
  // lastProductId unconditionally (no pronoun required): the trigger phrases
  // ("quantity", "encore un", "mets-en deux") are specific enough that this
  // is always about whatever product Guardian was just discussing, and
  // French quantity phrasing ("mets-en deux") uses the pronoun "en", which
  // BARE_REF_RE deliberately doesn't treat as a safe standalone reference.
  if (SET_QUANTITY_RE.test(normalized)) {
    const product =
      resolveReferencedProduct(normalized, lastProductId, cartProductIds.length > 0 ? cartProductIds : lastRecommendedProductIds) ??
      (lastProductId ? getProducts().find((p) => p.id === lastProductId) : undefined);
    if (!product) return buildClarifyAnswer(locale);
    const quantity = parseQuantity(normalized) ?? 1;
    return buildSetQuantityAnswer(ownerId, product, quantity, locale);
  }

  // 5. Bare cart mention with no recognized verb — "my cart?", "panier
  // total" — read as "show me the cart".
  if (mentionsCart) {
    return buildViewCartAnswer(ownerId, locale);
  }

  return null;
}
