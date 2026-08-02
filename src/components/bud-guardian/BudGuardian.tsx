"use client";

import { useRef, useState } from "react";
import ChatBubble from "./ChatBubble";
import ChatWindow from "./ChatWindow";
import type { ChatMessage } from "./Message";
import type { QuickActionConfig } from "./QuickActions";
import { respondToFaqId, respondToQuery, type GuardianResponse } from "@/lib/bud-guardian/engine";
import { useGuardianState } from "@/lib/bud-guardian/useGuardianState";
import { useOrderSession } from "@/lib/bud-guardian/useOrderSession";
import type { OrderActionId, OrderIntent } from "@/lib/bud-guardian/order-engine";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { QuickActionId } from "@/data/bud-guardian/types";

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

const WELCOME = {
  fr: "👋 Bonjour !\nJe suis Bud Guardian.\nVotre assistant virtuel disponible 24 h/24, 7 j/7.\nComment puis-je vous aider ?",
  en: "👋 Hi!\nI'm Bud Guardian.\nYour 24/7 virtual assistant.\nHow can I help?",
} as const;

const BUBBLE_LABEL = { fr: "Ouvrir Bud Guardian", en: "Open Bud Guardian" } as const;

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function BudGuardian() {
  const { locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const hasOpenedOnce = useRef(false);
  const { state: guardianState, isTyping, nodding, runThinkingSequence, flashResponding } = useGuardianState();
  const orderSession = useOrderSession();

  function handleOpen() {
    setIsOpen(true);
    if (!hasOpenedOnce.current) {
      hasOpenedOnce.current = true;
      setMessages([{ id: createId(), role: "bot", text: WELCOME[locale], animate: true }]);
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

    if (orderSession.isCollecting) {
      runThinkingSequence(
        orderSession.submitText(text, locale),
        (response) => pushBotMessage(response.text, response.suggestions)
      );
      return;
    }

    runThinkingSequence<GuardianResponse>(
      () => respondToQuery(text, locale),
      (response) => pushBotMessage(response.answer, response.suggestions)
    );
  }

  function handleQuickAction(action: QuickActionConfig) {
    if (action.kind === "external") {
      window.open(action.target, "_blank", "noopener,noreferrer");
    } else if (action.kind === "tel") {
      window.location.assign(action.target);
    }

    pushUserMessage(action.label[locale]);

    if (action.kind === "faq") {
      runThinkingSequence<GuardianResponse>(
        () => respondToFaqId(action.target, locale) ?? { answer: "", suggestions: [], found: false },
        (response) => {
          if (response.answer) pushBotMessage(response.answer, response.suggestions);
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

  return (
    <div className="fixed bottom-5 right-5 z-[60] sm:bottom-6 sm:right-6">
      {isOpen ? (
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          guardianState={guardianState}
          nodding={nodding}
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
