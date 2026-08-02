"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Locale } from "@/lib/i18n/types";

const OPTIONS: { code: Locale; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
];

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide ${className}`}
      role="group"
      aria-label="Language selector"
    >
      {OPTIONS.map((option, index) => (
        <span key={option.code} className="flex items-center gap-1.5">
          {index > 0 && (
            <span className="text-foreground/25" aria-hidden="true">
              |
            </span>
          )}
          <button
            type="button"
            onClick={() => setLocale(option.code)}
            aria-pressed={locale === option.code}
            className={`transition-colors ${
              locale === option.code
                ? "text-wb-orange"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        </span>
      ))}
    </div>
  );
}
