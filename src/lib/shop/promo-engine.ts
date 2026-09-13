// Storefront — BUDS5 once-per-account promo code business rules. Pure
// functions over data/shop/order-store.ts (read-only, to determine whether
// this identity has already redeemed BUDS5) and data/shop/cart-store.ts
// (GUEST_OWNER_ID). Never imports from or writes to data/bud-guardian/**,
// lib/staff/**, or components/staff/**.

import { GUEST_OWNER_ID } from "@/data/shop/cart-store";
import { getOrders } from "@/data/shop/order-store";

export const BUDS5_CODE = "BUDS5";
export const BUDS5_RATE = 0.05;

export type PromoRejectionReason = "empty" | "invalid" | "already_redeemed";

export type PromoEvaluation =
  | { ok: true; code: typeof BUDS5_CODE; discount: number }
  | { ok: false; reason: PromoRejectionReason };

// Eligibility rule: BUDS5 may be redeemed ONCE PER ACCOUNT — not "first
// order only". A customer can place any number of orders without the code
// and still use it later; what disqualifies them is having *actually
// redeemed* BUDS5 on a past order, not merely having past orders.
//
// Source of truth: each order already records the promo code applied to it
// at creation time (ShopOrder.promoCode, set in checkout-engine.ts). So
// eligibility is "does any of this identity's orders carry promoCode ===
// BUDS5_CODE", never "does this identity have zero prior orders". Signed-in
// accounts match on accountId; guests (who all share GUEST_OWNER_ID) match
// on the email they typed at checkout — their only durable identity. This
// still fully prevents reuse: once one order exists with BUDS5 applied for
// the identity, every later evaluation for that same identity fails here.
//
// NOTE (mock-data limitation): getOrders() reads data/shop/order-store.ts,
// which is localStorage-backed per browser — see that file's header. This
// check is correct against whatever order history is visible to it, but it
// is not a trusted server-side check: clearing localStorage, using another
// browser/device, or editing the persisted array removes the redeemed order
// and restores eligibility. A production build needs this same query
// (accountId/email -> has an order with promoCode === "BUDS5") run against a
// real server-side orders table, re-validated on the order-creation request
// the same way checkout-engine.createOrderFromCart already re-validates
// this function's result rather than trusting client state.
export function hasRedeemedBuds5(accountId: string, guestEmail: string | null): boolean {
  const orders = getOrders();
  if (accountId !== GUEST_OWNER_ID) {
    return orders.some((o) => o.accountId === accountId && o.promoCode === BUDS5_CODE);
  }
  const email = guestEmail?.trim().toLowerCase();
  if (!email) return false;
  return orders.some((o) => o.guestEmail?.toLowerCase() === email && o.promoCode === BUDS5_CODE);
}

export function evaluatePromoCode(
  rawCode: string,
  params: { accountId: string; guestEmail: string | null; subtotal: number }
): PromoEvaluation {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "empty" };
  if (code !== BUDS5_CODE) return { ok: false, reason: "invalid" };
  if (hasRedeemedBuds5(params.accountId, params.guestEmail)) return { ok: false, reason: "already_redeemed" };

  const discount = Math.round(params.subtotal * BUDS5_RATE * 100) / 100;
  return { ok: true, code: BUDS5_CODE, discount };
}
