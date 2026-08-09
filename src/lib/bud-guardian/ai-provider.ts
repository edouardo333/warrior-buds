// Bud Guardian V9/V10 — conversational provider abstraction.
//
// Guardian's safety-critical layers (guardian-policy.ts's refusals,
// access-control.ts's staff-data boundary, escalation.ts, and the
// order/payment two-factor lookup sessions) are NOT part of this
// abstraction and never will be: they are hard-coded, deterministic gates
// that must behave identically no matter which provider answers the
// open-ended part of the conversation, so they run upstream of it (see
// BudGuardian.tsx and staff-guardian-engine.ts). What IS pluggable here is
// the "answer this message, using conversation history and store data"
// step.
//
// LocalHeuristicProvider is the original, fully local implementation: live
// product grounding (product-intent.ts) + the payment FAQ + the keyword/
// typo-tolerant FAQ engine (engine.ts), with lightweight conversation
// memory (last topic, last product, repeated-fallback detection). It never
// calls out to any network/API — same "purely local and simulated" contract
// as every other Bud Guardian module. It is also the automatic fallback for
// ExternalAIProvider (see FallbackAIProvider below), so it's never dead
// code even when the external provider is selected.
//
// ExternalAIProvider (V10) hands the open-ended step to a real hosted model
// through app/api/bud-guardian/chat/route.ts — the only place the model's
// API key is ever read (see that file's header) — via
// guardian-ai-client.ts's stateless, client-driven tool-calling loop. The
// model can only ever touch app data through the fixed, read-only tool
// catalog in guardian-tools.ts/tool-executor.ts: it cannot invent store
// facts, and it cannot mutate anything (see AGENTS instructions — no
// arbitrary mutation tools, orders/payments/inventory/accounts/permissions
// stay untouched by the AI).

import type { Locale } from "@/lib/i18n/types";
import type { FaqTopic, QuickActionId } from "@/data/bud-guardian/types";
import type { ProductCategory } from "@/types/product";
import { respondToQuery } from "./engine";
import { matchGenericPaymentFaq } from "./payment-engine";
import { respondToProductQuery } from "./product-intent";
import { respondToCartQuery } from "./cart-intent";
import { respondToCheckoutQuery } from "./checkout-intent";
import { respondToSupportQuery } from "./support-intent";
import { runGuardianAiConversation, type GuardianAiTurn } from "./guardian-ai-client";
import type { GuardianToolName } from "./guardian-tools";

export type ConversationRole = "user" | "bot";

export type ConversationTurn = {
  role: ConversationRole;
  text: string;
  found?: boolean; // for bot turns: did Guardian actually have an answer (vs. the generic fallback)?
};

export type GuardianProviderInput = {
  message: string;
  /** Language Guardian should reply in for this turn (see language-detect.ts) — may differ from the site's UI locale. */
  replyLocale: Locale;
  /** Recent turns, oldest first, capped by the caller (BudGuardian.tsx keeps the last ~12). */
  history: ConversationTurn[];
  lastTopic: FaqTopic | null;
  lastProductId: string | null;
  // V11 — Smart Product Advisor conversation memory: the category/budget the
  // customer is shopping within, so "Vapes" resolves as "vapes under $30"
  // after Guardian asked "which category?" (see product-intent.ts).
  lastCategory: ProductCategory | null;
  lastMaxPrice: number | null;
  // V12 — Shopping & Cart Assistant. `ownerId` is the same "guest" or
  // signed-in accountId cart-actions.ts's useOwnerId() resolves, so Guardian
  // ever only mutates the customer's own real cart (see cart-intent.ts).
  // `lastRecommendedProductIds` is the ordered list from the last
  // recommendation/search Guardian showed (see product-intent.ts's
  // ProductQueryResult.productIds), so "add the second one"/"the cheapest
  // one" resolves against what was actually shown.
  ownerId: string;
  lastRecommendedProductIds: string[] | null;
  // V13 — Checkout & Order Assistant: whether the caller currently has a
  // real signed-in V5 account session (see checkout-intent.ts). Order/
  // payment lookups are only ever answered for a signed-in caller's own
  // account — never a guest/global lookup.
  isSignedIn: boolean;
};

export type GuardianProviderOutput = {
  answer: string;
  suggestions: QuickActionId[];
  topic?: FaqTopic;
  productId?: string;
  category?: ProductCategory;
  // undefined = leave the caller's remembered budget as-is; null = V11.1
  // explicit "clear it, the topic changed" signal; a number = remember this
  // new ceiling (see product-intent.ts's ProductQueryResult).
  maxPrice?: number | null;
  // V12 — undefined = leave the caller's remembered recommendation list
  // as-is; present = remember this new list (see product-intent.ts's
  // ProductQueryResult.productIds / cart-intent.ts's ordinal resolution).
  productIds?: string[];
  found: boolean;
};

export interface GuardianAIProvider {
  readonly id: string;
  respond(input: GuardianProviderInput): Promise<GuardianProviderOutput>;
}

export class GuardianProviderUnavailableError extends Error {
  constructor(providerId: string) {
    super(
      `Guardian provider "${providerId}" requires a real hosted model/API and is not configured in this deployment. ` +
        `Set up an API integration and implement its respond() before selecting this provider — see ai-provider.ts.`
    );
    this.name = "GuardianProviderUnavailableError";
  }
}

const FOLLOWUP_ESCALATION_NUDGE: Record<Locale, string> = {
  fr: "\n\nSi ça ne répond pas à votre question, je peux vous mettre en contact avec l'équipe.",
  en: "\n\nIf that doesn't answer your question, I can connect you with the team.",
};

const FOLLOWUP_ESCALATION_SUGGESTIONS: QuickActionId[] = ["instagram", "human-callback", "phone"];

export class LocalHeuristicProvider implements GuardianAIProvider {
  readonly id = "local-heuristic";

  async respond(input: GuardianProviderInput): Promise<GuardianProviderOutput> {
    const { message, replyLocale, history, lastTopic, lastProductId, lastCategory, lastMaxPrice, ownerId, lastRecommendedProductIds, isSignedIn } = input;

    // V14 — Customer Support & Problem Resolution (see support-intent.ts).
    // Checked FIRST: its regexes cover problem domains none of the other
    // modules own (account/login help, an out-of-stock product, a "wrong
    // quantity" complaint) plus a frustration-flavored "my order is stuck"
    // phrasing that's deliberately more specific than checkout-intent's own
    // neutral order-status wording just below, so the two never both try to
    // answer the same message.
    const support = respondToSupportQuery(message, replyLocale, { ownerId, isSignedIn, lastProductId });
    if (support) {
      return { answer: support.answer, suggestions: support.suggestions, found: true };
    }

    // V13 — checkout readiness, real payment methods, and the signed-in
    // customer's own order/payment status (see checkout-intent.ts). Checked
    // BEFORE cart-intent: its regexes are specific ("ready to checkout",
    // "payment methods", "where's my order"...) and never match a cart
    // mutation verb, but cart-intent's own bare "mentions cart" catch-all
    // (its rule 5) is broad enough to otherwise swallow a phrase like "is my
    // cart ready to checkout?" as a plain "show me the cart" before this
    // module ever gets a turn.
    const checkout = respondToCheckoutQuery(message, replyLocale, { ownerId, isSignedIn });
    if (checkout) {
      return { answer: checkout.answer, suggestions: checkout.suggestions, found: true };
    }

    // V12 — cart follow-ups ("add the second one", "make it two", "remove
    // that product") take priority over product/FAQ: they're actionable
    // commands, not questions, and they're only ever recognized when they
    // clearly resolve to a real product/cart state (see cart-intent.ts) —
    // anything that doesn't resolve falls through to product advice/FAQ
    // below instead of a wrong "which product?" reply.
    const cart = respondToCartQuery(message, replyLocale, { ownerId, lastProductId, lastRecommendedProductIds });
    if (cart) {
      return { answer: cart.answer, suggestions: cart.suggestions, found: true, productId: cart.productId };
    }

    // Live store data first: a specific product/recommendation ask is more
    // useful answered from the real catalog than from a static FAQ line.
    const product = respondToProductQuery(message, replyLocale, { lastProductId, lastCategory, lastMaxPrice });
    if (product) {
      return {
        answer: product.answer,
        suggestions: product.suggestions,
        found: true,
        productId: product.productId,
        category: product.category,
        maxPrice: product.maxPrice,
        productIds: product.productIds,
      };
    }

    const genericPayment = matchGenericPaymentFaq(message, replyLocale);
    if (genericPayment) {
      return { answer: genericPayment.text, suggestions: genericPayment.suggestions, found: true };
    }

    const faq = respondToQuery(message, replyLocale, lastTopic);

    // Conversation memory: two unanswered turns in a row is a good signal
    // the customer is stuck, not just asking something niche once — offer a
    // human path instead of a third generic "I don't know".
    const previousBotTurn = [...history].reverse().find((turn) => turn.role === "bot");
    const isRepeatedFallback = !faq.found && previousBotTurn?.found === false;

    return {
      answer: isRepeatedFallback ? `${faq.answer}${FOLLOWUP_ESCALATION_NUDGE[replyLocale]}` : faq.answer,
      suggestions: isRepeatedFallback ? FOLLOWUP_ESCALATION_SUGGESTIONS : faq.suggestions,
      topic: faq.topic,
      found: faq.found,
    };
  }
}

// V10 — suggestions are derived from which approved tools the model
// actually used this turn, mirroring how LocalHeuristicProvider's own
// suggestions come from which engine answered (product/payment/FAQ). No
// tool used (a pure smalltalk/refusal-adjacent reply) falls back to no
// suggestions, same as engine.ts's own "no strong match" case.
function suggestionsForTools(tools: GuardianToolName[]): QuickActionId[] {
  const used = new Set(tools);
  // V14 — account/login-help tool takes priority: a problem-resolution turn
  // is more usefully followed up with the real auth pages than the catalog.
  if (used.has("get_account_status")) return ["support-login", "support-forgot-password"];
  // V12 — cart tools take priority: a turn that both searched and mutated
  // the cart is more usefully followed up on the cart than the catalog.
  if (used.has("get_cart") || used.has("add_to_cart") || used.has("update_cart_quantity") || used.has("remove_from_cart") || used.has("clear_cart")) {
    return ["cat-products", "products"];
  }
  if (used.has("search_products") || used.has("get_product_details")) return ["cat-products", "products"];
  // V13 — checkout/order/payment tools.
  if (used.has("get_my_orders") || used.has("get_order_status") || used.has("get_payment_status_for_order")) {
    return ["checkout-orders", "order-call"];
  }
  if (used.has("get_checkout_status") || used.has("get_payment_methods")) return ["checkout-go", "checkout-cart"];
  if (used.has("get_store_info")) return ["hours", "directions"];
  if (used.has("get_learning_center_topic")) return ["cat-products"];
  if (used.has("get_faq_answer")) return ["cat-policies"];
  return [];
}

// V10 — real hosted-model provider. Delegates the actual network call +
// tool-calling loop to guardian-ai-client.ts (see that file's header for why
// the loop is client-driven) and only shapes the result into
// GuardianProviderOutput here. Throws GuardianProviderUnavailableError on
// any failure (missing/invalid API key, network error, timeout, malformed
// upstream response) — never selected directly by resolveGuardianProvider();
// always wrapped in FallbackAIProvider, which is what actually catches that
// error and falls back to LocalHeuristicProvider for that turn.
export class ExternalAIProvider implements GuardianAIProvider {
  readonly id = "external-llm";

  async respond(input: GuardianProviderInput): Promise<GuardianProviderOutput> {
    const history: GuardianAiTurn[] = input.history.map((turn) => ({ role: turn.role, text: turn.text }));

    const result = await runGuardianAiConversation({
      message: input.message,
      locale: input.replyLocale,
      history,
      mode: "public",
    });

    if (!result.ok) throw new GuardianProviderUnavailableError(this.id);

    return {
      answer: result.answer,
      suggestions: suggestionsForTools(result.toolsUsed),
      found: true,
      productId: result.productId,
    };
  }
}

// V10 — wraps a primary provider with a fallback: if the primary throws
// (network error, timeout, misconfiguration — see ExternalAIProvider above),
// the fallback answers instead so the conversation degrades gracefully
// rather than surfacing an error to the customer (see AGENTS instructions:
// "Handle API errors/timeouts gracefully and fall back locally").
export class FallbackAIProvider implements GuardianAIProvider {
  readonly id = "external-with-local-fallback";

  constructor(
    private readonly primary: GuardianAIProvider,
    private readonly fallback: GuardianAIProvider
  ) {}

  async respond(input: GuardianProviderInput): Promise<GuardianProviderOutput> {
    try {
      return await this.primary.respond(input);
    } catch (error) {
      if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
        console.warn(`[bud-guardian] ${this.primary.id} unavailable, falling back to ${this.fallback.id}:`, error);
      }
      return this.fallback.respond(input);
    }
  }
}

// Whether the external provider is configured for this build — read by both
// BudGuardian.tsx (indirectly, via resolveGuardianProvider()) and the staff
// copilot (GuardianAssistant.tsx, which has its own local/AI fallback split
// — see staff-guardian-engine.ts's respondToStaffQueryAI). Exposed as its
// own helper so the staff surface doesn't have to duplicate the raw
// env-var check.
export function isExternalGuardianAiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_GUARDIAN_AI_PROVIDER === "external";
}

// Chooses which provider answers open-ended public-chat messages.
// LocalHeuristicProvider is the default (no network call ever made); the
// external provider is opt-in via env var (see .env.example) and, once
// selected, always runs behind FallbackAIProvider so a missing API key,
// network failure, or timeout degrades to the local engine instead of
// breaking the chat.
export function resolveGuardianProvider(): GuardianAIProvider {
  if (isExternalGuardianAiEnabled()) {
    return new FallbackAIProvider(new ExternalAIProvider(), new LocalHeuristicProvider());
  }
  return new LocalHeuristicProvider();
}
