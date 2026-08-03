// Storefront — mock cart & wishlist store. Both are keyed by `ownerId`
// ("guest" or a CustomerAccount["id"]) so a signed-out shopper's cart can be
// merged into their account on login (see lib/shop/cart-engine.ts
// mergeGuestIntoAccount()). Same shape as data/bud-guardian/inventory-store.ts:
// localStorage-backed, cross-tab sync, pub/sub. Never imports from or
// writes to data/bud-guardian/**, lib/staff/**, or components/staff/**.

import type { Cart, Wishlist } from "@/types/cart";

const CARTS_KEY = "wb-shop-carts-v1";
const WISHLISTS_KEY = "wb-shop-wishlists-v1";

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
