"use client";

import { useEffect, useState } from "react";
import { getStoreStatus, STORE_TIMEZONE, type StoreStatus } from "@/lib/hours";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type StatusPalette = { solid: string; rgb: string };

const STATUS_PALETTE: Record<StoreStatus["state"], StatusPalette> = {
  open: { solid: "#30d158", rgb: "48, 209, 88" },
  "closing-soon": { solid: "#ffd60a", rgb: "255, 214, 10" },
  "last-30": { solid: "#ff9f0a", rgb: "255, 159, 10" },
  closed: { solid: "#ff453a", rgb: "255, 69, 58" },
};

type LedColor = "green" | "yellow" | "orange" | "red";

const LED_PALETTE: Record<LedColor, StatusPalette> = {
  green: { solid: "#30d158", rgb: "48, 209, 88" },
  yellow: { solid: "#ffd60a", rgb: "255, 214, 10" },
  orange: { solid: "#ff9f0a", rgb: "255, 159, 10" },
  red: { solid: "#ff453a", rgb: "255, 69, 58" },
};

// The pre-closing side (open / closing-soon / last-30) mirrors `state` 1:1 so
// the LED dot can never disagree with the badge's border/glow color — it used
// to run its own clock-time thresholds and drift out of sync with the real
// 30-minute "last-30" cutoff. Only the pre-opening ramp (closed -> opening
// soon -> open) still needs clock time, since `state` has no equivalent for
// that side and stays "closed" throughout.
function getLedColor(state: StoreStatus["state"], minutesSinceMidnight: number): LedColor {
  if (state === "open") return "green";
  if (state === "closing-soon") return "yellow";
  if (state === "last-30") return "orange";
  if (minutesSinceMidnight < 480) return "red"; // 02:00-07:59 — closed
  if (minutesSinceMidnight < 540) return "orange"; // 08:00-08:59 — opening soon
  if (minutesSinceMidnight < 600) return "yellow"; // 09:00-09:59 — opens soon
  return "red"; // fallback, unreachable while state === "closed"
}

type ClockParts = { hours: number; minutes: number; seconds: number };
type HandAngles = { hour: number; minute: number; second: number };

// Hoisted to module scope for the same reason as hours.ts's formatter: this
// runs every second, on every mounted instance (hero + footer badges both
// mount at once), and the options are always the same.
const TORONTO_CLOCK_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: STORE_TIMEZONE,
  hourCycle: "h23",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function getTorontoClockParts(date: Date): ClockParts {
  const parts = TORONTO_CLOCK_FORMATTER.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) map[part.type] = part.value;
  return { hours: Number(map.hour), minutes: Number(map.minute), seconds: Number(map.second) };
}

// Accumulates instead of wrapping at 360deg so the CSS transition always sweeps
// forward — a modulo angle would snap the hand backward at each rollover.
function advanceAngle(previousTotal: number, targetMod: number): number {
  const previousMod = ((previousTotal % 360) + 360) % 360;
  const delta = ((targetMod - previousMod) % 360 + 360) % 360;
  return previousTotal + delta;
}

function nextHandAngles(previous: HandAngles, clock: ClockParts): HandAngles {
  const { hours, minutes, seconds } = clock;
  return {
    hour: advanceAngle(previous.hour, (hours % 12) * 30 + minutes * 0.5 + seconds / 120),
    minute: advanceAngle(previous.minute, minutes * 6 + seconds * 0.1),
    second: advanceAngle(previous.second, seconds * 6),
  };
}

function AnalogClock({
  palette,
  size,
  angles,
  smooth,
}: {
  palette: StatusPalette;
  size: number;
  angles: HandAngles;
  smooth: boolean;
}) {
  const handTransition = smooth ? undefined : "none";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="shrink-0 overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="wb-clock-face" cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="47" fill="url(#wb-clock-face)" stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="47" fill="none" stroke={palette.solid} strokeOpacity="0.22" strokeWidth="1" />

      {[1, 2, 4, 5, 7, 8, 10, 11].map((h) => {
        const angle = (h * 30 * Math.PI) / 180;
        const sin = Math.round(Math.sin(angle) * 1e6) / 1e6;
        const cos = Math.round(Math.cos(angle) * 1e6) / 1e6;
        const x1 = 50 + 40.5 * sin;
        const y1 = 50 - 40.5 * cos;
        const x2 = 50 + 44.5 * sin;
        const y2 = 50 - 44.5 * cos;
        return (
          <line
            key={h}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(255,255,255,0.32)"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        );
      })}

      <text x="50" y="19" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="rgba(255,255,255,0.78)" fontFamily="ui-sans-serif, system-ui, sans-serif">
        12
      </text>
      <text x="82.5" y="53.7" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="rgba(255,255,255,0.78)" fontFamily="ui-sans-serif, system-ui, sans-serif">
        3
      </text>
      <text x="50" y="88.3" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="rgba(255,255,255,0.78)" fontFamily="ui-sans-serif, system-ui, sans-serif">
        6
      </text>
      <text x="17.5" y="53.7" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="rgba(255,255,255,0.78)" fontFamily="ui-sans-serif, system-ui, sans-serif">
        9
      </text>

      <line
        x1="50"
        y1="50"
        x2="50"
        y2="28"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth="3.6"
        strokeLinecap="round"
        className="wb-clock-hand"
        style={{ transform: `rotate(${angles.hour}deg)`, transformOrigin: "50px 50px", transition: handTransition }}
      />
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="16"
        stroke="rgba(255,255,255,0.97)"
        strokeWidth="2.3"
        strokeLinecap="round"
        className="wb-clock-hand"
        style={{ transform: `rotate(${angles.minute}deg)`, transformOrigin: "50px 50px", transition: handTransition }}
      />

      <line
        x1="50"
        y1="59"
        x2="50"
        y2="11"
        stroke={palette.solid}
        strokeWidth="1"
        strokeLinecap="round"
        className="wb-clock-hand"
        style={{
          transform: `rotate(${angles.second}deg)`,
          transformOrigin: "50px 50px",
          transition: handTransition,
          filter: `drop-shadow(0 0 3px ${palette.solid})`,
        }}
      />

      <circle cx="50" cy="50" r="3.4" fill={palette.solid} stroke="rgba(5,4,3,0.6)" strokeWidth="1" />
      <circle cx="50" cy="50" r="1.15" fill="#fff" />
    </svg>
  );
}

export default function OpeningStatus({ size = "md" }: { size?: "md" | "sm" | "hero" }) {
  const [status, setStatus] = useState<StoreStatus | null>(null);
  const [ledColor, setLedColor] = useState<LedColor>("green");
  const [angles, setAngles] = useState<HandAngles>({ hour: 0, minute: 0, second: 0 });
  const [handsReady, setHandsReady] = useState(false);
  const { locale } = useLanguage();

  useEffect(() => {
    // The badge text, the LED color, and the clock hands are all derived from
    // this single `now`, sampled every second, so they never drift apart.
    const update = () => {
      const now = new Date();
      const clock = getTorontoClockParts(now);
      const nextStatus = getStoreStatus(now, locale);
      setStatus(nextStatus);
      setLedColor(getLedColor(nextStatus.state, clock.hours * 60 + clock.minutes));
      setAngles((previous) => nextHandAngles(previous, clock));
    };
    update();
    const id = setInterval(update, 1_000);

    // Delay enabling the transition to a separate commit so the very first
    // sync (baseline -> real time) snaps into place instead of sweeping the
    // dial. A timeout is used instead of requestAnimationFrame because rAF
    // can be suspended entirely in a backgrounded/inactive tab.
    const readyTimeout = setTimeout(() => setHandsReady(true), 50);
    return () => {
      clearInterval(id);
      clearTimeout(readyTimeout);
    };
  }, [locale]);

  const state = status?.state ?? "open";
  const palette = STATUS_PALETTE[state];
  const ledPalette = LED_PALETTE[ledColor];
  const isSmall = size === "sm";
  // The footer card shares the hero card's font sizes, clock size, and LED —
  // only its outer padding/gap/glow are tightened for the compact layout.
  const useHeroMetrics = isSmall || size === "hero";

  const dotBox = useHeroMetrics ? 9 : 10;
  const dotCore = useHeroMetrics ? 6.5 : 7;
  const clockSize = useHeroMetrics ? 52 : 58;

  return (
    <div className="relative inline-flex items-center">
      <div
        className={`pointer-events-none absolute rounded-[36px] opacity-70 blur-2xl transition-colors duration-1000 ${
          isSmall ? "-inset-3" : "-inset-4"
        }`}
        style={{ background: `radial-gradient(circle, rgba(${palette.rgb}, 0.32), transparent 72%)` }}
      />

      <div
        className={`relative flex items-center overflow-hidden rounded-[26px] border border-white/10 bg-black/55 backdrop-blur-2xl transition-colors duration-700 ${
          isSmall ? "gap-3 px-3.5 py-2.5" : useHeroMetrics ? "gap-4 px-5 py-3" : "gap-5 px-6 py-4"
        }`}
        style={{
          boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.08), 0 24px 48px -24px rgba(0,0,0,0.85), 0 0 0 1px rgba(${palette.rgb}, 0.14)`,
        }}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <span
          className="pointer-events-none absolute inset-0 opacity-90 transition-colors duration-1000"
          style={{ background: `radial-gradient(130% 110% at 0% 0%, rgba(${palette.rgb}, 0.14), transparent 60%)` }}
        />

        {/* LED */}
        <span
          className="relative z-10 flex shrink-0 items-center justify-center"
          style={{ width: dotBox, height: dotBox }}
        >
          <span
            className="wb-led-halo absolute inline-flex rounded-full"
            style={{
              width: "100%",
              height: "100%",
              background: `radial-gradient(circle, rgba(${ledPalette.rgb}, 0.85) 0%, rgba(${ledPalette.rgb}, 0.32) 45%, rgba(${ledPalette.rgb}, 0) 75%)`,
            }}
          />
          <span
            className="wb-led-wave absolute inline-flex rounded-full"
            style={{ width: "100%", height: "100%", backgroundColor: ledPalette.solid }}
          />
          <span
            className="wb-led-wave absolute inline-flex rounded-full"
            style={{ width: "100%", height: "100%", backgroundColor: ledPalette.solid, animationDelay: "1.3s" }}
          />
          <span
            className="wb-led-core relative inline-flex rounded-full"
            style={{
              width: dotCore,
              height: dotCore,
              backgroundColor: ledPalette.solid,
              boxShadow: `0 0 4px 1px ${ledPalette.solid}, 0 0 10px 2px rgba(${ledPalette.rgb}, 0.7), 0 0 18px 5px rgba(${ledPalette.rgb}, 0.35)`,
            }}
          />
        </span>

        {/* Text */}
        <span className="relative z-10 flex flex-col leading-tight">
          <span
            className={`font-semibold tracking-tight text-white text-xl sm:text-2xl ${
              isSmall ? "whitespace-nowrap" : ""
            }`}
            style={{ textShadow: `0 0 18px rgba(${palette.rgb}, 0.35)` }}
          >
            {status?.primaryLabel ?? " "}
          </span>
          <span className="font-medium text-white/50 text-xs sm:text-sm">
            {status?.secondaryLabel ?? " "}
          </span>
        </span>

        {/* Divider */}
        <span
          className="relative z-10 self-stretch shrink-0"
          style={{ width: "1px", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.16), transparent)" }}
        />

        {/* Analog clock */}
        <span className="relative z-10 flex shrink-0 items-center">
          <AnalogClock palette={palette} size={clockSize} angles={angles} smooth={handsReady} />
        </span>
      </div>
    </div>
  );
}
