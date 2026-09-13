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
  // Present only when this line is a format-priced product (types/product.ts's
  // ProductFormat — e.g. regulated cannabis flower sold by weight): the exact
  // format LABEL the shopper picked (e.g. "14g"), never a price. The price is
  // always re-read live from the product's own formats[] by this label (see
  // lib/shop/cart-engine.ts computeCartLines) — the same "never persist a
  // derived price" discipline the quantity-tier model already applies to
  // bulkPricing — so a later catalog price change is reflected automatically
  // and this field can never itself go stale. Together with productId, this
  // label is the cart line's IDENTITY: two entries with the same productId
  // but a different selectedFormatLabel are separate lines (never merged);
  // the same productId + the same label merge quantities like an ordinary
  // item. Undefined for every ordinary (non-format-priced) product — a
  // pre-existing persisted cart entry simply lacks this field, which is
  // exactly the "no format" case, so no migration is needed for it.
  selectedFormatLabel?: string;
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
