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

const EMPTY_PRODUCTS: StorefrontProduct[] = [];

export function useOwnerId(): string {
  const session = useSession();
  return session?.accountId ?? GUEST_OWNER_ID;
}

export function useCart() {
  const ownerId = useOwnerId();
  const cart = useSyncExternalStore(subscribeCartStore, () => getCart(ownerId), () => getCart(GUEST_OWNER_ID));
  const products = useSyncExternalStore(subscribeProducts, getProducts, () => EMPTY_PRODUCTS);

  const lines = useMemo(() => cartEngine.computeCartLines(cart, products), [cart, products]);
  const totals = useMemo(() => cartEngine.computeCartTotals(lines), [lines]);
  const itemCount = useMemo(() => cart.items.reduce((sum, i) => sum + i.quantity, 0), [cart]);

  const addItem = useCallback((productId: string, quantity = 1) => cartEngine.addToCart(ownerId, productId, quantity), [ownerId]);
  const updateQuantity = useCallback(
    (productId: string, quantity: number) => cartEngine.updateCartQuantity(ownerId, productId, quantity),
    [ownerId]
  );
  const removeItem = useCallback((productId: string) => cartEngine.removeFromCart(ownerId, productId), [ownerId]);

  return { ownerId, lines, totals, itemCount, addItem, updateQuantity, removeItem };
}

export function useWishlist() {
  const ownerId = useOwnerId();
  const wishlist = useSyncExternalStore(subscribeCartStore, () => getWishlist(ownerId), () => getWishlist(GUEST_OWNER_ID));
  const products = useSyncExternalStore(subscribeProducts, getProducts, () => EMPTY_PRODUCTS);

  const items = useMemo(() => cartEngine.computeWishlistProducts(wishlist, products), [wishlist, products]);
  const savedIds = useMemo(() => new Set(wishlist.items.map((i) => i.productId)), [wishlist]);

  const toggle = useCallback((productId: string) => cartEngine.toggleWishlist(ownerId, productId), [ownerId]);
  const isSaved = useCallback((productId: string) => savedIds.has(productId), [savedIds]);
  const moveToCart = useCallback((productId: string) => cartEngine.moveWishlistItemToCart(ownerId, productId), [ownerId]);

  return { ownerId, items, isSaved, toggle, moveToCart };
}
