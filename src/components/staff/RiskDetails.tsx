"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, DollarSign, Mail, Package, Phone, Repeat, TriangleAlert, User, X, type LucideIcon } from "lucide-react";
import type { RiskFactor, RiskFactorId } from "@/types/risk";
import { maskName } from "@/lib/bud-guardian/order-engine";
import { getPaymentStatusLabel } from "@/lib/bud-guardian/payment-engine";
import {
  getRiskActionLabel,
  getRiskFactorDetail,
  getRiskFactorImpact,
  getRiskFactorLabel,
  getRiskFactorStateLabel,
  getRiskValidationLabel,
} from "@/lib/bud-guardian/risk-engine";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { maskEmailPartial, maskPhonePartial } from "@/lib/staff/order-actions";
import { staffApproveRiskAssessment, staffRejectRiskAssessment, type StaffRiskView } from "@/lib/staff/risk-actions";
import { hasPermission, minRoleFor } from "@/lib/staff/permissions";
import { getRoleLabel, type StaffSession } from "@/lib/staff/staff-auth";
import { RISK_LEVEL_COLORS } from "./RiskTable";
import TrustGauge from "./TrustGauge";
import RiskMeter from "./RiskMeter";

const TEXT = {
  fr: {
    order: "Commande",
    contact: "Contact",
    age: "Vérification 18+",
    identity: "Identité vérifiée",
    yes: "Oui",
    no: "Non",
    payment: "Dernier paiement",
    noOrder: "Commande introuvable — cette analyse fait référence à une commande absente du carnet local.",
    calculation: "Calcul transparent",
    reasons: "Raisons de l'alerte",
    noReasons: "Aucun signal détecté — commande conforme.",
    impact: "Impact",
    approve: "Approuver",
    reject: "Rejeter",
    alreadyResolved: "Cette analyse a déjà été validée par le personnel",
    history: "Historique des analyses",
    close: "Fermer",
    restricted: (role: string) => `Réservé aux rôles ${role} et plus.`,
  },
  en: {
    order: "Order",
    contact: "Contact",
    age: "18+ verification",
    identity: "Identity verified",
    yes: "Yes",
    no: "No",
    payment: "Latest payment",
    noOrder: "Order not found — this assessment references an order missing from the local book.",
    calculation: "Transparent calculation",
    reasons: "Alert reasons",
    noReasons: "No signal detected — order looks clean.",
    impact: "Impact",
    approve: "Approve",
    reject: "Reject",
    alreadyResolved: "This assessment has already been validated by staff",
    history: "Analysis history",
    close: "Close",
    restricted: (role: string) => `Reserved for ${role} and above.`,
  },
} as const;

const FACTOR_ICONS: Record<RiskFactorId, LucideIcon> = {
  "age-unverified": TriangleAlert,
  "identity-unverified": User,
  "suspicious-order": Package,
  "unusual-amount": DollarSign,
  "repeated-orders": Repeat,
  "duplicate-phone": Phone,
  "duplicate-email": Mail,
  "potential-fraud": CreditCard,
};

function formatDateTime(iso: string, locale: "fr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

// "100 - 15 - 10 = 75" — makes the deduction that produced the confidence
// score visible instead of leaving it a black box.
function buildScoreFormula(factors: RiskFactor[], score: number): string {
  const deductions = factors.map((factor) => `- ${getRiskFactorImpact(factor.id)}`);
  return ["100", ...deductions, `= ${score}`].join(" ");
}

function FactorCard({ factor, locale, impactLabel }: { factor: RiskFactor; locale: "fr" | "en"; impactLabel: string }) {
  const color = RISK_LEVEL_COLORS[factor.severity];
  const impact = getRiskFactorImpact(factor.id);
  const Icon = FACTOR_ICONS[factor.id];
  return (
    <li
      className="flex flex-col gap-1.5 rounded-xl border px-3.5 py-3 text-sm transition-colors duration-200"
      style={{ borderColor: `rgba(${color.rgb}, 0.35)`, background: `rgba(${color.rgb}, 0.06)` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{ background: `rgba(${color.rgb}, 0.16)`, color: color.solid }}
          >
            <Icon className="h-3 w-3" />
          </span>
          <p className="font-medium text-white/90">{getRiskFactorLabel(factor.id, locale)}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
          style={{ color: color.solid, background: `rgba(${color.rgb}, 0.14)` }}
        >
          {impactLabel} -{impact}
        </span>
      </div>
      <p className="text-xs font-medium" style={{ color: color.solid }}>
        {getRiskFactorStateLabel(factor.id, locale)}
      </p>
      <p className="text-xs text-white/50">{getRiskFactorDetail(factor, locale)}</p>
    </li>
  );
}

export default function RiskDetails({
  assessment,
  session,
  onClose,
}: {
  assessment: StaffRiskView;
  session: StaffSession;
  onClose?: () => void;
}) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const [busy, setBusy] = useState(false);
  const [resolution, setResolution] = useState<"approved" | "rejected" | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const isResolved = assessment.validation !== "pending";
  const history = [...assessment.history].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const canApprove = hasPermission(session.role, "risk.approve");
  const canReject = hasPermission(session.role, "risk.reject");

  function handleApprove() {
    setBusy(true);
    const updated = staffApproveRiskAssessment(assessment.id, session);
    setBusy(false);
    if (!updated) return; // denied (buttons are disabled for this role already — defense in depth)
    setResolution("approved");
    closeTimeoutRef.current = setTimeout(() => onClose?.(), 800);
  }

  function handleReject() {
    setBusy(true);
    const updated = staffRejectRiskAssessment(assessment.id, session);
    setBusy(false);
    if (!updated) return;
    setResolution("rejected");
    closeTimeoutRef.current = setTimeout(() => onClose?.(), 800);
  }

  return (
    <div className="wb-risk-details-in flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-white/50">{assessment.id}</p>
          <h2 className="text-lg font-semibold text-white/90">
            {assessment.order ? maskName(assessment.order.customerName) : t.noOrder}
          </h2>
          {assessment.order && (
            <p className="mt-0.5 text-xs text-white/45">
              {t.contact}: {maskPhonePartial(assessment.order.phone)} · {maskEmailPartial(assessment.order.email)}
            </p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="rounded-full border border-white/10 p-1.5 text-white/60 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:flex-row sm:items-center">
        <TrustGauge score={assessment.confidenceScore} level={assessment.riskLevel} locale={locale} />
        <div className="flex-1">
          <RiskMeter level={assessment.riskLevel} locale={locale} />
          <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/45">{t.order}</p>
              <p className="mt-1 font-mono text-white/85">{assessment.orderId}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/45">{t.age}</p>
              <p className="mt-1 text-white/85">{assessment.ageVerified ? t.yes : t.no}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/45">{t.identity}</p>
              <p className="mt-1 text-white/85">{assessment.identityVerified ? t.yes : t.no}</p>
            </div>
            {assessment.payment && (
              <div>
                <p className="text-xs uppercase tracking-wide text-white/45">{t.payment}</p>
                <p className="mt-1 text-white/85">{getPaymentStatusLabel(assessment.payment.effectiveStatus, locale)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{t.calculation}</h3>
        <p className="mt-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 font-mono text-sm text-white/70">
          {buildScoreFormula(assessment.factors, assessment.confidenceScore)}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{t.reasons}</h3>
        {assessment.factors.length === 0 ? (
          <p className="mt-2 text-sm text-white/45">{t.noReasons}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {assessment.factors.map((factor, index) => (
              <FactorCard key={`${factor.id}-${index}`} factor={factor} locale={locale} impactLabel={t.impact} />
            ))}
          </ul>
        )}
      </div>

      <div>
        {resolution ? (
          <div
            className={`wb-badge-pop inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold ${
              resolution === "approved"
                ? "border-wb-guardian-green/50 bg-wb-guardian-green/10 text-wb-guardian-green"
                : "border-wb-red/50 bg-wb-red/10 text-wb-red"
            }`}
          >
            <span>{resolution === "approved" ? "✓" : "✕"}</span>
            {getRiskValidationLabel(resolution, locale)}
          </div>
        ) : isResolved ? (
          <p className="text-sm text-white/45">
            {t.alreadyResolved} — {getRiskValidationLabel(assessment.validation, locale)}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy || !canApprove}
                title={!canApprove ? t.restricted(getRoleLabel(minRoleFor("risk.approve"), locale)) : undefined}
                onClick={handleApprove}
                className="rounded-xl border border-wb-guardian-green/50 bg-wb-guardian-green/10 px-3.5 py-2 text-sm font-medium text-wb-guardian-green disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.approve}
              </button>
              <button
                type="button"
                disabled={busy || !canReject}
                title={!canReject ? t.restricted(getRoleLabel(minRoleFor("risk.reject"), locale)) : undefined}
                onClick={handleReject}
                className="rounded-xl border border-wb-red/50 bg-wb-red/10 px-3.5 py-2 text-sm font-medium text-wb-red disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.reject}
              </button>
            </div>
            {(!canApprove || !canReject) && (
              <p className="text-xs text-white/35">{t.restricted(getRoleLabel(minRoleFor("risk.approve"), locale))}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{t.history}</h3>
        <ol className="mt-3 flex flex-col gap-0">
          {history.map((entry, index) => {
            const isLast = index === history.length - 1;
            return (
              <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
                {!isLast && <span className="absolute left-[5px] top-3 h-full w-px bg-white/10" />}
                <span className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-white/30" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white/85">{getRiskActionLabel(entry.action, locale)}</span>
                  <span className="text-xs text-white/45">
                    {formatDateTime(entry.at, locale)} · {entry.by}
                    {entry.note ? ` · ${entry.note}` : ""}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
