// Storefront — mock product catalog store. Same shape as
// data/bud-guardian/inventory-store.ts: a module-level singleton seeded
// from STOREFRONT_PRODUCTS, persisted to localStorage, mirrored across tabs
// via the `storage` event, exposing single mutation primitives so state can
// never drift. Purely local and simulated — no backend, no network call.
// Never imports from or writes to data/bud-guardian/**, lib/staff/**, or
// components/staff/**.

import type { ProductReview, StorefrontProduct } from "@/types/product";
import { STOREFRONT_PRODUCTS } from "./products";

const PRODUCTS_KEY = "wb-shop-products-v1";

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

let products: StorefrontProduct[] = loadJson(PRODUCTS_KEY, () => STOREFRONT_PRODUCTS.map((p) => ({ ...p })));

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
    products = loadJson(PRODUCTS_KEY, () => products);
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
// purchased. Clamped at 0 (never negative).
export function decrementStock(productId: string, quantity: number): void {
  products = products.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p));
  persist();
  notify();
}
