"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import type { LearningCategory, LearningTopic } from "@/data/learning-center";
import type { Locale } from "@/lib/i18n/types";

const ACCENT_TEXT: Record<LearningCategory["accent"], string> = {
  red: "text-wb-red",
  orange: "text-wb-orange",
  yellow: "text-wb-yellow",
};

type LearningTopicModalProps = {
  category: LearningCategory;
  topic: LearningTopic;
  locale: Locale;
  closeLabel: string;
  disclaimerText: string;
  onClose: () => void;
};

export default function LearningTopicModal({
  category,
  topic,
  locale,
  closeLabel,
  disclaimerText,
  onClose,
}: LearningTopicModalProps) {
  const Icon = category.icon;
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Move focus into the dialog on open and hand it back to the topic card
  // that opened it on close (keyboard + screen-reader users).
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <div className="wb-guardian-message-in relative flex max-h-[90svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-wb-charcoal-light shadow-[0_32px_80px_-24px_rgba(0,0,0,0.9)] sm:max-h-[85svh] sm:rounded-3xl">
        <div className="relative shrink-0 border-b border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent px-6 py-6 sm:px-8">
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-foreground/70 transition-colors hover:border-wb-orange/40 hover:text-wb-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-wb-orange/60"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 pr-12">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40">
              <Icon className={`h-5 w-5 ${ACCENT_TEXT[category.accent]}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-semibold uppercase tracking-widest ${ACCENT_TEXT[category.accent]}`}>
                {category.title[locale]}
              </p>
              <h2 id={titleId} className="mt-0.5 line-clamp-2 break-words font-display text-2xl leading-tight tracking-wide text-foreground sm:text-3xl">
                {topic.title[locale]}
              </h2>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <div className="space-y-4">
            {topic.body[locale].map((paragraph, index) => (
              <p key={index} className="text-sm leading-relaxed text-foreground/75 sm:text-base">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-relaxed text-foreground/50">
            {disclaimerText}
          </div>
        </div>
      </div>
    </div>
  );
}
