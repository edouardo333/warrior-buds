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

  // STLTH TITAN MAX 50K — client-supplied product sheet (catalog integration
  // pass). Append-only array: product ids are assigned by
  // position (nextId above), so appending keeps every existing product id —
  // and therefore every persisted cart/wishlist line — unchanged.
  //
  // ONE product with 25 selectable flavours in four families (flavourGroups),
  // not 25 products. Supported facts only, all read off the supplied sheet:
  // 50,000 puffs, smart display, 20 mL e-liquid, USB-C rechargeable, and the
  // packaging's nicotine warning. No purchasable price was supplied, so
  // `priceOnRequest` keeps this an informational listing (no Add to Cart/
  // wishlist — see types/product.ts's priceOnRequest); the client's price list
  // is shown display-only through `infoPricing`. `price: 0` is only a
  // placeholder that is never displayed or compared. Nicotine strength, puff-count claims
  // beyond the headline, battery capacity, stock and reviews were not
  // provided — left null/empty rather than guessed. Storefront type:
  // Disposables (productType), never Wax Pens/flower/strain/grade.
  product({
    slug: "stlth-titan-max-50k",
    name: "STLTH TITAN MAX 50K",
    brand: "STLTH",
    category: "vapes",
    productType: "disposable",
    strain: null,
    thcPercent: null,
    cbdPercent: null,
    weightGrams: null,
    price: 0,
    salePrice: null,
    priceOnRequest: true,
    // Client-supplied price list — displayed only (types/product.ts's
    // infoPricing); no cart/checkout tier logic is attached to it.
    infoPricing: [
      { quantity: 1, price: 45 },
      { quantity: 2, price: 80 },
      { quantity: 10, price: 320 },
      { quantity: 25, price: 700 },
    ],
    images: [
      {
        url: "/images/shop/products/stlth-titan-max-50k-puffs.jpg",
        alt: "STLTH TITAN MAX 50K — 50,000 puffs, smart display, 20 mL e-liquid, USB-C rechargeable — Fruit, Fruit + Ice, Mint and Tobacco flavours",
        portrait: true,
      },
    ],
    shortDescription:
      "STLTH TITAN MAX 50K — 50,000 puffs, smart display, 20 mL e-liquid and USB-C recharging. Available in 25 flavours across Fruit, Fruit + Ice, Mint and Tobacco.",
    description:
      "STLTH TITAN MAX 50K — 50,000 puffs, smart display, 20 mL e-liquid and USB-C recharging. Available in 25 flavours across Fruit, Fruit + Ice, Mint and Tobacco.",
    shortDescriptionLocalized: {
      fr: "STLTH TITAN MAX 50K — 50 000 bouffées, écran intelligent, 20 mL d'e-liquide et recharge USB-C. Offert en 25 saveurs : Fruit, Fruit + glace, Menthe et Tabac.",
      en: "STLTH TITAN MAX 50K — 50,000 puffs, smart display, 20 mL e-liquid and USB-C recharging. Available in 25 flavours across Fruit, Fruit + Ice, Mint and Tobacco.",
    },
    descriptionLocalized: {
      fr: "STLTH TITAN MAX 50K — 50 000 bouffées, écran intelligent, 20 mL d'e-liquide et recharge USB-C. Offert en 25 saveurs : Fruit, Fruit + glace, Menthe et Tabac.",
      en: "STLTH TITAN MAX 50K — 50,000 puffs, smart display, 20 mL e-liquid and USB-C recharging. Available in 25 flavours across Fruit, Fruit + Ice, Mint and Tobacco.",
    },
    stock: null,
    badges: [],
    reviews: [],
    specs: [
      { key: "puffs", label: { fr: "Bouffées", en: "Puffs" }, value: { fr: "50 000", en: "50,000" } },
      { key: "display", label: { fr: "Écran", en: "Display" }, value: { fr: "Écran intelligent", en: "Smart Display" } },
      { key: "e-liquid", label: { fr: "E-liquide", en: "E-Liquid" }, value: { fr: "20 mL", en: "20 mL" } },
      { key: "charging", label: { fr: "Recharge", en: "Charging" }, value: { fr: "Rechargeable USB-C", en: "USB-C Rechargeable" } },
    ],
    // Printed on the product packaging (EN + FR, Health Canada).
    warning: {
      fr: "AVERTISSEMENT : La nicotine crée une forte dépendance.",
      en: "WARNING: Nicotine is highly addictive.",
    },
    flavourGroups: [
      { id: "fruit", label: { fr: "Fruit", en: "Fruit" }, flavours: ["Blue Razz", "Juicy Peach"] },
      {
        id: "fruit-ice",
        label: { fr: "Fruit + glace", en: "Fruit + Ice" },
        flavours: [
          "Apple Kiwi Ice",
          "Banana Ice",
          "Blue Peach Ice",
          "Cherry Classic Ice",
          "Cranberry Pom Ice",
          "Green Apple Ice",
          "Honeydew Ice",
          "Juicy Grapefruit Ice",
          "Juicy Peach Ice",
          "Peach White Grape Ice",
          "Punch Ice",
          "Quad Berry Ice",
          "Razz Currant Ice",
          "Sour Blue Razz Ice",
          "Strawberry Guava Ice",
          "Strawberry Kiwi Ice",
          "Strawnana Orange Ice",
          "Tropical Mango Ice",
          "White Grape Ice",
          "White Grape Melon Ice",
        ],
      },
      { id: "mint", label: { fr: "Menthe", en: "Mint" }, flavours: ["Smooth Mint", "Spearmint"] },
      { id: "tobacco", label: { fr: "Tabac", en: "Tobacco" }, flavours: ["Smooth Tobacco"] },
    ],
  }),

  // Heavy Hitters — a NEW, independent brand/product (not Pack Man, not STLTH),
  // appended last so every existing product id stays unchanged. Sits in the
  // same storefront slot as Pack Man (Vapes → Wax Pens, productType
  // "wax-pen") even though the supplied artwork prints the word "Disposable";
  // the storefront category is a catalog decision, not read off the artwork.
  //
  // Supported facts only, all read off the supplied artwork
  // (heavy-hitter.jpg): "Premium Disposable", 1G, Indica, Premium Distillate,
  // and the four flavour names. THC/CBD %, terpenes, effects, lab results,
  // stock, reviews and any further flavours were not provided — left
  // null/empty rather than guessed. No purchasable price was supplied, so
  // `priceOnRequest` keeps this an informational listing (no Add to Cart/
  // wishlist — see types/product.ts's priceOnRequest); the client's display
  // prices are shown through `infoPricing` below. `price: 0` is a placeholder
  // that is never displayed or compared. `brand` is unset (the name is the brand), so
  // the eyebrow falls back to the category label, as for Pack Man. Copy must
  // not use the word "cartridge" (it would also match the Cartridges filter).
  //
  // ONE product with four selectable flavours (a single flavourGroups family,
  // not four products). The near-square artwork carries printed text at its
  // edges, so `aspectRatio` makes the gallery/card show it uncropped.
  product({
    slug: "heavy-hitters",
    name: "Heavy Hitters",
    category: "vapes",
    productType: "wax-pen",
    strain: "indica",
    thcPercent: null,
    cbdPercent: null,
    weightGrams: 1,
    price: 0,
    salePrice: null,
    priceOnRequest: true,
    // Client-supplied DISPLAY prices for Heavy Hitters 1G — exactly these six
    // tiers, shown in the same Bulk Pricing card as Pack Man (infoPricingAsBulk)
    // but display only: no cart/checkout tier logic is attached, and the product
    // stays non-purchasable online.
    infoPricing: [
      { quantity: 1, price: 20 },
      { quantity: 10, price: 150 },
      { quantity: 25, price: 350 },
      { quantity: 50, price: 600 },
      { quantity: 100, price: 1100 },
      { quantity: 200, price: 2000 },
    ],
    infoPricingAsBulk: true,
    bulkUnitLabel: {
      singular: { fr: "stylo", en: "pen" },
      plural: { fr: "stylos", en: "pens" },
    },
    images: [
      {
        url: "/images/shop/products/heavy-hitter.jpg",
        alt: "Heavy Hitters Premium Disposable 1G Indica, Premium Distillate — Juicy Watermelon, Super Lemon, Pineapple Breeze and Fizzy Grape flavours",
        aspectRatio: 1223 / 1286,
      },
    ],
    // Product Detail hero + lightbox use the Fizzy Grape artwork; the card
    // above keeps the promotional heavy-hitter.jpg. Same single product.
    detailImages: [
      {
        url: "/images/shop/products/fizzy-grape.png",
        alt: "Heavy Hitters Premium Disposable 1G Indica — Fizzy Grape artwork",
        aspectRatio: 1312 / 1199,
      },
    ],
    shortDescription:
      "Heavy Hitters Premium Disposable — 1G Indica made with premium distillate. Available in Juicy Watermelon, Super Lemon, Pineapple Breeze and Fizzy Grape.",
    description:
      "Heavy Hitters Premium Disposable — 1G Indica made with premium distillate. Available in Juicy Watermelon, Super Lemon, Pineapple Breeze and Fizzy Grape.",
    shortDescriptionLocalized: {
      fr: "Heavy Hitters Premium Disposable — 1 G Indica à base de distillat premium. Offert en Juicy Watermelon, Super Lemon, Pineapple Breeze et Fizzy Grape.",
      en: "Heavy Hitters Premium Disposable — 1G Indica made with premium distillate. Available in Juicy Watermelon, Super Lemon, Pineapple Breeze and Fizzy Grape.",
    },
    descriptionLocalized: {
      fr: "Heavy Hitters Premium Disposable — 1 G Indica à base de distillat premium. Offert en Juicy Watermelon, Super Lemon, Pineapple Breeze et Fizzy Grape.",
      en: "Heavy Hitters Premium Disposable — 1G Indica made with premium distillate. Available in Juicy Watermelon, Super Lemon, Pineapple Breeze and Fizzy Grape.",
    },
    stock: null,
    badges: [],
    reviews: [],
    flavourGroups: [
      {
        id: "flavours",
        label: { fr: "Saveurs", en: "Flavours" },
        flavours: ["Juicy Watermelon", "Super Lemon", "Pineapple Breeze", "Fizzy Grape"],
      },
    ],
  }),
];
