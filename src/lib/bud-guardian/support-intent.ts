// Bud Guardian V14 — Customer Support & Problem Resolution,
// LocalHeuristicProvider path. Diagnoses the common "something's wrong"
// messages — a stuck/pending order, a product that looks unavailable, a
// cart quantity that seems wrong, or login/account trouble — strictly from
// real live V5 storefront data (the signed-in caller's own orders/account
// via data/shop/**, the live catalog, the live cart), and hands off to a
// real resolution path (an existing quick action, an existing storefront
// page, or human escalation) instead of ever inventing a status or a fix.
// This is the LOCAL counterpart to the external provider's
// get_account_status tool (see guardian-tools.ts/tool-executor.ts) plus its
// existing get_order_status/get_payment_status_for_order/get_cart/
// search_products tools — same rules, same underlying stores, two different
// "how does the AI decide what to call" front ends, mirroring checkout-
// intent.ts's and cart-intent.ts's own contracts exactly.
//
// Scope/safety (see AGENTS instructions and guardian-tools.ts's header):
// read-only everywhere. This module never resets a password, verifies an
// email, changes an order/payment, or fixes a cart quantity itself — it
// diagnoses from real data and points to the real page/flow (login, forgot-
// password, verify-email) or the real cart-mutation tools cart-intent.ts
// already owns. Order/account lookups stay scoped to the SIGNED-IN caller's
// own account only (getOrdersForAccount(ownerId)/findAccountById(ownerId)),
// never a global/by-id lookup — same ownership boundary checkout-intent.ts
// and tool-executor.ts already enforce. When a problem can't be resolved
// from real data (no matching order, account not found, an out-of-stock
// product with no restock date), Guardian says so honestly and offers the
// same real human-contact path escalation.ts uses (call, Instagram, request
// a callback) — never a made-up ETA or workaround.

import type { Locale } from "@/lib/i18n/types";
import type { QuickActionId } from "@/data/bud-guardian/types";
import { getProducts } from "@/data/shop/product-store";
import { getPriceLabel, getStockStatus, isPriceOnRequest } from "@/lib/shop/product-engine";
import { getCartLines } from "@/lib/shop/cart-engine";
import { getOrdersForAccount } from "@/data/shop/order-store";
import { findAccountById } from "@/data/shop/account-store";
import { getOrderStatusLabel, getNextStatus } from "@/lib/shop/order-engine";
import { findGuardianProducts } from "./guardian-shop-hooks";
import { findProductByText, formatPrice } from "./product-intent";
import { extractOrderId, buildSignInNudge } from "./checkout-intent";

export type SupportAdviceContext = {
  // Same "guest" or signed-in accountId cart-actions.ts's useOwnerId()
  // resolves — see checkout-intent.ts's/cart-intent.ts's identical contract.
  ownerId: string;
  isSignedIn: boolean;
  // V9's conversation memory — resolves a bare stock/availability follow-up
  // ("is it back in stock?") against whatever product Guardian last showed,
  // the same way product-intent.ts's own lastProductId does.
  lastProductId?: string | null;
};

export type SupportQueryResult = {
  answer: string;
  suggestions: QuickActionId[];
};

const ESCALATE_SUGGESTIONS: QuickActionId[] = ["order-call", "instagram", "human-callback"];
const SHOP_SUGGESTIONS: QuickActionId[] = ["cat-products", "products"];
const CART_SUGGESTIONS: QuickActionId[] = ["checkout-cart", "cat-products"];

// ---------------------------------------------------------------------------
// Intent detection — same authoring discipline as checkout-intent.ts/
// cart-intent.ts: accent-stripped regexes, deliberately specific so a
// generic message doesn't get misread as one of these problem reports.
// ---------------------------------------------------------------------------

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

const PASSWORD_RESET_RE =
  /\bforgot(ten)? (my )?password\b|\breset (my )?password\b|\bcan'?t remember (my )?password\b|\bmot de passe oublie\b|\breinitialiser (mon )?mot de passe\b|\bj'?ai oublie (mon )?mot de passe\b/i;

const EMAIL_VERIFY_RE =
  /\bverify (my )?email\b|\bemail (isn'?t|is not|not) verified\b|\bverification email\b|\bverifier (mon )?courriel\b|\bcourriel (n'?est pas |pas )?verifie\b|\bcode de verification\b/i;

const LOGIN_TROUBLE_RE =
  /\bcan'?t log ?in\b|\bcannot log ?in\b|\bcan'?t sign ?in\b|\blogin (isn'?t|is not|not) working\b|\bmy account is locked\b|\btrouble (logging|signing) in\b|\bje n'?arrive pas a me connecter\b|\bimpossible de me connecter\b|\bmon compte est bloque\b|\bproblem(e)? de connexion\b/i;

const STUCK_ORDER_RE =
  /\border('s| is)? stuck\b|\bnot moving\b|\bhasn'?t (shipped|moved|updated)\b|\btaking (forever|too long)\b|\bwhy hasn'?t my order\b|\bstill (nothing|no updates?)\b|\bcommande (est )?bloque[e]?\b|\bn'?avance pas\b|\bne bouge pas\b|\btoujours (en attente|pareil)\b depuis|\bpas de nouvelles? de ma commande\b/i;

const STOCK_ISSUE_RE =
  /\bout of stock\b|\bsold out\b|\bunavailable\b|\bnot available\b|\bback in stock\b|\bwhen will it be back\b|\brestock\b|\brupture de stock\b|\bepuise\b|\bindisponible\b|\bde retour en stock\b|\bquand (sera|est) il de retour\b/i;

// Matches either word order ("wrong quantity" / "the quantity in my cart is
// wrong") since real customer phrasing goes both ways and often has other
// words in between — same "gap" convention cart-intent.ts's own
// CLEAR_CART_RE already uses ([^.!?]* between the two anchor words, so it
// still stops at a sentence boundary instead of matching across clauses).
const WRONG_QTY_COMPLAINT_RE =
  /\bwrong\b[^.!?]*\b(quantity|amount)\b|\b(quantity|amount)\b[^.!?]*\bwrong\b|\bincorrect\b[^.!?]*\bquantity\b|\bquantity\b[^.!?]*\bincorrect\b|\btoo many (items|units)\b|\bnot enough (items|units)\b|\bmauvaise\b[^.!?]*\bquantite\b|\bquantite\b[^.!?]*\b(erronee|incorrecte)\b|\bpas la bonne quantite\b|\btrop d'?articles\b|\bpas assez d'?articles\b/i;

// ---------------------------------------------------------------------------
// Answer builders
// ---------------------------------------------------------------------------

function buildForgotPasswordAnswer(locale: Locale): SupportQueryResult {
  return {
    answer:
      locale === "fr"
        ? "Pas de souci — utilisez notre page « Mot de passe oublié » : entrez votre courriel et suivez le lien de réinitialisation. Pour des raisons de sécurité, je ne peux pas réinitialiser votre mot de passe moi-même dans ce clavardage."
        : "No problem — use our Forgot Password page: enter your email and follow the reset link. For security reasons, I can't reset your password myself here in chat.",
    suggestions: ["support-forgot-password", "support-login"],
  };
}

function buildEmailVerifyAnswer(context: SupportAdviceContext, locale: Locale): SupportQueryResult {
  const { ownerId, isSignedIn } = context;
  if (!isSignedIn) {
    return {
      answer:
        locale === "fr"
          ? "Vous devez d'abord être connecté pour que je vérifie le statut de vérification de votre courriel. Connectez-vous, puis reposez-moi la question."
          : "You'll need to be signed in first for me to check your email verification status. Sign in, then ask me again.",
      suggestions: ["support-login"],
    };
  }

  const account = findAccountById(ownerId);
  if (!account) {
    return {
      answer:
        locale === "fr"
          ? "Je ne trouve pas votre compte pour l'instant. Essayez de vous reconnecter, ou contactez-nous si le problème persiste."
          : "I can't find your account right now. Try signing in again, or contact us if this keeps happening.",
      suggestions: ESCALATE_SUGGESTIONS,
    };
  }

  if (account.emailVerified) {
    return {
      answer:
        locale === "fr"
          ? `Bonne nouvelle : le courriel de votre compte (${account.email}) est déjà vérifié ✅.`
          : `Good news: your account's email (${account.email}) is already verified ✅.`,
      suggestions: [],
    };
  }

  return {
    answer:
      locale === "fr"
        ? `Le courriel de votre compte (${account.email}) n'est pas encore vérifié. Rendez-vous sur la page de vérification pour compléter cette étape.`
        : `Your account's email (${account.email}) isn't verified yet. Head to the verification page to complete that step.`,
    suggestions: ["support-verify-email"],
  };
}

function buildLoginTroubleAnswer(context: SupportAdviceContext, locale: Locale): SupportQueryResult {
  const { ownerId, isSignedIn } = context;
  if (isSignedIn) {
    const account = findAccountById(ownerId);
    const emailNote = account ? ` (${account.email})` : "";
    return {
      answer:
        locale === "fr"
          ? `Vous êtes bien connecté sur cet appareil${emailNote}. Si un autre appareil refuse la connexion, vérifiez le courriel/mot de passe utilisé là-bas, ou réinitialisez le mot de passe.`
          : `You're actually signed in on this device${emailNote}. If a different device won't log in, double-check the email/password used there, or reset the password.`,
      suggestions: ["support-forgot-password"],
    };
  }

  return {
    answer:
      locale === "fr"
        ? "Rendez-vous sur notre page de connexion pour vous identifier. Si vous avez oublié votre mot de passe, utilisez « Mot de passe oublié » pour le réinitialiser."
        : "Head to our Login page to sign in. If you've forgotten your password, use Forgot Password to reset it.",
    suggestions: ["support-login", "support-forgot-password"],
  };
}

function buildStuckOrderAnswer(context: SupportAdviceContext, text: string, locale: Locale): SupportQueryResult {
  const { ownerId, isSignedIn } = context;
  if (!isSignedIn) return buildSignInNudge(locale);

  const orders = getOrdersForAccount(ownerId);
  if (orders.length === 0) {
    return {
      answer:
        locale === "fr"
          ? "Vous n'avez pas encore de commande chez Warrior Buds, donc rien ne devrait être bloqué de ce côté."
          : "You don't have any Warrior Buds orders yet, so there shouldn't be anything stuck on that front.",
      suggestions: SHOP_SUGGESTIONS,
    };
  }

  const requestedId = extractOrderId(text);
  const order = requestedId ? orders.find((o) => o.id.toUpperCase() === requestedId) : orders[0];
  if (!order) {
    return {
      answer:
        locale === "fr" ? `Je ne trouve pas de commande ${requestedId} associée à votre compte.` : `I can't find an order ${requestedId} on your account.`,
      suggestions: ["checkout-orders", "order-call"],
    };
  }

  const statusLabel = getOrderStatusLabel(order.status, locale);

  if (order.status === "cancelled") {
    return {
      answer:
        locale === "fr"
          ? `Commande ${order.id} : annulée. Si un paiement n'arrive jamais, notre équipe annule la commande manuellement — je ne peux pas la relancer moi-même. Contactez-nous si vous pensez qu'il y a une erreur.`
          : `Order ${order.id}: cancelled. If a payment never arrives, our team cancels the order manually — I can't restart it myself. Contact us if you think this is a mistake.`,
      suggestions: ESCALATE_SUGGESTIONS,
    };
  }

  if (order.status === "delivered") {
    return {
      answer:
        locale === "fr"
          ? `Commande ${order.id} : déjà marquée « livrée ». Si vous ne l'avez pas reçue, contactez notre équipe rapidement.`
          : `Order ${order.id}: already marked "delivered". If you haven't actually received it, contact our team right away.`,
      suggestions: ESCALATE_SUGGESTIONS,
    };
  }

  if (order.status === "pending_payment") {
    return {
      answer:
        locale === "fr"
          ? `Commande ${order.id} : le paiement est toujours en attente — c'est pour ça qu'elle n'avance pas. Complétez le paiement selon les instructions fournies, ou parlons-en avec notre équipe si vous pensez l'avoir déjà envoyé.`
          : `Order ${order.id}: payment is still pending — that's why it isn't moving. Complete payment following the instructions provided, or let's loop in our team if you believe you already sent it.`,
      suggestions: ["checkout-orders", ...ESCALATE_SUGGESTIONS],
    };
  }

  const next = getNextStatus(order.status);
  const nextLabel = next ? getOrderStatusLabel(next, locale) : null;
  const nextLine = nextLabel
    ? locale === "fr"
      ? ` La prochaine étape est : ${nextLabel}.`
      : ` The next step is: ${nextLabel}.`
    : "";

  return {
    answer:
      locale === "fr"
        ? `Commande ${order.id} : statut actuel « ${statusLabel} ».${nextLine} Je comprends que ça peut sembler bloqué sans mise à jour visible — si vous voulez, je peux vous mettre en contact avec notre équipe pour vérifier directement.`
        : `Order ${order.id}: currently "${statusLabel}".${nextLine} I understand it can feel stuck without a visible update — if you'd like, I can connect you with our team to check on it directly.`,
    suggestions: ["checkout-orders", ...ESCALATE_SUGGESTIONS],
  };
}

function buildStockIssueAnswer(text: string, locale: Locale, context: SupportAdviceContext): SupportQueryResult {
  const resolved = findProductByText(text) ?? (context.lastProductId ? getProducts().find((p) => p.id === context.lastProductId) : undefined);

  if (!resolved) {
    return {
      answer:
        locale === "fr"
          ? "Quel produit vous semble indisponible? Donnez-moi son nom et je vérifie son vrai statut de stock."
          : "Which product looks unavailable to you? Give me its name and I'll check its real stock status.",
      suggestions: SHOP_SUGGESTIONS,
    };
  }

  const stockStatus = getStockStatus(resolved);
  // No "at $X" phrase for a price-on-request product (never quote its 0 placeholder).
  const priceOnRequest = isPriceOnRequest(resolved);
  const price = getPriceLabel(resolved, locale);

  if (stockStatus === "out-of-stock") {
    const alternatives = findGuardianProducts({ category: resolved.category, excludeId: resolved.id }, "rating", 3);
    const altLines = alternatives.map((p) => `• ${p.name} — ${getPriceLabel(p, locale)}`);
    const altBlock = altLines.length > 0 ? `\n${altLines.join("\n")}` : "";

    return {
      answer:
        locale === "fr"
          ? `${resolved.name} est bien en rupture de stock en ce moment. Nous n'avons pas de date de réapprovisionnement à vous donner — je préfère être honnête plutôt que d'inventer une date.${altLines.length > 0 ? " Voici des options similaires en stock :" : ""}${altBlock}`
          : `${resolved.name} is indeed out of stock right now. We don't have a restock date to share — I'd rather be upfront than make one up.${altLines.length > 0 ? " Here are similar in-stock options:" : ""}${altBlock}`,
      suggestions: SHOP_SUGGESTIONS,
    };
  }

  const stockLabel = stockStatus === "low-stock" ? (locale === "fr" ? "stock faible" : "low stock") : locale === "fr" ? "en stock" : "in stock";

  return {
    answer:
      locale === "fr"
        ? `Bonne nouvelle : ${resolved.name} est actuellement « ${stockLabel} »${priceOnRequest ? "" : ` à ${price}`}, pas en rupture. Si le site vous montre autre chose, essayez de rafraîchir la page — sinon je peux vous mettre en contact avec notre équipe.`
        : `Good news: ${resolved.name} is currently showing "${stockLabel}"${priceOnRequest ? "" : ` at ${price}`}, not out of stock. If the site is showing you something else, try refreshing the page — otherwise I can connect you with our team.`,
    suggestions: [...SHOP_SUGGESTIONS, "instagram"],
  };
}

function buildWrongQuantityAnswer(ownerId: string, locale: Locale): SupportQueryResult {
  const lines = getCartLines(ownerId);
  if (lines.length === 0) {
    return {
      answer:
        locale === "fr"
          ? "Votre panier est actuellement vide, donc il n'y a rien à corriger. Ajoutez un produit et dites-moi si la quantité est incorrecte."
          : "Your cart is currently empty, so there's nothing to fix there. Add a product and let me know if the quantity looks wrong.",
      suggestions: SHOP_SUGGESTIONS,
    };
  }

  const itemLines = lines.map((l) => `• ${l.product.name} — ${locale === "fr" ? "qté" : "qty"} ${l.quantity} (${formatPrice(l.lineTotal, locale)})`);
  const intro = locale === "fr" ? "Voici votre panier réel en ce moment :" : "Here's your real cart right now:";
  const ask =
    locale === "fr"
      ? "Dites-moi quel produit et la bonne quantité (ex. « mets-en 2 ») et je le corrige tout de suite."
      : "Tell me which product and the correct quantity (e.g. \"set it to 2\") and I'll fix it right away.";

  return {
    answer: `${intro}\n${itemLines.join("\n")}\n\n${ask}`,
    suggestions: CART_SUGGESTIONS,
  };
}

// Attempts to diagnose/resolve a free-text customer-support problem from
// real V5 storefront data. Returns null when the message doesn't look like
// one of these problem reports at all (caller falls back to checkout-intent/
// cart-intent/product-intent/the static FAQ engine).
export function respondToSupportQuery(text: string, locale: Locale, context: SupportAdviceContext): SupportQueryResult | null {
  const normalized = stripDiacritics(text);

  // 1. Account/login help — password reset and email verification are
  // checked before the generic "can't log in" phrasing so a message
  // mentioning both gets the more specific, more useful answer.
  if (PASSWORD_RESET_RE.test(normalized)) return buildForgotPasswordAnswer(locale);
  if (EMAIL_VERIFY_RE.test(normalized)) return buildEmailVerifyAnswer(context, locale);
  if (LOGIN_TROUBLE_RE.test(normalized)) return buildLoginTroubleAnswer(context, locale);

  // 2. "My order is stuck" — a frustration-flavored order complaint,
  // deliberately more specific than checkout-intent.ts's neutral order-
  // status/next-step phrasing so the two never both try to answer the same
  // message.
  if (STUCK_ORDER_RE.test(normalized)) return buildStuckOrderAnswer(context, normalized, locale);

  // 3. Unavailable/out-of-stock product.
  if (STOCK_ISSUE_RE.test(normalized)) return buildStockIssueAnswer(text, locale, context);

  // 4. Wrong cart quantity — a complaint, not a command (cart-intent.ts
  // still owns the actual fix once the customer names a product/quantity).
  if (WRONG_QTY_COMPLAINT_RE.test(normalized)) return buildWrongQuantityAnswer(context.ownerId, locale);

  return null;
}
