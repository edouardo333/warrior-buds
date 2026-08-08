"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import ChatBubble from "./ChatBubble";
import ChatWindow from "./ChatWindow";
import type { ChatMessage } from "./Message";
import { CATEGORY_SUGGESTIONS, getCategoryIntro, type QuickActionConfig } from "./QuickActions";
import { respondToFaqId, type GuardianResponse } from "@/lib/bud-guardian/engine";
import { checkAccessControl } from "@/lib/bud-guardian/access-control";
import { checkGuardianPolicy } from "@/lib/bud-guardian/guardian-policy";
import { detectEscalation } from "@/lib/bud-guardian/escalation";
import { detectOrderIntent } from "@/lib/bud-guardian/order-intent";
import { resolveReplyLocale } from "@/lib/bud-guardian/language-detect";
import { resolveGuardianProvider, type ConversationTurn } from "@/lib/bud-guardian/ai-provider";
import { useGuardianState } from "@/lib/bud-guardian/useGuardianState";
import { useOrderSession } from "@/lib/bud-guardian/useOrderSession";
import { usePaymentSession } from "@/lib/bud-guardian/usePaymentSession";
import type { OrderActionId, OrderIntent } from "@/lib/bud-guardian/order-engine";
import {
  answerGenericPaymentFaq,
  type PaymentActionId,
  type PaymentIntent,
} from "@/lib/bud-guardian/payment-engine";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { FaqTopic, QuickActionId } from "@/data/bud-guardian/types";

const ORDER_INTENT_BY_ACTION: Partial<Record<QuickActionId, OrderIntent>> = {
  "order-track": "track",
  "order-find": "find",
  "order-ready": "ready",
  "order-payment": "payment",
  "order-resume-cart": "resume-cart",
};

const ORDER_ACTION_BY_ID: Partial<Record<QuickActionId, OrderActionId>> = {
  "order-resume": "resume",
  "order-view-cart": "view-cart",
  "order-payment-retry": "payment-retry",
};

const PAYMENT_INTENT_BY_ACTION: Partial<Record<QuickActionId, PaymentIntent>> = {
  "payment-check-received": "check-received",
  "payment-check-worked": "check-worked",
  "payment-remaining": "remaining-amount",
  "payment-order-confirmed": "order-confirmed",
  "payment-expired": "check-expired",
  "payment-simulate-interac": "simulate-interac",
};

const PAYMENT_ACTION_BY_ID: Partial<Record<QuickActionId, PaymentActionId>> = {
  "payment-confirm-demo": "confirm-demo",
  "payment-decline-demo": "decline-demo",
};

const GENERIC_PAYMENT_FAQ_IDS: QuickActionId[] = ["payment-interac-info", "payment-in-store"];

const CATEGORY_IDS: QuickActionId[] = [
  "cat-store",
  "cat-products",
  "cat-product-help",
  "cat-orders",
  "cat-payments",
  "cat-policies",
  "cat-contact",
  "cat-human-help",
];

const WELCOME = {
  fr: "👋 Bonjour !\nJe suis Bud Guardian.\nVotre assistant virtuel disponible 24 h/24, 7 j/7.\nComment puis-je vous aider ?",
  en: "👋 Hi!\nI'm Bud Guardian.\nYour 24/7 virtual assistant.\nHow can I help?",
} as const;

const BUBBLE_LABEL = { fr: "Ouvrir Bud Guardian", en: "Open Bud Guardian" } as const;

// Storefront — mobile-only compact FAB: on checkout/cart/order pages the
// floating bubble sits closer to totals, CTAs, and form fields than
// anywhere else in the app, so it drops to a smaller footprint with a bit
// more clearance from the bottom edge (see ChatBubble's `compact` prop).
// Desktop sizing/position is untouched. Never removes the widget — it stays
// reachable everywhere.
const COMPACT_PATH_PREFIXES = ["/cart", "/checkout", "/track-order", "/account/orders"];

function isCompactPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return COMPACT_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function BudGuardian() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Conversation memory: the topic of the last successfully-answered FAQ,
  // used only as a tie-breaker for follow-up questions (see engine.ts).
  const [lastTopic, setLastTopic] = useState<FaqTopic | null>(null);
  // V9 — the last product Guardian discussed, so a bare follow-up ("and the
  // price?", "is it in stock?") resolves without repeating the product name
  // (see product-intent.ts).
  const [lastProductId, setLastProductId] = useState<string | null>(null);
  // V9 — one conversational provider per mount (see ai-provider.ts). Local
  // by default; never recreated mid-conversation.
  const guardianProvider = useRef(resolveGuardianProvider()).current;
  // UI-only: which category pill is highlighted/centered in the persistent
  // bar (desktop). Purely presentational, does not affect chatbot logic.
  const [activeCategory, setActiveCategory] = useState<QuickActionId | null>(null);
  const hasOpenedOnce = useRef(false);
  const { state: guardianState, isTyping, nodding, runThinkingSequence, flashResponding } = useGuardianState();
  const orderSession = useOrderSession();
  const paymentSession = usePaymentSession();

  // Bud Guardian is the public-only assistant — staff have their own
  // dashboards as their "mode" (see /staff/*), so the widget must never
  // float over authenticated staff routes.
  if (pathname?.startsWith("/staff")) return null;

  const compact = isCompactPath(pathname);

  function handleOpen() {
    setIsOpen(true);
    if (!hasOpenedOnce.current) {
      hasOpenedOnce.current = true;
      setMessages([{ id: createId(), role: "bot", text: WELCOME[locale], suggestions: CATEGORY_IDS, animate: true }]);
    }
  }

  function pushUserMessage(text: string) {
    setMessages((prev) => [...prev, { id: createId(), role: "user", text }]);
  }

  function pushBotMessage(text: string, suggestions: ChatMessage["suggestions"] = [], found = true) {
    setMessages((prev) => [...prev, { id: createId(), role: "bot", text, suggestions, animate: true, found }]);
  }

  async function handleSend(text: string) {
    pushUserMessage(text);

    // V9 — Guardian's free-text replies follow the language the customer
    // just used (see language-detect.ts), independent of the site's own
    // FR/EN toggle. Applies to every check below except the order/payment
    // two-factor sessions, which stay in the site's UI locale — switching
    // languages mid multi-step form is more likely to confuse than help.
    const replyLocale = resolveReplyLocale(text, locale);

    // V9 — centralized safety/refusal layer. Runs before everything else,
    // including mid order/payment session, same guarantee access-control
    // below already gives staff-data topics (see guardian-policy.ts).
    const policyBlock = checkGuardianPolicy(text, replyLocale);
    if (policyBlock) {
      runThinkingSequence(
        () => policyBlock,
        (response) => pushBotMessage(response.answer, response.suggestions)
      );
      return;
    }

    // Public access-control layer: blocked topics are refused even mid-
    // session, before any order/payment identifier text is consumed.
    const blocked = checkAccessControl(text, replyLocale);
    if (blocked) {
      runThinkingSequence(
        () => blocked,
        (response) => pushBotMessage(response.answer, response.suggestions)
      );
      return;
    }

    if (orderSession.isCollecting) {
      runThinkingSequence(
        orderSession.submitText(text, locale),
        (response) => pushBotMessage(response.text, response.suggestions)
      );
      return;
    }

    if (paymentSession.isCollecting) {
      runThinkingSequence(
        paymentSession.submitText(text, locale),
        (response) => pushBotMessage(response.text, response.suggestions)
      );
      return;
    }

    const escalation = detectEscalation(text, replyLocale);
    if (escalation) {
      runThinkingSequence(
        () => escalation,
        (response) => pushBotMessage(response.answer, response.suggestions)
      );
      return;
    }

    // Bridge free-text order questions ("Puis-je suivre ma commande?") into
    // the same two-factor order-lookup session the quick actions use.
    const orderIntent = detectOrderIntent(text);
    if (orderIntent) {
      runThinkingSequence(
        orderSession.beginIntent(orderIntent, locale),
        (response) => pushBotMessage(response.text, response.suggestions)
      );
      return;
    }

    // V9 — everything past this point is the open-ended conversational
    // step: live product grounding, generic payment FAQ, then the
    // keyword/typo-tolerant FAQ engine, all behind the provider
    // abstraction (see ai-provider.ts).
    const history: ConversationTurn[] = messages.map((m) => ({ role: m.role, text: m.text, found: m.found }));
    const result = await guardianProvider.respond({ message: text, replyLocale, history, lastTopic, lastProductId });

    runThinkingSequence(
      () => result,
      (response) => {
        pushBotMessage(response.answer, response.suggestions, response.found);
        setLastTopic(response.topic ?? null);
        if (response.productId) setLastProductId(response.productId);
      }
    );
  }

  function handleQuickAction(action: QuickActionConfig) {
    if (action.kind === "external") {
      window.open(action.target, "_blank", "noopener,noreferrer");
    } else if (action.kind === "tel") {
      window.location.assign(action.target);
    }

    pushUserMessage(action.label[locale]);

    if (action.kind === "category") {
      setActiveCategory(action.id);
      const suggestions = CATEGORY_SUGGESTIONS[action.id] ?? [];
      flashResponding();
      pushBotMessage(getCategoryIntro(action.id, locale), suggestions);
      return;
    }

    if (action.kind === "faq") {
      runThinkingSequence<GuardianResponse>(
        () => respondToFaqId(action.target, locale) ?? { answer: "", suggestions: [], found: false },
        (response) => {
          if (response.answer) pushBotMessage(response.answer, response.suggestions);
          setLastTopic(response.topic ?? null);
        }
      );
      return;
    }

    if (action.kind === "order") {
      const resolve = resolveOrderAction(action.id);
      runThinkingSequence(resolve, (response) => {
        if (response.text) pushBotMessage(response.text, response.suggestions);
      });
      return;
    }

    if (action.kind === "payment") {
      const resolve = resolvePaymentAction(action.id);
      runThinkingSequence(resolve, (response) => {
        if (response.text) pushBotMessage(response.text, response.suggestions);
      });
      return;
    }

    const confirmation =
      locale === "fr" ? `Ouverture de ${action.label.fr}…` : `Opening ${action.label.en}…`;
    flashResponding();
    pushBotMessage(confirmation);
  }

  function resolveOrderAction(id: QuickActionConfig["id"]) {
    if (id === "order-confirm-yes") return orderSession.answerConfirmation(true, locale);
    if (id === "order-confirm-no") return orderSession.answerConfirmation(false, locale);

    const actionId = ORDER_ACTION_BY_ID[id];
    if (actionId) return orderSession.dispatchAction(actionId, locale);

    const intent = ORDER_INTENT_BY_ACTION[id] ?? null;
    return orderSession.beginIntent(intent, locale);
  }

  function resolvePaymentAction(id: QuickActionConfig["id"]) {
    if (GENERIC_PAYMENT_FAQ_IDS.includes(id)) {
      return () => answerGenericPaymentFaq(id as "payment-interac-info" | "payment-in-store", locale);
    }

    const actionId = PAYMENT_ACTION_BY_ID[id];
    if (actionId) return paymentSession.dispatchAction(actionId, locale);

    const intent = PAYMENT_INTENT_BY_ACTION[id] ?? null;
    return paymentSession.beginIntent(intent, locale);
  }

  return (
    <div
      className={`fixed z-[60] sm:bottom-6 sm:right-6 ${compact ? "bottom-6 right-4" : "bottom-5 right-5"}`}
    >
      {isOpen ? (
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          guardianState={guardianState}
          nodding={nodding}
          activeCategory={activeCategory}
          onClose={() => setIsOpen(false)}
          onSend={handleSend}
          onQuickAction={handleQuickAction}
        />
      ) : (
        <ChatBubble state={guardianState} nodding={nodding} onClick={handleOpen} label={BUBBLE_LABEL[locale]} compact={compact} />
      )}
    </div>
  );
}
