import { useId } from "react";
import type { GuardianState } from "@/lib/bud-guardian/useGuardianState";

export type GuardianVisualState = GuardianState;

type HelmetIconProps = {
  size?: number;
  state?: GuardianVisualState;
  nodding?: boolean;
  pupilOffset?: { x: number; y: number };
  className?: string;
};

const EYE_COLOR: Record<GuardianVisualState, string> = {
  greeting: "var(--wb-orange)",
  available: "var(--wb-guardian-green)",
  thinking: "var(--wb-orange)",
  searching: "var(--wb-guardian-blue)",
  responding: "var(--wb-orange)",
  unavailable: "var(--wb-red)",
};

const EYE_ANIM_CLASS: Record<GuardianVisualState, string> = {
  greeting: "wb-guardian-eye-greeting",
  available: "wb-guardian-eye-idle",
  thinking: "wb-guardian-eye-think",
  searching: "wb-guardian-eye-search",
  responding: "wb-guardian-eye-respond",
  unavailable: "wb-guardian-eye-unavailable",
};

export default function HelmetIcon({
  size = 40,
  state = "available",
  nodding = false,
  pupilOffset = { x: 0, y: 0 },
  className = "",
}: HelmetIconProps) {
  const uid = useId();
  const crestGradientId = `wb-crest-${uid}`;
  const metalGradientId = `wb-metal-${uid}`;
  const glowFilterId = `wb-glow-${uid}`;
  const visorClipId = `wb-visor-${uid}`;
  const sweepGradientId = `wb-sweep-${uid}`;
  const eyeClass = EYE_ANIM_CLASS[state];
  const eyeColor = EYE_COLOR[state];
  const isSearching = state === "searching";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 105"
      className={`wb-guardian-breathe ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={crestGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--wb-yellow)" />
          <stop offset="55%" stopColor="var(--wb-orange)" />
          <stop offset="100%" stopColor="var(--wb-red)" />
        </linearGradient>
        <linearGradient id={metalGradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#312c27" />
          <stop offset="45%" stopColor="#161311" />
          <stop offset="100%" stopColor="#050403" />
        </linearGradient>
        <filter id={glowFilterId} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={visorClipId}>
          <rect x="27" y="55" width="46" height="11" rx="3.5" />
        </clipPath>
        <linearGradient id={sweepGradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--wb-guardian-blue)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--wb-guardian-blue)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--wb-guardian-blue)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className={nodding ? "wb-guardian-nod" : ""}>
        {/* Mohawk-style crest, echoing the logo's feathered headdress */}
        <path
          d="M50 -3 C46 -1 44 9 45 19 L42 19 L42 27 L58 27 L58 19 L55 19 C56 9 54 -1 50 -3 Z"
          fill={`url(#${crestGradientId})`}
        />
        <path d="M45 8 L41 8 L44 12 L45 12 Z" fill="var(--wb-yellow)" opacity="0.85" />
        <path d="M55 8 L59 8 L56 12 L55 12 Z" fill="var(--wb-yellow)" opacity="0.85" />

        {/* Helmet dome + cheek guards */}
        <path
          d="M50 25 C28 25 14 39 13 57 C12 69 16 79 23 89 L32 101 L38 87 L62 87 L68 101 L77 89 C84 79 88 69 87 57 C86 39 72 25 50 25 Z"
          fill={`url(#${metalGradientId})`}
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.2"
        />
        <path
          d="M27 35 C33 29 43 26 50 26"
          stroke="rgba(255,255,255,0.32)"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M32 60 L26 82" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeLinecap="round" />
        <path d="M68 60 L74 82" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeLinecap="round" />

        {/* Nose guard */}
        <rect x="46" y="55" width="8" height="32" rx="2" fill={`url(#${metalGradientId})`} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />

        {/* Eye slit band */}
        <rect x="27" y="55" width="46" height="11" rx="3.5" fill="#020202" />

        {/* Glowing eyes */}
        <ellipse cx="37.5" cy="60.5" rx="5.2" ry="3.3" fill={eyeColor} filter={`url(#${glowFilterId})`} className={eyeClass} />
        <ellipse cx="62.5" cy="60.5" rx="5.2" ry="3.3" fill={eyeColor} filter={`url(#${glowFilterId})`} className={eyeClass} />

        {/* Pupils — track the cursor very slightly */}
        <ellipse
          cx={37.5 + pupilOffset.x}
          cy={60.5 + pupilOffset.y}
          rx="1.5"
          ry="1.2"
          fill="#050403"
          opacity="0.6"
        />
        <ellipse
          cx={62.5 + pupilOffset.x}
          cy={60.5 + pupilOffset.y}
          rx="1.5"
          ry="1.2"
          fill="#050403"
          opacity="0.6"
        />

        {/* Search-state scan across the visor */}
        {isSearching && (
          <rect
            x="20"
            y="55"
            width="16"
            height="11"
            fill={`url(#${sweepGradientId})`}
            clipPath={`url(#${visorClipId})`}
            className="wb-guardian-sweep"
          />
        )}
      </g>
    </svg>
  );
}
