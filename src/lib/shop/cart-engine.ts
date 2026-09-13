// Storefront — cart & wishlist business rules: pure functions over
// data/shop/cart-store.ts and read-only product lookups from
// data/shop/product-store.ts (for pricing/joins). Never imports from or
// writes to data/bud-guardian/**, lib/staff/**, or components/staff/**.

import { GUEST_OWNER_ID, clearCart, getCart, getWishlist, setCart, setWishlist } from "@/data/shop/cart-store";
import { findProductById, getProducts } from "@/data/shop/product-store";
import type { Cart, CartItem, Wishlist } from "@/types/cart";
import type { ProductFormat, StorefrontProduct } from "@/types/product";
import { getProductPriceForQuantity } from "./product-engine";

export type CartLine = {
  product: StorefrontProduct;
  quantity: number;
  lineTotal: number;
  // Present only for a format-priced line (types/cart.ts's
  // selectedFormatLabel) — the actual ProductFormat object read live from
  // the product's own formats[], for display (label) and lineTotal (price)
  // alike. Never present for an ordinary quantity-tier line.
  selectedFormat?: ProductFormat;
};

// Two cart items are the "same line" when productId AND selectedFormatLabel
// match (requirement: productId + selectedFormat is the cart's line
// identity) — undefined/undefined (two ordinary items of the same product)
// counts as a match, same as today. Never compares by productId alone once
// either side carries a format label.
function isSameLine(a: Pick<CartItem, "productId" | "selectedFormatLabel">, b: Pick<CartItem, "productId" | "selectedFormatLabel">): boolean {
  return a.productId === b.productId && (a.selectedFormatLabel ?? null) === (b.selectedFormatLabel ?? null);
}

const SHIPPING_FLAT_RATE = 9.95;
// Announcement bar advertises "FREE SHIPPING ON ORDERS $100+" — this is the
// single source of truth that promise resolves to; exported so promo/UI
// copy (lib/shop/promo-engine.ts, AnnouncementBar) can reference the same
// number instead of hardcoding it a second time.
export const FREE_SHIPPING_THRESHOLD = 100;
// Warrior Buds storefront rule: no tax is charged to the customer. `tax` is
// kept on CartTotals (rather than removed) because ShopOrder/UI/Bud Guardian
// all read it as part of the same totals shape — it's always 0 here so every
// consumer of getCartTotals()/getCartLines() stays correct for free instead
// of needing its own "tax doesn't exist" special case.
const TAX_RATE = 0;

// Pure variant taking already-fetched store snapshots — used by
// lib/shop/cart-actions.ts so a useMemo can list `cart`/`products` as real
// dependencies (they're actually read here) instead of opaque re-fetches.
//
// Line totals go through the shared getProductPriceForQuantity helper (not
// a naive price × quantity here) so an exact verified bulk tier
// (data/shop/products.ts's bulkPricing) is never overridden. Cart items only
// ever store productId + quantity (types/cart.ts) — the tier is re-derived
// live from the product's own bulkPricing every time, which is what makes
// it survive navigation/refresh/locale switches for free: the product's
// identity and pricing data never change with locale.
export function computeCartLines(cart: Cart, products: StorefrontProduct[]): CartLine[] {
  const lines: CartLine[] = [];
  for (const item of cart.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;

    if (item.selectedFormatLabel) {
      // Format-priced line: re-read the format object live from the
      // product's own formats[] by label — same discipline as the
      // quantity-tier branch below, never a price stored on the cart item
      // itself. If the catalog no longer has this label (a format was
      // renamed/removed — the "legacy persisted cart entry" case), drop the
      // line rather than inventing a price for a format that no longer
      // exists, same as the product-not-found case just above.
      const format = product.formats?.find((f) => f.label === item.selectedFormatLabel);
      if (!format) continue;
      lines.push({
        product,
        quantity: item.quantity,
        selectedFormat: format,
        lineTotal: Math.round(format.price * item.quantity * 100) / 100,
      });
      continue;
    }

    // Existing quantity-tier products are never routed through the
    // format-pricing branch above — unchanged from before.
    lines.push({ product, quantity: item.quantity, lineTotal: getProductPriceForQuantity(product, item.quantity) });
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

// `selectedFormatLabel` is omitted/undefined for every ordinary
// quantity-tier product — existing callers (ProductCard's quick-add, Bud
// Guardian's add-to-cart tool, wishlist's moveToCart) pass nothing and keep
// matching/merging by productId alone, unchanged from before. Only a
// format-priced product's Add to Cart passes it, and then it's required —
// see ProductDetail.tsx, which disables Add to Cart until a format is
// selected.
export function addToCart(ownerId: string, productId: string, quantity = 1, selectedFormatLabel?: string | null): void {
  const cart = getCart(ownerId);
  const incoming: Pick<CartItem, "productId" | "selectedFormatLabel"> = {
    productId,
    selectedFormatLabel: selectedFormatLabel ?? undefined,
  };
  const existing = cart.items.find((i) => isSameLine(i, incoming));
  const items: CartItem[] = existing
    ? cart.items.map((i) => (isSameLine(i, incoming) ? { ...i, quantity: i.quantity + quantity } : i))
    : [...cart.items, { productId, quantity, addedAt: new Date().toISOString(), selectedFormatLabel: selectedFormatLabel ?? undefined }];
  setCart({ ownerId, items, updatedAt: new Date().toISOString() });
}

export function updateCartQuantity(ownerId: string, productId: string, quantity: number, selectedFormatLabel?: string | null): void {
  const cart = getCart(ownerId);
  const target: Pick<CartItem, "productId" | "selectedFormatLabel"> = { productId, selectedFormatLabel: selectedFormatLabel ?? undefined };
  const items =
    quantity <= 0
      ? cart.items.filter((i) => !isSameLine(i, target))
      : cart.items.map((i) => (isSameLine(i, target) ? { ...i, quantity } : i));
  setCart({ ownerId, items, updatedAt: new Date().toISOString() });
}

export function removeFromCart(ownerId: string, productId: string, selectedFormatLabel?: string | null): void {
  updateCartQuantity(ownerId, productId, 0, selectedFormatLabel);
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
    // Keyed by productId + selectedFormatLabel, matching isSameLine's
    // identity rule, so two different formats of the same product merge
    // into two separate lines instead of colliding on productId alone.
    const merged = new Map<string, CartItem>();
    for (const item of [...accountCart.items, ...guestCart.items]) {
      const key = `${item.productId}::${item.selectedFormatLabel ?? ""}`;
      const existing = merged.get(key);
      merged.set(key, existing ? { ...existing, quantity: existing.quantity + item.quantity } : item);
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
