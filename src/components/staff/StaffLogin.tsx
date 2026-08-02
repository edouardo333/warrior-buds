"use client";

import { useState, type FormEvent } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { STAFF_ROLES, getRoleLabel, startSession, verifyAccessCode } from "@/lib/staff/staff-auth";
import type { StaffRole } from "@/types/staff-order";

const TEXT = {
  fr: {
    title: "Bud Guardian — Espace employé",
    subtitle: "Connexion réservée à l'équipe Warrior Buds. Accès temporaire de démonstration.",
    nameLabel: "Votre nom",
    namePlaceholder: "Ex. Camille",
    roleLabel: "Rôle",
    codeLabel: "Code d'accès",
    codePlaceholder: "Code fourni par la direction",
    submit: "Se connecter",
    error: "Code d'accès invalide. Vérifiez auprès de votre gestionnaire.",
    notice: "Aucune donnée bancaire ou mot de passe client n'est traitée ici. Toutes les données sont fictives et locales.",
  },
  en: {
    title: "Bud Guardian — Staff space",
    subtitle: "Sign-in reserved for the Warrior Buds team. Temporary demo access.",
    nameLabel: "Your name",
    namePlaceholder: "E.g. Camille",
    roleLabel: "Role",
    codeLabel: "Access code",
    codePlaceholder: "Code provided by management",
    submit: "Sign in",
    error: "Invalid access code. Check with your manager.",
    notice: "No banking data or customer passwords are handled here. All data is fictional and local.",
  },
} as const;

export default function StaffLogin() {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole>("employee");
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!verifyAccessCode(code)) {
      setError(true);
      return;
    }
    setError(false);
    startSession(name, role);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background bg-grain px-4 py-12">
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
            {t.nameLabel}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-foreground outline-none transition-colors focus:border-wb-orange/60"
              autoComplete="off"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-white/80">
            {t.roleLabel}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-foreground outline-none transition-colors focus:border-wb-orange/60"
            >
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r} className="bg-wb-charcoal">
                  {getRoleLabel(r, locale)}
                </option>
              ))}
            </select>
          </label>

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

        <p className="mt-6 text-xs leading-relaxed text-white/40">{t.notice}</p>
      </form>
    </div>
  );
}
