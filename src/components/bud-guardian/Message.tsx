"use client";

import { useEffect, useState } from "react";
import { QUICK_ACTIONS, type QuickActionConfig } from "./QuickActions";
import type { QuickActionId } from "@/data/bud-guardian/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export type MessageRole = "user" | "bot";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  text: string;
  suggestions?: QuickActionId[];
  animate?: boolean;
};

type MessageProps = {
  role: MessageRole;
  text: string;
  suggestions?: QuickActionId[];
  onSuggestionClick?: (action: QuickActionConfig) => void;
  animate?: boolean;
};

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Message({ role, text, suggestions, onSuggestionClick, animate = false }: MessageProps) {
  const { locale } = useLanguage();
  const isBot = role === "bot";
  // Messages are id-keyed and immutable once mounted, so this only needs to
  // run once per instance — it's not meant to react to `text` changing.
  const shouldAnimate = animate && isBot && !prefersReducedMotion();
  const [visibleChars, setVisibleChars] = useState(shouldAnimate ? 0 : text.length);

  useEffect(() => {
    if (!shouldAnimate) return;
    const step = Math.max(1, Math.round(text.length / 45));
    const id = setInterval(() => {
      setVisibleChars((prev) => {
        const next = prev + step;
        if (next >= text.length) clearInterval(id);
        return Math.min(text.length, next);
      });
    }, 16);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFullyRevealed = visibleChars >= text.length;
  const showSuggestions = isBot && isFullyRevealed && suggestions && suggestions.length > 0;

  return (
    <div className={`wb-guardian-message-in flex flex-col gap-2 ${isBot ? "items-start" : "items-end"}`}>
      <div
        className={
          isBot
            ? "max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-foreground/90 backdrop-blur-xl"
            : "max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-sm bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-4 py-3 text-sm font-medium leading-relaxed text-black"
        }
      >
        {text.slice(0, visibleChars)}
      </div>

      {showSuggestions && (
        <div className="flex max-w-[90%] flex-wrap gap-2">
          {suggestions!.map((id) => {
            const action = QUICK_ACTIONS.find((item) => item.id === id);
            if (!action) return null;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSuggestionClick?.(action)}
                className="inline-flex items-center gap-1.5 rounded-full border border-wb-orange/30 bg-wb-orange/10 px-3 py-1.5 text-xs font-medium text-wb-orange transition-colors duration-200 hover:bg-wb-orange/20"
              >
                <span aria-hidden="true">➡️</span>
                {action.label[locale]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
