"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import ChatBubble from "./ChatBubble";
import ChatWindow from "./ChatWindow";
import BanScreen from "./BanScreen";
import type { ChatMessage } from "./Message";
import { CATEGORY_SUGGESTIONS, getCategoryIntro, type QuickActionConfig } from "./QuickActions";
import { respondToFaqId, type GuardianResponse } from "@/lib/bud-guardian/engine";
import { checkAccessControl } from "@/lib/bud-guardian/access-control";
import { checkGuardianPolicy } from "@/lib/bud-guardian/guardian-policy";
import { detectEscalation } from "@/lib/bud-guardian/escalation";
import { detectSevereViolation, applyAutoBan, getActiveBan } from "@/lib/bud-guardian/moderation-engine";
import { getGuardianIdentities } from "@/lib/bud-guardian/guardian-identity";
import { subscribeBanStore } from "@/data/bud-guardian/ban-store";
import type { BanRecord } from "@/types/moderation";
import { detectOrderIntent } from "@/lib/bud-guardian/order-intent";
import { resolveReplyLocale } from "@/lib/bud-guardian/language-detect";
import { resolveGuardianProvider, type ConversationTurn } from "@/lib/bud-guardian/ai-provider";
import { useGuardianState } from "@/lib/bud-guardian/useGuardianState";
import { useOrderSession } from "@/lib/bud-guardian/useOrderSession";
import { usePaymentSession } from "@/lib/bud-guardian/usePaymentSession";
import { useOwnerId } from "@/lib/shop/cart-actions";
import { useSession } from "@/lib/shop/auth-actions";
import type { OrderActionId, OrderIntent } from "@/lib/bud-guardian/order-engine";
import {
  answerGenericPaymentFaq,
  type PaymentActionId,
  type PaymentIntent,
} from "@/lib/bud-guardian/payment-engine";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { FaqTopic, QuickActionId } from "@/data/bud-guardian/types";
import type { ProductCategory } from "@/types/product";
import { OPEN_BUD_GUARDIAN_EVENT } from "./events";

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

// The "24 h/24, 7 j/7." (FR) segment is glued together with non-breaking
// spaces so the chat bubble's word-wrap never splits it mid-phrase (e.g.
// stranding "7 j/7." alone on its own line) — it now wraps as one unit,
// keeping the greeting compact instead of spilling an extra line.
const WELCOME = {
  fr: "👋 Bonjour !\nJe suis Bud Guardian, votre assistant virtuel disponible 24 h/24, 7 j/7.\nComment puis-je vous aider ?",
  en: "👋 Hi!\nI'm Bud Guardian, your 24/7 virtual assistant.\nHow can I help?",
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

// Lets other pages (e.g. Contact's "Chat with Bud Guardian" CTA) open the
// widget without reaching into its local state — dispatch
// `window.dispatchEvent(new Event(OPEN_BUD_GUARDIAN_EVENT))` and this
// component's own listener (below) opens the window, exactly as if the
// bubble had been clicked. Defined in ./events.ts (imported above), not
// here, so pages that only need the event name don't pull in this file's
// whole engine import graph — re-exported here so existing imports of it
// from this module keep working.
export { OPEN_BUD_GUARDIAN_EVENT };

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
  // V11 — Smart Product Advisor conversation memory: the category/budget the
  // customer is shopping within, so a bare follow-up ("Vapes") after
  // Guardian asks "which category?" resolves as "vapes under $30" (see
  // product-intent.ts). Sticky like lastProductId above — only ever updated
  // when a turn actually surfaces a new value, never cleared mid-session.
  const [lastCategory, setLastCategory] = useState<ProductCategory | null>(null);
  const [lastMaxPrice, setLastMaxPrice] = useState<number | null>(null);
  // V12 — Shopping & Cart Assistant conversation memory: the ordered list of
  // products from the last recommendation/search Guardian showed, so "add
  // the second one"/"the cheapest one" resolves against what was actually
  // shown (see product-intent.ts's productIds / cart-intent.ts). ownerId is
  // the same "guest"/signed-in account id lib/shop/cart-actions.ts's own
  // useCart()/useWishlist() resolve, so Guardian only ever mutates the
  // customer's own real cart.
  const [lastRecommendedProductIds, setLastRecommendedProductIds] = useState<string[] | null>(null);
  const ownerId = useOwnerId();
  // V13 — Checkout & Order Assistant: whether a real signed-in V5 account
  // session exists (see checkout-intent.ts). Used to route free-text order/
  // payment questions to the real-account-grounded flow below instead of the
  // unrelated V4.1 CRM-demo two-factor lookup (see the orderIntent gate
  // further down), and passed straight through to the provider.
  const isSignedIn = !!useSession();
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
  // V12.2 — Autonomous Abuse Defense: the active ban (if any) for every
  // identity tied to this browser (device + signed-in account, see
  // guardian-identity.ts). Recomputed on mount and on every ban-store change
  // (same-tab, right after a violation is banned, and cross-tab), so an
  // expired ban's access is restored automatically the next time this
  // widget is opened/re-rendered — no separate "restore" job needed.
  const [banRecord, setBanRecord] = useState<BanRecord | null>(null);

  useEffect(() => {
    const refresh = () => setBanRecord(getActiveBan(getGuardianIdentities()));
    refresh();
    return subscribeBanStore(refresh);
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (!hasOpenedOnce.current) {
      hasOpenedOnce.current = true;
      setMessages([{ id: createId(), role: "bot", text: WELCOME[locale], suggestions: CATEGORY_IDS, animate: true }]);
    }
  }, [locale]);

  // See OPEN_BUD_GUARDIAN_EVENT above — external CTAs (Contact page) open
  // the same widget instance this way instead of duplicating the chat UI.
  // Hooks must run unconditionally, so this sits above the staff-route
  // early return below.
  useEffect(() => {
    window.addEventListener(OPEN_BUD_GUARDIAN_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_BUD_GUARDIAN_EVENT, handleOpen);
  }, [handleOpen]);

  // Bud Guardian is the public-only assistant — staff have their own
  // dashboards as their "mode" (see /staff/*), so the widget must never
  // float over authenticated staff routes.
  if (pathname?.startsWith("/staff")) return null;

  const compact = isCompactPath(pathname);

  function pushUserMessage(text: string) {
    setMessages((prev) => [...prev, { id: createId(), role: "user", text }]);
  }

  function pushBotMessage(text: string, suggestions: ChatMessage["suggestions"] = [], found = true) {
    setMessages((prev) => [...prev, { id: createId(), role: "bot", text, suggestions, animate: true, found }]);
  }

  async function handleSend(text: string) {
    // V12.2 — Autonomous Abuse Defense, defense-in-depth: if this identity
    // is already banned (e.g. a stale tab that hasn't re-rendered the
    // BanScreen yet), refuse before doing anything else — the render guard
    // below is the primary gate, this is belt-and-suspenders.
    if (banRecord) return;

    pushUserMessage(text);

    // V12.2 — the single most severe check, ahead of even guardian-policy.ts
    // below: Warrior Buds Rule #1 is RESPECT, and a severe violation ends
    // the conversation with an automatic ban, not just a refused reply (see
    // moderation-engine.ts). Runs before ANY other engine, tool, or AI call,
    // mid order/payment session or not — same "always runs first" guarantee
    // guardian-policy.ts documents for illegal/unsafe content.
    const violation = detectSevereViolation(text);
    if (violation) {
      const record = applyAutoBan(getGuardianIdentities(), violation);
      setBanRecord(record);
      return;
    }

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
    // the same two-factor order-lookup session the quick actions use. V13 —
    // this CRM-demo lookup (data/bud-guardian/orders-store.ts) is unrelated
    // to the real V5 shop account a signed-in customer actually has, so it
    // only ever runs for signed-out callers; a signed-in customer's order/
    // payment questions instead fall through to the real-data-grounded
    // checkout-intent.ts / guardian tool path below (see isSignedIn above).
    const orderIntent = isSignedIn ? null : detectOrderIntent(text);
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
    const result = await guardianProvider.respond({
      message: text,
      replyLocale,
      history,
      lastTopic,
      lastProductId,
      lastCategory,
      lastMaxPrice,
      ownerId,
      lastRecommendedProductIds,
      isSignedIn,
    });

    runThinkingSequence(
      () => result,
      (response) => {
        pushBotMessage(response.answer, response.suggestions, response.found);
        setLastTopic(response.topic ?? null);
        if (response.productId) setLastProductId(response.productId);
        if (response.category) setLastCategory(response.category);
        // V11.1 — undefined means "leave the remembered budget alone"; null
        // is product-intent.ts's explicit "the topic changed, clear it"
        // signal (see its isNewTopic check) and must actually clear the
        // sticky memory, not just be skipped like undefined is.
        if (response.maxPrice !== undefined) setLastMaxPrice(response.maxPrice);
        // V12 — undefined means "leave the remembered recommendation list
        // alone" (e.g. a cart mutation or FAQ answer this turn); present
        // means a new recommendation/search list was just shown.
        if (response.productIds !== undefined) setLastRecommendedProductIds(response.productIds);
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
        banRecord ? (
          <BanScreen record={banRecord} locale={locale} onClose={() => setIsOpen(false)} />
        ) : (
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
        )
      ) : (
        <ChatBubble state={guardianState} nodding={nodding} onClick={handleOpen} label={BUBBLE_LABEL[locale]} compact={compact} />
      )}
    </div>
  );
}
