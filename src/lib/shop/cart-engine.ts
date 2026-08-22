// Storefront — cart & wishlist business rules: pure functions over
// data/shop/cart-store.ts and read-only product lookups from
// data/shop/product-store.ts (for pricing/joins). Never imports from or
// writes to data/bud-guardian/**, lib/staff/**, or components/staff/**.

import { GUEST_OWNER_ID, clearCart, getCart, getWishlist, setCart, setWishlist } from "@/data/shop/cart-store";
import { findProductById, getProducts } from "@/data/shop/product-store";
import type { Cart, CartItem, Wishlist } from "@/types/cart";
import type { StorefrontProduct } from "@/types/product";
import { getEffectivePrice } from "./product-engine";

export type CartLine = {
  product: StorefrontProduct;
  quantity: number;
  lineTotal: number;
};

const SHIPPING_FLAT_RATE = 9.95;
// Announcement bar advertises "FREE SHIPPING ON ORDERS $100+" — this is the
// single source of truth that promise resolves to; exported so promo/UI
// copy (lib/shop/promo-engine.ts, AnnouncementBar) can reference the same
// number instead of hardcoding it a second time.
export const FREE_SHIPPING_THRESHOLD = 100;
const TAX_RATE = 0.14975; // QC combined GST+QST, approximate, demo-only

// Pure variant taking already-fetched store snapshots — used by
// lib/shop/cart-actions.ts so a useMemo can list `cart`/`products` as real
// dependencies (they're actually read here) instead of opaque re-fetches.
export function computeCartLines(cart: Cart, products: StorefrontProduct[]): CartLine[] {
  const lines: CartLine[] = [];
  for (const item of cart.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    const price = getEffectivePrice(product);
    lines.push({ product, quantity: item.quantity, lineTotal: Math.round(price * item.quantity * 100) / 100 });
  }
  return lines;
}

export function getCartLines(ownerId: string): CartLine[] {
  return computeCartLines(getCart(ownerId), getProducts());
}

export function getCartItemCount(ownerId: string): number {
  return getCart(ownerId).items.reduce((sum, i) => sum + i.quantity, 0);
}

export type CartTotals = { subtotal: number; shipping: number; tax: number; total: number };

export function computeCartTotals(lines: CartLine[]): CartTotals {
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  return { subtotal: Math.round(subtotal * 100) / 100, shipping, tax, total };
}

export function getCartTotals(ownerId: string): CartTotals {
  return computeCartTotals(getCartLines(ownerId));
}

export function addToCart(ownerId: string, productId: string, quantity = 1): void {
  const cart = getCart(ownerId);
  const existing = cart.items.find((i) => i.productId === productId);
  const items: CartItem[] = existing
    ? cart.items.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i))
    : [...cart.items, { productId, quantity, addedAt: new Date().toISOString() }];
  setCart({ ownerId, items, updatedAt: new Date().toISOString() });
}

export function updateCartQuantity(ownerId: string, productId: string, quantity: number): void {
  const cart = getCart(ownerId);
  const items =
    quantity <= 0
      ? cart.items.filter((i) => i.productId !== productId)
      : cart.items.map((i) => (i.productId === productId ? { ...i, quantity } : i));
  setCart({ ownerId, items, updatedAt: new Date().toISOString() });
}

export function removeFromCart(ownerId: string, productId: string): void {
  updateCartQuantity(ownerId, productId, 0);
}

// V12 — thin wrapper over the store's clearCart so callers (Bud Guardian's
// clear_cart tool/cart-intent.ts) only ever go through this business-rules
// module, never data/shop/cart-store.ts directly.
export function clearCartItems(ownerId: string): void {
  clearCart(ownerId);
}

// Returns true if the product is now in the wishlist (i.e. it was added).
export function toggleWishlist(ownerId: string, productId: string): boolean {
  const wishlist = getWishlist(ownerId);
  const exists = wishlist.items.some((i) => i.productId === productId);
  const items = exists
    ? wishlist.items.filter((i) => i.productId !== productId)
    : [...wishlist.items, { productId, addedAt: new Date().toISOString() }];
  setWishlist({ ownerId, items, updatedAt: new Date().toISOString() });
  return !exists;
}

export function isInWishlist(ownerId: string, productId: string): boolean {
  return getWishlist(ownerId).items.some((i) => i.productId === productId);
}

export function computeWishlistProducts(wishlist: Wishlist, products: StorefrontProduct[]): StorefrontProduct[] {
  return wishlist.items
    .map((i) => products.find((p) => p.id === i.productId))
    .filter((p): p is StorefrontProduct => Boolean(p));
}

export function getWishlistProducts(ownerId: string): StorefrontProduct[] {
  return getWishlist(ownerId)
    .items.map((i) => findProductById(i.productId))
    .filter((p): p is StorefrontProduct => Boolean(p));
}

export function moveWishlistItemToCart(ownerId: string, productId: string): void {
  addToCart(ownerId, productId, 1);
  const wishlist = getWishlist(ownerId);
  setWishlist({
    ownerId,
    items: wishlist.items.filter((i) => i.productId !== productId),
    updatedAt: new Date().toISOString(),
  });
}

// Called once on login — folds the anonymous guest cart/wishlist into the
// signed-in account's, then clears the guest copy so it can never be merged
// twice (matches the "Sync with customer account" wishlist requirement).
export function mergeGuestIntoAccount(accountId: string): void {
  const guestCart = getCart(GUEST_OWNER_ID);
  if (guestCart.items.length > 0) {
    const accountCart = getCart(accountId);
    const merged = new Map<string, CartItem>();
    for (const item of [...accountCart.items, ...guestCart.items]) {
      const existing = merged.get(item.productId);
      merged.set(item.productId, existing ? { ...existing, quantity: existing.quantity + item.quantity } : item);
    }
    setCart({ ownerId: accountId, items: [...merged.values()], updatedAt: new Date().toISOString() });
  }

  const guestWishlist = getWishlist(GUEST_OWNER_ID);
  if (guestWishlist.items.length > 0) {
    const accountWishlist = getWishlist(accountId);
    const mergedIds = new Set(accountWishlist.items.map((i) => i.productId));
    const combined = [...accountWishlist.items, ...guestWishlist.items.filter((i) => !mergedIds.has(i.productId))];
    setWishlist({ ownerId: accountId, items: combined, updatedAt: new Date().toISOString() });
  }

  clearCart(GUEST_OWNER_ID);
  setWishlist({ ownerId: GUEST_OWNER_ID, items: [], updatedAt: new Date().toISOString() });
}
