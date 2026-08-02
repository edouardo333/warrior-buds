"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import HelmetIcon, { type GuardianVisualState } from "./HelmetIcon";
import Message, { type ChatMessage } from "./Message";
import TypingIndicator from "./TypingIndicator";
import QuickActions, { type QuickActionConfig } from "./QuickActions";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type ChatWindowProps = {
  messages: ChatMessage[];
  isTyping: boolean;
  guardianState: GuardianVisualState;
  nodding?: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
  onQuickAction: (action: QuickActionConfig) => void;
};

const COPY = {
  fr: {
    title: "Bud Guardian",
    subtitle: "Assistant virtuel · 24/7",
    online: "En ligne",
    placeholder: "Écrivez votre question…",
    send: "Envoyer",
    close: "Fermer",
  },
  en: {
    title: "Bud Guardian",
    subtitle: "Virtual Assistant · 24/7",
    online: "Online",
    placeholder: "Type your question…",
    send: "Send",
    close: "Close",
  },
} as const;

export default function ChatWindow({
  messages,
  isTyping,
  guardianState,
  nodding = false,
  onClose,
  onSend,
  onQuickAction,
}: ChatWindowProps) {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <div className="flex h-[min(680px,calc(100svh-6rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/70 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
      {/* Header */}
      <div className="relative flex shrink-0 items-center gap-3 border-b border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent px-4 py-3.5">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/60">
          <HelmetIcon size={28} state={guardianState} nodding={nodding} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{copy.title}</p>
          <p className="flex items-center gap-1.5 truncate text-xs text-foreground/50">
            <span className="wb-led-core inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {copy.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.close}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/50 transition-colors duration-200 hover:bg-white/10 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <Message
            key={message.id}
            role={message.role}
            text={message.text}
            suggestions={message.suggestions}
            animate={message.animate}
            onSuggestionClick={onQuickAction}
          />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Quick actions */}
      <div className="shrink-0 border-t border-white/10">
        <QuickActions onAction={onQuickAction} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex shrink-0 items-center gap-2 border-t border-white/10 p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={copy.placeholder}
          className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors duration-200 focus:border-wb-orange/50"
        />
        <button
          type="submit"
          aria-label={copy.send}
          disabled={!input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow text-black transition-transform duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
