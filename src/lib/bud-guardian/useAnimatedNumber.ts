"use client";

import { useEffect, useRef, useState } from "react";

// Eases a numeric display from its previous value to a new `target` over
// `duration`ms — shared by TrustGauge (score ring + center number) and the
// Risk Engine KPI cards (count-up on load). rAF is fully suspended by
// browsers on a hidden/backgrounded tab, so a setTimeout safety net — which
// still fires there, just throttled — guarantees the value lands on target
// instead of getting stuck mid-animation.
export function useAnimatedNumber(target: number, duration = 650, initial = target): number {
  const [value, setValue] = useState(initial);
  const fromRef = useRef(initial);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    const start = performance.now();
    let raf = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (target - from) * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    }

    raf = requestAnimationFrame(tick);
    const settle = setTimeout(() => {
      fromRef.current = target;
      setValue(target);
    }, duration + 100);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [target, duration]);

  return value;
}
