"use client";

// Thin React wrapper around payment-engine.ts's session-step functions —
// mirrors useOrderSession.ts's role exactly: the engine decides *what*
// happens, this hook just holds the "which identifiers were given, which
// payment is active" conversation state between turns, local to the tab.

import { useCallback, useState } from "react";
import type { Locale } from "@/lib/i18n/types";
import {
  INITIAL_PAYMENT_SESSION,
  beginPaymentIntent,
  requestPaymentAction,
  submitPaymentIdentifierText,
  type PaymentActionId,
  type PaymentEngineResponse,
  type PaymentIntent,
  type PaymentSessionState,
} from "./payment-engine";

export function usePaymentSession() {
  const [session, setSession] = useState<PaymentSessionState>(INITIAL_PAYMENT_SESSION);

  const beginIntent = useCallback(
    (intent: PaymentIntent, locale: Locale) => (): PaymentEngineResponse => {
      const { session: next, response } = beginPaymentIntent(intent, locale);
      setSession(next);
      return response;
    },
    []
  );

  const submitText = useCallback(
    (text: string, locale: Locale) => (): PaymentEngineResponse => {
      const { session: next, response } = submitPaymentIdentifierText(session, text, locale);
      setSession(next);
      return response;
    },
    [session]
  );

  const dispatchAction = useCallback(
    (actionId: PaymentActionId, locale: Locale) => (): PaymentEngineResponse => {
      const { session: next, response } = requestPaymentAction(session, actionId, locale);
      setSession(next);
      return response;
    },
    [session]
  );

  return {
    isCollecting: session.stage === "collecting",
    beginIntent,
    submitText,
    dispatchAction,
  };
}
