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
  | "order-confirm-no";

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
