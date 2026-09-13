"use client";

// Storefront — "use client" cart & wishlist hooks over
// data/shop/cart-store.ts + lib/shop/cart-engine.ts. Snapshots subscribed
// via useSyncExternalStore always read the store's raw, per-owner
// referentially-stable objects (getCart/getWishlist/getProducts); totals,
// line joins, and lookups are derived with useMemo so they only recompute
// when a raw snapshot actually changes. Never imports from or writes to
// data/bud-guardian/**, lib/staff/**, or components/staff/**.

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { GUEST_OWNER_ID, getCart, getWishlist, subscribeCartStore } from "@/data/shop/cart-store";
import { getProducts, subscribeProducts } from "@/data/shop/product-store";
import * as cartEngine from "./cart-engine";
import { useSession } from "./auth-actions";
import type { StorefrontProduct } from "@/types/product";
import type { Cart, Wishlist } from "@/types/cart";

const EMPTY_PRODUCTS: StorefrontProduct[] = [];

// getServerSnapshot for the cart/wishlist useSyncExternalStore calls below.
// This must NOT be `() => getCart(GUEST_OWNER_ID)` / `() => getWishlist(GUEST_OWNER_ID)`:
// those read cart-store.ts's live `carts`/`wishlists` module state, which on
// the client is already populated from localStorage by the time this module
// evaluates (cart-store.ts loads it synchronously at import time, before
// hydration runs). Using the live accessor here would make React's
// hydration-time snapshot return the already-hydrated persisted cart instead
// of the empty cart the server actually rendered (e.g. server renders
// "Panier, 0 articles", client hydrates against "Panier, 25 articles") —
// a hydration mismatch. A fixed, store-independent empty value — the same
// pattern EMPTY_PRODUCTS above already uses for the products store — keeps
// the server-matching snapshot deterministic. The real persisted cart still
// appears immediately after hydration, once useSyncExternalStore switches to
// the live getSnapshot.
const EMPTY_CART: Cart = { ownerId: GUEST_OWNER_ID, items: [], updatedAt: new Date(0).toISOString() };
const EMPTY_WISHLIST: Wishlist = { ownerId: GUEST_OWNER_ID, items: [], updatedAt: new Date(0).toISOString() };

export function useOwnerId(): string {
  const session = useSession();
  return session?.accountId ?? GUEST_OWNER_ID;
}

export function useCart() {
  const ownerId = useOwnerId();
  const cart = useSyncExternalStore(subscribeCartStore, () => getCart(ownerId), () => EMPTY_CART);
  const products = useSyncExternalStore(subscribeProducts, getProducts, () => EMPTY_PRODUCTS);

  const lines = useMemo(() => cartEngine.computeCartLines(cart, products), [cart, products]);
  const totals = useMemo(() => cartEngine.computeCartTotals(lines), [lines]);
  const itemCount = useMemo(() => cart.items.reduce((sum, i) => sum + i.quantity, 0), [cart]);

  // `selectedFormatLabel` is only ever passed for a format-priced product's
  // Add to Cart (ProductDetail.tsx) — every other caller omits it and keeps
  // matching by productId alone, unchanged from before.
  const addItem = useCallback(
    (productId: string, quantity = 1, selectedFormatLabel?: string | null) =>
      cartEngine.addToCart(ownerId, productId, quantity, selectedFormatLabel),
    [ownerId]
  );
  const updateQuantity = useCallback(
    (productId: string, quantity: number, selectedFormatLabel?: string | null) =>
      cartEngine.updateCartQuantity(ownerId, productId, quantity, selectedFormatLabel),
    [ownerId]
  );
  const removeItem = useCallback(
    (productId: string, selectedFormatLabel?: string | null) => cartEngine.removeFromCart(ownerId, productId, selectedFormatLabel),
    [ownerId]
  );

  return { ownerId, lines, totals, itemCount, addItem, updateQuantity, removeItem };
}

export function useWishlist() {
  const ownerId = useOwnerId();
  const wishlist = useSyncExternalStore(subscribeCartStore, () => getWishlist(ownerId), () => EMPTY_WISHLIST);
  const products = useSyncExternalStore(subscribeProducts, getProducts, () => EMPTY_PRODUCTS);

  const items = useMemo(() => cartEngine.computeWishlistProducts(wishlist, products), [wishlist, products]);
  const savedIds = useMemo(() => new Set(wishlist.items.map((i) => i.productId)), [wishlist]);

  const toggle = useCallback((productId: string) => cartEngine.toggleWishlist(ownerId, productId), [ownerId]);
  const isSaved = useCallback((productId: string) => savedIds.has(productId), [savedIds]);
  const moveToCart = useCallback((productId: string) => cartEngine.moveWishlistItemToCart(ownerId, productId), [ownerId]);

  return { ownerId, items, isSaved, toggle, moveToCart };
}
