"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import ChatBubble from "./ChatBubble";
import ChatWindow from "./ChatWindow";
import type { ChatMessage } from "./Message";
import { CATEGORY_SUGGESTIONS, getCategoryIntro, type QuickActionConfig } from "./QuickActions";
import { respondToFaqId, respondToQuery, type GuardianResponse } from "@/lib/bud-guardian/engine";
import { checkAccessControl } from "@/lib/bud-guardian/access-control";
import { detectEscalation } from "@/lib/bud-guardian/escalation";
import { detectOrderIntent } from "@/lib/bud-guardian/order-intent";
import { useGuardianState } from "@/lib/bud-guardian/useGuardianState";
import { useOrderSession } from "@/lib/bud-guardian/useOrderSession";
import { usePaymentSession } from "@/lib/bud-guardian/usePaymentSession";
import type { OrderActionId, OrderIntent } from "@/lib/bud-guardian/order-engine";
import {
  answerGenericPaymentFaq,
  matchGenericPaymentFaq,
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

  function pushBotMessage(text: string, suggestions: ChatMessage["suggestions"] = []) {
    setMessages((prev) => [...prev, { id: createId(), role: "bot", text, suggestions, animate: true }]);
  }

  function handleSend(text: string) {
    pushUserMessage(text);

    // Public access-control layer: blocked topics are refused even mid-
    // session, before any order/payment identifier text is consumed.
    const blocked = checkAccessControl(text, locale);
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

    const escalation = detectEscalation(text, locale);
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

    const genericPayment = matchGenericPaymentFaq(text, locale);
    if (genericPayment) {
      runThinkingSequence(
        () => genericPayment,
        (response) => pushBotMessage(response.text, response.suggestions)
      );
      return;
    }

    runThinkingSequence<GuardianResponse>(
      () => respondToQuery(text, locale, lastTopic),
      (response) => {
        pushBotMessage(response.answer, response.suggestions);
        setLastTopic(response.topic ?? null);
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
    <div className="fixed bottom-5 right-5 z-[60] sm:bottom-6 sm:right-6">
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
        <ChatBubble state={guardianState} nodding={nodding} onClick={handleOpen} label={BUBBLE_LABEL[locale]} />
      )}
    </div>
  );
}
