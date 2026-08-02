"use client";

import HelmetIcon, { type GuardianVisualState } from "./HelmetIcon";
import { useCursorTilt } from "@/lib/bud-guardian/useCursorTilt";

type ChatBubbleProps = {
  state: GuardianVisualState;
  nodding?: boolean;
  onClick: () => void;
  label: string;
};

export default function ChatBubble({ state, nodding = false, onClick, label }: ChatBubbleProps) {
  const { ref, tilt, handleMouseMove, handleMouseLeave } = useCursorTilt<HTMLSpanElement>();
  const isGreeting = state === "greeting";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={label}
      aria-expanded={false}
      className="group relative flex h-16 w-16 items-center justify-center sm:h-[72px] sm:w-[72px]"
    >
      <span
        className={`wb-guardian-halo pointer-events-none absolute -inset-3 rounded-full bg-gradient-to-br from-wb-red/40 via-wb-orange/40 to-wb-yellow/30 blur-xl ${isGreeting ? "wb-guardian-halo-greeting" : ""}`}
      />
      <span className="absolute inset-0 rounded-full border border-white/10 bg-black/70 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-transform duration-200 group-hover:scale-105" />
      <span
        ref={ref}
        className="relative z-10 flex items-center justify-center transition-transform duration-300 ease-out"
        style={{ transform: `perspective(400px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)` }}
      >
        <HelmetIcon size={40} state={state} nodding={nodding} pupilOffset={{ x: tilt.pupilX, y: tilt.pupilY }} />
      </span>
    </button>
  );
}
