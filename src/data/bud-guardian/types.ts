// Shared types for the Bud Guardian local knowledge base.
// Kept locale-agnostic so future layers (AI, orders, cart, CRM) can consume
// the same shapes without reworking the data files.

export type QuickActionId =
  | "hours"
  | "products"
  | "categories"
  | "address"
  | "directions"
  | "instagram"
  | "linktree"
  | "phone"
  // Bud Guardian V2 — order-assistance quick actions (see order-engine.ts).
  | "order-track"
  | "order-find"
  | "order-ready"
  | "order-payment"
  | "order-resume-cart"
  | "order-call"
  | "order-resume"
  | "order-view-cart"
  | "order-payment-retry"
  | "order-confirm-yes"
  | "order-confirm-no"
  // Bud Guardian V2.2 — payment-assistance quick actions (see payment-engine.ts).
  | "payment-check-received"
  | "payment-check-worked"
  | "payment-remaining"
  | "payment-interac-info"
  | "payment-in-store"
  | "payment-order-confirmed"
  | "payment-expired"
  | "payment-simulate-interac"
  | "payment-confirm-demo"
  | "payment-decline-demo"
  // Bud Guardian V4.1 — quick-action category bar (see QuickActions.tsx).
  | "cat-store"
  | "cat-products"
  | "cat-product-help"
  | "cat-orders"
  | "cat-payments"
  | "cat-policies"
  | "cat-contact"
  | "cat-human-help"
  // V4.1 — new leaf actions surfaced as category suggestions.
  | "store-open-now"
  | "store-parking"
  | "product-prerolls"
  | "product-new-arrivals"
  | "product-availability"
  | "product-potency"
  | "order-pickup-process"
  | "help-beginner"
  | "help-choose"
  | "help-thc-cbd"
  | "policy-age"
  | "policy-id"
  | "policy-returns"
  | "policy-general"
  | "contact-message"
  | "human-callback"
  // Bud Guardian V13 — Checkout & Order Assistant quick actions (see
  // checkout-intent.ts). Contextual-only (message suggestions), not shown in
  // the persistent bar.
  | "checkout-go"
  | "checkout-cart"
  | "checkout-orders"
  // Bud Guardian V14 — Customer Support & Problem Resolution quick actions
  // (see support-intent.ts). Contextual-only (message suggestions), link out
  // to the real storefront auth pages — never a simulated login/reset.
  | "support-login"
  | "support-forgot-password"
  | "support-verify-email";

export type FaqTopic =
  | "hours"
  | "location"
  | "payment"
  | "age"
  | "purchase"
  | "products"
  | "contact"
  | "about"
  | "reviews"
  | "language"
  | "legal"
  | "policy"
  | "guidance"
  | "smalltalk";

// "storeStatus" marks entries whose answer should be swapped at render time
// for the live open/closed status instead of the static `answer` string.
export type FaqDynamic = "storeStatus";

export type FaqEntry = {
  id: string;
  topic: FaqTopic;
  question: string;
  keywords: string[];
  answer: string;
  suggestions?: QuickActionId[];
  dynamic?: FaqDynamic;
};
