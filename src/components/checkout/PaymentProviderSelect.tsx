"use client";

// Storefront — dark-themed replacement for the native <select> on
// /account/payment-methods (a bright white browser menu clashed with the
// dark theme). Same visual language as the PaymentStep provider cards:
// black/dark background, subtle border, orange hover/selected state, badge
// icons from PaymentIcons. Fully keyboard-accessible (listbox pattern) and
// closes on outside click / Escape. Never touches the underlying saved
// payment preference logic — this only replaces the picker UI.

import { useEffect, useRef, useState } from "react";
import { PAYMENT_PROVIDER_BADGES } from "./PaymentIcons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { PaymentProviderAdapter, PaymentProviderId } from "@/types/shop-payment";

export default function PaymentProviderSelect({
  id,
  providers,
  value,
  onChange,
}: {
  id?: string;
  providers: PaymentProviderAdapter[];
  value: PaymentProviderId;
  onChange: (id: PaymentProviderId) => void;
}) {
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, providers.findIndex((p) => p.id === value)));
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const selected = providers.find((p) => p.id === value) ?? providers[0];
  const SelectedBadge = selected ? PAYMENT_PROVIDER_BADGES[selected.id] : undefined;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function commit(index: number) {
    const provider = providers[index];
    if (!provider) return;
    onChange(provider.id);
    setActiveIndex(index);
    setOpen(false);
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  function handleListKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(providers.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commit(activeIndex);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id ? `${id}-listbox` : undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
        className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-left text-sm text-foreground outline-none transition-colors focus:border-wb-orange/60"
      >
        {SelectedBadge && <SelectedBadge />}
        <span className="flex-1 truncate">{selected?.getDisplayName(locale)}</span>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 shrink-0 text-foreground/50 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
        >
          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={id ? `${id}-option-${activeIndex}` : undefined}
          onKeyDown={handleListKeyDown}
          ref={(node) => node?.focus()}
          className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-white/10 bg-[#0d0b0a] p-1.5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7)]"
        >
          {providers.map((provider, index) => {
            const Badge = PAYMENT_PROVIDER_BADGES[provider.id];
            const isSelected = provider.id === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={provider.id}
                id={id ? `${id}-option-${index}` : undefined}
                role="option"
                aria-selected={isSelected}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commit(index)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isSelected
                    ? "bg-wb-orange/15 text-wb-orange"
                    : isActive
                      ? "bg-white/[0.06] text-foreground"
                      : "text-foreground/80"
                }`}
              >
                {Badge && <Badge />}
                <span className="flex-1 truncate">{provider.getDisplayName(locale)}</span>
                {isSelected && (
                  <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-wb-orange" fill="none">
                    <path d="M5 10.5 8.5 14 15 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
