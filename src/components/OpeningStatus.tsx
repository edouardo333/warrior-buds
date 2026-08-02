"use client";

import { useEffect, useState } from "react";
import { getStoreStatus, type StoreStatus } from "@/lib/hours";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const DOT_COLOR: Record<StoreStatus["state"], string> = {
  open: "bg-green-500",
  "closing-soon": "bg-yellow-400",
  "last-30": "bg-wb-orange",
  closed: "bg-red-500",
};

const CONTAINER_STYLE: Record<StoreStatus["state"], string> = {
  open: "border-white/15 bg-white/5",
  "closing-soon": "border-white/15 bg-white/5",
  "last-30": "border-wb-orange/50 bg-wb-orange/10",
  closed: "border-white/15 bg-white/5",
};

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
  const dotColor = DOT_COLOR[state];
  const containerStyle = CONTAINER_STYLE[state];
  const isSmall = size === "sm";

  return (
    <div
      className={`inline-flex items-center rounded-full border backdrop-blur-sm ${containerStyle} ${
        isSmall ? "gap-2 px-3 py-1.5" : "gap-2.5 px-4 py-2"
      }`}
    >
      <span className={`relative flex shrink-0 ${isSmall ? "h-2 w-2" : "h-2.5 w-2.5"}`}>
        {state !== "closed" && (
          <span className={`absolute inline-flex h-full w-full animate-pulse-glow rounded-full ${dotColor}`} />
        )}
        <span className={`relative inline-flex h-full w-full rounded-full ${dotColor}`} />
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={`font-semibold uppercase tracking-widest text-foreground/90 ${
            isSmall ? "text-[10px]" : "text-xs"
          }`}
        >
          {status?.primaryLabel ?? " "}
        </span>
        <span className={`text-foreground/55 ${isSmall ? "text-[10px]" : "text-[11px]"}`}>
          {status?.secondaryLabel ?? " "}
        </span>
      </span>
    </div>
  );
}
