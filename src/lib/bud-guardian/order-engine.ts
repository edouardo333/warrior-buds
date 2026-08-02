// Bud Guardian V2 — order-assistance engine. Pure functions only (no React),
// mirroring the read-only, locale-driven shape of ../engine.ts so the two
// modes ("FAQ" and "Commandes") feel like one assistant. Nothing here talks
// to a real payment/delivery/CRM system — everything is derived from the
// shared live order store (orders-store.ts, also written to by the
// /staff/orders dashboard) and, for the confirmation flow, a
// session-scoped overlay held in React state (see useOrderSession.ts).
//
// Hard rules baked into this module: never request/display a card number,
// password, or PIN; never claim a payment is confirmed beyond what
// order.payment.status already says; only reveal an order once at least two
// identifiers match the same record; personal contact info is always masked.

import type { Locale } from "@/lib/i18n/types";
import type { QuickActionId } from "@/data/bud-guardian/types";
import { getOrders } from "@/data/bud-guardian/orders-store";
import type {
  ConfirmationQuestionId,
  FulfillmentMethod,
  Order,
  OrderConfirmationFlags,
  OrderLookupQuery,
  OrderLookupResult,
  OrderMatchField,
  OrderStatus,
  PaymentStatus,
} from "@/types/order";

export type OrderEngineResponse = {
  text: string;
  suggestions: QuickActionId[];
  found: boolean;
};

export type OrderIntent = "track" | "find" | "ready" | "payment" | "resume-cart" | null;
export type OrderActionId = "resume" | "view-cart" | "payment-retry";

export type OrderSessionState = {
  stage: "idle" | "collecting";
  intent: OrderIntent;
  pendingQuery: OrderLookupQuery;
  activeOrder: Order | null;
  confirmationOverrides: Partial<OrderConfirmationFlags>;
};

export const INITIAL_ORDER_SESSION: OrderSessionState = {
  stage: "idle",
  intent: null,
  pendingQuery: {},
  activeOrder: null,
  confirmationOverrides: {},
};

export type OrderStepResult = { session: OrderSessionState; response: OrderEngineResponse };

// ---------------------------------------------------------------------------
// Normalization + matching
// ---------------------------------------------------------------------------

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizePhone(value: string): string {
  const digits = digitsOnly(value);
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeOrderNumber(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "").replace(/^(WB)?-?/, "WB-");
}

const ORDER_NUMBER_RE = /\bWB-?\s?\d{4,6}\b/i;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE_RE = /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;

export function extractIdentifiers(text: string): OrderLookupQuery {
  const query: OrderLookupQuery = {};

  const emailMatch = text.match(EMAIL_RE);
  if (emailMatch) query.email = emailMatch[0];

  const orderMatch = text.match(ORDER_NUMBER_RE);
  if (orderMatch) query.orderNumber = orderMatch[0];

  const withoutOrderNumber = orderMatch ? text.replace(orderMatch[0], " ") : text;
  const phoneMatch = withoutOrderNumber.match(PHONE_RE);
  if (phoneMatch && digitsOnly(phoneMatch[0]).length >= 10) query.phone = phoneMatch[0];

  return query;
}

function mergeQuery(a: OrderLookupQuery, b: OrderLookupQuery): OrderLookupQuery {
  return {
    orderNumber: b.orderNumber ?? a.orderNumber,
    phone: b.phone ?? a.phone,
    email: b.email ?? a.email,
  };
}

function countFilled(query: OrderLookupQuery): number {
  return [query.orderNumber, query.phone, query.email].filter(Boolean).length;
}

// Only ever returns an order when at least two supplied identifiers match
// the same record — this is the "two-factor" rule from the spec.
export function matchOrder(query: OrderLookupQuery): OrderLookupResult | null {
  let best: OrderLookupResult | null = null;

  for (const order of getOrders()) {
    const matchedFields: OrderMatchField[] = [];
    if (query.orderNumber && normalizeOrderNumber(query.orderNumber) === order.id) matchedFields.push("orderNumber");
    if (query.phone && normalizePhone(query.phone) === normalizePhone(order.phone)) matchedFields.push("phone");
    if (query.email && normalizeEmail(query.email) === normalizeEmail(order.email)) matchedFields.push("email");

    if (matchedFields.length >= 2 && (!best || matchedFields.length > best.matchedFields.length)) {
      best = { order, matchedFields };
    }
  }

  return best;
}

// ---------------------------------------------------------------------------
// Masking — personal info is never shown in full in the chat UI
// ---------------------------------------------------------------------------

export function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0];
  return `${first} ${lastInitial}.`;
}

function lastDigits(phone: string, count: number): string {
  const digits = digitsOnly(phone);
  return digits.slice(-count);
}

// ---------------------------------------------------------------------------
// Display formatting
// ---------------------------------------------------------------------------

export function getOrderTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

function formatCurrency(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

const STATUS_LABELS: Record<OrderStatus, Record<Locale, string>> = {
  received: { fr: "Reçue", en: "Received" },
  verifying: { fr: "En vérification", en: "Verifying" },
  confirmed: { fr: "Confirmée", en: "Confirmed" },
  preparing: { fr: "En préparation", en: "Preparing" },
  ready: { fr: "Prête", en: "Ready" },
  completed: { fr: "Terminée", en: "Completed" },
  cancelled: { fr: "Annulée", en: "Cancelled" },
};

export function getStatusLabel(status: OrderStatus, locale: Locale): string {
  return STATUS_LABELS[status][locale];
}

const FULFILLMENT_LABELS: Record<FulfillmentMethod, Record<Locale, string>> = {
  pickup: { fr: "Ramassage en boutique", en: "In-store pickup" },
  curbside: { fr: "Ramassage à l'auto", en: "Curbside pickup" },
};

export function getFulfillmentLabel(method: FulfillmentMethod, locale: Locale): string {
  return FULFILLMENT_LABELS[method][locale];
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, Record<Locale, string>> = {
  not_started: { fr: "Paiement non entamé", en: "Payment not started" },
  pending: { fr: "Paiement en attente", en: "Payment pending" },
  awaiting_confirmation: { fr: "En attente de confirmation", en: "Awaiting confirmation" },
  failed: { fr: "Paiement refusé", en: "Payment failed" },
  paid_in_store: { fr: "Payé en boutique", en: "Paid in-store" },
};

export function getPaymentStatusLabel(status: PaymentStatus, locale: Locale): string {
  return PAYMENT_STATUS_LABELS[status][locale];
}

const NEXT_STEP: Record<string, Record<Locale, string>> = {
  received: { fr: "Notre équipe doit vérifier votre commande.", en: "Our team needs to verify your order." },
  verifying: { fr: "Vérification en cours par notre équipe.", en: "Our team is currently verifying it." },
  confirmed: { fr: "Quelques confirmations sont requises avant la préparation.", en: "A few confirmations are needed before preparation." },
  confirmedAwaitingPayment: { fr: "En attente de la confirmation du paiement.", en: "Waiting on payment confirmation." },
  preparing: { fr: "Votre commande est en préparation en boutique.", en: "Your order is being prepared in-store." },
  ready: { fr: "Vous pouvez venir la récupérer.", en: "You can come pick it up." },
  completed: { fr: "Aucune, la commande est terminée. Merci !", en: "None — the order is complete. Thank you!" },
  cancelled: { fr: "Aucune, la commande a été annulée.", en: "None — the order was cancelled." },
};

export function getNextStepLabel(order: Order, locale: Locale): string {
  if (order.status === "confirmed" && order.payment.status === "awaiting_confirmation") {
    return NEXT_STEP.confirmedAwaitingPayment[locale];
  }
  return NEXT_STEP[order.status][locale];
}

export function formatOrderCard(order: Order, locale: Locale): string {
  const itemsLabel = order.items
    .map((item) => `• ${item.quantity} × ${item.name} — ${formatCurrency(item.unitPrice * item.quantity, locale)}`)
    .join("\n");
  const total = formatCurrency(getOrderTotal(order), locale);

  const lines =
    locale === "fr"
      ? [
          `Commande ${order.id}`,
          `Client : ${maskName(order.customerName)}`,
          `Date : ${formatDate(order.createdAt, locale)}`,
          `Statut : ${getStatusLabel(order.status, locale)}`,
          `Articles :\n${itemsLabel}`,
          `Total : ${total}`,
          `Récupération : ${getFulfillmentLabel(order.fulfillmentMethod, locale)}`,
          `Prochaine étape : ${getNextStepLabel(order, locale)}`,
        ]
      : [
          `Order ${order.id}`,
          `Customer: ${maskName(order.customerName)}`,
          `Date: ${formatDate(order.createdAt, locale)}`,
          `Status: ${getStatusLabel(order.status, locale)}`,
          `Items:\n${itemsLabel}`,
          `Total: ${total}`,
          `Pickup: ${getFulfillmentLabel(order.fulfillmentMethod, locale)}`,
          `Next step: ${getNextStepLabel(order, locale)}`,
        ];

  return lines.join("\n");
}

function cartSummaryText(order: Order, locale: Locale): string {
  const card = formatOrderCard(order, locale);
  const note =
    locale === "fr"
      ? "\n\nVotre panier est toujours disponible, rien n'a été perdu."
      : "\n\nYour cart is still available, nothing was lost.";
  return `${card}${note}`;
}

// ---------------------------------------------------------------------------
// Abandonment + reminders
// ---------------------------------------------------------------------------

const ABANDONED_THRESHOLD_MS = 4 * 60 * 60 * 1000;
const ABANDONABLE_STATUSES: OrderStatus[] = ["received", "verifying"];

export function isOrderAbandoned(order: Order): boolean {
  if (!ABANDONABLE_STATUSES.includes(order.status)) return false;
  return Date.now() - new Date(order.createdAt).getTime() >= ABANDONED_THRESHOLD_MS;
}

const REMINDER_READY: Record<Locale, string> = { fr: "Votre commande est prête.", en: "Your order is ready." };
const REMINDER_PENDING: Record<Locale, string> = {
  fr: "Votre commande attend une confirmation.",
  en: "Your order is waiting on confirmation.",
};
const REMINDER_CART: Record<Locale, string> = {
  fr: "Votre panier est toujours disponible.",
  en: "Your cart is still available.",
};

export function getReminderMessage(order: Order, locale: Locale): string | null {
  if (order.status === "ready") return REMINDER_READY[locale];
  if (isOrderAbandoned(order)) return REMINDER_CART[locale];
  if (order.status === "received" || order.status === "verifying") return REMINDER_PENDING[locale];
  return null;
}

// ---------------------------------------------------------------------------
// Confirmation Q&A (name / phone / pickup method / age 18+)
// ---------------------------------------------------------------------------

const CONFIRMATION_ORDER: ConfirmationQuestionId[] = ["name", "phone", "fulfillment", "age"];
const NEEDS_CONFIRMATION_STATUSES: OrderStatus[] = ["received", "verifying", "confirmed"];

const FLAG_BY_QUESTION: Record<ConfirmationQuestionId, keyof OrderConfirmationFlags> = {
  name: "nameConfirmed",
  phone: "phoneConfirmed",
  fulfillment: "fulfillmentConfirmed",
  age: "ageConfirmed",
};

export function nextConfirmationQuestion(
  order: Order,
  overrides: Partial<OrderConfirmationFlags>
): ConfirmationQuestionId | null {
  for (const question of CONFIRMATION_ORDER) {
    const flag = FLAG_BY_QUESTION[question];
    const effective = overrides[flag] ?? order.confirmation[flag];
    if (!effective) return question;
  }
  return null;
}

function confirmationQuestionText(question: ConfirmationQuestionId, order: Order, locale: Locale): string {
  switch (question) {
    case "name":
      return locale === "fr"
        ? `Pour confirmer : cette commande est bien au nom de ${maskName(order.customerName)} ?`
        : `To confirm: is this order under the name ${maskName(order.customerName)}?`;
    case "phone":
      return locale === "fr"
        ? `Le numéro de téléphone se terminant par ${lastDigits(order.phone, 4)} est-il toujours le bon ?`
        : `Is the phone number ending in ${lastDigits(order.phone, 4)} still correct?`;
    case "fulfillment":
      return locale === "fr"
        ? `Mode de récupération prévu : ${getFulfillmentLabel(order.fulfillmentMethod, "fr")}. Est-ce toujours exact ?`
        : `Planned pickup method: ${getFulfillmentLabel(order.fulfillmentMethod, "en")}. Still correct?`;
    case "age":
      return locale === "fr"
        ? "Confirmez-vous avoir 18 ans ou plus ?"
        : "Do you confirm you are 18 years of age or older?";
  }
}

const CONFIRMATION_MISMATCH_TEXT: Record<Locale, string> = {
  fr: "D'accord, un membre de l'équipe doit valider ce détail avec vous directement avant qu'on continue.",
  en: "Understood — a team member needs to confirm that detail with you directly before we continue.",
};

const ALL_CONFIRMED_TEXT: Record<Locale, string> = {
  fr: "Merci, ces informations sont confirmées ✅. Notre équipe s'occupe de la suite avec vous.",
  en: "Thanks, those details are confirmed ✅. Our team will handle the next step with you.",
};

// ---------------------------------------------------------------------------
// Payment assistance — never claims a payment succeeded beyond stored status
// ---------------------------------------------------------------------------

const PAYMENT_STEPS: Record<Locale, string> = {
  fr:
    "Warrior Buds ne traite pas encore les paiements en ligne. Le paiement se fait sur place, par Interac ou en argent comptant, au moment de la récupération.",
  en:
    "Warrior Buds doesn't process online payments yet. Payment happens in-store, by Interac or cash, at pickup.",
};

function paymentAssistanceText(order: Order, locale: Locale): string {
  const status = getPaymentStatusLabel(order.payment.status, locale);
  return locale === "fr" ? `Statut du paiement : ${status}.\n\n${PAYMENT_STEPS.fr}` : `Payment status: ${status}.\n\n${PAYMENT_STEPS.en}`;
}

function paymentRetryText(order: Order, locale: Locale): string {
  if (order.payment.status === "paid_in_store") {
    return locale === "fr"
      ? "Notre système indique que cette commande est déjà payée en boutique — aucune action requise."
      : "Our system shows this order is already paid in-store — no action needed.";
  }
  return locale === "fr"
    ? "Aucun paiement en ligne n'est requis pour l'instant. Présentez-vous en boutique avec Interac ou de l'argent comptant, ou appelez-nous si vous préférez qu'on vous guide."
    : "No online payment is required right now. Come in-store with Interac or cash, or call us if you'd like to be walked through it.";
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

const INTENT_INTRO: Record<Exclude<OrderIntent, null>, Record<Locale, string>> = {
  track: { fr: "Pour suivre votre commande, ", en: "To track your order, " },
  find: { fr: "Pour retrouver votre commande, ", en: "To find your order, " },
  ready: { fr: "Pour vérifier si votre commande est prête, ", en: "To check if your order is ready, " },
  payment: { fr: "Pour vous aider avec le paiement, retrouvons d'abord votre commande. ", en: "To help with payment, let's first find your order. " },
  "resume-cart": { fr: "Pour reprendre votre commande, ", en: "To resume your order, " },
};

function identifierRequest(locale: Locale): string {
  return locale === "fr"
    ? "donnez-moi deux informations parmi : numéro de commande, téléphone ou courriel. Ces renseignements restent confidentiels."
    : "give me two of the following: order number, phone, or email. This stays confidential.";
}

function lookupPromptText(intent: OrderIntent, locale: Locale): string {
  const intro = intent ? INTENT_INTRO[intent][locale] : "";
  return `${intro}${identifierRequest(locale)}`;
}

const NEED_ONE_MORE: Record<Locale, string> = {
  fr: "Merci. Il me manque une deuxième information (numéro de commande, téléphone ou courriel) pour retrouver votre commande en toute sécurité.",
  en: "Thanks. I still need a second identifier (order number, phone, or email) to safely look up your order.",
};

const COULD_NOT_PARSE: Record<Locale, string> = {
  fr: "Je n'ai pas reconnu ces informations. Pouvez-vous indiquer votre numéro de commande, votre téléphone ou votre courriel ?",
  en: "I couldn't recognize that. Could you share your order number, phone, or email?",
};

const NOT_FOUND_TEXT: Record<Locale, string> = {
  fr: "Je ne trouve aucune commande correspondant à ces informations. Vous pouvez réessayer, appeler Warrior Buds ou nous écrire sur Instagram.",
  en: "I can't find an order matching that information. You can try again, call Warrior Buds, or message us on Instagram.",
};

const NO_ACTIVE_ORDER_TEXT: Record<Locale, string> = {
  fr: "Retrouvons d'abord votre commande.",
  en: "Let's find your order first.",
};

// ---------------------------------------------------------------------------
// Session step functions — each takes the current session + input and
// returns the next session plus the bot's response. Pure and synchronous so
// callers (see useOrderSession.ts) can plug them straight into the existing
// thinking/searching animation sequence.
// ---------------------------------------------------------------------------

function describeForIntent(
  session: OrderSessionState,
  order: Order,
  intent: OrderIntent,
  locale: Locale,
  options: { skipAbandonedCheck?: boolean } = {}
): OrderStepResult {
  const card = formatOrderCard(order, locale);
  const settledSession: OrderSessionState = { ...session, stage: "idle", activeOrder: order };

  if (!options.skipAbandonedCheck && isOrderAbandoned(order)) {
    return {
      session: settledSession,
      response: {
        text: `${card}\n\n${getReminderMessage(order, locale)}`,
        suggestions: ["order-resume", "order-view-cart", "phone", "instagram"],
        found: true,
      },
    };
  }

  if (intent === "payment") {
    return {
      session: settledSession,
      response: {
        text: `${card}\n\n${paymentAssistanceText(order, locale)}`,
        suggestions: order.payment.status === "failed" || order.payment.status === "pending" ? ["order-payment-retry", "phone"] : ["phone"],
        found: true,
      },
    };
  }

  const needsConfirmation = NEEDS_CONFIRMATION_STATUSES.includes(order.status);
  const nextQuestion = needsConfirmation ? nextConfirmationQuestion(order, session.confirmationOverrides) : null;

  if (nextQuestion) {
    return {
      session: settledSession,
      response: {
        text: `${card}\n\n${confirmationQuestionText(nextQuestion, order, locale)}`,
        suggestions: ["order-confirm-yes", "order-confirm-no"],
        found: true,
      },
    };
  }

  const reminder = getReminderMessage(order, locale);
  const trailingSuggestions: QuickActionId[] =
    order.status === "confirmed" && order.payment.status !== "paid_in_store" ? ["order-payment"] : ["order-call"];

  return {
    session: settledSession,
    response: {
      text: reminder ? `${card}\n\n${reminder}` : card,
      suggestions: order.status === "cancelled" ? ["phone", "instagram"] : trailingSuggestions,
      found: true,
    },
  };
}

export function beginOrderIntent(session: OrderSessionState, intent: OrderIntent, locale: Locale): OrderStepResult {
  if (session.activeOrder) {
    return describeForIntent({ ...session, intent }, session.activeOrder, intent, locale);
  }

  const nextSession: OrderSessionState = { ...INITIAL_ORDER_SESSION, stage: "collecting", intent };
  return { session: nextSession, response: { text: lookupPromptText(intent, locale), suggestions: [], found: true } };
}

export function submitOrderIdentifierText(session: OrderSessionState, text: string, locale: Locale): OrderStepResult {
  const extracted = extractIdentifiers(text);
  const pendingQuery = mergeQuery(session.pendingQuery, extracted);
  const filled = countFilled(pendingQuery);
  const workingSession: OrderSessionState = { ...session, pendingQuery };

  if (filled === 0) {
    return { session: workingSession, response: { text: COULD_NOT_PARSE[locale], suggestions: [], found: false } };
  }
  if (filled < 2) {
    return { session: workingSession, response: { text: NEED_ONE_MORE[locale], suggestions: [], found: false } };
  }

  const match = matchOrder(pendingQuery);
  if (!match) {
    return {
      session: { ...INITIAL_ORDER_SESSION },
      response: { text: NOT_FOUND_TEXT[locale], suggestions: ["order-find", "order-call", "instagram"], found: false },
    };
  }

  return describeForIntent(workingSession, match.order, session.intent, locale);
}

export function answerOrderConfirmation(session: OrderSessionState, yes: boolean, locale: Locale): OrderStepResult {
  const order = session.activeOrder;
  if (!order) {
    return { session, response: { text: NO_ACTIVE_ORDER_TEXT[locale], suggestions: ["order-find"], found: false } };
  }

  const question = nextConfirmationQuestion(order, session.confirmationOverrides);
  if (!question) {
    return { session, response: { text: ALL_CONFIRMED_TEXT[locale], suggestions: ["order-payment", "order-call"], found: true } };
  }

  const flag = FLAG_BY_QUESTION[question];
  const confirmationOverrides = { ...session.confirmationOverrides, [flag]: yes };
  const nextSession: OrderSessionState = { ...session, confirmationOverrides };

  if (!yes) {
    return {
      session: nextSession,
      response: { text: CONFIRMATION_MISMATCH_TEXT[locale], suggestions: ["order-call", "instagram"], found: false },
    };
  }

  const nextQuestion = nextConfirmationQuestion(order, confirmationOverrides);
  if (nextQuestion) {
    return {
      session: nextSession,
      response: {
        text: confirmationQuestionText(nextQuestion, order, locale),
        suggestions: ["order-confirm-yes", "order-confirm-no"],
        found: true,
      },
    };
  }

  return {
    session: nextSession,
    response: { text: ALL_CONFIRMED_TEXT[locale], suggestions: ["order-payment", "order-call"], found: true },
  };
}

export function requestOrderAction(session: OrderSessionState, actionId: OrderActionId, locale: Locale): OrderStepResult {
  const order = session.activeOrder;
  if (!order) {
    return { session, response: { text: NO_ACTIVE_ORDER_TEXT[locale], suggestions: ["order-find"], found: false } };
  }

  if (actionId === "view-cart") {
    return { session, response: { text: cartSummaryText(order, locale), suggestions: ["order-resume", "order-call"], found: true } };
  }

  if (actionId === "resume") {
    // Resuming an abandoned order is an explicit request to move it forward,
    // so skip re-showing the "still abandoned" branch and go straight to
    // whatever comes next (confirmation questions, or the order card).
    return describeForIntent({ ...session, intent: "find" }, order, "find", locale, { skipAbandonedCheck: true });
  }

  // payment-retry
  return {
    session,
    response: { text: paymentRetryText(order, locale), suggestions: ["order-call"], found: order.payment.status !== "failed" },
  };
}
