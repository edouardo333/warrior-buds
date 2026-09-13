// Storefront — Products page category taxonomy for the 2-level "Category"
// mega-dropdown filter. Deliberately separate from the flat ProductCategory
// enum (types/product.ts) and its CATEGORY_LABELS (product-engine.ts), which
// stay untouched so every existing product record, staff/inventory view,
// and Bud Guardian keyword map keeps working unchanged.
//
// Every node's `match` predicate is derived only from fields that already
// exist on StorefrontProduct (category, strain, grade, price, weightGrams,
// name, description) — never from data we don't have. The AAA/AAA+ grade
// nodes below match the structured `grade` field (never title-string
// parsing) now that verified flower products carry one. This taxonomy is
// still intentionally wider than the current verified real-product catalog
// (grading tiers like AAAA/AA, most concentrate subtypes, several
// edible/mushroom formats, etc. have no matching field or honest text
// signal today), so those leaf subcategories always return false and show 0
// products. That's expected, not a bug — subcategories are allowed to be
// empty and counts stay 100% dynamic from real catalog data. Never imports
// from or writes to data/bud-guardian/**, lib/staff/**, or
// components/staff/**.

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
        label: { en: "Budget Buds $39–$100", fr: "Buds économiques 39 $–100 $" },
        match: (p) => {
          if (p.category !== "flower") return false;
          const oz = pricePerOz(p);
          return oz !== null && oz >= 39 && oz <= 99;
        },
      },
      {
        id: "cannabis-craft",
        label: { en: "Craft Cannabis", fr: "Cannabis artisanal" },
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
        label: { en: "AAAA", fr: "AAAA" },
        match: never,
      },
      {
        id: "cannabis-aaa-plus",
        label: { en: "AAA+", fr: "AAA+" },
        // Exact grade match, never a prefix/substring match against "AAA" —
        // an AAA+ product must never be counted under the plain AAA node.
        match: (p) => p.category === "flower" && p.grade === "AAA+",
      },
      {
        id: "cannabis-aaa",
        label: { en: "AAA", fr: "AAA" },
        match: (p) => p.category === "flower" && p.grade === "AAA",
      },
      {
        id: "cannabis-aa",
        label: { en: "AA", fr: "AA" },
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
      { id: "concentrates-crumble", label: { en: "Crumble", fr: "Crumble" }, match: (p) => p.category === "concentrates" && /\bcrumble\b/.test(searchableText(p)) },
      { id: "concentrates-diamonds", label: { en: "Diamonds", fr: "Diamants" }, match: (p) => p.category === "concentrates" && /(thca|diamonds?)\b/.test(searchableText(p)) },
      { id: "concentrates-distillate", label: { en: "Distillate", fr: "Distillat" }, match: (p) => p.category === "concentrates" && /\bdistillate\b/.test(searchableText(p)) },
      { id: "concentrates-hash", label: { en: "Hash", fr: "Hash" }, match: (p) => p.category === "concentrates" && /\bhash\b/.test(searchableText(p)) },
      { id: "concentrates-kief", label: { en: "Kief", fr: "Kief" }, match: (p) => p.category === "concentrates" && /\bkief\b/.test(searchableText(p)) },
      { id: "concentrates-live-resin", label: { en: "Live Resin", fr: "Live Resin" }, match: (p) => p.category === "concentrates" && /live resin/.test(searchableText(p)) },
      { id: "concentrates-rosin", label: { en: "Rosin", fr: "Rosin" }, match: (p) => p.category === "concentrates" && /\brosin\b/.test(searchableText(p)) },
      { id: "concentrates-shatter", label: { en: "Shatter", fr: "Shatter" }, match: (p) => p.category === "concentrates" && /\bshatter\b/.test(searchableText(p)) },
      { id: "concentrates-sugar-wax", label: { en: "Sugar Wax", fr: "Sugar Wax" }, match: (p) => p.category === "concentrates" && /sugar wax/.test(searchableText(p)) },
      { id: "concentrates-terp-sauce", label: { en: "Terp Sauce", fr: "Terp Sauce" }, match: (p) => p.category === "concentrates" && /terp sauce/.test(searchableText(p)) },
      { id: "concentrates-wax", label: { en: "Wax", fr: "Wax" }, match: (p) => p.category === "concentrates" && /\bwax\b/.test(searchableText(p)) },
    ],
  },
  {
    id: "edibles",
    label: { en: "Edibles", fr: "Comestibles" },
    match: (p) => p.category === "edibles",
    children: [
      { id: "edibles-baked", label: { en: "Baked Edibles", fr: "Comestibles cuits au four" }, match: (p) => p.category === "edibles" && /(baked|cookie|brownie|cake)/.test(searchableText(p)) },
      { id: "edibles-candies", label: { en: "Candies", fr: "Bonbons" }, match: (p) => p.category === "edibles" && /(\bcandy\b|\bcandies\b|bonbon)/.test(searchableText(p)) },
      { id: "edibles-chocolates", label: { en: "Chocolates", fr: "Chocolats" }, match: (p) => p.category === "edibles" && /chocolate/.test(searchableText(p)) },
      { id: "edibles-gummies", label: { en: "Gummies", fr: "Gommes" }, match: (p) => p.category === "edibles" && /gumm(y|ies)/.test(searchableText(p)) },
      { id: "edibles-capsules", label: { en: "Capsules", fr: "Capsules" }, match: (p) => p.category === "edibles" && /capsule/.test(searchableText(p)) },
      { id: "edibles-drinks", label: { en: "Drinks", fr: "Boissons" }, match: (p) => p.category === "edibles" && /(drink|beverage|seltzer|soda)/.test(searchableText(p)) },
      { id: "edibles-syrups", label: { en: "Syrups", fr: "Sirops" }, match: (p) => p.category === "edibles" && /syrup/.test(searchableText(p)) },
      { id: "edibles-teas-cocoa", label: { en: "Teas / Cocoa", fr: "Thés / Cacao" }, match: (p) => p.category === "edibles" && /(\btea\b|\bteas\b|cocoa)/.test(searchableText(p)) },
    ],
  },
  {
    id: "accessories",
    label: { en: "Accessories", fr: "Accessoires" },
    match: (p) => p.category === "accessories",
    children: [
      {
        id: "accessories-papers",
        label: { en: "Papers", fr: "Papiers à rouler" },
        match: (p) => p.category === "accessories" && /(rolling paper|filter tip|\bpapers?\b)/.test(searchableText(p)),
      },
      {
        id: "accessories-grinders",
        label: { en: "Grinders", fr: "Broyeurs" },
        match: (p) => p.category === "accessories" && /grinder/.test(searchableText(p)),
      },
      {
        id: "accessories-vape-batteries",
        label: { en: "Vape Batteries", fr: "Piles pour vapoteuse" },
        match: (p) => p.category === "accessories" && /(vape battery|510[- ]thread battery|\bbatter(y|ies)\b)/.test(searchableText(p)),
      },
      {
        id: "accessories-smoking-accessories",
        label: { en: "Smoking Accessories", fr: "Accessoires de fumage" },
        match: (p) => p.category === "accessories" && /(\bpipe\b|\bbong\b|rolling tray|ashtray)/.test(searchableText(p)),
      },
    ],
  },
  {
    id: "vapes",
    label: { en: "Vapes", fr: "Vapoteuses" },
    match: (p) => p.category === "vapes",
    children: [
      {
        id: "vapes-cartridges",
        label: { en: "Cartridges", fr: "Cartouches" },
        match: (p) => p.category === "vapes" && /cartridge/.test(searchableText(p)),
      },
      {
        id: "vapes-disposables",
        label: { en: "Disposables", fr: "Vapoteuses jetables" },
        match: (p) => p.category === "vapes" && /disposable/.test(searchableText(p)),
      },
      {
        id: "vapes-wax-pens",
        label: { en: "Wax Pens", fr: "Wax Pens" },
        match: (p) => p.category === "vapes" && /wax pen/.test(searchableText(p)),
      },
    ],
  },
  {
    id: "cbd",
    label: { en: "CBD", fr: "CBD" },
    match: (p) => p.category === "cbd",
    children: [
      {
        id: "cbd-oils-tinctures",
        label: { en: "Oils & Tinctures", fr: "Huiles et teintures" },
        match: (p) => p.category === "cbd" && /(\boil\b|tincture|dropper)/.test(searchableText(p)),
      },
      {
        id: "cbd-capsules-softgels",
        label: { en: "Capsules & Softgels", fr: "Capsules et gélules" },
        match: (p) => p.category === "cbd" && /(capsule|softgel)/.test(searchableText(p)),
      },
    ],
  },
  {
    id: "topicals",
    label: { en: "Topicals", fr: "Topiques" },
    match: (p) => p.category === "topicals",
    children: [
      {
        id: "topicals-balms-salves",
        label: { en: "Balms & Salves", fr: "Baumes et onguents" },
        match: (p) => p.category === "topicals" && /(balm|salve)/.test(searchableText(p)),
      },
      {
        id: "topicals-creams-lotions",
        label: { en: "Creams & Lotions", fr: "Crèmes et lotions" },
        match: (p) => p.category === "topicals" && /(cream|lotion)/.test(searchableText(p)),
      },
    ],
  },
  {
    id: "mushrooms",
    label: { en: "Mushrooms", fr: "Champignons" },
    match: (p) => p.category === "mushrooms",
    children: [
      {
        id: "mushrooms-capsules",
        label: { en: "Capsules", fr: "Capsules" },
        match: (p) => p.category === "mushrooms" && /capsule/.test(searchableText(p)),
      },
      {
        id: "mushrooms-dried",
        label: { en: "Dried Mushrooms", fr: "Champignons séchés" },
        match: (p) => p.category === "mushrooms" && /(dried|powder)/.test(searchableText(p)),
      },
      {
        id: "mushrooms-drinks",
        label: { en: "Drinks", fr: "Boissons" },
        match: (p) => p.category === "mushrooms" && /(drink|beverage)/.test(searchableText(p)),
      },
      {
        id: "mushrooms-edibles",
        label: { en: "Edibles", fr: "Comestibles" },
        match: (p) => p.category === "mushrooms" && /(gumm|chocolate|\bcandy\b|edible)/.test(searchableText(p)),
      },
    ],
  },
  {
    // No verified cigarette products exist in the catalog yet — this node
    // deliberately has no children and always counts/filters to 0 real
    // products, never a fabricated one. It exists so the Products page
    // filter and the homepage category card have a correct destination to
    // link to (see Categories.tsx's cigarettes entry).
    id: "cigarettes",
    label: { en: "Cigarettes", fr: "Cigarettes" },
    match: (p) => p.category === "cigarettes",
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
