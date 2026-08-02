"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Bud Guardian's animation state machine. Each state maps to a distinct
// visual treatment in HelmetIcon (eye color/animation, halo, sweep, nod).
// New behaviors (security alerts, notifications, etc.) can be added here
// as additional states + a transition path, without touching the visuals.
export type GuardianState =
  | "greeting"
  | "available"
  | "thinking"
  | "searching"
  | "responding"
  | "unavailable";

type Outcome = { found: boolean };

const GREETING_DURATION = 1000;
const THINKING_DURATION = 500;
const SEARCHING_DURATION = 450;
const RESPONDING_DURATION = 1500;
const UNAVAILABLE_DURATION = 900;
const NOD_DURATION = 650;

const VISITED_KEY = "wb-guardian-visited";

function hasVisitedBefore(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(VISITED_KEY) === "1";
  } catch {
    return true;
  }
}

function markVisited() {
  try {
    localStorage.setItem(VISITED_KEY, "1");
  } catch {
    // localStorage unavailable (private browsing, etc.) — greeting will replay next visit
  }
}

export function useGuardianState() {
  const [state, setState] = useState<GuardianState>("available");
  const [nodding, setNodding] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    if (!hasVisitedBefore()) {
      after(0, () => setState("greeting"));
      after(GREETING_DURATION, () => setState("available"));
      markVisited();
    }
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const settleAfterOutcome = useCallback(
    ({ found }: Outcome) => {
      if (found) {
        setState("responding");
        setNodding(true);
        after(NOD_DURATION, () => setNodding(false));
        after(RESPONDING_DURATION, () => setState("available"));
      } else {
        setState("unavailable");
        after(UNAVAILABLE_DURATION, () => setState("available"));
      }
    },
    [after]
  );

  // Runs the thinking -> searching -> (responding|unavailable) sequence.
  // `resolve` is called once searching completes and must return the
  // answer plus whether it was actually found (drives the outcome state).
  const runThinkingSequence = useCallback(
    <T extends Outcome>(resolve: () => T, onResolved: (result: T) => void) => {
      clearTimers();
      setState("thinking");
      after(THINKING_DURATION, () => {
        setState("searching");
        after(SEARCHING_DURATION, () => {
          const result = resolve();
          settleAfterOutcome(result);
          onResolved(result);
        });
      });
    },
    [after, clearTimers, settleAfterOutcome]
  );

  // For instant confirmations (external links, tel:) that skip the thinking/searching beats.
  const flashResponding = useCallback(() => {
    clearTimers();
    settleAfterOutcome({ found: true });
  }, [clearTimers, settleAfterOutcome]);

  useEffect(() => clearTimers, [clearTimers]);

  const isTyping = state === "thinking" || state === "searching";

  return { state, isTyping, nodding, runThinkingSequence, flashResponding };
}
