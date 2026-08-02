"use client";

// Thin React wrapper around order-engine.ts's pure session-step functions.
// Keeps the "Commandes" mode's conversation state (which identifiers were
// given, which order is active, which confirmations were answered this
// session) local to the browser tab — nothing is persisted or sent anywhere.
// Mirrors useGuardianState.ts's role: the engine decides *what* happens, this
// hook just holds the state between turns.

import { useCallback, useState } from "react";
import type { Locale } from "@/lib/i18n/types";
import {
  INITIAL_ORDER_SESSION,
  answerOrderConfirmation,
  beginOrderIntent,
  requestOrderAction,
  submitOrderIdentifierText,
  type OrderActionId,
  type OrderEngineResponse,
  type OrderIntent,
  type OrderSessionState,
} from "./order-engine";

export function useOrderSession() {
  const [session, setSession] = useState<OrderSessionState>(INITIAL_ORDER_SESSION);

  const beginIntent = useCallback(
    (intent: OrderIntent, locale: Locale) => (): OrderEngineResponse => {
      const { session: next, response } = beginOrderIntent(session, intent, locale);
      setSession(next);
      return response;
    },
    [session]
  );

  const submitText = useCallback(
    (text: string, locale: Locale) => (): OrderEngineResponse => {
      const { session: next, response } = submitOrderIdentifierText(session, text, locale);
      setSession(next);
      return response;
    },
    [session]
  );

  const answerConfirmation = useCallback(
    (yes: boolean, locale: Locale) => (): OrderEngineResponse => {
      const { session: next, response } = answerOrderConfirmation(session, yes, locale);
      setSession(next);
      return response;
    },
    [session]
  );

  const dispatchAction = useCallback(
    (actionId: OrderActionId, locale: Locale) => (): OrderEngineResponse => {
      const { session: next, response } = requestOrderAction(session, actionId, locale);
      setSession(next);
      return response;
    },
    [session]
  );

  return {
    isCollecting: session.stage === "collecting",
    beginIntent,
    submitText,
    answerConfirmation,
    dispatchAction,
  };
}
