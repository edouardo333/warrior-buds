"use client";

import type { RiskLevel, RiskValidationStatus } from "@/types/risk";
import { getRiskLevelLabel, getRiskValidationLabel } from "@/lib/bud-guardian/risk-engine";
import { maskName } from "@/lib/bud-guardian/order-engine";
import { formatStaffDateTime } from "@/lib/staff/table-format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StaffRiskView } from "@/lib/staff/risk-actions";
import StaffTableScroll from "./StaffTableScroll";

export const RISK_LEVEL_COLORS: Record<RiskLevel, { solid: string; rgb: string }> = {
  low: { solid: "#3ce27a", rgb: "60, 226, 122" },
  medium: { solid: "#f8b400", rgb: "248, 180, 0" },
  high: { solid: "#f4670f", rgb: "244, 103, 15" },
  critical: { solid: "#e0202e", rgb: "224, 32, 46" },
};

export const RISK_VALIDATION_COLORS: Record<RiskValidationStatus, { solid: string; rgb: string }> = {
  pending: { solid: "#8a8f98", rgb: "138, 143, 152" },
  approved: { solid: "#3ce27a", rgb: "60, 226, 122" },
  rejected: { solid: "#e0202e", rgb: "224, 32, 46" },
};

const TEXT = {
  fr: {
    empty: "Aucune analyse ne correspond à cette recherche.",
    assessment: "Analyse",
    order: "Commande",
    customer: "Client",
    level: "Niveau",
    score: "Confiance",
    validation: "Validation",
    updated: "Mise à jour",
    noOrder: "Commande introuvable",
  },
  en: {
    empty: "No assessment matches this search.",
    assessment: "Assessment",
    order: "Order",
    customer: "Customer",
    level: "Level",
    score: "Confidence",
    validation: "Validation",
    updated: "Updated",
    noOrder: "Order not found",
  },
} as const;

function RiskLevelBadge({ level, locale }: { level: RiskLevel; locale: "fr" | "en" }) {
  const color = RISK_LEVEL_COLORS[level];
  return (
    <span
      key={level}
      className="wb-badge-pop inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{ borderColor: color.solid, background: `rgba(${color.rgb}, 0.14)`, color: color.solid }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color.solid }} />
      {getRiskLevelLabel(level, locale)}
    </span>
  );
}

function ValidationBadge({ status, locale }: { status: RiskValidationStatus; locale: "fr" | "en" }) {
  const color = RISK_VALIDATION_COLORS[status];
  return (
    <span
      key={status}
      className="wb-badge-pop inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{ borderColor: color.solid, background: `rgba(${color.rgb}, 0.14)`, color: color.solid }}
    >
      {getRiskValidationLabel(status, locale)}
    </span>
  );
}

export default function RiskTable({
  assessments,
  selectedId,
  onSelect,
}: {
  assessments: StaffRiskView[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { locale } = useLanguage();
  const t = TEXT[locale];

  if (assessments.length === 0) {
    return <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-white/50">{t.empty}</p>;
  }

  return (
    <>
      {/* Desktop / tablet */}
      <StaffTableScroll>
        <table className="w-full min-w-[840px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase tracking-wide text-white/45">
              <th className="px-4 py-3 font-medium">{t.assessment}</th>
              <th className="px-4 py-3 font-medium">{t.order}</th>
              <th className="px-4 py-3 font-medium">{t.customer}</th>
              <th className="px-4 py-3 font-medium">{t.level}</th>
              <th className="px-4 py-3 font-medium">{t.score}</th>
              <th className="px-4 py-3 font-medium">{t.validation}</th>
              <th className="min-w-[190px] whitespace-nowrap px-4 py-3 font-medium">{t.updated}</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((assessment) => {
              const selected = assessment.id === selectedId;
              return (
                <tr
                  key={assessment.id}
                  onClick={() => onSelect(assessment.id)}
                  className={`cursor-pointer border-b border-white/5 transition-all duration-200 ease-out last:border-b-0 hover:bg-white/[0.04] ${
                    selected ? "bg-wb-orange/10" : ""
                  }`}
                  style={{
                    boxShadow: selected
                      ? "inset 3px 0 0 0 #f4670f, inset 0 0 0 1px rgba(224, 32, 46, 0.3)"
                      : "inset 3px 0 0 0 rgba(244, 103, 15, 0), inset 0 0 0 1px rgba(224, 32, 46, 0)",
                  }}
                >
                  <td className="px-4 py-3 font-mono text-xs text-white/80">{assessment.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/70">{assessment.orderId}</td>
                  <td className="px-4 py-3 text-white/85">{assessment.order ? maskName(assessment.order.customerName) : t.noOrder}</td>
                  <td className="px-4 py-3">
                    <RiskLevelBadge level={assessment.riskLevel} locale={locale} />
                  </td>
                  <td className="px-4 py-3 text-white/80">{assessment.confidenceScore}/100</td>
                  <td className="px-4 py-3">
                    <ValidationBadge status={assessment.validation} locale={locale} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-white/45">{formatStaffDateTime(assessment.updatedAt, locale)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </StaffTableScroll>

      {/* Mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        {assessments.map((assessment) => {
          const selected = assessment.id === selectedId;
          return (
            <button
              key={assessment.id}
              type="button"
              onClick={() => onSelect(assessment.id)}
              className={`rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ease-out ${
                selected ? "border-wb-orange/50 bg-wb-orange/10" : "border-white/10 bg-white/[0.03]"
              }`}
              style={{
                boxShadow: selected
                  ? "inset 3px 0 0 0 #f4670f, inset 0 0 0 1px rgba(224, 32, 46, 0.3)"
                  : "inset 3px 0 0 0 rgba(244, 103, 15, 0), inset 0 0 0 1px rgba(224, 32, 46, 0)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-white/70">{assessment.id}</span>
                <RiskLevelBadge level={assessment.riskLevel} locale={locale} />
              </div>
              <div className="mt-1.5 text-sm font-medium text-white/85">
                {assessment.order ? maskName(assessment.order.customerName) : t.noOrder}
              </div>
              <div className="mt-0.5 font-mono text-xs text-white/50">{assessment.orderId}</div>
              <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                <span>{assessment.confidenceScore}/100</span>
                <ValidationBadge status={assessment.validation} locale={locale} />
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
