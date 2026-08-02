"use client";

import { useCallback, useRef, useState, type MouseEvent } from "react";

export type TiltState = {
  rotateX: number;
  rotateY: number;
  pupilX: number;
  pupilY: number;
};

const RESTING: TiltState = { rotateX: 0, rotateY: 0, pupilX: 0, pupilY: 0 };
const MAX_ROTATE_DEG = 9;
const MAX_PUPIL_OFFSET = 1.6;

function clamp(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

// Drives the subtle "head turns toward the cursor" + eye-tracking effect.
// Only active while the pointer is over the element — resets to resting on leave.
export function useCursorTilt<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [tilt, setTilt] = useState<TiltState>(RESTING);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = clamp((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2));
    const ny = clamp((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2));
    setTilt({
      rotateY: nx * MAX_ROTATE_DEG,
      rotateX: -ny * MAX_ROTATE_DEG,
      pupilX: nx * MAX_PUPIL_OFFSET,
      pupilY: ny * MAX_PUPIL_OFFSET,
    });
  }, []);

  const handleMouseLeave = useCallback(() => setTilt(RESTING), []);

  return { ref, tilt, handleMouseMove, handleMouseLeave };
}
