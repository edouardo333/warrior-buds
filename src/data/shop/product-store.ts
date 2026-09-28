// Storefront — mock product catalog store. Same shape as
// data/bud-guardian/inventory-store.ts: a module-level singleton seeded
// from STOREFRONT_PRODUCTS, persisted to localStorage, mirrored across tabs
// via the `storage` event, exposing single mutation primitives so state can
// never drift. Purely local and simulated — no backend, no network call.
// Never imports from or writes to data/bud-guardian/**, lib/staff/**, or
// components/staff/**.

import type { ProductReview, StorefrontProduct } from "@/types/product";
import { STOREFRONT_PRODUCTS } from "./products";

// v2 — bumped when the fake demo catalog was replaced with the real
// Warrior Buds catalog, so browsers that already persisted the old
// 18-product demo seed reseed from the new STOREFRONT_PRODUCTS instead of
// reading stale fake products back out of localStorage.
//
// v3 — bumped when Whole Melts was replaced by Pack Man in the catalog, so
// browsers holding the v2 payload (which still contains the removed Whole
// Melts product and lacks Pack Man) reseed from the current STOREFRONT_PRODUCTS.
//
// v4 — bumped when Pack Man was reclassified from "disposable" to Wax Pens
// (productType + copy change), so a persisted v3 payload doesn't keep the old
// classification/wording.
//
// v5 — bumped when the Pack Man / STLTH / cigarettes price tiers were cut
// (Pack Man now Telegram-order only), so a persisted v4 payload doesn't keep
// the removed 1/2-unit and 1/5-bag tiers.
//
// v6 — bumped when the four original accessories went from "price on request"
// to their $3.50 price, so a persisted v5 payload doesn't keep them unpriced.
//
// v7 — bumped when Maserati Hash's price changed ($1,000 → $750 / 1 lb), so a
// persisted v6 payload doesn't keep the stale Maserati pricing.
const PRODUCTS_KEY = "wb-shop-products-v7";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadJson<T>(key: string, fallback: () => T): T {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // Corrupt/unavailable storage — fall back to the seed below.
    }
  }
  return fallback();
}

// Products added to the seed after a browser already persisted PRODUCTS_KEY
// (e.g. STLTH TITAN MAX 50K, appended last so existing ids never shift) are
// merged in by id rather than by bumping the key, so the persisted copy —
// including any customer-written reviews — is kept, not wiped and reseeded.
// Products already persisted are left exactly as stored.
//
// The reverse also applies: products removed from the seed (their ids are
// retired in products.ts, never reused) are dropped from the persisted copy,
// so a stale localStorage payload can never bring a removed product back.
//
// Image URLs are always taken from the seed, never the persisted copy: the
// product photos moved from .png to .webp and the old files were deleted, so
// a stored payload's image URLs would otherwise 404. The Telegram contact flag
// is display-only config, so it is likewise always read from the seed.
function withNewSeedProducts(stored: StorefrontProduct[]): StorefrontProduct[] {
  if (!Array.isArray(stored)) return STOREFRONT_PRODUCTS.map((p) => ({ ...p }));
  const seedById = new Map(STOREFRONT_PRODUCTS.map((p) => [p.id, p]));
  const current = stored.flatMap((p) => {
    const seed = seedById.get(p.id);
    return seed ? [{ ...p, images: seed.images, detailImages: seed.detailImages, telegramContact: seed.telegramContact }] : [];
  });
  const known = new Set(current.map((p) => p.id));
  const missing = STOREFRONT_PRODUCTS.filter((p) => !known.has(p.id)).map((p) => ({ ...p }));
  return [...current, ...missing];
}

// Nothing persisted yet (the common case — only a review or checkout ever
// writes PRODUCTS_KEY): use the seed array itself. Every mutation below builds
// new arrays/objects and never mutates in place, so sharing it is safe — and
// it keeps the client snapshot referentially identical to the server snapshot
// (product-actions.ts's getServerProducts), so hydration doesn't re-render the
// whole catalog a second time just because the array was copied.
let products: StorefrontProduct[] = (() => {
  const stored = loadJson<StorefrontProduct[] | null>(PRODUCTS_KEY, () => null);
  return stored ? withNewSeedProducts(stored) : STOREFRONT_PRODUCTS;
})();

const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch {
    // Storage full/unavailable (private browsing) — in-memory state still works.
  }
}

function notify(): void {
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== PRODUCTS_KEY) return;
    products = withNewSeedProducts(loadJson(PRODUCTS_KEY, () => products));
    notify();
  });
}

export function subscribeProducts(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProducts(): StorefrontProduct[] {
  return products;
}

export function findProductById(id: string): StorefrontProduct | undefined {
  return products.find((p) => p.id === id);
}

export function findProductBySlug(slug: string): StorefrontProduct | undefined {
  return products.find((p) => p.slug === slug);
}

export function addReview(productId: string, input: Omit<ProductReview, "id" | "createdAt">): ProductReview | undefined {
  const review: ProductReview = { ...input, id: uid("rev"), createdAt: new Date().toISOString() };
  let added: ProductReview | undefined;
  products = products.map((p) => {
    if (p.id !== productId) return p;
    added = review;
    return { ...p, reviews: [review, ...p.reviews] };
  });
  if (added) {
    persist();
    notify();
  }
  return added;
}

// Single mutation primitive for stock changes triggered by a completed
// checkout — keeps `stock` from ever drifting from what was actually
// purchased. Clamped at 0 (never negative). A `null` stock (no verified
// inventory count) is left untouched rather than turned into a fake number.
export function decrementStock(productId: string, quantity: number): void {
  products = products.map((p) => (p.id === productId && p.stock !== null ? { ...p, stock: Math.max(0, p.stock - quantity) } : p));
  persist();
  notify();
}
