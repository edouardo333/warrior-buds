"use client";

// Bud Guardian V12.2 — Autonomous Abuse Defense. Replaces ChatWindow entirely
// (same panel footprint, so it swaps in/out without any layout jump) for any
// identity BudGuardian.tsx currently sees an active ban for — see
// lib/bud-guardian/moderation-engine.ts's getActiveBan(). There is no input,
// no quick actions, no send button: the widget is fully blocked, not just
// the AI/tool step, for as long as the ban is active.

import { Ban, Clock, ShieldAlert, X } from "lucide-react";
import type { BanRecord } from "@/types/moderation";
import type { Locale } from "@/lib/i18n/types";
import { getModerationCategoryLabel } from "@/lib/bud-guardian/moderation-engine";
import { SITE } from "@/lib/site";

const COPY = {
  fr: {
    title: "Accès suspendu",
    subtitle: "Bud Guardian · Warrior Buds",
    rule: "Règle no 1 de Warrior Buds : le RESPECT.",
    intro:
      "Votre accès au clavardage Bud Guardian a été suspendu automatiquement à la suite d'une violation grave de nos règles de conduite.",
    reasonLabel: "Motif",
    countLabel: "Infraction",
    expiryLabel: "Accès rétabli le",
    disputeIntro: "Vous pensez qu'il s'agit d'une erreur ? Contactez notre équipe :",
    close: "Fermer",
  },
  en: {
    title: "Access suspended",
    subtitle: "Bud Guardian · Warrior Buds",
    rule: "Warrior Buds Rule #1: RESPECT.",
    intro:
      "Your access to Bud Guardian chat has been automatically suspended following a severe violation of our conduct rules.",
    reasonLabel: "Reason",
    countLabel: "Offense",
    expiryLabel: "Access restored on",
    disputeIntro: "Think this is a mistake? Contact our team:",
    close: "Close",
  },
} as const;

function ordinal(n: number, locale: Locale): string {
  if (locale === "fr") return `${n}e`;
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]}`;
}

export default function BanScreen({
  record,
  locale,
  onClose,
}: {
  record: BanRecord;
  locale: Locale;
  onClose: () => void;
}) {
  const t = COPY[locale];
  const expiry = new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(record.expiresAt));

  return (
    <div className="flex h-[min(680px,calc(100svh-6rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-red-500/20 bg-black/80 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
      {/* Header */}
      <div className="relative flex shrink-0 items-center gap-3 border-b border-white/10 bg-gradient-to-b from-red-500/10 to-transparent px-4 py-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
          <Ban className="h-5 w-5 text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{t.title}</p>
          <p className="truncate text-xs text-foreground/50">{t.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/50 transition-colors duration-200 hover:bg-white/10 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
        <div className="flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm font-medium text-red-300">{t.rule}</p>
        </div>

        <p className="text-sm leading-relaxed text-foreground/70">{t.intro}</p>

        <dl className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-foreground/50">{t.reasonLabel}</dt>
            <dd className="font-medium text-foreground/85">{getModerationCategoryLabel(record.category, locale)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-foreground/50">{t.countLabel}</dt>
            <dd className="font-medium text-foreground/85">{ordinal(record.banCount, locale)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-foreground/50">
              <Clock className="h-3.5 w-3.5" />
              {t.expiryLabel}
            </dt>
            <dd className="text-right font-medium text-foreground/85">{expiry}</dd>
          </div>
        </dl>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs text-foreground/50">
          <p>{t.disputeIntro}</p>
          <p className="mt-1.5 font-medium text-foreground/70">
            {SITE.phoneDisplay} · {SITE.email}
          </p>
        </div>
      </div>
    </div>
  );
}
