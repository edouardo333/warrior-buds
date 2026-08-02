"use client";

import { useEffect, useState } from "react";
import { getStoreStatus, type StoreStatus } from "@/lib/hours";

const DOT_COLOR: Record<StoreStatus["state"], string> = {
  open: "bg-green-500",
  "closing-soon": "bg-yellow-400",
  closed: "bg-red-500",
};

export default function OpeningStatus() {
  const [status, setStatus] = useState<StoreStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(getStoreStatus());
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  const state = status?.state ?? "open";
  const dotColor = DOT_COLOR[state];

  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        {state !== "closed" && (
          <span className={`absolute inline-flex h-full w-full animate-pulse-glow rounded-full ${dotColor}`} />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dotColor}`} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-xs font-semibold uppercase tracking-widest text-foreground/90">
          {status?.primaryLabel ?? " "}
        </span>
        <span className="text-[11px] text-foreground/55">
          {status?.secondaryLabel ?? " "}
        </span>
      </span>
    </div>
  );
}
