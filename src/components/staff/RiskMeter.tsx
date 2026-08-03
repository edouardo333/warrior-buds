"use client";

import type { RiskLevel } from "@/types/risk";
import { getRiskLevelLabel } from "@/lib/bud-guardian/risk-engine";
import { RISK_LEVEL_COLORS } from "./RiskTable";

const LEVELS: RiskLevel[] = ["low", "medium", "high", "critical"];

export default function RiskMeter({ level, locale }: { level: RiskLevel; locale: "fr" | "en" }) {
  return (
    <div className="flex items-end gap-1.5">
      {LEVELS.map((lvl) => {
        const color = RISK_LEVEL_COLORS[lvl];
        const isActive = lvl === level;
        return (
          <div key={lvl} className="flex flex-1 flex-col items-center gap-1.5">
            <span
              className="w-full origin-bottom rounded-full transition-all duration-200"
              style={{
                height: 8,
                background: color.solid,
                opacity: isActive ? 1 : 0.16,
                boxShadow: isActive ? `0 0 10px rgba(${color.rgb}, 0.55)` : "none",
                transform: isActive ? "scaleY(1.3)" : "scaleY(1)",
              }}
            />
            <span
              className="text-[10px] font-medium uppercase tracking-wide transition-colors duration-200"
              style={{ color: isActive ? color.solid : "rgba(255,255,255,0.3)" }}
            >
              {getRiskLevelLabel(lvl, locale)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
