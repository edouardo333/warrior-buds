"use client";

import { useMemo, useState } from "react";
import { ChartColumn, Clock, ShieldAlert, ShieldCheck, ShieldX, TriangleAlert, type LucideIcon } from "lucide-react";
import type { RiskLevel } from "@/types/risk";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StaffSession } from "@/lib/staff/staff-auth";
import { useStaffRiskAssessments, type StaffRiskView } from "@/lib/staff/risk-actions";
import { getRiskLevelLabel } from "@/lib/bud-guardian/risk-engine";
import { useAnimatedNumber } from "@/lib/bud-guardian/useAnimatedNumber";
import RiskTable, { RISK_LEVEL_COLORS } from "./RiskTable";
import RiskDetails from "./RiskDetails";
import StaffShell from "./StaffShell";

const RISK_LEVEL_FLOW: RiskLevel[] = ["low", "medium", "high", "critical"];

const TEXT = {
  fr: {
    title: "Bud Guardian — Risk Engine",
    subtitle: "Analyse automatique du risque de chaque commande, connectée aux commandes et aux paiements.",
    searchPlaceholder: "Analyse, commande, nom, téléphone ou courriel…",
    levelAll: "Tous les niveaux",
    clearFilters: "Réinitialiser",
    kpis: {
      total: "Total",
      low: "Faible",
      medium: "Moyen",
      high: "Élevé",
      critical: "Critique",
      pending: "À valider",
    },
    selectHint: "Sélectionnez une analyse pour voir les détails.",
  },
  en: {
    title: "Bud Guardian — Risk Engine",
    subtitle: "Automatic per-order risk analysis, connected to orders and payments.",
    searchPlaceholder: "Assessment, order, name, phone or email…",
    levelAll: "All levels",
    clearFilters: "Reset",
    kpis: {
      total: "Total",
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
      pending: "To validate",
    },
    selectHint: "Select an assessment to see its details.",
  },
} as const;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function KpiCard({
  label,
  icon: Icon,
  solid,
  rgb,
  value,
}: {
  label: string;
  icon: LucideIcon;
  solid: string;
  rgb: string;
  value: number;
}) {
  const animated = useAnimatedNumber(value, 800, 0);
  return (
    <div className="group flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105"
        style={{ background: `rgba(${rgb}, 0.14)`, color: solid }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-2xl font-semibold text-white/90">{Math.round(animated)}</p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  );
}

function matchesSearch(assessment: StaffRiskView, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (assessment.id.toLowerCase().includes(q)) return true;
  if (assessment.orderId.toLowerCase().includes(q)) return true;
  if (assessment.order?.customerName.toLowerCase().includes(q)) return true;
  if (assessment.order?.email.toLowerCase().includes(q)) return true;
  const qDigits = digitsOnly(q);
  if (qDigits.length >= 3 && assessment.order && digitsOnly(assessment.order.phone).includes(qDigits)) return true;
  return false;
}

export default function SecurityDashboard({ session }: { session: StaffSession }) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const assessments = useStaffRiskAssessments();

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<RiskLevel | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      total: assessments.length,
      low: assessments.filter((a) => a.riskLevel === "low").length,
      medium: assessments.filter((a) => a.riskLevel === "medium").length,
      high: assessments.filter((a) => a.riskLevel === "high").length,
      critical: assessments.filter((a) => a.riskLevel === "critical").length,
      pending: assessments.filter((a) => a.validation === "pending" && (a.riskLevel === "high" || a.riskLevel === "critical")).length,
    }),
    [assessments]
  );

  const filtered = useMemo(
    () => assessments.filter((a) => matchesSearch(a, search) && (levelFilter === "all" || a.riskLevel === levelFilter)),
    [assessments, search, levelFilter]
  );

  const selectedAssessment = selectedId ? assessments.find((a) => a.id === selectedId) ?? null : null;

  const kpiItems: { key: keyof typeof counts; label: string; icon: LucideIcon; solid: string; rgb: string }[] = [
    { key: "total", label: t.kpis.total, icon: ChartColumn, solid: "#f4670f", rgb: "244, 103, 15" },
    { key: "low", label: t.kpis.low, icon: ShieldCheck, ...RISK_LEVEL_COLORS.low },
    { key: "medium", label: t.kpis.medium, icon: ShieldAlert, ...RISK_LEVEL_COLORS.medium },
    { key: "high", label: t.kpis.high, icon: TriangleAlert, ...RISK_LEVEL_COLORS.high },
    { key: "critical", label: t.kpis.critical, icon: ShieldX, ...RISK_LEVEL_COLORS.critical },
    { key: "pending", label: t.kpis.pending, icon: Clock, solid: "#8a8f98", rgb: "138, 143, 152" },
  ];

  return (
    <StaffShell session={session} active="security">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-gradient-ember font-display text-3xl tracking-wide sm:text-4xl">{t.title}</h1>
          <p className="mt-1 text-sm text-white/55">{t.subtitle}</p>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kpiItems.map(({ key, label, icon, solid, rgb }) => (
            <KpiCard key={key} label={label} icon={icon} solid={solid} rgb={rgb} value={counts[key]} />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none focus:border-wb-orange/60"
          />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as RiskLevel | "all")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none focus:border-wb-orange/60"
          >
            <option value="all" className="bg-wb-charcoal">
              {t.levelAll}
            </option>
            {RISK_LEVEL_FLOW.map((level) => (
              <option key={level} value={level} className="bg-wb-charcoal">
                {getRiskLevelLabel(level, locale)}
              </option>
            ))}
          </select>
          {(search || levelFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setLevelFilter("all");
              }}
              className="text-sm text-white/50 underline-offset-2 hover:text-white/80 hover:underline"
            >
              {t.clearFilters}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <RiskTable assessments={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <div className="lg:col-span-5">
            {selectedAssessment ? (
              <RiskDetails key={selectedAssessment.id} assessment={selectedAssessment} session={session} onClose={() => setSelectedId(null)} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-sm text-white/40">
                {t.selectHint}
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
