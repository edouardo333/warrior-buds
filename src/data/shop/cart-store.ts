// Storefront — mock cart & wishlist store. Both are keyed by `ownerId`
// ("guest" or a CustomerAccount["id"]) so a signed-out shopper's cart can be
// merged into their account on login (see lib/shop/cart-engine.ts
// mergeGuestIntoAccount()). Same shape as data/bud-guardian/inventory-store.ts:
// localStorage-backed, cross-tab sync, pub/sub. Never imports from or
// writes to data/bud-guardian/**, lib/staff/**, or components/staff/**.

import type { Cart, Wishlist } from "@/types/cart";

// v2 — bumped alongside product-store.ts's PRODUCTS_KEY migration (v1 -> v2)
// so browsers holding a pre-migration cart with stale fake/demo product IDs
// (from the old 18-product demo seed) stop reading that cart back out of
// localStorage. computeCartLines() already drops lines whose productId no
// longer resolves, but getCartItemCount() does not, so the navbar badge
// could show a stale count while the Cart page rendered fewer/zero lines.
// Reseeding from an empty wb-shop-carts-v2 key closes that gap. The old
// wb-shop-carts-v1 payload, if still present in a visitor's browser, is
// simply never read again — no compatibility mapping to real products.
//
// v3 — bumped when Whole Melts was replaced by Pack Man. Pack Man reuses the
// catalog's first product ID (PROD-1001, previously Whole Melts), so a v2 cart
// line for the old product would otherwise silently resolve to Pack Man at the
// old quantity. Whole Melts was the only product ever addable to a cart
// (flower/cigarettes are format-priced/in-store-only), so nothing else is lost.
const CARTS_KEY = "wb-shop-carts-v3";
// v2 — bumped for the same reason as CARTS_KEY above: a pre-migration
// wishlist can still hold stale fake/demo product IDs from the old 18-product
// demo seed. computeWishlistProducts() already drops items whose productId no
// longer resolves, but that still means a browser holding an old
// wb-shop-wishlists-v1 payload full of nothing-but-stale IDs would render an
// empty wishlist without ever being reseeded. Bumping the key makes that
// browser start over from an empty wb-shop-wishlists-v2 instead. The old
// wb-shop-wishlists-v1 payload, if still present, is simply never read again
// — no compatibility mapping to real products.
//
// v3 — bumped alongside CARTS_KEY above for the same PROD-1001 reuse: a v2
// wishlist entry for Whole Melts would otherwise turn into a Pack Man entry.
const WISHLISTS_KEY = "wb-shop-wishlists-v3";

export const GUEST_OWNER_ID = "guest";

function loadJson<T>(key: string, fallback: () => T): T {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // Corrupt/unavailable storage — fall back to the default below.
    }
  }
  return fallback();
}

let carts: Record<string, Cart> = loadJson(CARTS_KEY, () => ({}));
let wishlists: Record<string, Wishlist> = loadJson(WISHLISTS_KEY, () => ({}));

const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CARTS_KEY, JSON.stringify(carts));
    window.localStorage.setItem(WISHLISTS_KEY, JSON.stringify(wishlists));
  } catch {
    // Storage full/unavailable (private browsing) — in-memory state still works.
  }
}

function notify(): void {
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (![CARTS_KEY, WISHLISTS_KEY].includes(event.key ?? "")) return;
    carts = loadJson(CARTS_KEY, () => carts);
    wishlists = loadJson(WISHLISTS_KEY, () => wishlists);
    notify();
  });
}

export function subscribeCartStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// getCart/getWishlist are used directly as useSyncExternalStore snapshots
// (see lib/shop/cart-actions.ts), which requires a stable reference between
// calls for a given owner until that owner's data actually changes.
// Synthesizing a fresh fallback object on every call would spin React into
// an infinite render loop (the same hazard staff-auth.ts's sessionCache
// comment documents), so empty carts/wishlists are cached per ownerId here.
const emptyCarts: Record<string, Cart> = {};
const emptyWishlists: Record<string, Wishlist> = {};

export function getCart(ownerId: string): Cart {
  if (carts[ownerId]) return carts[ownerId];
  if (!emptyCarts[ownerId]) emptyCarts[ownerId] = { ownerId, items: [], updatedAt: new Date(0).toISOString() };
  return emptyCarts[ownerId];
}

export function setCart(cart: Cart): void {
  carts = { ...carts, [cart.ownerId]: cart };
  persist();
  notify();
}

export function clearCart(ownerId: string): void {
  const next = { ...carts };
  delete next[ownerId];
  carts = next;
  persist();
  notify();
}

export function getWishlist(ownerId: string): Wishlist {
  if (wishlists[ownerId]) return wishlists[ownerId];
  if (!emptyWishlists[ownerId]) emptyWishlists[ownerId] = { ownerId, items: [], updatedAt: new Date(0).toISOString() };
  return emptyWishlists[ownerId];
}

export function setWishlist(wishlist: Wishlist): void {
  wishlists = { ...wishlists, [wishlist.ownerId]: wishlist };
  persist();
  notify();
}
