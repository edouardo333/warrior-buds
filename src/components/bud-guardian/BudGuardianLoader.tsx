"use client";

// Perf: BudGuardian pulls in its entire conversational engine (FAQ data in
// both locales, product/cart/checkout/support intent matchers, the AI
// provider abstraction, moderation/risk/order/payment engines, etc. — see
// BudGuardian.tsx's import list) on every single route, since RootLayout
// renders it unconditionally. None of that is needed for the very first
// paint — the widget only starts a conversation once the visitor opens it —
// so it's split into its own chunk and skipped during SSR entirely. This
// keeps the widget's ~dozen engine modules out of every route's initial
// server render and first-load client JS; they're fetched once, lazily,
// right after the shell has hydrated, and cached for every route after
// that. No behavior changes: same widget, same props, just loaded off the
// critical path.
import dynamic from "next/dynamic";

const BudGuardian = dynamic(() => import("./BudGuardian"), { ssr: false });

export default function BudGuardianLoader() {
  return <BudGuardian />;
}
