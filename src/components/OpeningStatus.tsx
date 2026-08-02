"use client";

import { useEffect, useState } from "react";
import { getStoreStatus, type StoreStatus } from "@/lib/hours";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type StatusPalette = { solid: string; rgb: string };

const STATUS_PALETTE: Record<StoreStatus["state"], StatusPalette> = {
  open: { solid: "#22c55e", rgb: "34, 197, 94" },
  "closing-soon": { solid: "#f8b400", rgb: "248, 180, 0" },
  "last-30": { solid: "#f4670f", rgb: "244, 103, 15" },
  closed: { solid: "#e0202e", rgb: "224, 32, 46" },
};

function ClockIcon({ palette, size }: { palette: StatusPalette; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 overflow-visible"
      style={{ filter: `drop-shadow(0 0 4px rgba(${palette.rgb}, 0.55))` }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" stroke={palette.solid} strokeOpacity="0.3" strokeWidth="1.3" />
      <circle
        cx="12"
        cy="12"
        r="9.5"
        stroke={palette.solid}
        strokeOpacity="0.85"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeDasharray="6 24"
        className="wb-clock-ring"
      />
      <line x1="12" y1="12" x2="12" y2="7" stroke={palette.solid} strokeWidth="1.4" strokeLinecap="round" className="wb-clock-hour" />
      <line x1="12" y1="12" x2="15.5" y2="12" stroke={palette.solid} strokeWidth="1.4" strokeLinecap="round" className="wb-clock-minute" />
      <circle cx="12" cy="12" r="1.1" fill={palette.solid} />
    </svg>
  );
}

export default function OpeningStatus({ size = "md" }: { size?: "md" | "sm" }) {
  const [status, setStatus] = useState<StoreStatus | null>(null);
  const { locale } = useLanguage();

  useEffect(() => {
    const update = () => setStatus(getStoreStatus(new Date(), locale));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [locale]);

  const state = status?.state ?? "open";
  const palette = STATUS_PALETTE[state];
  const isAlive = state !== "closed";
  const isSmall = size === "sm";

  return (
    <div
      className={`relative inline-flex items-center overflow-hidden rounded-2xl border backdrop-blur-md transition-colors duration-700 ${
        isSmall ? "gap-2.5 px-3.5 py-2" : "gap-3.5 px-5 py-3"
      }`}
      style={{
        borderColor: `rgba(${palette.rgb}, 0.4)`,
        background: `linear-gradient(135deg, rgba(5,4,3,0.75), rgba(${palette.rgb}, 0.1))`,
        boxShadow: `0 0 ${isSmall ? 20 : 30}px -8px rgba(${palette.rgb}, 0.55), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle at 15% 0%, rgba(${palette.rgb}, 0.25), transparent 55%)`,
        }}
      />

      {/* LED */}
      <span className={`relative z-10 flex shrink-0 items-center justify-center ${isSmall ? "h-4 w-4" : "h-5 w-5"}`}>
        {isAlive && (
          <>
            <span
              className="wb-led-wave absolute inline-flex h-full w-full rounded-full"
              style={{ backgroundColor: palette.solid }}
            />
            <span
              className="wb-led-wave absolute inline-flex h-full w-full rounded-full"
              style={{ backgroundColor: palette.solid, animationDelay: "1.4s" }}
            />
          </>
        )}
        <span
          className={`relative inline-flex rounded-full ${isAlive ? "wb-led-core" : ""} ${
            isSmall ? "h-2 w-2" : "h-2.5 w-2.5"
          }`}
          style={{
            backgroundColor: palette.solid,
            boxShadow: `0 0 6px 1px ${palette.solid}, 0 0 14px 3px rgba(${palette.rgb}, 0.75), 0 0 24px 8px rgba(${palette.rgb}, 0.4)`,
          }}
        />
      </span>

      {/* Text */}
      <span className="relative z-10 flex flex-col leading-tight">
        <span
          className={`font-bold uppercase tracking-widest text-foreground ${isSmall ? "text-[10px]" : "text-xs"}`}
          style={{ textShadow: `0 0 10px rgba(${palette.rgb}, 0.4)` }}
        >
          {status?.primaryLabel ?? " "}
        </span>
        <span className={`text-foreground/60 ${isSmall ? "text-[10px]" : "text-[11px]"}`}>
          {status?.secondaryLabel ?? " "}
        </span>
      </span>

      {/* Divider */}
      <span
        className="relative z-10 hidden self-stretch sm:block"
        style={{
          width: "1px",
          background: `linear-gradient(to bottom, transparent, rgba(${palette.rgb}, 0.45), transparent)`,
        }}
      />

      {/* 24/7 clock */}
      <span className="relative z-10 hidden shrink-0 items-center gap-1.5 sm:flex">
        <ClockIcon palette={palette} size={isSmall ? 16 : 20} />
        <span className="flex flex-col leading-[1.1]">
          <span className={`font-bold uppercase tracking-wider text-foreground/75 ${isSmall ? "text-[8px]" : "text-[9px]"}`}>
            24/7
          </span>
          <span className={`font-medium uppercase tracking-wider text-foreground/40 ${isSmall ? "text-[6.5px]" : "text-[7px]"}`}>
            Schedule
          </span>
        </span>
      </span>
    </div>
  );
}
