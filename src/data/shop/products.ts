// Storefront — real product catalog. As of the Phase 1 fake-data removal,
// this holds only client-verified Warrior Buds products (see AGENTS.md /
// the migration ticket for the removal + first-product spec). It is fully
// independent of the empty CRM BUD_GUARDIAN_PRODUCTS fixture
// (data/bud-guardian/products.ts, which Bud Guardian's chat must never
// invent from) and the staff Inventory module's InventoryProduct
// (types/inventory.ts). Never imported by anything under lib/staff/**,
// components/staff/**, or lib/bud-guardian/**.

import type { StorefrontProduct } from "@/types/product";

let sequence = 1000;
function nextId(): string {
  sequence += 1;
  return `PROD-${sequence}`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function product(input: Omit<StorefrontProduct, "id" | "createdAt"> & { createdAtDaysAgo?: number }): StorefrontProduct {
  const { createdAtDaysAgo, ...rest } = input;
  return { id: nextId(), createdAt: daysAgo(createdAtDaysAgo ?? 0), ...rest };
}

export const STOREFRONT_PRODUCTS: StorefrontProduct[] = [
  // Pack Man 2G Liquid Diamond Pens — replaces the former Whole Melts wax pen
  // in the vapes slot (same category family). Client-supplied facts only:
  // Liquid Diamonds + Live Resin, all-in-one wax pen (storefront type: Wax Pens, NOT Disposables), 2G, multiple
  // flavours available, plus the exact 8-tier price sheet below. THC/CBD %,
  // strain, terpenes, effects, flavour names, stock, and lab results were not
  // provided — left null/empty rather than guessed. `brand` is unset (no
  // separate manufacturer name was supplied), so cards/detail fall back to
  // the category label for the eyebrow.
  product({
    slug: "pack-man-2g-liquid-diamond-pens",
    name: "Pack Man 2G Liquid Diamond Pens",
    category: "vapes",
    productType: "wax-pen",
    strain: null,
    thcPercent: null,
    cbdPercent: null,
    // The 2G size is a client-verified spec value for this product.
    weightGrams: 2,
    // Base per-unit price — used only for card/sort display and for
    // quantities that don't exactly match a bulkPricing tier below.
    price: 40,
    salePrice: null,
    images: [
      {
        url: "/images/shop/products/pack-man-2g-liquid-diamond-pens.jpg",
        alt: "Pack Man 2G Liquid Diamond Pens all-in-one wax pen vape",
      },
    ],
    // Default/fallback copy (English) — read by non-localizing consumers
    // (search, Bud Guardian, page metadata). See shortDescriptionLocalized/
    // descriptionLocalized below for what the storefront UI actually shows.
    shortDescription: "Pack Man 2G all-in-one wax pen vaporizer featuring Liquid Diamonds + Live Resin. Multiple flavours available.",
    description: "Pack Man 2G all-in-one wax pen vaporizer featuring Liquid Diamonds + Live Resin. Multiple flavours available.",
    shortDescriptionLocalized: {
      fr: "Wax pen tout-en-un Pack Man 2G avec Liquid Diamonds + Live Resin. Plusieurs saveurs disponibles.",
      en: "Pack Man 2G all-in-one wax pen vaporizer featuring Liquid Diamonds + Live Resin. Multiple flavours available.",
    },
    descriptionLocalized: {
      fr: "Wax pen tout-en-un Pack Man 2G avec Liquid Diamonds + Live Resin. Plusieurs saveurs disponibles.",
      en: "Pack Man 2G all-in-one wax pen vaporizer featuring Liquid Diamonds + Live Resin. Multiple flavours available.",
    },
    // No verified inventory count from the client — null rather than an
    // invented number. Treated as "no known cap" throughout (see
    // product-engine.ts's getAvailableStock/getStockStatus); the product
    // stays purchasable, including at every bulk tier up to 300 units,
    // without displaying any stock figure.
    stock: null,
    badges: [],
    reviews: [],
    // Exact client-supplied TOTAL prices per quantity (not per-unit prices) —
    // resolved by getProductPriceForQuantity on an exact quantity match only.
    // Any quantity between tiers is priced at the base `price` × quantity;
    // no intermediate tier is interpolated or invented.
    bulkPricing: [
      { quantity: 1, price: 40 },
      { quantity: 2, price: 70 },
      { quantity: 10, price: 300 },
      { quantity: 25, price: 550 },
      { quantity: 50, price: 900 },
      { quantity: 100, price: 1800 },
      { quantity: 200, price: 3500 },
      { quantity: 300, price: 4800 },
    ],
    bulkUnitLabel: {
      singular: { fr: "stylo", en: "pen" },
      plural: { fr: "stylos", en: "pens" },
    },
  }),

  // Three client-supplied real cannabis flower products (catalog integration
  // pass — see the accompanying task report). Format-priced, not quantity-
  // priced: `formats` holds the exact client-verified size/price sheet, and
  // `price` below is only the lowest (3.5g) format price, used for card/sort
  // display ("starting from") — never an addable per-unit price. These never
  // run through bulkPricing/getProductPriceForQuantity, and never expose Add
  // to Cart/wishlist controls (see isFormatPriced in product-engine.ts) —
  // informational listings only, no new checkout/payment flow.
  //
  // `brand` has no client-supplied manufacturer name distinct from the
  // product name itself, so it's left unset rather than invented; `grade`
  // instead carries the client-supplied quality grade (already part of the
  // official title, e.g. "AAA"/"AAA+") — see types/product.ts's `grade` for
  // why this is a distinct field, not the brand. ProductCard/ProductDetail
  // fall back to `grade` for the eyebrow label a real brand would fill.
  //
  // THC/CBD percent, stock, ratings/reviews, terpenes, effects, and
  // genetics/origin were not provided — left null/empty rather than guessed
  // (never rendered as a result, see product-engine.ts/ProductDetail.tsx).
  product({
    slug: "blueberry-aaa",
    name: "Blueberry AAA",
    grade: "AAA",
    category: "flower",
    strain: "indica",
    thcPercent: null,
    cbdPercent: null,
    weightGrams: null,
    price: 10,
    salePrice: null,
    images: [{ url: "/images/shop/products/blueberry-aaa.jpg", alt: "Blueberry AAA cannabis flower" }],
    shortDescription: "Blueberry AAA cannabis flower. Available in multiple sizes.",
    description: "Blueberry AAA cannabis flower. Available in multiple sizes.",
    shortDescriptionLocalized: {
      fr: "Fleur de cannabis Blueberry AAA. Disponible en plusieurs formats.",
      en: "Blueberry AAA cannabis flower. Available in multiple sizes.",
    },
    descriptionLocalized: {
      fr: "Fleur de cannabis Blueberry AAA. Disponible en plusieurs formats.",
      en: "Blueberry AAA cannabis flower. Available in multiple sizes.",
    },
    stock: null,
    badges: [],
    reviews: [],
    formats: [
      { label: "3.5g", price: 10 },
      { label: "7g", price: 20 },
      { label: "14g", price: 30 },
      { label: "1 oz", price: 50 },
      { label: "QP", price: 160 },
      { label: "HP", price: 250 },
      { label: "1 lb", price: 450 },
      { label: "2 lb", price: 800 },
    ],
  }),
  product({
    slug: "fruit-punch-aaa-plus",
    name: "Fruit Punch AAA+",
    grade: "AAA+",
    category: "flower",
    strain: "hybrid",
    thcPercent: null,
    cbdPercent: null,
    weightGrams: null,
    price: 20,
    salePrice: null,
    images: [{ url: "/images/shop/products/fruit-punch-aaa-plus.jpg", alt: "Fruit Punch AAA+ cannabis flower" }],
    shortDescription: "Fruit Punch AAA+ cannabis flower. Available in multiple sizes.",
    description: "Fruit Punch AAA+ cannabis flower. Available in multiple sizes.",
    shortDescriptionLocalized: {
      fr: "Fleur de cannabis Fruit Punch AAA+. Disponible en plusieurs formats.",
      en: "Fruit Punch AAA+ cannabis flower. Available in multiple sizes.",
    },
    descriptionLocalized: {
      fr: "Fleur de cannabis Fruit Punch AAA+. Disponible en plusieurs formats.",
      en: "Fruit Punch AAA+ cannabis flower. Available in multiple sizes.",
    },
    stock: null,
    badges: [],
    reviews: [],
    // No verified 2 lb price for this product — not generated/interpolated.
    formats: [
      { label: "3.5g", price: 20 },
      { label: "7g", price: 30 },
      { label: "14g", price: 50 },
      { label: "1 oz", price: 80 },
      { label: "QP", price: 250 },
      { label: "HP", price: 350 },
      { label: "1 lb", price: 650 },
    ],
  }),
  product({
    slug: "nutter-butter-aaa-plus",
    name: "Nutter Butter AAA+",
    grade: "AAA+",
    category: "flower",
    strain: "hybrid",
    thcPercent: null,
    cbdPercent: null,
    weightGrams: null,
    price: 20,
    salePrice: null,
    images: [{ url: "/images/shop/products/nutter-butter-aaa-plus.jpg", alt: "Nutter Butter AAA+ cannabis flower" }],
    shortDescription: "Nutter Butter AAA+ cannabis flower. Available in multiple sizes.",
    description: "Nutter Butter AAA+ cannabis flower. Available in multiple sizes.",
    shortDescriptionLocalized: {
      fr: "Fleur de cannabis Nutter Butter AAA+. Disponible en plusieurs formats.",
      en: "Nutter Butter AAA+ cannabis flower. Available in multiple sizes.",
    },
    descriptionLocalized: {
      fr: "Fleur de cannabis Nutter Butter AAA+. Disponible en plusieurs formats.",
      en: "Nutter Butter AAA+ cannabis flower. Available in multiple sizes.",
    },
    stock: null,
    badges: [],
    reviews: [],
    // No verified 2 lb price for this product — not generated/interpolated.
    formats: [
      { label: "3.5g", price: 20 },
      { label: "7g", price: 35 },
      { label: "14g", price: 60 },
      { label: "1 oz", price: 100 },
      { label: "QP", price: 280 },
      { label: "HP", price: 400 },
      { label: "1 lb", price: 700 },
    ],
  }),

  // Client-supplied real product — Discount Tips Canadian Blend cigarettes
  // (catalog integration pass, see AGENTS.md / the accompanying task
  // report). Format-priced by bag-quantity tier, same convention as the
  // flower products above (`formats`, not `bulkPricing`: these are exact
  // client-verified tiers, not a per-unit multiplier — 1/5/10/25/50 bags
  // only, never interpolated). `inStoreOnly: true` additionally keeps this
  // product fully non-transactional (ProductDetail hides the quantity
  // stepper/Add to Cart/wishlist entirely and shows the in-store notice
  // instead — see types/product.ts's inStoreOnly) since, unlike flower,
  // this must never be addable to cart even once a format is selected.
  //
  // Nicotine amount, cigarette count per bag, manufacturer details beyond
  // the product name, stock, ratings/reviews, and SKU were not provided —
  // left unset/null/empty rather than guessed, same rule as the flower
  // products above.
  product({
    slug: "discount-cigarettes",
    name: "Discount Cigarettes",
    category: "cigarettes",
    strain: null,
    thcPercent: null,
    cbdPercent: null,
    weightGrams: null,
    price: 25,
    salePrice: null,
    images: [{ url: "/images/shop/products/cigarettes.jpg", alt: "Discount Tips Canadian Blend cigarette bags" }],
    shortDescription: "Discount cigarettes available in multiple quantity formats.",
    description: "Discount cigarettes available in multiple quantity formats.",
    shortDescriptionLocalized: {
      fr: "Cigarettes Discount disponibles en plusieurs formats de quantité.",
      en: "Discount cigarettes available in multiple quantity formats.",
    },
    descriptionLocalized: {
      fr: "Cigarettes Discount disponibles en plusieurs formats de quantité.",
      en: "Discount cigarettes available in multiple quantity formats.",
    },
    stock: null,
    badges: [],
    reviews: [],
    inStoreOnly: true,
    // Client-verified exact tiers only (1/5/10/25/50 bags) — never
    // interpolated (e.g. no invented "2 bags"/"20 bags"). labelLocalized
    // carries the client-provided FR wording ("sac"/"sacs") since it
    // genuinely differs from the EN "bag"/"bags" wording, unlike the
    // flower products' unit-abbreviation labels above.
    formats: [
      { label: "1 bag", labelLocalized: { fr: "1 sac", en: "1 bag" }, price: 25 },
      { label: "5 bags", labelLocalized: { fr: "5 sacs", en: "5 bags" }, price: 120 },
      { label: "10 bags", labelLocalized: { fr: "10 sacs", en: "10 bags" }, price: 200 },
      { label: "25 bags", labelLocalized: { fr: "25 sacs", en: "25 bags" }, price: 350 },
      { label: "50 bags (1 case)", labelLocalized: { fr: "50 sacs (1 caisse)", en: "50 bags (1 case)" }, price: 600 },
    ],
  }),
];
