// Bud Guardian V13 — Checkout & Order Assistant, LocalHeuristicProvider path.
// Understands free-text questions about checkout readiness, real payment
// methods, and the SIGNED-IN customer's own real Warrior Buds orders/
// payments — answered strictly from the real V5 storefront data (the live
// cart via cart-engine.ts, the real payment-provider registry, and
// data/shop/order-store.ts's real ShopOrder records for the signed-in
// account), never invented. This is the LOCAL counterpart to the external
// provider's get_checkout_status/get_payment_methods/get_my_orders/
// get_order_status/get_payment_status_for_order tools (see
// guardian-tools.ts/tool-executor.ts) — same rules, same underlying stores,
// two different "how does the AI decide what to call" front ends, mirroring
// cart-intent.ts's own contract exactly.
//
// Scope/safety (see AGENTS instructions): read-only everywhere — cart
// mutations stay cart-intent.ts's job, and this module never places an
// order or takes a payment. Order/payment lookups are scoped to the
// SIGNED-IN caller's own account only (getOrdersForAccount(ownerId)), never
// a global/by-id lookup — same ownership boundary tool-executor.ts's
// toolGetOrderStatus already enforces. An unauthenticated caller is told to
// sign in or use guest order tracking (/track-order) — never asked to paste
// identifiers into this chat as a substitute (that stays order-engine.ts's
// separate, unrelated CRM-demo two-factor flow, untouched by this module).
//
// Payment-state honesty: Warrior Buds' real order model
// (types/shop-order.ts) only ever tracks a payment as still-pending
// ("pending_payment"), received (any later status), or the order having
// been cancelled — there is no separate "declined"/"expired" flag anywhere
// in the real system. Every answer below reflects that honestly instead of
// inventing one, even when the customer's own wording assumes it exists.

import type { Locale } from "@/lib/i18n/types";
import type { QuickActionId } from "@/data/bud-guardian/types";
import type { ShopOrder } from "@/types/shop-order";
import { getCartLines, getCartTotals } from "@/lib/shop/cart-engine";
import { getEnabledProviders } from "@/lib/shop/payment-providers/registry";
import { getOrdersForAccount } from "@/data/shop/order-store";
import { findAccountById } from "@/data/shop/account-store";
import { getOrderStatusLabel, getNextStatus } from "@/lib/shop/order-engine";
import { formatPrice } from "./product-intent";

export type CheckoutAdviceContext = {
  // Same "guest" or signed-in accountId cart-actions.ts's useOwnerId()
  // resolves — see cart-intent.ts's identical contract.
  ownerId: string;
  isSignedIn: boolean;
};

export type CheckoutQueryResult = {
  answer: string;
  suggestions: QuickActionId[];
};

const CHECKOUT_SUGGESTIONS: QuickActionId[] = ["checkout-go", "checkout-cart"];
const ORDER_SUGGESTIONS: QuickActionId[] = ["checkout-orders", "order-call"];
const SIGNIN_SUGGESTIONS: QuickActionId[] = ["checkout-orders", "phone"];
const SHOP_SUGGESTIONS: QuickActionId[] = ["cat-products", "products"];

// ---------------------------------------------------------------------------
// Intent detection — same authoring discipline as cart-intent.ts: regexes
// written without accents (see stripDiacritics), matched against already-
// stripped text, deliberately specific so generic messages don't get
// misread as checkout/order questions.
// ---------------------------------------------------------------------------

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

const PAYMENT_METHODS_RE =
  /\bpayment methods?\b|\bhow (can|do) i pay\b|\bways? to pay\b|\bpay(ing)? options?\b|\bwhat payment\b|\bmodes? de paiement\b|\bmoyens? de paiement\b|\bcomment (puis-je |je peux |on peut )?payer\b|\boptions? de paiement\b/i;

const CHECKOUT_READY_RE =
  /\bready to check ?out\b|\bcan i check ?out\b|\bcheckout ready\b|\bready to (order|pay)\b|\bwhat do i need to (checkout|check out|order|complete my order)\b|\bwhat'?s missing\b|\bpret[e]? (a|pour) (commander|payer|la caisse|le paiement)\b|\bpuis-je (commander|payer|passer a la caisse)\b|\bpanier pret\b|\bqu'?est-ce qu'?il me manque\b/i;

const NEXT_STEP_RE =
  /\bwhat'?s next\b|\bwhat is next\b|\bwhat do i (need to )?do next\b|\bnext step\b|\bwhat happens next\b|\bqu'?est[- ]ce que je dois faire\b|\bprochaine etape\b|\bque dois[- ]je faire\b|\bqu'?est[- ]ce qui se passe (ensuite|maintenant)\b/i;

const ORDER_STATUS_RE =
  /\bwhere'?s my order\b|\bwhere is my order\b|\btrack (my )?order\b|\border status\b|\bstatus of my order\b|\bmy orders?\b|\bmy recent orders?\b|\bou (est|en est) ma commande\b|\bsuivre ma commande\b|\bstatut de ma commande\b|\bmes commandes\b/i;

const PAYMENT_STATE_RE =
  /\bpayment (pending|received|declined|failed|expired|refused)\b|\bis my payment (received|pending|declined|expired)\b|\bwhy (is|was) my payment (pending|declined|expired|failed|refused)\b|\bpaiement (en attente|recu|refuse|expire)\b|\bpourquoi mon paiement (est |a )?(en attente|refuse|expire)\b/i;

// V14 — exported so support-intent.ts can resolve which order a "stuck
// order" complaint refers to using the exact same ownership-scoped id
// extraction, instead of a second implementation.
export const ORDER_ID_RE = /\bWB-?[A-Z0-9]{4,}\b/i;

export function extractOrderId(text: string): string | null {
  const match = text.match(ORDER_ID_RE);
  return match ? match[0].toUpperCase().replace(/\s+/g, "") : null;
}

// ---------------------------------------------------------------------------
// Answer builders
// ---------------------------------------------------------------------------

// V14 — exported so support-intent.ts's account/order problem-resolution
// flows nudge a signed-out caller to sign in with the exact same wording,
// instead of a second near-duplicate message.
export function buildSignInNudge(locale: Locale): CheckoutQueryResult {
  return {
    answer:
      locale === "fr"
        ? "Vous devez être connecté à votre compte pour que je puisse consulter vos commandes ou votre paiement. Connectez-vous, ou utilisez le suivi de commande pour invités."
        : "You'll need to be signed in to your account for me to look up your orders or payment. Sign in, or use guest order tracking instead.",
    suggestions: SIGNIN_SUGGESTIONS,
  };
}

function buildPaymentMethodsAnswer(locale: Locale): CheckoutQueryResult {
  const providers = getEnabledProviders();
  const lines = providers.map((p) => {
    // Only Interac currently returns real step-by-step instructions — every
    // other enabled rail is a clearly-labeled demo placeholder (see each
    // adapter's own header in lib/shop/payment-providers/*.ts). Derived from
    // the real adapter output rather than a hardcoded id list, so this stays
    // correct if the registry ever changes.
    const hasLiveInstructions = p.getInstructions(locale, { id: "", total: 0 }, "checkout").steps.length > 0;
    const suffix = hasLiveInstructions ? "" : locale === "fr" ? " (démo)" : " (demo)";
    return `• ${p.getDisplayName(locale)}${suffix}`;
  });

  const intro = locale === "fr" ? "Voici les modes de paiement disponibles à la caisse :" : "Here are the payment methods available at checkout:";
  return { answer: `${intro}\n${lines.join("\n")}`, suggestions: CHECKOUT_SUGGESTIONS };
}

function buildCheckoutReadinessAnswer(ownerId: string, isSignedIn: boolean, locale: Locale): CheckoutQueryResult {
  const lines = getCartLines(ownerId);
  if (lines.length === 0) {
    return {
      answer:
        locale === "fr"
          ? "Votre panier est vide — ajoutez au moins un produit avant de passer à la caisse."
          : "Your cart is empty — add at least one product before checking out.",
      suggestions: SHOP_SUGGESTIONS,
    };
  }

  const totals = getCartTotals(ownerId);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const totalLabel = formatPrice(totals.total, locale);

  const account = isSignedIn ? findAccountById(ownerId) : undefined;
  const hasDefaultAddress = !!account?.addresses.some((a) => a.isDefault);

  const stepsLine =
    locale === "fr"
      ? "Le paiement se fait en 4 étapes : livraison → facturation → révision → paiement."
      : "Checkout is 4 steps: shipping → billing → review → payment.";

  const addressNote = isSignedIn
    ? hasDefaultAddress
      ? locale === "fr"
        ? " Votre adresse par défaut sera proposée automatiquement."
        : " Your default address will be pre-filled for you."
      : locale === "fr"
        ? " Vous n'avez pas encore d'adresse enregistrée — vous pourrez en ajouter une à l'étape livraison."
        : " You don't have a saved address yet — you'll be able to add one at the shipping step."
    : locale === "fr"
      ? " Vous pouvez continuer en tant qu'invité ou vous connecter avant de commencer."
      : " You can continue as a guest or sign in before you start.";

  const answer =
    locale === "fr"
      ? `Oui, votre panier est prêt : ${itemCount} article(s) pour ${totalLabel}. ${stepsLine}${addressNote}`
      : `Yes, your cart is ready: ${itemCount} item(s) totaling ${totalLabel}. ${stepsLine}${addressNote}`;

  return { answer, suggestions: CHECKOUT_SUGGESTIONS };
}

function buildOrderNextStepAnswer(order: ShopOrder, locale: Locale): CheckoutQueryResult {
  const statusLabel = getOrderStatusLabel(order.status, locale);
  const next = getNextStatus(order.status);
  const nextLabel = next ? getOrderStatusLabel(next, locale) : null;

  const stepText =
    order.status === "pending_payment"
      ? locale === "fr"
        ? "il ne reste qu'à compléter le paiement pour cette commande."
        : "the only thing left is completing payment for this order."
      : order.status === "cancelled"
        ? locale === "fr"
          ? "cette commande a été annulée — aucune action requise."
          : "this order was cancelled — no action needed."
        : nextLabel
          ? locale === "fr"
            ? `la prochaine étape est : ${nextLabel}.`
            : `the next step is: ${nextLabel}.`
          : locale === "fr"
            ? "notre équipe s'occupe de la suite."
            : "our team is handling the rest.";

  const answer =
    locale === "fr"
      ? `Votre commande ${order.id} est actuellement « ${statusLabel} » — ${stepText}`
      : `Your order ${order.id} is currently "${statusLabel}" — ${stepText}`;

  return { answer, suggestions: order.status === "pending_payment" ? ORDER_SUGGESTIONS : ORDER_SUGGESTIONS };
}

function buildNextStepsAnswer(ownerId: string, isSignedIn: boolean, locale: Locale): CheckoutQueryResult {
  // An unfinished order already exists — the next step is about that order,
  // not the cart (which was already cleared when the order was placed).
  if (isSignedIn) {
    const orders = getOrdersForAccount(ownerId);
    const latest = orders[0]; // addOrder() prepends, so this is the most recent
    if (latest && latest.status !== "delivered" && latest.status !== "cancelled") {
      return buildOrderNextStepAnswer(latest, locale);
    }
  }

  const lines = getCartLines(ownerId);
  if (lines.length === 0) {
    return {
      answer:
        locale === "fr"
          ? "Votre panier est vide. Direction la boutique pour choisir vos produits !"
          : "Your cart is empty. Head to the shop to pick some products!",
      suggestions: SHOP_SUGGESTIONS,
    };
  }

  return buildCheckoutReadinessAnswer(ownerId, isSignedIn, locale);
}

function buildOrderStatusAnswer(ownerId: string, text: string, locale: Locale): CheckoutQueryResult {
  const orders = getOrdersForAccount(ownerId);
  if (orders.length === 0) {
    return {
      answer: locale === "fr" ? "Vous n'avez pas encore de commande chez Warrior Buds." : "You don't have any Warrior Buds orders yet.",
      suggestions: SHOP_SUGGESTIONS,
    };
  }

  const requestedId = extractOrderId(text);
  // Ownership-scoped: only ever matched against THIS account's own orders,
  // never a global lookup — same rule tool-executor.ts's toolGetOrderStatus
  // enforces for the AI-tool path.
  const order = requestedId ? orders.find((o) => o.id.toUpperCase() === requestedId) : orders[0];

  if (!order) {
    return {
      answer:
        locale === "fr" ? `Je ne trouve pas de commande ${requestedId} associée à votre compte.` : `I can't find an order ${requestedId} on your account.`,
      suggestions: ORDER_SUGGESTIONS,
    };
  }

  const statusLabel = getOrderStatusLabel(order.status, locale);
  const totalLabel = formatPrice(order.total, locale);
  const trackingLine = order.canadaPostTrackingNumber
    ? locale === "fr"
      ? `\nNuméro de suivi : ${order.canadaPostTrackingNumber}`
      : `\nTracking number: ${order.canadaPostTrackingNumber}`
    : "";

  const answer =
    locale === "fr"
      ? `Commande ${order.id} — Statut : ${statusLabel}. Total : ${totalLabel}.${trackingLine}`
      : `Order ${order.id} — Status: ${statusLabel}. Total: ${totalLabel}.${trackingLine}`;

  return { answer, suggestions: ORDER_SUGGESTIONS };
}

function buildPaymentStateAnswer(ownerId: string, text: string, locale: Locale): CheckoutQueryResult {
  const orders = getOrdersForAccount(ownerId);
  const requestedId = extractOrderId(text);
  const order = requestedId ? orders.find((o) => o.id.toUpperCase() === requestedId) : orders[0];

  if (!order) {
    return {
      answer:
        locale === "fr"
          ? "Je ne trouve pas de commande à vérifier sur votre compte pour l'instant."
          : "I can't find an order on your account to check right now.",
      suggestions: SHOP_SUGGESTIONS,
    };
  }

  const statusLabel = getOrderStatusLabel(order.status, locale);

  if (order.status === "pending_payment") {
    return {
      answer:
        locale === "fr"
          ? `Commande ${order.id} : paiement en attente. Nous n'avons pas encore reçu votre paiement. Suivez les instructions de paiement fournies pour cette commande, ou contactez-nous si vous pensez qu'il y a une erreur.`
          : `Order ${order.id}: payment pending. We haven't received your payment yet. Follow the payment instructions provided for this order, or contact us if you think something's wrong.`,
      suggestions: ORDER_SUGGESTIONS,
    };
  }

  // Warrior Buds' real order model doesn't auto-flag a payment "declined" or
  // "expired" — see this file's header. Cancelled is the closest real
  // terminal state, and Guardian says so honestly instead of confirming a
  // status that was never actually tracked.
  if (order.status === "cancelled") {
    return {
      answer:
        locale === "fr"
          ? `Commande ${order.id} : annulée. Warrior Buds ne marque pas automatiquement un paiement « refusé » ou « expiré » — si un paiement n'arrive jamais, notre équipe annule la commande manuellement. Contactez-nous si vous pensez qu'il y a une erreur.`
          : `Order ${order.id}: cancelled. Warrior Buds doesn't auto-flag a payment as "declined" or "expired" — if a payment never arrives, our team cancels the order manually. Contact us if you think this is a mistake.`,
      suggestions: ["order-call", "instagram"],
    };
  }

  return {
    answer:
      locale === "fr"
        ? `Commande ${order.id} : paiement reçu ✅. Statut actuel : ${statusLabel}.`
        : `Order ${order.id}: payment received ✅. Current status: ${statusLabel}.`,
    suggestions: ORDER_SUGGESTIONS,
  };
}

// Attempts to answer a free-text checkout/order/payment question from real
// V5 storefront data. Returns null when the message doesn't look like one of
// these questions at all (caller falls back to product-intent.ts / the
// generic payment FAQ / the static FAQ engine).
export function respondToCheckoutQuery(text: string, locale: Locale, context: CheckoutAdviceContext): CheckoutQueryResult | null {
  const { ownerId, isSignedIn } = context;
  const normalized = stripDiacritics(text);

  // 1. Payment methods — no identity required, always safe to answer from
  // the real provider registry.
  if (PAYMENT_METHODS_RE.test(normalized)) {
    return buildPaymentMethodsAnswer(locale);
  }

  // 2. Own order/payment-state questions — gated on being signed in (see
  // header: never a global/guest lookup here).
  if (PAYMENT_STATE_RE.test(normalized) || ORDER_STATUS_RE.test(normalized)) {
    if (!isSignedIn) return buildSignInNudge(locale);
    return PAYMENT_STATE_RE.test(normalized) ? buildPaymentStateAnswer(ownerId, normalized, locale) : buildOrderStatusAnswer(ownerId, normalized, locale);
  }

  // 3. "What's next" — contextual across cart -> checkout -> order.
  if (NEXT_STEP_RE.test(normalized)) {
    return buildNextStepsAnswer(ownerId, isSignedIn, locale);
  }

  // 4. Checkout readiness.
  if (CHECKOUT_READY_RE.test(normalized)) {
    return buildCheckoutReadinessAnswer(ownerId, isSignedIn, locale);
  }

  return null;
}
