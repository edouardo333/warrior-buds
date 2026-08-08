"use client";

// Bud Guardian V8 — dependency-free chart primitives for /staff/analytics.
// No charting library is installed in this project, so these are small,
// purpose-built SVG/CSS components matching the app's existing dark theme
// (wb-orange accent, white/10 borders — same palette every other staff
// dashboard's KpiCard already uses). Presentation only: every number they
// render comes from lib/bud-guardian/analytics-engine.ts, computed from the
// live stores — nothing here invents or randomizes data.

import type { Locale } from "@/lib/i18n/types";

const ORANGE = "#f4670f";

// ---------------------------------------------------------------------------
// Trend area chart — revenue (or any single series) over time.
// ---------------------------------------------------------------------------

export function TrendAreaChart({
  points,
  locale,
  formatValue,
  emptyLabel,
}: {
  points: { dateIso: string; value: number }[];
  locale: Locale;
  formatValue: (value: number) => string;
  emptyLabel: string;
}) {
  const width = 640;
  const height = 180;
  const padX = 8;
  const padTop = 16;
  const padBottom = 24;

  const hasData = points.length > 0 && points.some((p) => p.value > 0);

  if (points.length === 0) {
    return <p className="py-10 text-center text-sm text-white/40">{emptyLabel}</p>;
  }

  const max = Math.max(...points.map((p) => p.value), 1);
  const innerWidth = width - padX * 2;
  const innerHeight = height - padTop - padBottom;
  const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;

  const coords = points.map((p, i) => {
    const x = padX + (points.length > 1 ? i * step : innerWidth / 2);
    const y = padTop + innerHeight - (p.value / max) * innerHeight;
    return { x, y, point: p };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${padTop + innerHeight} L${coords[0].x.toFixed(1)},${padTop + innerHeight} Z`;

  // Show at most 5 x-axis labels so dense ranges (90 days) stay legible.
  const labelStride = Math.max(1, Math.ceil(coords.length / 5));
  const dateFormatter = new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { month: "short", day: "numeric" });

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full" preserveAspectRatio="none" role="img" aria-label={emptyLabel}>
        <defs>
          <linearGradient id="wb-analytics-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ORANGE} stopOpacity="0.35" />
            <stop offset="100%" stopColor={ORANGE} stopOpacity="0" />
          </linearGradient>
        </defs>
        {hasData && <path d={areaPath} fill="url(#wb-analytics-area)" stroke="none" />}
        <path d={linePath} fill="none" stroke={ORANGE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {coords.length <= 45 &&
          coords.map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r={c.point.value > 0 ? 2.5 : 1.5} fill={ORANGE} opacity={c.point.value > 0 ? 1 : 0.35} />
          ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-white/35">
        {coords
          .filter((_, i) => i % labelStride === 0 || i === coords.length - 1)
          .map((c, i) => (
            <span key={i}>{dateFormatter.format(new Date(c.point.dateIso))}</span>
          ))}
      </div>
      {!hasData && <p className="mt-2 text-center text-xs text-white/35">{emptyLabel}</p>}
      <p className="sr-only">
        {points.map((p) => `${dateFormatter.format(new Date(p.dateIso))}: ${formatValue(p.value)}`).join(", ")}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Horizontal bar list — top products/categories/customers/segments/movers.
// ---------------------------------------------------------------------------

export type BarListItem = { key: string; label: string; value: number; sublabel?: string; color?: string };

export function BarList({
  items,
  formatValue,
  emptyLabel,
  color = ORANGE,
}: {
  items: BarListItem[];
  formatValue: (value: number) => string;
  emptyLabel: string;
  color?: string;
}) {
  if (items.length === 0) return <p className="py-6 text-center text-sm text-white/40">{emptyLabel}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const pct = Math.max((item.value / max) * 100, item.value > 0 ? 4 : 0);
        return (
          <li key={item.key} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="truncate text-white/75">{item.label}</span>
              <span className="shrink-0 font-medium text-white/90">{formatValue(item.value)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: item.color ?? color }} />
            </div>
            {item.sublabel && <span className="text-[11px] text-white/40">{item.sublabel}</span>}
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Vertical bar chart — day-of-week / hour-of-day distributions, small
// status-breakdown multiples. CSS-only (flex + heights), no SVG needed for
// plain equal-width bars.
// ---------------------------------------------------------------------------

export function VerticalBarChart({
  items,
  formatValue,
  compact = false,
  color = ORANGE,
}: {
  items: { key: string | number; label: string; value: number }[];
  formatValue: (value: number) => string;
  compact?: boolean;
  color?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className={`flex items-end gap-1 ${compact ? "h-24" : "h-32"}`}>
      {items.map((item) => {
        const pct = Math.max((item.value / max) * 100, item.value > 0 ? 6 : 2);
        return (
          <div key={item.key} className="group flex flex-1 flex-col items-center justify-end gap-1" title={`${item.label}: ${formatValue(item.value)}`}>
            <span className={`text-white/50 ${compact ? "text-[9px]" : "text-[10px]"} opacity-0 transition-opacity duration-150 group-hover:opacity-100`}>
              {formatValue(item.value)}
            </span>
            <div
              className="w-full rounded-t-sm transition-all duration-300"
              style={{ height: `${pct}%`, backgroundColor: item.value > 0 ? color : "rgba(255,255,255,0.08)", minHeight: 2 }}
            />
            <span className={`text-white/40 ${compact ? "text-[8px]" : "text-[10px]"}`}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
