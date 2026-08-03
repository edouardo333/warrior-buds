"use client";

import type { RiskLevel } from "@/types/risk";
import { getRiskLevelLabel } from "@/lib/bud-guardian/risk-engine";
import { useAnimatedNumber } from "@/lib/bud-guardian/useAnimatedNumber";
import { RISK_LEVEL_COLORS } from "./RiskTable";

const SIZE = 168;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DURATION = 750;

export default function TrustGauge({ score, level, locale }: { score: number; level: RiskLevel; locale: "fr" | "en" }) {
  // Parent (RiskDetails) is keyed by assessment id, so this remounts on
  // every selection — starting the ring and center number fresh from 0.
  const animated = useAnimatedNumber(Math.max(0, Math.min(100, score)), DURATION, 0);
  const color = RISK_LEVEL_COLORS[level];
  const offset = CIRCUMFERENCE - (animated / 100) * CIRCUMFERENCE;

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div
        className="relative flex items-center justify-center"
        style={{ width: SIZE, height: SIZE, filter: `drop-shadow(0 0 16px rgba(${color.rgb}, 0.4))` }}
      >
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} strokeWidth={STROKE} fill="none" stroke="rgba(255,255,255,0.08)" />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE}
            fill="none"
            stroke={color.solid}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-display text-4xl tracking-wide text-white/95">{Math.round(animated)}</span>
          <span className="text-[11px] text-white/40">/100</span>
        </div>
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: color.solid }}>
        {getRiskLevelLabel(level, locale)}
      </span>
    </div>
  );
}
