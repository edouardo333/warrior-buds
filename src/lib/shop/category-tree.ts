// Storefront — Products page category taxonomy for the 2-level "Category"
// mega-dropdown filter. Deliberately separate from the flat ProductCategory
// enum (types/product.ts) and its CATEGORY_LABELS (product-engine.ts), which
// stay untouched so every existing product record, staff/inventory view,
// and Bud Guardian keyword map keeps working unchanged.
//
// Every node's `match` predicate is derived only from fields that already
// exist on StorefrontProduct (category, strain, price, weightGrams, name,
// description) — never from data we don't have. Several leaf subcategories
// (grading tiers like AAAA/AAA/AA, "Craft Cannabis Flowers", "Shake / Trim",
// most concentrate/accessory subtypes) have no matching field or honest text
// signal in the current 18-product seed, so their `match` always returns
// false today. That's expected, not a bug: the taxonomy is intentionally
// wider than the current catalog, and those nodes simply show 0 products
// until real inventory in that subtype exists. Never imports from or writes
// to data/bud-guardian/**, lib/staff/**, or components/staff/**.

import type { Locale } from "@/lib/i18n/types";
import type { StorefrontProduct } from "@/types/product";

export type CategoryNode = {
  id: string;
  label: Record<Locale, string>;
  match: (product: StorefrontProduct) => boolean;
  children?: CategoryNode[];
};

function searchableText(p: StorefrontProduct): string {
  return `${p.name} ${p.shortDescription} ${p.description}`.toLowerCase();
}

// Cannabis is conventionally sold/priced by the ounce even though this
// catalog stores price + weightGrams per unit — this converts the two
// existing fields into an oz price, it doesn't invent a new fact.
function pricePerOz(p: StorefrontProduct): number | null {
  if (!p.weightGrams || p.weightGrams <= 0) return null;
  return (p.price / p.weightGrams) * 28;
}

const never = () => false;

export const CATEGORY_TREE: CategoryNode[] = [
  {
    id: "cannabis",
    label: { en: "Cannabis", fr: "Cannabis" },
    match: (p) => p.category === "flower" || p.category === "pre-rolls",
    children: [
      {
        id: "cannabis-budget-buds",
        label: { en: "$39–99/oz (Budget Buds)", fr: "39 $–99 $/oz (Bourgeons économiques)" },
        match: (p) => {
          if (p.category !== "flower") return false;
          const oz = pricePerOz(p);
          return oz !== null && oz >= 39 && oz <= 99;
        },
      },
      {
        id: "cannabis-craft-flowers",
        label: { en: "Craft Cannabis Flowers", fr: "Fleurs de cannabis artisanales" },
        match: never,
      },
      {
        id: "cannabis-indica",
        label: { en: "Indica", fr: "Indica" },
        match: (p) => p.category === "flower" && p.strain === "indica",
      },
      {
        id: "cannabis-sativa",
        label: { en: "Sativa", fr: "Sativa" },
        match: (p) => p.category === "flower" && p.strain === "sativa",
      },
      {
        id: "cannabis-hybrid",
        label: { en: "Hybrid", fr: "Hybride" },
        match: (p) => p.category === "flower" && p.strain === "hybrid",
      },
      {
        id: "cannabis-aaaa",
        label: { en: "AAAA Weed", fr: "Weed AAAA" },
        match: never,
      },
      {
        id: "cannabis-aaa",
        label: { en: "AAA Weed", fr: "Weed AAA" },
        match: never,
      },
      {
        id: "cannabis-aa",
        label: { en: "AA Weed", fr: "Weed AA" },
        match: never,
      },
      {
        id: "cannabis-pre-rolls",
        label: { en: "Pre-Rolls", fr: "Pré-roulés" },
        match: (p) => p.category === "pre-rolls",
      },
      {
        id: "cannabis-shake-trim",
        label: { en: "Shake / Trim", fr: "Shake / Trim" },
        match: never,
      },
    ],
  },
  {
    id: "concentrates",
    label: { en: "Concentrates", fr: "Concentrés" },
    match: (p) => p.category === "concentrates",
    children: [
      { id: "concentrates-budder", label: { en: "Budder", fr: "Budder" }, match: (p) => p.category === "concentrates" && /\bbudder\b/.test(searchableText(p)) },
      { id: "concentrates-caviar", label: { en: "Caviar", fr: "Caviar" }, match: (p) => p.category === "concentrates" && /\bcaviar\b/.test(searchableText(p)) },
      { id: "concentrates-distillate", label: { en: "Distillate", fr: "Distillat" }, match: (p) => p.category === "concentrates" && /\bdistillate\b/.test(searchableText(p)) },
      { id: "concentrates-hash", label: { en: "Hash", fr: "Hash" }, match: (p) => p.category === "concentrates" && /\bhash\b/.test(searchableText(p)) },
      { id: "concentrates-kief", label: { en: "Kief", fr: "Kief" }, match: (p) => p.category === "concentrates" && /\bkief\b/.test(searchableText(p)) },
      { id: "concentrates-live-resin", label: { en: "Live Resin", fr: "Live Resin" }, match: (p) => p.category === "concentrates" && /live resin/.test(searchableText(p)) },
      { id: "concentrates-shatter", label: { en: "Shatter", fr: "Shatter" }, match: (p) => p.category === "concentrates" && /\bshatter\b/.test(searchableText(p)) },
      { id: "concentrates-thca-diamond", label: { en: "THCa Diamond", fr: "Diamant THCa" }, match: (p) => p.category === "concentrates" && /(thca|diamond)/.test(searchableText(p)) },
    ],
  },
  {
    id: "edibles",
    label: { en: "Edibles", fr: "Comestibles" },
    match: (p) => p.category === "edibles",
    children: [
      { id: "edibles-candy", label: { en: "Candy", fr: "Bonbons" }, match: (p) => p.category === "edibles" && /(candy|gumm(y|ies)|bonbon)/.test(searchableText(p)) },
      { id: "edibles-capsules", label: { en: "Capsules", fr: "Capsules" }, match: (p) => p.category === "edibles" && /capsule/.test(searchableText(p)) },
      { id: "edibles-chocolate-baked-goods", label: { en: "Chocolate & Baked Goods", fr: "Chocolat et pâtisseries" }, match: (p) => p.category === "edibles" && /(chocolate|cookie|brownie|baked)/.test(searchableText(p)) },
      { id: "edibles-tinctures-oils", label: { en: "Tinctures & Oils", fr: "Teintures et huiles" }, match: (p) => p.category === "edibles" && /(tincture|\boil\b)/.test(searchableText(p)) },
    ],
  },
  {
    id: "accessories",
    label: { en: "Accessories", fr: "Accessoires" },
    match: (p) => p.category === "accessories",
    children: [
      {
        id: "accessories-rolling-papers",
        label: { en: "Rolling Paper & Filter Tips", fr: "Papier à rouler et embouts filtres" },
        match: (p) => p.category === "accessories" && /(rolling paper|filter tip)/.test(searchableText(p)),
      },
      {
        id: "accessories-rolling-trays",
        label: { en: "Rolling Trays", fr: "Plateaux à rouler" },
        match: (p) => p.category === "accessories" && /rolling tray/.test(searchableText(p)),
      },
    ],
  },
  {
    id: "vapes",
    label: { en: "Vapes", fr: "Vapoteuses" },
    match: (p) => p.category === "vapes",
  },
  {
    id: "cbd",
    label: { en: "CBD", fr: "CBD" },
    match: (p) => p.category === "cbd",
  },
  {
    id: "topicals",
    label: { en: "Topicals", fr: "Topiques" },
    match: (p) => p.category === "topicals",
  },
  {
    id: "mushrooms",
    label: { en: "Mushrooms", fr: "Champignons" },
    match: (p) => p.category === "mushrooms",
  },
];

export function findCategoryNode(id: string, nodes: CategoryNode[] = CATEGORY_TREE): CategoryNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findCategoryNode(id, node.children);
      if (found) return found;
    }
  }
  return undefined;
}

export function getNodeLabel(node: CategoryNode, locale: Locale): string {
  return node.label[locale];
}

export function countNodeMatches(node: CategoryNode, products: StorefrontProduct[]): number {
  return products.reduce((count, p) => (node.match(p) ? count + 1 : count), 0);
}
