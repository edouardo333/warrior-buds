"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DEMO_ACCOUNTS, findDemoAccount, getRoleLabel, startSession } from "@/lib/staff/staff-auth";

const TEXT = {
  fr: {
    title: "Bud Guardian — Espace employé",
    subtitle: "Connexion réservée à l'équipe Warrior Buds. Accès temporaire de démonstration.",
    codeLabel: "Code d'accès",
    codePlaceholder: "Ex. WB2026",
    submit: "Se connecter",
    error: "Code d'accès invalide. Vérifiez auprès de votre gestionnaire.",
    demoTitle: "Comptes de démonstration",
    notice: "Aucune donnée bancaire ou mot de passe client n'est traitée ici. Toutes les données sont fictives et locales.",
    backToSite: "Retour au site",
  },
  en: {
    title: "Bud Guardian — Staff space",
    subtitle: "Sign-in reserved for the Warrior Buds team. Temporary demo access.",
    codeLabel: "Access code",
    codePlaceholder: "E.g. WB2026",
    submit: "Sign in",
    error: "Invalid access code. Check with your manager.",
    demoTitle: "Demo accounts",
    notice: "No banking data or customer passwords are handled here. All data is fictional and local.",
    backToSite: "Back to website",
  },
} as const;

export default function StaffLogin() {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const account = findDemoAccount(code);
    if (!account) {
      setError(true);
      return;
    }
    setError(false);
    startSession(account.name, account.role);
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background bg-grain px-4 py-12">
      <a
        href="/"
        className="group absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-medium text-white/45 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:text-white/80 hover:shadow-[0_0_16px_-2px_rgba(255,255,255,0.25)] sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        {t.backToSite}
      </a>

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-black/55 p-8 backdrop-blur-2xl"
        style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.08), 0 24px 48px -24px rgba(0,0,0,0.85)" }}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <h1 className="text-gradient-ember font-display text-3xl tracking-wide">{t.title}</h1>
        <p className="mt-2 text-sm text-white/60">{t.subtitle}</p>

        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-white/80">
            {t.codeLabel}
            <input
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError(false);
              }}
              placeholder={t.codePlaceholder}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-foreground outline-none transition-colors focus:border-wb-orange/60"
              autoComplete="off"
            />
          </label>

          {error && <p className="text-sm text-wb-red">{t.error}</p>}

          <button
            type="submit"
            className="mt-2 rounded-xl bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-4 py-3 font-semibold text-black transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {t.submit}
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50">{t.demoTitle}</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-xs text-white/60">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.code} className="flex items-center justify-between gap-3">
                <span>
                  {getRoleLabel(account.role, locale)} — {account.name}
                </span>
                <span className="font-mono text-white/80">{account.code}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-white/40">{t.notice}</p>
      </form>
    </div>
  );
}
