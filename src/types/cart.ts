// Storefront — Cart & Wishlist types. Independent of the CRM's Order.items
// (types/order.ts, free-text item names only). Stores are keyed by
// `ownerId` — the literal string "guest" or a CustomerAccount["id"] — so a
// guest cart/wishlist can be merged into an account's on login (see
// lib/shop/cart-engine.ts mergeIntoAccount()). Never imports from or writes
// to data/bud-guardian/**, lib/staff/**, or components/staff/**.

export type CartItem = {
  productId: string;
  quantity: number;
  addedAt: string;
};

export type Cart = {
  ownerId: string;
  items: CartItem[];
  updatedAt: string;
};

export type WishlistItem = {
  productId: string;
  addedAt: string;
};

export type Wishlist = {
  ownerId: string;
  items: WishlistItem[];
  updatedAt: string;
};
