"use client";

// Bud Guardian V8 — cross-module "Insights / Attention Needed" for
// /staff/analytics. Distinct from StaffHub's Attention section (which lists
// individual records to act on — this order, that payment): every card here
// is a *pattern* over the current date range, computed by
// analytics-engine.ts's buildInsights() from facts each module already
// exposes (stock status, risk validation, payment status, customer
// recurrence, order timing). Rule-based and explainable, no black-box score —
// each insight traces back to exactly one threshold in analytics-engine.ts.

import { AlertTriangle, Boxes, Clock, CreditCard, PackageX, PieChart, ShieldAlert, TrendingDown, Users, type LucideIcon } from "lucide-react";
import type { InventoryCategory } from "@/types/inventory";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Locale } from "@/lib/i18n/types";
import type { AnalyticsInsight, AnalyticsInsightKind } from "@/lib/bud-guardian/analytics-engine";
import { getHourLabel, getWeekdayLabel } from "@/lib/bud-guardian/analytics-engine";
import { getCategoryLabel } from "@/lib/bud-guardian/inventory-engine";

const SEVERITY_COLORS: Record<AnalyticsInsight["severity"], { solid: string; rgb: string }> = {
  critical: { solid: "#e0202e", rgb: "224, 32, 46" },
  warning: { solid: "#f8b400", rgb: "248, 180, 0" },
  info: { solid: "#2f9bf0", rgb: "47, 155, 240" },
};

const KIND_ICON: Record<AnalyticsInsightKind, LucideIcon> = {
  "out-of-stock": PackageX,
  "low-stock": Boxes,
  "pending-risk": ShieldAlert,
  "pending-payments": CreditCard,
  "abandoned-orders": AlertTriangle,
  "returning-rate-low": Users,
  "category-concentration": PieChart,
  "peak-time": Clock,
  "decline-rate-high": TrendingDown,
};

function formatCurrency(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function categoryLabel(key: InventoryCategory | "other" | string, locale: Locale): string {
  if (key === "other") return locale === "fr" ? "non classé" : "uncategorized";
  return getCategoryLabel(key as InventoryCategory, locale);
}

type InsightTextFn = (data: Record<string, number | string>, locale: Locale) => string;

const INSIGHT_TEXT: Record<Locale, Record<AnalyticsInsightKind, InsightTextFn>> = {
  fr: {
    "out-of-stock": (d) => `${d.count} produit(s) en rupture de stock.`,
    "low-stock": (d) => `${d.count} produit(s) en stock faible.`,
    "pending-risk": (d) => `${d.count} analyse(s) de risque moyen ou plus en attente de validation.`,
    "pending-payments": (d, locale) => `${d.count} paiement(s) en attente, totalisant ${formatCurrency(Number(d.amount), locale)}.`,
    "abandoned-orders": (d) => `${d.count} commande(s) abandonnée(s) sur cette période.`,
    "returning-rate-low": (d) => `Taux de clients récurrents faible cette période (${d.rate} %).`,
    "category-concentration": (d, locale) =>
      `${d.share} % du chiffre d'affaires de la période provient de la catégorie « ${categoryLabel(String(d.category), locale)} ».`,
    "peak-time": (d, locale) => `Période la plus achalandée : ${getWeekdayLabel(Number(d.day), locale)}, autour de ${getHourLabel(Number(d.hour), locale)}.`,
    "decline-rate-high": (d) => `Taux de refus de paiement élevé cette période (${d.rate} %).`,
  },
  en: {
    "out-of-stock": (d) => `${d.count} product(s) out of stock.`,
    "low-stock": (d) => `${d.count} product(s) running low.`,
    "pending-risk": (d) => `${d.count} medium+ risk assessment(s) waiting on validation.`,
    "pending-payments": (d, locale) => `${d.count} pending payment(s), totalling ${formatCurrency(Number(d.amount), locale)}.`,
    "abandoned-orders": (d) => `${d.count} abandoned order(s) this period.`,
    "returning-rate-low": (d) => `Low repeat-customer rate this period (${d.rate}%).`,
    "category-concentration": (d, locale) => `${d.share}% of this period's revenue comes from the "${categoryLabel(String(d.category), locale)}" category.`,
    "peak-time": (d, locale) => `Busiest window: ${getWeekdayLabel(Number(d.day), locale)}, around ${getHourLabel(Number(d.hour), locale)}.`,
    "decline-rate-high": (d) => `Payment decline rate is elevated this period (${d.rate}%).`,
  },
};

const TEXT = {
  fr: { empty: "Aucune anomalie détectée sur cette période — tous les modules sont en bon état." },
  en: { empty: "Nothing to flag for this period — every module looks healthy." },
} as const;

export default function AnalyticsInsights({ insights }: { insights: AnalyticsInsight[] }) {
  const { locale } = useLanguage();
  const t = TEXT[locale];

  if (insights.length === 0) {
    return <p className="text-sm text-white/45">{t.empty}</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {insights.map((insight) => {
        const Icon = KIND_ICON[insight.kind];
        const color = SEVERITY_COLORS[insight.severity];
        const text = INSIGHT_TEXT[locale][insight.kind](insight.data, locale);
        return (
          <li key={insight.id}>
            <a
              href={insight.href}
              className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.05]"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `rgba(${color.rgb}, 0.14)`, color: color.solid }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm text-white/70 group-hover:text-white/90">{text}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
