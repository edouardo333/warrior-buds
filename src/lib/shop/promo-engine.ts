// Storefront — BUDS5 first-order promo code business rules. Pure functions
// over data/shop/order-store.ts (read-only, to determine first-order
// eligibility) and data/shop/cart-store.ts (GUEST_OWNER_ID). Never imports
// from or writes to data/bud-guardian/**, lib/staff/**, or
// components/staff/**.

import { GUEST_OWNER_ID } from "@/data/shop/cart-store";
import { getOrders } from "@/data/shop/order-store";

export const BUDS5_CODE = "BUDS5";
export const BUDS5_RATE = 0.05;

export type PromoRejectionReason = "empty" | "invalid" | "not_first_order";

export type PromoEvaluation =
  | { ok: true; code: typeof BUDS5_CODE; discount: number }
  | { ok: false; reason: PromoRejectionReason };

// "First order" = this identity has no orders in the store yet. Signed-in
// accounts match on accountId; guests (who all share GUEST_OWNER_ID) match
// on the email they typed at checkout — their only durable identity. This
// also doubles as reuse-prevention: once an order exists for the identity
// (BUDS5 or not), later attempts fail this same check, so the code can
// never be redeemed twice by the same account, and by the same guest email
// where one was provided.
export function isFirstOrder(accountId: string, guestEmail: string | null): boolean {
  const orders = getOrders();
  if (accountId !== GUEST_OWNER_ID) return !orders.some((o) => o.accountId === accountId);
  const email = guestEmail?.trim().toLowerCase();
  if (!email) return true;
  return !orders.some((o) => o.guestEmail?.toLowerCase() === email);
}

export function evaluatePromoCode(
  rawCode: string,
  params: { accountId: string; guestEmail: string | null; subtotal: number }
): PromoEvaluation {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "empty" };
  if (code !== BUDS5_CODE) return { ok: false, reason: "invalid" };
  if (!isFirstOrder(params.accountId, params.guestEmail)) return { ok: false, reason: "not_first_order" };

  const discount = Math.round(params.subtotal * BUDS5_RATE * 100) / 100;
  return { ok: true, code: BUDS5_CODE, discount };
}
