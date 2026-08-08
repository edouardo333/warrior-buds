"use client";

// Bud Guardian V9 — staff copilot panel for /staff/analytics. Free-text
// "ask Guardian" box that explains KPIs, summarizes the current period, and
// surfaces priorities/insights conversationally — using exactly the
// AnalyticsSnapshot the rest of this page already renders (see
// lib/bud-guardian/staff-guardian-engine.ts). Read-only, no mutations, no
// parallel data. Only ever mounted inside AnalyticsDashboard, itself only
// reachable through StaffShell's session gate — never rendered without an
// active staff session.

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { AnalyticsSnapshot } from "@/lib/bud-guardian/analytics-engine";
import { respondToStaffQuery } from "@/lib/bud-guardian/staff-guardian-engine";

type Turn = { id: string; role: "user" | "bot"; text: string };

const TEXT = {
  fr: {
    title: "Demander à Guardian",
    subtitle: "Posez une question sur les revenus, le risque, l'inventaire, la clientèle ou les priorités de la période.",
    placeholder: "Ex. : quelles sont les priorités cette semaine ?",
    send: "Envoyer",
    empty: "Guardian répond avec les chiffres de la période sélectionnée ci-dessus.",
    prompts: ["Résumé des priorités", "Revenus", "Paiements en attente", "Stock faible", "Meilleurs produits"],
  },
  en: {
    title: "Ask Guardian",
    subtitle: "Ask about revenue, risk, inventory, customers, or this period's priorities.",
    placeholder: "e.g. what needs attention this week?",
    send: "Send",
    empty: "Guardian answers using the period selected above.",
    prompts: ["Priorities summary", "Revenue", "Pending payments", "Low stock", "Top products"],
  },
} as const;

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function GuardianAssistant({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [turns]);

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    const response = respondToStaffQuery(trimmed, locale, snapshot);
    setTurns((prev) => [
      ...prev,
      { id: createId(), role: "user", text: trimmed },
      { id: createId(), role: "bot", text: response.answer },
    ]);
    setInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    ask(input);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h2 className="flex items-center gap-1.5 font-display text-lg tracking-wide text-white/85">
        <Sparkles className="h-4 w-4 text-wb-orange" />
        {t.title}
      </h2>
      <p className="mt-1 text-sm text-white/50">{t.subtitle}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {t.prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => ask(prompt)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors duration-200 hover:border-wb-orange/50 hover:text-wb-orange"
          >
            {prompt}
          </button>
        ))}
      </div>

      {turns.length > 0 && (
        <div ref={scrollRef} className="mt-4 max-h-72 space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3.5">
          {turns.map((turn) => (
            <div key={turn.id} className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}>
              <p
                className={`max-w-[85%] whitespace-pre-line rounded-xl px-3.5 py-2 text-sm leading-relaxed ${
                  turn.role === "user"
                    ? "bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow text-black"
                    : "border border-white/10 bg-white/5 text-white/85"
                }`}
              >
                {turn.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {turns.length === 0 && <p className="mt-4 text-xs text-white/35">{t.empty}</p>}

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors duration-200 placeholder:text-white/35 focus:border-wb-orange/50"
        />
        <button
          type="submit"
          aria-label={t.send}
          disabled={!input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow text-black transition-transform duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
