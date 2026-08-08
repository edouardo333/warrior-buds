// Bud Guardian V9 — conversational provider abstraction.
//
// Guardian's safety-critical layers (guardian-policy.ts's refusals,
// access-control.ts's staff-data boundary, escalation.ts, and the
// order/payment two-factor lookup sessions) are NOT part of this
// abstraction and never will be: they are hard-coded, deterministic gates
// that must behave identically no matter which provider answers the
// open-ended part of the conversation, so they run upstream of it (see
// BudGuardian.tsx and staff-guardian-engine.ts). What IS pluggable here is
// the "answer this message, using conversation history and store data"
// step — the part that would, in a fuller product, be handed to a real
// LLM.
//
// LocalHeuristicProvider is what actually runs today: live product
// grounding (product-intent.ts) + the payment FAQ + the keyword/typo-
// tolerant FAQ engine (engine.ts), with lightweight conversation memory
// (last topic, last product, repeated-fallback detection). It never calls
// out to any network/API — same "purely local and simulated" contract as
// every other Bud Guardian module.
//
// ExternalAIProvider is an intentionally UNIMPLEMENTED stub: true
// open-ended, GPT-like conversation requires a real hosted model behind an
// API (e.g. the Claude API), which this app has no backend/API key wiring
// for. Rather than fake that with more keyword rules dressed up as "AI",
// this provider documents the seam and fails loudly and clearly if
// selected without one — see GuardianProviderUnavailableError.

import type { Locale } from "@/lib/i18n/types";
import type { FaqTopic, QuickActionId } from "@/data/bud-guardian/types";
import { respondToQuery } from "./engine";
import { matchGenericPaymentFaq } from "./payment-engine";
import { respondToProductQuery } from "./product-intent";

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
};

export type GuardianProviderOutput = {
  answer: string;
  suggestions: QuickActionId[];
  topic?: FaqTopic;
  productId?: string;
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
    const { message, replyLocale, history, lastTopic, lastProductId } = input;

    // Live store data first: a specific product/recommendation ask is more
    // useful answered from the real catalog than from a static FAQ line.
    const product = respondToProductQuery(message, replyLocale, lastProductId);
    if (product) {
      return { answer: product.answer, suggestions: product.suggestions, found: true, productId: product.productId };
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

// Documented, unimplemented seam for a real hosted model. Never selected by
// default — see resolveGuardianProvider() — and fails loudly rather than
// pretending to be an LLM if it ever is.
export class ExternalAIProvider implements GuardianAIProvider {
  readonly id = "external-llm";

  async respond(): Promise<GuardianProviderOutput> {
    throw new GuardianProviderUnavailableError(this.id);
  }
}

// Chooses which provider answers open-ended messages. Local is the only
// functional option today; an external provider is opt-in via env var for
// when a real API is wired up, and will fail clearly (not silently) until
// then.
export function resolveGuardianProvider(): GuardianAIProvider {
  if (process.env.NEXT_PUBLIC_GUARDIAN_AI_PROVIDER === "external") {
    return new ExternalAIProvider();
  }
  return new LocalHeuristicProvider();
}
