// Bud Guardian V2.2 — payment engine. Mirrors order-engine.ts's shape
// (locale-driven, session-step functions) so the "Paiements" mode feels
// like the same assistant, but — unlike order-engine.ts, which is
// deliberately read-only — this module DOES write: simulating an Interac
// payment and confirming/declining one are the whole point of V2.2, so both
// paths call through to the shared orders-store.ts and this module's own
// payments.ts store, the same primitives /staff/orders and /staff/payments
// read from. Nothing here ever calls a real payment rail — everything is
// generated locally and clearly labelled as simulated.
//
// Hard rules carried over from order-engine.ts: never request/display a
// card number, password, or PIN; only reveal a payment once at least two
// supplied identifiers match the same order (or a single exact transaction
// number, which is already a strong, receipt-like secret on its own).

import type { Locale } from "@/lib/i18n/types";
import type { QuickActionId } from "@/data/bud-guardian/types";
import type { PaymentMethod as OrderPaymentMethod } from "@/types/order";
import type {
  PaymentLookupQuery,
  PaymentProvider,
  PaymentRecord,
  PaymentTransactionStatus,
} from "@/types/payment";
import { findOrderById, replaceOrder } from "@/data/bud-guardian/orders-store";
import { addPayment, findLatestPaymentByOrderId, findPaymentById, replacePayment } from "@/data/bud-guardian/payments";
import { extractIdentifiers, getOrderTotal, getStatusLabel, matchOrder } from "./order-engine";
import { findBestMatch } from "./search";
import { INTERAC_PAYMENT_EMAIL } from "@/lib/shop/payment-providers/interac";

export type PaymentEngineResponse = {
  text: string;
  suggestions: QuickActionId[];
  found: boolean;
};

export type PaymentIntent =
  | "check-received"
  | "check-worked"
  | "remaining-amount"
  | "order-confirmed"
  | "check-expired"
  | "simulate-interac"
  | null;

export type PaymentActionId = "confirm-demo" | "decline-demo";

export type PaymentSessionState = {
  stage: "idle" | "collecting";
  intent: PaymentIntent;
  pendingQuery: PaymentLookupQuery;
  activePaymentId: string | null;
};

export const INITIAL_PAYMENT_SESSION: PaymentSessionState = {
  stage: "idle",
  intent: null,
  pendingQuery: {},
  activePaymentId: null,
};

export type PaymentStepResult = { session: PaymentSessionState; response: PaymentEngineResponse };

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function formatCurrency(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

// ---------------------------------------------------------------------------
// Normalization + matching
// ---------------------------------------------------------------------------

const TXN_RE = /\bTXN-?\s?[A-Z0-9]{6}\b/i;
const TXN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — easier to read aloud

export function normalizeTransactionId(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/^(TXN)?-?/, "TXN-");
}

export function extractPaymentIdentifiers(text: string): PaymentLookupQuery {
  const base = extractIdentifiers(text);
  const txnMatch = text.match(TXN_RE);
  return { ...base, transactionId: txnMatch ? txnMatch[0] : undefined };
}

function mergeQuery(a: PaymentLookupQuery, b: PaymentLookupQuery): PaymentLookupQuery {
  return {
    orderNumber: b.orderNumber ?? a.orderNumber,
    phone: b.phone ?? a.phone,
    email: b.email ?? a.email,
    transactionId: b.transactionId ?? a.transactionId,
  };
}

function countFilled(query: PaymentLookupQuery): number {
  return [query.orderNumber, query.phone, query.email].filter(Boolean).length;
}

function hasEnoughIdentifiers(query: PaymentLookupQuery): boolean {
  if (query.transactionId) return true;
  return countFilled(query) >= 2;
}

// Only ever returns a payment once at least two supplied identifiers match
// the same order, or the transaction number matches exactly — the same
// "two-factor" privacy rule order-engine.ts's matchOrder() enforces.
export function matchPayment(query: PaymentLookupQuery) {
  if (query.transactionId) {
    const payment = findPaymentById(normalizeTransactionId(query.transactionId));
    if (payment) return { payment, matchedFields: ["transactionId"] as const };
  }

  const orderMatch = matchOrder(query);
  if (!orderMatch) return null;
  const payment = findLatestPaymentByOrderId(orderMatch.order.id);
  if (!payment) return null;
  return { payment, matchedFields: orderMatch.matchedFields };
}

function generateTransactionId(): string {
  let id: string;
  do {
    let suffix = "";
    for (let i = 0; i < 6; i++) suffix += TXN_CHARS[Math.floor(Math.random() * TXN_CHARS.length)];
    id = `TXN-${suffix}`;
  } while (findPaymentById(id));
  return id;
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const PAYMENT_STATUS_LABELS: Record<PaymentTransactionStatus, Record<Locale, string>> = {
  pending: { fr: "Paiement en attente", en: "Payment pending" },
  received: { fr: "Paiement reçu", en: "Payment received" },
  declined: { fr: "Paiement refusé", en: "Payment declined" },
  expired: { fr: "Paiement expiré", en: "Payment expired" },
  cancelled: { fr: "Paiement annulé", en: "Payment cancelled" },
};

export function getPaymentStatusLabel(status: PaymentTransactionStatus, locale: Locale): string {
  return PAYMENT_STATUS_LABELS[status][locale];
}

// A "pending" payment past its expiresAt reads as expired without needing a
// background job to flip the stored status — mirrors order-engine.ts's
// isOrderAbandoned(), which is likewise computed on read, not stored.
export function isPaymentExpired(payment: PaymentRecord): boolean {
  if (payment.status === "expired") return true;
  if (payment.status !== "pending" || !payment.expiresAt) return false;
  return Date.now() > new Date(payment.expiresAt).getTime();
}

export function getEffectivePaymentStatus(payment: PaymentRecord): PaymentTransactionStatus {
  return isPaymentExpired(payment) ? "expired" : payment.status;
}

export function isOrderAwaitingPayment(orderId: string): boolean {
  const payment = findLatestPaymentByOrderId(orderId);
  if (!payment) return true; // no payment initiated yet
  return getEffectivePaymentStatus(payment) === "pending";
}

// ---------------------------------------------------------------------------
// Mutations — the single path both the chatbot's "simulate payment" demo and
// /staff/payments' confirm/refuse buttons go through, so the two surfaces
// can never disagree about a payment's status.
// ---------------------------------------------------------------------------

function appendHistory(payment: PaymentRecord, status: PaymentTransactionStatus, by: string, note?: string): PaymentRecord {
  const at = new Date().toISOString();
  return {
    ...payment,
    status,
    updatedAt: at,
    history: [...payment.history, { id: `${payment.id}-h${payment.history.length + 1}`, status, at, by, note }],
  };
}

function toOrderPaymentMethod(provider: PaymentProvider): OrderPaymentMethod {
  if (provider === "interac") return "interac";
  if (provider === "in_store") return "in_store_card";
  // Stripe/Square/Moneris/Clover/QR are modeled for a future integration but
  // never actually produced by this simulated build.
  return "in_store_card";
}

export function simulateInteracPayment(orderId: string, actor = "Bud Guardian"): PaymentRecord | null {
  const order = findOrderById(orderId);
  if (!order) return null;

  const id = generateTransactionId();
  const now = new Date().toISOString();
  const payment: PaymentRecord = {
    id,
    orderId,
    provider: "interac",
    amount: getOrderTotal(order),
    status: "pending",
    createdAt: now,
    updatedAt: now,
    expiresAt: hoursFromNow(24),
    history: [{ id: `${id}-h1`, status: "pending", at: now, by: actor }],
  };
  addPayment(payment);

  replaceOrder(orderId, (o) => ({ ...o, payment: { status: "pending", method: "interac" }, updatedAt: now }));

  return payment;
}

export function confirmPayment(paymentId: string, actor: string): PaymentRecord | undefined {
  const updated = replacePayment(paymentId, (payment) => appendHistory(payment, "received", actor));
  if (!updated) return undefined;

  replaceOrder(updated.orderId, (order) => {
    const shouldAdvance = order.status === "received" || order.status === "verifying" || order.status === "confirmed";
    return {
      ...order,
      status: shouldAdvance ? "preparing" : order.status,
      payment: { status: "paid_in_store", method: toOrderPaymentMethod(updated.provider) },
      updatedAt: new Date().toISOString(),
    };
  });

  return updated;
}

export function declinePayment(paymentId: string, actor: string, reason?: string): PaymentRecord | undefined {
  const updated = replacePayment(paymentId, (payment) => appendHistory(payment, "declined", actor, reason));
  if (!updated) return undefined;

  replaceOrder(updated.orderId, (order) => ({
    ...order,
    payment: { status: "failed", method: order.payment.method },
    updatedAt: new Date().toISOString(),
  }));

  return updated;
}

export function cancelPayment(paymentId: string, actor: string): PaymentRecord | undefined {
  const updated = replacePayment(paymentId, (payment) => appendHistory(payment, "cancelled", actor));
  if (!updated) return undefined;

  replaceOrder(updated.orderId, (order) => ({ ...order, payment: { status: "not_started", method: null }, updatedAt: new Date().toISOString() }));

  return updated;
}

// ---------------------------------------------------------------------------
// Generic (identity-free) payment FAQ — "Où envoyer mon virement Interac ?",
// "Puis-je payer en magasin ?" — answered the same way engine.ts answers
// store FAQ: local keyword search, no lookup required.
// ---------------------------------------------------------------------------

// Single source of truth for the real Interac recipient lives in the
// checkout payment provider — re-exported here so Bud Guardian never drifts
// from what checkout actually tells customers to pay.
export const INTERAC_RECIPIENT_EMAIL = INTERAC_PAYMENT_EMAIL;

type GenericPaymentFaqId = "payment-interac-info" | "payment-in-store";

const GENERIC_PAYMENT_FAQ: { id: GenericPaymentFaqId; keywords: string[]; answer: Record<Locale, string> }[] = [
  {
    id: "payment-interac-info",
    keywords: [
      "envoyer virement interac",
      "adresse interac",
      "courriel interac",
      "ou envoyer interac",
      "where send interac",
      "interac email",
      "e-transfer address",
      "send e-transfer",
    ],
    answer: {
      fr: `Envoyez votre virement Interac à ${INTERAC_RECIPIENT_EMAIL} et indiquez votre numéro de commande dans le message pour qu'on puisse l'associer rapidement.`,
      en: `Send your Interac e-Transfer to ${INTERAC_RECIPIENT_EMAIL} and include your order number in the message so we can match it quickly.`,
    },
  },
  {
    id: "payment-in-store",
    keywords: ["payer en magasin", "paiement comptoir", "payer sur place", "pay in store", "pay in person", "pay at the counter"],
    answer: {
      fr: "Oui, vous pouvez payer directement en boutique — comptant, carte ou Interac au comptoir.",
      en: "Yes, you can pay directly in-store — cash, card, or Interac at the counter.",
    },
  },
];

export function matchGenericPaymentFaq(query: string, locale: Locale): PaymentEngineResponse | null {
  const match = findBestMatch(query, GENERIC_PAYMENT_FAQ);
  if (!match) return null;
  return { text: match.answer[locale], suggestions: [], found: true };
}

export function answerGenericPaymentFaq(id: GenericPaymentFaqId, locale: Locale): PaymentEngineResponse {
  const entry = GENERIC_PAYMENT_FAQ.find((e) => e.id === id);
  return entry ? { text: entry.answer[locale], suggestions: [], found: true } : { text: "", suggestions: [], found: false };
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

const INTENT_INTRO: Record<Exclude<PaymentIntent, null>, Record<Locale, string>> = {
  "check-received": { fr: "Pour vérifier si votre paiement est reçu, ", en: "To check if your payment was received, " },
  "check-worked": { fr: "Pour vérifier si votre paiement a fonctionné, ", en: "To check if your payment went through, " },
  "remaining-amount": { fr: "Pour connaître le montant restant, ", en: "To find your remaining balance, " },
  "order-confirmed": { fr: "Pour vérifier si votre commande est confirmée, ", en: "To check if your order is confirmed, " },
  "check-expired": { fr: "Pour vérifier si votre paiement est expiré, ", en: "To check if your payment expired, " },
  "simulate-interac": { fr: "Pour simuler un paiement Interac, ", en: "To simulate an Interac payment, " },
};

function identifierRequest(locale: Locale): string {
  return locale === "fr"
    ? "donnez-moi deux informations parmi : numéro de commande, téléphone ou courriel — ou votre numéro de transaction (TXN-XXXXXX) si vous l'avez."
    : "give me two of the following: order number, phone, or email — or your transaction number (TXN-XXXXXX) if you have it.";
}

function lookupPromptText(intent: PaymentIntent, locale: Locale): string {
  const intro = intent ? INTENT_INTRO[intent][locale] : "";
  return `${intro}${identifierRequest(locale)}`;
}

const NEED_ONE_MORE: Record<Locale, string> = {
  fr: "Merci. Il me manque une deuxième information (numéro de commande, téléphone ou courriel), ou votre numéro de transaction.",
  en: "Thanks. I still need a second identifier (order number, phone, or email), or your transaction number.",
};

const COULD_NOT_PARSE: Record<Locale, string> = {
  fr: "Je n'ai pas reconnu ces informations. Pouvez-vous indiquer votre numéro de commande, votre téléphone, votre courriel ou votre numéro de transaction ?",
  en: "I couldn't recognize that. Could you share your order number, phone, email, or transaction number?",
};

const NOT_FOUND_TEXT: Record<Locale, string> = {
  fr: "Je ne trouve aucun paiement correspondant à ces informations. Vous pouvez réessayer ou appeler Warrior Buds.",
  en: "I can't find a payment matching that information. You can try again or call Warrior Buds.",
};

const NO_ACTIVE_PAYMENT_TEXT: Record<Locale, string> = {
  fr: "Retrouvons d'abord votre paiement.",
  en: "Let's find your payment first.",
};

// ---------------------------------------------------------------------------
// Identity-bound answers
// ---------------------------------------------------------------------------

const RECEIVED_OR_WORKED_TEXT: Record<PaymentTransactionStatus, (statusLabel: string, orderId: string) => Record<Locale, string>> = {
  received: (statusLabel, orderId) => ({
    fr: `Oui ✅ — ${statusLabel} pour la commande ${orderId}. Elle passe en préparation.`,
    en: `Yes ✅ — ${statusLabel} for order ${orderId}. It's moving to preparation.`,
  }),
  pending: (statusLabel) => ({
    fr: `Pas encore — ${statusLabel}. Ça peut prendre quelques minutes après l'envoi du virement Interac.`,
    en: `Not yet — ${statusLabel}. It can take a few minutes after sending the Interac e-Transfer.`,
  }),
  declined: (statusLabel) => ({
    fr: `Non ❌ — ${statusLabel}. Vous pouvez réessayer ou payer en magasin.`,
    en: `No ❌ — ${statusLabel}. You can try again or pay in-store.`,
  }),
  expired: (statusLabel) => ({
    fr: `Non — ${statusLabel}. La demande Interac a expiré, il faut en envoyer une nouvelle.`,
    en: `No — ${statusLabel}. The Interac request expired; a new one is needed.`,
  }),
  cancelled: (statusLabel) => ({
    fr: `Non — ${statusLabel}.`,
    en: `No — ${statusLabel}.`,
  }),
};

function answerForIntent(payment: PaymentRecord, intent: PaymentIntent, locale: Locale): PaymentEngineResponse {
  const order = findOrderById(payment.orderId);
  if (!order) return { text: NOT_FOUND_TEXT[locale], suggestions: ["phone"], found: false };

  const effectiveStatus = getEffectivePaymentStatus(payment);
  const statusLabel = getPaymentStatusLabel(effectiveStatus, locale);

  switch (intent) {
    case "check-received":
    case "check-worked": {
      const text = RECEIVED_OR_WORKED_TEXT[effectiveStatus](statusLabel, order.id)[locale];
      return { text, suggestions: effectiveStatus === "declined" || effectiveStatus === "expired" ? ["payment-simulate-interac", "phone"] : ["phone"], found: true };
    }

    case "remaining-amount": {
      const amount = formatCurrency(effectiveStatus === "received" ? 0 : payment.amount, locale);
      const text =
        effectiveStatus === "received"
          ? locale === "fr"
            ? `Montant restant : ${amount} — la commande ${order.id} est payée au complet.`
            : `Remaining balance: ${amount} — order ${order.id} is paid in full.`
          : locale === "fr"
            ? `Montant restant : ${amount} pour la commande ${order.id}.`
            : `Remaining balance: ${amount} for order ${order.id}.`;
      return { text, suggestions: ["phone"], found: true };
    }

    case "order-confirmed": {
      const orderStatusLabel = getStatusLabel(order.status, locale);
      const confirmed = order.status === "confirmed" || order.status === "preparing" || order.status === "ready" || order.status === "completed";
      const text = confirmed
        ? locale === "fr"
          ? `Oui ✅ — statut de la commande ${order.id} : ${orderStatusLabel}.`
          : `Yes ✅ — order ${order.id} status: ${orderStatusLabel}.`
        : locale === "fr"
          ? `Pas encore — statut actuel de la commande ${order.id} : ${orderStatusLabel}.`
          : `Not yet — order ${order.id}'s current status: ${orderStatusLabel}.`;
      return { text, suggestions: ["phone"], found: true };
    }

    case "check-expired": {
      const expiryNote = payment.expiresAt && effectiveStatus === "pending" ? (locale === "fr" ? ` Expire le ${formatDate(payment.expiresAt, locale)}.` : ` Expires on ${formatDate(payment.expiresAt, locale)}.`) : "";
      const text =
        effectiveStatus === "expired"
          ? locale === "fr"
            ? `Oui — ${statusLabel}. Une nouvelle demande Interac est nécessaire.`
            : `Yes — ${statusLabel}. A new Interac request is needed.`
          : `${locale === "fr" ? `Non — ${statusLabel}.` : `No — ${statusLabel}.`}${expiryNote}`;
      return { text, suggestions: effectiveStatus === "expired" ? ["payment-simulate-interac", "phone"] : ["phone"], found: true };
    }

    default:
      return { text: statusLabel, suggestions: ["phone"], found: true };
  }
}

function simulatedCreatedText(payment: PaymentRecord, orderId: string, locale: Locale): string {
  const amount = formatCurrency(payment.amount, locale);
  const expiry = payment.expiresAt ? formatDate(payment.expiresAt, locale) : "";
  return locale === "fr"
    ? `Virement Interac simulé créé ✅\nCommande : ${orderId}\nNuméro de transaction : ${payment.id}\nMontant : ${amount}\nExpire le : ${expiry}\n\nUtilisez les boutons ci-dessous pour simuler la réponse de la banque (démonstration uniquement).`
    : `Simulated Interac e-Transfer created ✅\nOrder: ${orderId}\nTransaction number: ${payment.id}\nAmount: ${amount}\nExpires on: ${expiry}\n\nUse the buttons below to simulate the bank's response (demo only).`;
}

function confirmedDemoText(payment: PaymentRecord, order: ReturnType<typeof findOrderById>, locale: Locale): string {
  const statusLabel = getPaymentStatusLabel("received", locale);
  const orderStatusLabel = order ? getStatusLabel(order.status, locale) : "";
  return locale === "fr"
    ? `✅ ${statusLabel} — ${payment.id} confirmé.\nStatut de la commande : ${orderStatusLabel}.`
    : `✅ ${statusLabel} — ${payment.id} confirmed.\nOrder status: ${orderStatusLabel}.`;
}

function declinedDemoText(payment: PaymentRecord, locale: Locale): string {
  const statusLabel = getPaymentStatusLabel("declined", locale);
  return locale === "fr"
    ? `❌ ${statusLabel} — ${payment.id}.\nVous pouvez réessayer ou payer en magasin.`
    : `❌ ${statusLabel} — ${payment.id}.\nYou can try again or pay in-store.`;
}

// ---------------------------------------------------------------------------
// Session step functions — pure and synchronous, plugged into React state by
// usePaymentSession.ts, mirroring order-engine.ts's session functions.
// ---------------------------------------------------------------------------

export function beginPaymentIntent(intent: PaymentIntent, locale: Locale): PaymentStepResult {
  const nextSession: PaymentSessionState = { stage: "collecting", intent, pendingQuery: {}, activePaymentId: null };
  return { session: nextSession, response: { text: lookupPromptText(intent, locale), suggestions: [], found: true } };
}

function beginSimulation(query: PaymentLookupQuery, locale: Locale): PaymentStepResult {
  const orderMatch = matchOrder(query);
  if (!orderMatch) {
    return { session: { ...INITIAL_PAYMENT_SESSION }, response: { text: NOT_FOUND_TEXT[locale], suggestions: ["phone"], found: false } };
  }

  const payment = simulateInteracPayment(orderMatch.order.id);
  if (!payment) {
    return { session: { ...INITIAL_PAYMENT_SESSION }, response: { text: NOT_FOUND_TEXT[locale], suggestions: ["phone"], found: false } };
  }

  return {
    session: { ...INITIAL_PAYMENT_SESSION, activePaymentId: payment.id },
    response: { text: simulatedCreatedText(payment, orderMatch.order.id, locale), suggestions: ["payment-confirm-demo", "payment-decline-demo"], found: true },
  };
}

export function submitPaymentIdentifierText(session: PaymentSessionState, text: string, locale: Locale): PaymentStepResult {
  const extracted = extractPaymentIdentifiers(text);
  const pendingQuery = mergeQuery(session.pendingQuery, extracted);
  const workingSession: PaymentSessionState = { ...session, pendingQuery };

  if (countFilled(pendingQuery) === 0 && !pendingQuery.transactionId) {
    return { session: workingSession, response: { text: COULD_NOT_PARSE[locale], suggestions: [], found: false } };
  }

  if (!hasEnoughIdentifiers(pendingQuery)) {
    return { session: workingSession, response: { text: NEED_ONE_MORE[locale], suggestions: [], found: false } };
  }

  if (session.intent === "simulate-interac") {
    return beginSimulation(pendingQuery, locale);
  }

  const match = matchPayment(pendingQuery);
  if (!match) {
    return { session: { ...INITIAL_PAYMENT_SESSION }, response: { text: NOT_FOUND_TEXT[locale], suggestions: ["phone"], found: false } };
  }

  return {
    session: { ...INITIAL_PAYMENT_SESSION, activePaymentId: match.payment.id },
    response: answerForIntent(match.payment, session.intent, locale),
  };
}

export function requestPaymentAction(session: PaymentSessionState, actionId: PaymentActionId, locale: Locale): PaymentStepResult {
  if (!session.activePaymentId) {
    return { session, response: { text: NO_ACTIVE_PAYMENT_TEXT[locale], suggestions: [], found: false } };
  }

  const actor = locale === "fr" ? "Bud Guardian (démo)" : "Bud Guardian (demo)";
  const payment = actionId === "confirm-demo" ? confirmPayment(session.activePaymentId, actor) : declinePayment(session.activePaymentId, actor);

  if (!payment) {
    return { session, response: { text: NO_ACTIVE_PAYMENT_TEXT[locale], suggestions: [], found: false } };
  }

  const text = actionId === "confirm-demo" ? confirmedDemoText(payment, findOrderById(payment.orderId), locale) : declinedDemoText(payment, locale);
  return { session: { ...session, activePaymentId: null, stage: "idle" }, response: { text, suggestions: [], found: true } };
}
