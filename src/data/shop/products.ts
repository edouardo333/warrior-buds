// Storefront — real product catalog. As of the Phase 1 fake-data removal,
// this holds only client-verified Warrior Buds products (see AGENTS.md /
// the migration ticket for the removal + first-product spec). It is fully
// independent of the empty CRM BUD_GUARDIAN_PRODUCTS fixture
// (data/bud-guardian/products.ts, which Bud Guardian's chat must never
// invent from) and the staff Inventory module's InventoryProduct
// (types/inventory.ts). Never imported by anything under lib/staff/**,
// components/staff/**, or lib/bud-guardian/**.

import type { LocalizedText, StorefrontProduct } from "@/types/product";

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

function retireIds(count: number): StorefrontProduct[] {
  sequence += count;
  return [];
}

function product(input: Omit<StorefrontProduct, "id" | "createdAt"> & { createdAtDaysAgo?: number }): StorefrontProduct {
  const { createdAtDaysAgo, ...rest } = input;
  return { id: nextId(), createdAt: daysAgo(createdAtDaysAgo ?? 0), ...rest };
}

// Accessories — rolling papers, filter tips, lighter and cigars. One builder
// for every accessory so the original four and the ones appended later share
// the same shape. `image` is the supplied WebP file, referenced exactly as
// supplied (never renamed or copied).
type AccessoryType = "rolling-papers" | "filter-tips" | "lighter" | "cigars";

const ACCESSORY_TYPE_LABELS: Record<AccessoryType, LocalizedText> = {
  "rolling-papers": { fr: "Papiers à rouler", en: "Rolling Papers" },
  "filter-tips": { fr: "Filtres / Embouts", en: "Filter Tips" },
  lighter: { fr: "Briquet", en: "Lighter" },
  cigars: { fr: "Cigares", en: "Cigars" },
};

type AccessoryInput = {
  slug: string;
  name: string;
  brand: string;
  type: AccessoryType;
  line?: string;
  size?: string;
  copy: LocalizedText;
  image: string;
  aspectRatio: number;
} & Pick<StorefrontProduct, "price"> &
  Partial<Pick<StorefrontProduct, "priceOnRequest" | "infoPricing" | "infoPricingAsFormats" | "warning">>;

function accessory({ slug, name, brand, type, line, size, copy, image, aspectRatio, ...pricing }: AccessoryInput): StorefrontProduct {
  return product({
    slug,
    name,
    brand,
    category: "accessories",
    productType: type,
    strain: null,
    thcPercent: null,
    cbdPercent: null,
    weightGrams: null,
    salePrice: null,
    ...pricing,
    telegramContact: true,
    images: [{ url: `/images/shop/products/${image}`, alt: name, aspectRatio }],
    shortDescription: copy.en,
    description: copy.en,
    shortDescriptionLocalized: copy,
    descriptionLocalized: copy,
    stock: null,
    badges: [],
    reviews: [],
    specs: [
      { key: "type", label: { fr: "Type", en: "Type" }, value: ACCESSORY_TYPE_LABELS[type] },
      // A cigar's line is its flavour (Banana, Grape…) — official name, never translated.
      ...(line
        ? [{ key: "line" as const, label: type === "cigars" ? { fr: "Saveur", en: "Flavour" } : { fr: "Gamme", en: "Line" }, value: { fr: line, en: line } }]
        : []),
      ...(size ? [{ key: "format" as const, label: { fr: "Format", en: "Size" }, value: { fr: size, en: size } }] : []),
    ],
  });
}

// Client-supplied single-unit accessory price ("1x-3.50$" in each filename).
const ACCESSORY_UNIT_PRICE = 3.5;

// Supporting "Type" spec label for the 1 oz concentrates appended below.
// Strain/product names stay untranslated; only the subtype term is localized.
const CONCENTRATE_TYPE_LABELS: Record<"shatter" | "budder" | "distillate" | "live-resin", LocalizedText> = {
  shatter: { fr: "Shatter", en: "Shatter" },
  budder: { fr: "Budder", en: "Budder" },
  distillate: { fr: "Distillat", en: "Distillate" },
  "live-resin": { fr: "Live Resin", en: "Live Resin" },
};

// Hash — one builder for every Hash product so the original four and the ones
// appended later share the same shape. Client-supplied facts only: name, image
// and the 1 lb price (read off each supplied filename); the 1/2 lb row is
// exactly half of it, per the client's Hash pricing rule. No THC/CBD, strain,
// effects, terpenes, stock or description. Informational listing
// (priceOnRequest + infoPricing): "From $X" and a display-only Pricing table;
// no row is wired to a cart or order action. `image` is the supplied WebP
// file, referenced exactly as supplied (never renamed or copied) and
// URL-encoded: the production server and image optimizer reject a raw path
// mixing spaces/"–" with "$" (404/400), which would drop the card to its
// fallback. The encoded path is served fine.
type HashInput = { slug: string; name: string; image: string; aspectRatio: number; poundPrice: number };

function hash({ slug, name, image, aspectRatio, poundPrice }: HashInput): StorefrontProduct {
  return product({
    slug,
    name,
    category: "concentrates",
    productType: "hash",
    strain: null,
    thcPercent: null,
    cbdPercent: null,
    weightGrams: null,
    price: 0,
    salePrice: null,
    priceOnRequest: true,
    infoPricing: [
      { quantity: 0.5, price: poundPrice / 2, label: { fr: "1/2 livre", en: "1/2 Pound" } },
      { quantity: 1, price: poundPrice, label: { fr: "1 livre", en: "1 Pound" } },
    ],
    telegramContact: true,
    images: [{ url: `/images/shop/products/${encodeURIComponent(image)}`, alt: name, aspectRatio }],
    shortDescription: "",
    description: "",
    stock: null,
    badges: [],
    reviews: [],
    specs: [{ key: "type", label: { fr: "Type", en: "Type" }, value: { fr: "Hash", en: "Hash" } }],
  });
}

// Mushrooms — one builder for every mushroom product so the original four and
// the ones appended later share the same shape. Client-supplied facts only:
// name, image and one price for 1 Pound (priceUnit) — no other quantity is
// priced or derived, and no potency, strain characteristics, effects, stock or
// description. Regular price + the Telegram team link; nothing here reaches a
// cart or checkout. `image` is URL-encoded for the same reason as hash()'s.
type MushroomInput = { slug: string; name: string; price: number; image: string; aspectRatio: number };

function mushroom({ slug, name, price, image, aspectRatio }: MushroomInput): StorefrontProduct {
  return product({
    slug,
    name,
    category: "mushrooms",
    strain: null,
    thcPercent: null,
    cbdPercent: null,
    weightGrams: null,
    price,
    salePrice: null,
    priceUnit: { fr: "1 livre", en: "1 Pound" },
    telegramContact: true,
    images: [{ url: `/images/shop/products/${encodeURIComponent(image)}`, alt: `${name} — 1 Pound`, aspectRatio }],
    shortDescription: "",
    description: "",
    stock: null,
    badges: [],
    reviews: [],
    specs: [{ key: "format", label: { fr: "Format", en: "Format" }, value: { fr: "1 livre", en: "1 Pound" } }],
  });
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
    // Sold in bulk only, ordered through Telegram (telegramOrder) — never a
    // cart line. `price: 0` is the priceOnRequest placeholder, never displayed.
    price: 0,
    salePrice: null,
    priceOnRequest: true,
    telegramOrder: true,
    images: [
      {
        url: "/images/shop/products/pack-man-2g-liquid-diamond-pens.jpg",
        alt: "Pack Man 2G Liquid Diamond Pens all-in-one wax pen vape",
      },
    ],
    // Default/fallback copy (English) — read by non-localizing consumers
    // (search, Bud Guardian, page metadata). See shortDescriptionLocalized/
    // descriptionLocalized below for what the storefront UI actually shows.
    shortDescription: "",
    description: "Pack Man 2G all-in-one wax pen vaporizer featuring Liquid Diamonds + Live Resin. Multiple flavours available.",
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
    // Display only — no pricing table is shown on the detail page
    // (infoPricingAsBulk). The lowest tier is the "From $X" figure on the
    // card and the Telegram CTA.
    infoPricingAsBulk: true,
    infoPricing: [{ quantity: 50, price: 900 }],
    bulkUnitLabel: {
      singular: { fr: "stylo", en: "pen" },
      plural: { fr: "stylos", en: "pens" },
    },
  }),

  // PROD-1002..PROD-1004 belonged to three flower products that were removed
  // from the catalog. Ids are assigned by position, so those ids are retired
  // here rather than reused — every later product keeps its id, and
  // product-store.ts drops removed ids from any persisted localStorage copy.
  ...retireIds(3),

  // Client-supplied real product — Discount Tips Canadian Blend cigarettes
  // (catalog integration pass, see AGENTS.md / the accompanying task
  // report). Format-priced by bag-quantity tier (`formats`, not
  // `bulkPricing`: these are exact client-verified tiers, not a per-unit
  // multiplier — 1/5/10/25/50 bags only, never interpolated).
  // `inStoreOnly: true` additionally keeps this product fully
  // non-transactional (ProductDetail hides the quantity stepper/Add to
  // Cart/wishlist entirely and shows the in-store notice instead — see
  // types/product.ts's inStoreOnly), so it is never addable to cart even
  // once a format is selected.
  //
  // Nicotine amount, cigarette count per bag, manufacturer details beyond
  // the product name, stock, ratings/reviews, and SKU were not provided —
  // left unset/null/empty rather than guessed.
  product({
    slug: "discount-cigarettes",
    name: "Discount Cigarettes",
    category: "cigarettes",
    strain: null,
    thcPercent: null,
    cbdPercent: null,
    weightGrams: null,
    price: 200,
    salePrice: null,
    images: [{ url: "/images/shop/products/cigarettes.jpg", alt: "Discount Tips Canadian Blend cigarette bags" }],
    shortDescription: "",
    description: "Discount cigarettes available in multiple quantity formats.",
    descriptionLocalized: {
      fr: "Cigarettes Discount disponibles en plusieurs formats de quantité.",
      en: "Discount cigarettes available in multiple quantity formats.",
    },
    stock: null,
    badges: [],
    reviews: [],
    inStoreOnly: true,
    telegramContact: true,
    // Client-verified exact tiers only (10/25/50 bags) — never
    // interpolated (e.g. no invented "2 bags"/"20 bags"). labelLocalized
    // carries the client-provided FR wording ("sac"/"sacs") since it
    // genuinely differs from the EN "bag"/"bags" wording.
    formats: [
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
    shortDescription: "",
    description:
      "STLTH TITAN MAX 50K — 50,000 puffs, smart display, 20 mL e-liquid and USB-C recharging. Available in 25 flavours across Fruit, Fruit + Ice, Mint and Tobacco.",
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

  // Eight client-supplied Wax Pens, sold by the box only. Appended (never
  // inserted) so every existing product id stays unchanged. Client-supplied
  // facts only: name, G format, box quantity and the official box price —
  // no per-unit price, THC/CBD, strain, effects, stock or description.
  // The box price is shown as a Telegram CTA (boxPricing), never a cart line.
  ...[
    { slug: "cookies-x-freak-v3", name: "Cookies x Freak V3", format: "2G", box: 50, price: 1000, image: "cookies-freak-box(50)-1000$-2G.webp", aspectRatio: 1305 / 1206 },
    { slug: "cookies-switch", name: "Cookies Switch", format: "2G", box: 100, price: 1100, image: "cookies-switch-100(box)-1100$-2G.webp", aspectRatio: 1337 / 1177 },
    { slug: "dope-disposable-vaporizers", name: "DOPE Disposable Vaporizers", format: "1G", box: 50, price: 800, image: "dope-box(50)-800$-1G.webp", aspectRatio: 1567 / 1004 },
    { slug: "dope-triple-fusion", name: "DOPE Triple Fusion", format: "8G", box: 50, price: 1100, image: "dope-box(50)-1100$-8G.webp", aspectRatio: 1567 / 1004 },
    { slug: "drizzle-switch", name: "Drizzle Switch", format: "2G", box: 50, price: 900, image: "Drizzle-switch-box(50)-900$-2G.webp", aspectRatio: 1774 / 887 },
    { slug: "gas-gang", name: "Gas Gang", format: "2G", box: 40, price: 950, image: "gas-gang-box(40)-950$-2G.webp", aspectRatio: 1221 / 1288 },
    { slug: "heavy-hitters", name: "Heavy Hitters", format: "1.1G", box: 25, price: 500, image: "heavy-hitters-box(25)-500$-1.1G.webp", aspectRatio: 1278 / 1230 },
    { slug: "muha-meds", name: "Muha Meds", format: "2G", box: 50, price: 950, image: "muha-meds-box(50)-2G-950$.webp", aspectRatio: 1086 / 1448 },
  ].map((pen) =>
    product({
      slug: pen.slug,
      name: pen.name,
      category: "vapes",
      productType: "wax-pen",
      strain: null,
      thcPercent: null,
      cbdPercent: null,
      weightGrams: null,
      // Mirrors the box price for sorting only — never shown as a unit price.
      price: pen.price,
      salePrice: null,
      boxPricing: { quantity: pen.box, price: pen.price },
      images: [{ url: `/images/shop/products/${pen.image}`, alt: `${pen.name} ${pen.format} wax pen box`, aspectRatio: pen.aspectRatio }],
      shortDescription: "",
      description: "",
      stock: null,
      badges: [],
      reviews: [],
      specs: [
        { key: "format", label: { fr: "Format", en: "Format" }, value: { fr: pen.format, en: pen.format } },
        { key: "type", label: { fr: "Type", en: "Type" }, value: { fr: "Wax Pens", en: "Wax Pens" } },
        { key: "box", label: { fr: "Quantité par boîte", en: "Box Quantity" }, value: { fr: `${pen.box}`, en: `${pen.box}` } },
      ],
    }),
  ),

  // The first four client-supplied Hash concentrates (see hash() above) — kept
  // at this position so their ids never change. Maserati Hash is $750 / 1 lb
  // (client price change; formerly $1,000), matching its supplied filename.
  hash({ slug: "afghan-palm-tree-hash", name: "Afghan Palm Tree Hash", image: "Afghan Palm Tree Hash-1000$-1pound.webp", aspectRatio: 1463 / 1075, poundPrice: 1000 }),
  hash({ slug: "afghani-sword-hash", name: "Afghani Sword Hash", image: "Afghani Sword Hash-1000$-1pound.webp", aspectRatio: 1516 / 1038, poundPrice: 1000 }),
  hash({ slug: "maserati-hash", name: "Maserati Hash", image: "Maserati Hash-750$-1pound.webp", aspectRatio: 1134 / 1387, poundPrice: 750 }),
  hash({ slug: "rolex-crown-hash", name: "Rolex Crown Hash", image: "Rolex Crown Hash-1000$-1pound.webp", aspectRatio: 1488 / 1057, poundPrice: 1000 }),

  // Three client-supplied Kief concentrates — three separate products, not
  // variants of one. Appended so every existing id is unchanged. Same
  // informational listing as the Hash products above ("From $300" + a
  // display-only ½ lb / 1 lb table, headed "Available Formats"), plus a
  // separate Telegram team link. No THC/CBD, strain, effects, stock or
  // description was supplied — left null/empty rather than guessed.
  ...[
    { slug: "watermelon-kush-kief", name: "Watermelon Kush Kief", image: "watermelon-kush-kief.webp", aspectRatio: 1294 / 1216 },
    { slug: "bubba-kush-kief", name: "Bubba Kush Kief", image: "bubba-kush-kief.webp", aspectRatio: 1271 / 1237 },
    { slug: "blackberry-cream-kief", name: "Blackberry Cream Kief", image: "blackberry-cream-kief.webp", aspectRatio: 1325 / 1187 },
  ].map((kief) =>
    product({
      slug: kief.slug,
      name: kief.name,
      category: "concentrates",
      productType: "kief",
      strain: null,
      thcPercent: null,
      cbdPercent: null,
      weightGrams: null,
      price: 0,
      salePrice: null,
      priceOnRequest: true,
      infoPricing: [
        { quantity: 0.5, price: 300, label: { fr: "½ livre", en: "½ Pound" } },
        { quantity: 1, price: 600, label: { fr: "1 livre", en: "1 Pound" } },
      ],
      infoPricingAsFormats: true,
      telegramContact: true,
      images: [{ url: `/images/shop/products/${kief.image}`, alt: kief.name, aspectRatio: kief.aspectRatio }],
      shortDescription: "",
      description: "",
      stock: null,
      badges: [],
      reviews: [],
      specs: [{ key: "type", label: { fr: "Type", en: "Type" }, value: { fr: "Kief", en: "Kief" } }],
    }),
  ),

  // Five client-supplied Twisted Extracts gummies — five separate products.
  // Appended so every existing id is unchanged. Facts read off the supplied
  // packaging only: brand, product line, 1200 mg THC, strain, 12 x 100 mg
  // doses, fruit gummies — plus the client's $50 price. No description,
  // effects, terpenes, ingredients, stock or reviews were supplied — left
  // empty/null rather than guessed. Regular price with the Telegram team link
  // (telegramContact); nothing here reaches a cart or checkout.
  //
  // Supplied filenames containing spaces are served through slug-named
  // copies: next/image's optimizer rejects a source path with a space (400),
  // which would drop the card to its fallback. All product photos here are
  // WebP conversions of the supplied PNGs (same basename, same dimensions).
  ...[
    { slug: "twisted-extracts-berry-wild", name: "Berry Wild", strain: "indica", line: "Twisted Naturals", image: "twisted-extracts-berry-wild.webp", aspectRatio: 1181 / 1331 },
    { slug: "twisted-extracts-cherry-blast", name: "Cherry Blast", strain: "sativa", line: "Sour Twisted Singles", image: "Cherry-Blast-High-Dose-Sativa-1200mg-thc-Twisted-Extracts-50$.webp", aspectRatio: 1287 / 1222 },
    { slug: "twisted-extracts-citrus-twist", name: "Citrus Twist", strain: "sativa", line: "Twisted Naturals", image: "Citrus-Twist-Gummies-Sativa-1200mg-thc-Twisted-Naturals-50$.webp", aspectRatio: 1237 / 1271 },
    { slug: "twisted-extracts-blueberry", name: "Blueberry", strain: "indica", line: "Sour Twisted Singles", image: "Blueberry-High-Dose-Indica-1200mg-thc-Twisted-Extracts-50$.webp", aspectRatio: 1271 / 1237 },
    { slug: "twisted-extracts-nectarine-dream", name: "Nectarine Dream", strain: "indica", line: "Sour Twisted Singles", image: "twisted-extracts-nectarine-dream.webp", aspectRatio: 1292 / 1218 },
  ].map((gummy) =>
    product({
      slug: gummy.slug,
      name: gummy.name,
      brand: "Twisted Extracts",
      category: "edibles",
      productType: "gummies",
      strain: gummy.strain as "indica" | "sativa",
      thcPercent: null,
      cbdPercent: null,
      weightGrams: null,
      price: 50,
      salePrice: null,
      telegramContact: true,
      images: [{ url: `/images/shop/products/${gummy.image}`, alt: `Twisted Extracts ${gummy.name} — 1200 mg THC fruit gummies`, aspectRatio: gummy.aspectRatio }],
      shortDescription: "",
      description: "",
      stock: null,
      badges: [],
      reviews: [],
      specs: [
        { key: "type", label: { fr: "Type", en: "Type" }, value: { fr: "Gommes aux fruits", en: "Fruit Gummies" } },
        { key: "line", label: { fr: "Gamme", en: "Line" }, value: { fr: gummy.line, en: gummy.line } },
        { key: "thc-total", label: { fr: "THC", en: "THC" }, value: { fr: "1200 mg", en: "1200 mg" } },
        { key: "doses", label: { fr: "Doses", en: "Doses" }, value: { fr: "12 x 100 mg", en: "12 x 100 mg" } },
      ],
    }),
  ),

  // Five client-supplied Bloom Co. CBD bath bombs — five separate products.
  // Appended so every existing id is unchanged. Facts read off the supplied
  // label only: brand, "Bath Bomb", 200MG CBD and the scent name — plus the
  // client's $10 price. No description, ingredients, weight or therapeutic
  // claim — left empty rather than guessed. Same Telegram team link as above.
  // Images are slug-named WebP conversions of the supplied
  // "Bloom Co. – <Scent> Bathbomb – 200MG CBD-10$.png" files (see the
  // gummies note above on why).
  ...[
    { slug: "bloom-co-bath-bomb-coconut-cream", scent: "Coconut Cream", aspectRatio: 1298 / 1212 },
    { slug: "bloom-co-bath-bomb-eucalyptus", scent: "Eucalyptus", aspectRatio: 1313 / 1198 },
    { slug: "bloom-co-bath-bomb-grapefruit-pink", scent: "Grapefruit Pink", aspectRatio: 1313 / 1198 },
    { slug: "bloom-co-bath-bomb-lavender", scent: "Lavender", aspectRatio: 1313 / 1198 },
    { slug: "bloom-co-bath-bomb-vanilla", scent: "Vanilla", aspectRatio: 1313 / 1198 },
  ].map((bomb) =>
    product({
      slug: bomb.slug,
      name: `Bloom Co. Bath Bomb — ${bomb.scent}`,
      brand: "Bloom Co.",
      category: "topicals",
      productType: "bath-bomb",
      strain: null,
      thcPercent: null,
      cbdPercent: null,
      weightGrams: null,
      price: 10,
      salePrice: null,
      telegramContact: true,
      images: [{ url: `/images/shop/products/${bomb.slug}.webp`, alt: `Bloom Co. ${bomb.scent} bath bomb — 200MG CBD`, aspectRatio: bomb.aspectRatio }],
      shortDescription: "",
      description: "",
      stock: null,
      badges: [],
      reviews: [],
      specs: [
        { key: "type", label: { fr: "Type", en: "Type" }, value: { fr: "Bombe de bain", en: "Bath Bomb" } },
        { key: "cbd-total", label: { fr: "CBD", en: "CBD" }, value: { fr: "200 mg", en: "200 mg" } },
      ],
    }),
  ),

  // Five client-supplied concentrates — Diamonds, Budder and Live Resin, five
  // separate products. Appended so every existing id is unchanged. Facts from
  // the supplied filenames only: name, subtype and the 1 oz price. Same
  // informational listing as the Kief products above (one "1 oz" row under
  // "Available Formats" + the Telegram team link) — no other quantity is
  // priced, and no THC/CBD, strain, effects, terpenes, stock or description was
  // supplied. The Diamonds images are used as supplied; the others are
  // byte-identical slug-named copies (see the gummies note above).
  ...[
    { slug: "premium-super-pink-kush-thc-diamonds", name: "Premium Super Pink Kush THC Diamonds", type: "diamonds", typeLabel: { fr: "Diamants", en: "Diamonds" }, price: 400, image: "Premium-Super-Pink-Kush-thc-Diamonds-400$-1oz.webp", aspectRatio: 1327 / 1185 },
    { slug: "premium-pomegranate-thc-diamonds", name: "Premium Pomegranate THC Diamonds", type: "diamonds", typeLabel: { fr: "Diamants", en: "Diamonds" }, price: 400, image: "Premium-Pomegranate-thc-Diamonds-400$-1oz.webp", aspectRatio: 1311 / 1200 },
    { slug: "mac-1-budder", name: "Mac 1 Budder", type: "budder", typeLabel: { fr: "Budder", en: "Budder" }, price: 250, image: "mac-1-budder.webp", aspectRatio: 1 },
    { slug: "exodus-kush-budder", name: "Exodus Kush Budder", type: "budder", typeLabel: { fr: "Budder", en: "Budder" }, price: 250, image: "exodus-kush-budder.webp", aspectRatio: 1318 / 1193 },
    { slug: "kimbo-kush-live-resin", name: "Kimbo Kush Live Resin", type: "live-resin", typeLabel: { fr: "Live Resin", en: "Live Resin" }, price: 250, image: "kimbo-kush-live-resin.webp", aspectRatio: 1330 / 1183 },
  ].map((concentrate) =>
    product({
      slug: concentrate.slug,
      name: concentrate.name,
      category: "concentrates",
      productType: concentrate.type,
      strain: null,
      thcPercent: null,
      cbdPercent: null,
      weightGrams: null,
      price: 0,
      salePrice: null,
      priceOnRequest: true,
      infoPricing: [{ quantity: 1, price: concentrate.price, label: { fr: "1 oz", en: "1 oz" } }],
      infoPricingAsFormats: true,
      telegramContact: true,
      images: [{ url: `/images/shop/products/${concentrate.image}`, alt: concentrate.name, aspectRatio: concentrate.aspectRatio }],
      shortDescription: "",
      description: "",
      stock: null,
      badges: [],
      reviews: [],
      specs: [{ key: "type", label: { fr: "Type", en: "Type" }, value: concentrate.typeLabel }],
    }),
  ),

  // The first four client-supplied accessories — kept at this position so
  // their ids never change. Copy is limited to what the supplied packaging
  // shows. Priced at the client's single-unit $3.50 (the price in each
  // supplied filename) with the Telegram team link; nothing here reaches a
  // cart or checkout. OCB Premium Slim no longer claims "box of 50 booklets":
  // the $3.50 is a single-unit price, so a box quantity beside it would
  // misstate what it buys.
  accessory({
    slug: "raw-organic-hemp-rolling-papers",
    name: "RAW Organic Hemp Rolling Papers",
    brand: "RAW",
    type: "rolling-papers",
    line: "Organic Hemp",
    size: "1 1/4",
    copy: {
      fr: "Papiers à rouler RAW Organic Hemp en chanvre naturel non raffiné — format 1 1/4.",
      en: "RAW Organic Hemp natural unrefined hemp rolling papers — 1 1/4 size.",
    },
    price: ACCESSORY_UNIT_PRICE,
    image: "raw-organic-hemp-rolling-papers-1x-3.50$.webp",
    aspectRatio: 1313 / 1198,
  }),
  accessory({
    slug: "raw-classic-rolling-papers",
    name: "RAW Classic Rolling Papers",
    brand: "RAW",
    type: "rolling-papers",
    line: "Classic",
    size: "1 1/4",
    copy: {
      fr: "Papiers à rouler RAW Classic naturels non raffinés — format 1 1/4.",
      en: "RAW Classic natural unrefined rolling papers — 1 1/4 size.",
    },
    price: ACCESSORY_UNIT_PRICE,
    image: "raw-classic-rolling-papers-1x-3.50$.webp",
    aspectRatio: 1313 / 1198,
  }),
  accessory({
    slug: "ocb-premium-slim-rolling-papers",
    name: "OCB Premium Slim Rolling Papers",
    brand: "OCB",
    type: "rolling-papers",
    line: "Premium Slim",
    copy: {
      fr: "Papiers à rouler OCB Premium Slim.",
      en: "OCB Premium Slim rolling papers.",
    },
    price: ACCESSORY_UNIT_PRICE,
    image: "ocb-premium-slim-rolling-papers1x-3.50$.webp",
    aspectRatio: 1316 / 1195,
  }),
  accessory({
    slug: "raw-unbleached-filter-tips",
    name: "RAW Unbleached Filter Tips",
    brand: "RAW",
    type: "filter-tips",
    copy: {
      fr: "RAW Natural Rolling Paper Tips — filtres / embouts non blanchis.",
      en: "RAW Natural Rolling Paper Tips — unbleached filter tips (roaches).",
    },
    price: ACCESSORY_UNIT_PRICE,
    image: "raw-unbleached-filter-tips-1x-3.50$.webp",
    aspectRatio: 1313 / 1198,
  }),

  // Four client-supplied mushroom products (see mushroom() above) — four
  // separate products, never merged into variants. Appended so every existing
  // id is unchanged. Images are slug-named WebP conversions of the supplied
  // "Mushroom – <Name>-<price>$-1pound.png" files (see the gummies note above;
  // "#" would also break the URL).
  mushroom({ slug: "mushroom-penis-envy-6", name: "Mushroom – Penis Envy #6", price: 550, image: "mushroom-penis-envy-6.webp", aspectRatio: 1296 / 1214 }),
  mushroom({ slug: "mushroom-albino-jedimindfuck", name: "Mushroom – Albino Jedimindfuck", price: 500, image: "mushroom-albino-jedimindfuck.webp", aspectRatio: 1310 / 1201 }),
  mushroom({ slug: "mushroom-daddy-long-legs", name: "Mushroom – Daddy Long Legs", price: 600, image: "mushroom-daddy-long-legs.webp", aspectRatio: 1312 / 1199 }),
  mushroom({ slug: "mushroom-jack-frost", name: "Mushroom – Jack Frost", price: 600, image: "mushroom-jack-frost.webp", aspectRatio: 1312 / 1199 }),

  // Three client-supplied One Life tinctures — three separate products, not a
  // strength selector. Appended so every existing id is unchanged. Facts from
  // the supplied labels/brief only: brand, 30 mL bottle, CBD/THC mg, ratio and
  // the client's individual prices (NOT derived from strength). No dosage,
  // ingredients, lab results, effects or health claims — left unset. The 1:1
  // bottle sits in the existing CBD category (with the Oils & Tinctures node)
  // but its specs state 500 mg CBD + 500 mg THC, never CBD-only. Images are
  // byte-identical slug-named copies of the supplied files.
  ...[
    {
      slug: "one-life-tincture-1000mg-cbd",
      name: "One Life Tincture – 1000mg CBD",
      price: 30,
      type: { fr: "Teinture CBD", en: "CBD Tincture" },
      cbd: "1000 mg",
      thc: null,
      ratio: null,
      alt: "One Life CBD Tincture — 1000 mg CBD, 30 mL",
      aspectRatio: 969 / 1624,
    },
    {
      slug: "one-life-tincture-2000mg-cbd",
      name: "One Life Tincture – 2000mg CBD",
      price: 50,
      type: { fr: "Teinture CBD", en: "CBD Tincture" },
      cbd: "2000 mg",
      thc: null,
      ratio: null,
      alt: "One Life CBD Tincture — 2000 mg CBD, 30 mL",
      aspectRatio: 1010 / 1557,
    },
    {
      slug: "one-life-tincture-1-1-cbd-thc",
      name: "One Life Tincture – 1:1 CBD:THC",
      price: 30,
      type: { fr: "Teinture CBD:THC", en: "CBD:THC Tincture" },
      cbd: "500 mg",
      thc: "500 mg",
      ratio: "1:1",
      alt: "One Life 1:1 CBD:THC Tincture — 500 mg CBD + 500 mg THC, 30 mL",
      aspectRatio: 965 / 1630,
    },
  ].map((tincture) =>
    product({
      slug: tincture.slug,
      name: tincture.name,
      brand: "One Life",
      category: "cbd",
      productType: "tincture",
      strain: null,
      thcPercent: null,
      cbdPercent: null,
      weightGrams: null,
      price: tincture.price,
      salePrice: null,
      telegramContact: true,
      images: [{ url: `/images/shop/products/${tincture.slug}.webp`, alt: tincture.alt, aspectRatio: tincture.aspectRatio }],
      shortDescription: "",
      description: "",
      stock: null,
      badges: [],
      reviews: [],
      specs: [
        { key: "type", label: { fr: "Type", en: "Type" }, value: tincture.type },
        ...(tincture.ratio ? [{ key: "ratio" as const, label: { fr: "Ratio", en: "Ratio" }, value: { fr: tincture.ratio, en: tincture.ratio } }] : []),
        { key: "cbd-total", label: { fr: "CBD", en: "CBD" }, value: { fr: tincture.cbd, en: tincture.cbd } },
        ...(tincture.thc ? [{ key: "thc-total" as const, label: { fr: "THC", en: "THC" }, value: { fr: tincture.thc, en: tincture.thc } }] : []),
        { key: "volume", label: { fr: "Flacon", en: "Bottle" }, value: { fr: "30 mL", en: "30 mL" } },
      ],
    }),
  ),

  // Fifteen client-supplied flower products — fifteen separate products, never
  // merged into variants. Appended so every existing id is unchanged. Facts
  // supplied: name, image and one price for 1 Pound (priceUnit) — no smaller
  // format is priced or derived, and no strain, grade, THC/CBD, effects,
  // terpenes, stock or description was supplied. Same listing as the mushroom
  // products above: regular price + the Telegram team link; nothing here
  // reaches a cart or checkout. Images are slug-named WebP conversions of
  // the supplied "<Name>-<price>$-1pound.png" files (see the gummies note
  // above; the curly apostrophes and "$" would also break the URL).
  ...[
    { slug: "blue-dynamite", name: "Blue Dynamite", price: 600, aspectRatio: 1380 / 1140 },
    { slug: "blueberry-space-cookies", name: "Blueberry Space Cookies", price: 1150, aspectRatio: 1368 / 1149 },
    { slug: "cake-crasher", name: "Cake Crasher", price: 1100, aspectRatio: 1392 / 1130 },
    { slug: "candyland", name: "Candyland", price: 1000, aspectRatio: 1344 / 1170 },
    { slug: "cracker-jack", name: "Cracker Jack", price: 750, aspectRatio: 1474 / 1067 },
    { slug: "deep-line-alchemy", name: "Deep Line Alchemy", price: 450, aspectRatio: 1421 / 1107 },
    { slug: "hawaiian-rain", name: "Hawaiian Rain", price: 500, aspectRatio: 1375 / 1144 },
    { slug: "joes-lemonade", name: "Joe’s Lemonade", price: 550, aspectRatio: 1393 / 1129 },
    { slug: "lemon-cake", name: "Lemon Cake", price: 900, aspectRatio: 1382 / 1138 },
    { slug: "maui-citrus-punch", name: "Maui Citrus Punch", price: 750, aspectRatio: 1391 / 1131 },
    { slug: "peach-oz", name: "Peach Oz", price: 700, aspectRatio: 1368 / 1150 },
    { slug: "sojay-haze", name: "Sojay Haze", price: 650, aspectRatio: 1346 / 1169 },
    { slug: "sputnik", name: "Sputnik", price: 850, aspectRatio: 1232 / 1277 },
    { slug: "swazi-gold", name: "Swazi Gold", price: 800, aspectRatio: 1397 / 1126 },
    { slug: "titans-haze", name: "Titan’s Haze", price: 500, aspectRatio: 1351 / 1164 },
  ].map((flower) =>
    product({
      slug: flower.slug,
      name: flower.name,
      category: "flower",
      strain: null,
      thcPercent: null,
      cbdPercent: null,
      weightGrams: null,
      price: flower.price,
      salePrice: null,
      priceUnit: { fr: "1 livre", en: "1 Pound" },
      telegramContact: true,
      images: [{ url: `/images/shop/products/${flower.slug}.webp`, alt: `${flower.name} — 1 Pound`, aspectRatio: flower.aspectRatio }],
      shortDescription: "",
      description: "",
      stock: null,
      badges: [],
      reviews: [],
      specs: [{ key: "format", label: { fr: "Format", en: "Format" }, value: { fr: "1 livre", en: "1 Pound" } }],
    }),
  ),

  // Three more client-supplied $3.50 accessories, completing the set started
  // by the four above. Appended so every existing id is unchanged. Copy is
  // limited to what the supplied packaging shows.
  accessory({
    slug: "ocb-bamboo-rolling-paper",
    name: "OCB Bamboo Rolling Paper",
    brand: "OCB",
    type: "rolling-papers",
    line: "Bamboo",
    size: "1 1/4",
    copy: {
      fr: "Papiers à rouler OCB Bamboo non blanchis — format 1 1/4.",
      en: "OCB Bamboo unbleached rolling papers — 1 1/4 size.",
    },
    price: ACCESSORY_UNIT_PRICE,
    image: "OCB Bamboo Rolling Paper-1x-3.50$.webp",
    aspectRatio: 1175 / 1338,
  }),
  accessory({
    slug: "irie-rolling-papers",
    name: "IRIE Rolling Papers",
    brand: "IRIE",
    type: "rolling-papers",
    line: "Extra Light",
    size: "1 1/4",
    copy: {
      fr: "Papiers à rouler IRIE Extra Light — format 1 1/4, 64 feuilles.",
      en: "IRIE Extra Light rolling papers — 1 1/4 size, 64 leaves.",
    },
    price: ACCESSORY_UNIT_PRICE,
    image: "Papier à rouler Irie-1x-3.50$.webp",
    aspectRatio: 1312 / 1199,
  }),
  accessory({
    slug: "bic-lighter",
    name: "BIC Lighter",
    brand: "BIC",
    type: "lighter",
    copy: { fr: "Briquet BIC.", en: "BIC lighter." },
    price: ACCESSORY_UNIT_PRICE,
    image: "lighter-bic-1x-3.50$.webp",
    aspectRatio: 1418 / 1109,
  }),

  // Eight client-supplied Backwoods cigars — eight separate products, one per
  // flavour. Appended so every existing id is unchanged. Tobacco: an
  // informational listing only (priceOnRequest keeps it out of any cart or
  // checkout), with the client's two catalog prices — 1x $15 and 1 box $80 —
  // shown display-only under "Available Formats" (the Kief pattern), the
  // Telegram team link, and the same nicotine warning as STLTH. No pack/box
  // count is tied to either price — none was supplied.
  ...[
    { flavour: "Banana", aspectRatio: 1369 / 1149 },
    { flavour: "Cognac XO", aspectRatio: 1312 / 1199 },
    { flavour: "Dark Stout", aspectRatio: 1312 / 1199 },
    { flavour: "Grape", aspectRatio: 1312 / 1199 },
    { flavour: "Honey Berry", aspectRatio: 1233 / 1276 },
    { flavour: "Russian Cream", aspectRatio: 1312 / 1199 },
    { flavour: "Vanilla", aspectRatio: 1312 / 1199 },
    { flavour: "Wild Rum", aspectRatio: 1312 / 1199 },
  ].map(({ flavour, aspectRatio }) =>
    accessory({
      slug: `backwoods-${flavour.toLowerCase().replace(/ /g, "-")}`,
      name: `Backwoods ${flavour}`,
      brand: "Backwoods",
      type: "cigars",
      line: flavour,
      copy: {
        fr: `Cigares Backwoods ${flavour}.`,
        en: `Backwoods ${flavour} cigars.`,
      },
      // `price: 0` is the priceOnRequest placeholder, never displayed.
      price: 0,
      priceOnRequest: true,
      infoPricing: [
        { quantity: 1, price: 15, label: { fr: "1x", en: "1x" } },
        { quantity: 1, price: 80, label: { fr: "1 boîte", en: "1 Box" } },
      ],
      infoPricingAsFormats: true,
      warning: {
        fr: "AVERTISSEMENT : La nicotine crée une forte dépendance.",
        en: "WARNING: Nicotine is highly addictive.",
      },
      image: `Backwoods ${flavour}-1x-15$-1box-80$.webp`,
      aspectRatio,
    }),
  ),

  // Eight client-supplied Sky High gummies — eight separate products, one per
  // flavour, under Edibles → Gummies. Appended so every existing id is
  // unchanged. Facts read off the supplied packaging only: brand, flavour,
  // "Cannabis Infused Gummies", 500mg THC per bag, 12 pieces, 50mg THC per
  // piece — plus the client's $15 price. The supplied filenames say "600mg
  // THC"; the packaging (500mg per bag) is the source of truth, so no 600mg
  // figure is used here. No strain, effects, terpenes, CBD, ingredients,
  // stock or lab results — left null/empty rather than guessed.
  // Images are byte-identical slug-named copies of the supplied
  // "Sky High Edibles – <Flavour> Gummy …$.webp" files (see the gummies note
  // above: the production image optimizer rejects those paths).
  ...[
    { flavour: "Blue Berry", aspectRatio: 1166 / 1349 },
    { flavour: "Green Apple", aspectRatio: 1131 / 1391 },
    { flavour: "Guava", aspectRatio: 1163 / 1352 },
    { flavour: "Peach Mango", aspectRatio: 1173 / 1341 },
    { flavour: "Plum", aspectRatio: 1183 / 1329 },
    { flavour: "Pomegranate", aspectRatio: 1123 / 1401 },
    { flavour: "Grape", aspectRatio: 1159 / 1357 },
    { flavour: "Tropical Punch", aspectRatio: 1122 / 1402 },
  ].map(({ flavour, aspectRatio }) => {
    const slug = `sky-high-${flavour.toLowerCase().replace(/ /g, "-")}-gummies`;
    const image = `${slug}.webp`;
    const copy: LocalizedText = {
      fr: `Gummies infusées au cannabis Sky High ${flavour} — 500 mg de THC par sac, 12 morceaux, 50 mg de THC par morceau.`,
      en: `Sky High ${flavour} cannabis infused gummies — 500mg THC per bag, 12 pieces, 50mg THC per piece.`,
    };
    return product({
      slug,
      name: `Sky High — ${flavour} Gummies`,
      brand: "Sky High",
      category: "edibles",
      productType: "gummies",
      strain: null,
      thcPercent: null,
      cbdPercent: null,
      weightGrams: null,
      price: 15,
      salePrice: null,
      telegramContact: true,
      images: [{ url: `/images/shop/products/${image}`, alt: `Sky High ${flavour} cannabis infused gummies — 500mg THC per bag, 12 pieces, 50mg THC per piece`, aspectRatio }],
      shortDescription: copy.en,
      description: copy.en,
      shortDescriptionLocalized: copy,
      descriptionLocalized: copy,
      stock: null,
      badges: [],
      reviews: [],
      specs: [
        { key: "type", label: { fr: "Type", en: "Type" }, value: { fr: "Gummies infusées au cannabis", en: "Cannabis Infused Gummies" } },
        { key: "line", label: { fr: "Saveur", en: "Flavour" }, value: { fr: flavour, en: flavour } },
        { key: "thc-total", label: { fr: "THC par sac", en: "THC per Bag" }, value: { fr: "500 mg", en: "500mg" } },
        { key: "doses", label: { fr: "Morceaux", en: "Pieces" }, value: { fr: "12", en: "12" } },
        { key: "thc-per-unit", label: { fr: "THC par morceau", en: "THC per Piece" }, value: { fr: "50 mg", en: "50mg" } },
      ],
    });
  }),

  // Ten client-supplied Sky High THC syrups — ten separate products, one per
  // flavour, under Edibles → Drinks. Appended so every existing id is
  // unchanged. Facts read off the supplied bottle labels only: brand, flavour,
  // "Cannabis Infused Syrup", the THC total (1000mg or 3000mg), 100ml, the
  // printed "Warning very strong dosage" and "Shake well before each use •
  // Refrigerate after opening" — plus the client's price for each strength.
  // No serving size, effects, ingredients, stock or lab results. Images are
  // byte-identical slug-named copies of the supplied "Sky High Syrup – …$.webp"
  // files, like the gummies above.
  ...[
    { flavour: "Blue Raspberry", thc: 1000 },
    { flavour: "Cran-Raspberry", thc: 3000 },
    { flavour: "Grape", thc: 3000 },
    { flavour: "Guava", thc: 1000 },
    { flavour: "Key Lime", thc: 3000 },
    { flavour: "Melon", thc: 1000 },
    { flavour: "Pina Colada", thc: 1000 },
    { flavour: "Pineapple", thc: 3000 },
    { flavour: "Strawberry Kiwi", thc: 3000 },
    { flavour: "Tropical Punch", thc: 1000 },
  ].map(({ flavour, thc }) => {
    const slug = `sky-high-thc-syrup-${flavour.toLowerCase().replace(/ /g, "-")}`;
    const image = `${slug}.webp`;
    const copy: LocalizedText = {
      fr: `Sirop THC Sky High ${flavour} — sirop infusé au cannabis, ${thc} mg de THC, 100 mL. Bien agiter avant chaque utilisation · Réfrigérer après ouverture.`,
      en: `Sky High ${flavour} THC Syrup — cannabis infused syrup, ${thc}mg THC, 100ml. Shake well before each use · Refrigerate after opening.`,
    };
    return product({
      slug,
      name: `Sky High THC Syrup — ${flavour}`,
      brand: "Sky High",
      category: "edibles",
      productType: "drinks",
      strain: null,
      thcPercent: null,
      cbdPercent: null,
      weightGrams: null,
      // Client price per strength: $25 for 1000mg, $60 for 3000mg.
      price: thc === 3000 ? 60 : 25,
      salePrice: null,
      telegramContact: true,
      images: [{ url: `/images/shop/products/${image}`, alt: `Sky High ${flavour} THC Syrup — cannabis infused syrup, ${thc}mg THC, 100ml`, aspectRatio: 1024 / 1536 }],
      shortDescription: copy.en,
      description: copy.en,
      shortDescriptionLocalized: copy,
      descriptionLocalized: copy,
      stock: null,
      badges: [],
      reviews: [],
      specs: [
        { key: "type", label: { fr: "Type", en: "Type" }, value: { fr: "Sirop infusé au cannabis", en: "Cannabis Infused Syrup" } },
        { key: "line", label: { fr: "Saveur", en: "Flavour" }, value: { fr: flavour, en: flavour } },
        { key: "thc-total", label: { fr: "THC", en: "THC" }, value: { fr: `${thc} mg`, en: `${thc}mg` } },
        { key: "volume", label: { fr: "Format", en: "Volume" }, value: { fr: "100 mL", en: "100ml" } },
      ],
      // Printed on every bottle label.
      warning: {
        fr: "AVERTISSEMENT : Dosage très fort.",
        en: "WARNING: Very strong dosage.",
      },
    });
  }),

  // Sixteen client-supplied concentrates — sixteen separate products under
  // Concentrates → Shatter / Budder / Distillates / Live Resin. Appended so
  // every existing id is unchanged. Facts from the supplied filenames only:
  // subtype, name, the 1 oz format and its price ($400 for the two
  // distillates, $250 for the rest). Regular price quoted per 1 oz
  // (priceUnit, the mushroom/flower pattern) + the Telegram team link; nothing
  // here reaches a cart or checkout. No THC/CBD, potency, strain, effects,
  // terpenes, extraction process, lab results, stock or description was
  // supplied — left null/empty rather than guessed. Images are byte-identical
  // slug-named copies of the supplied "<Subtype> – <Name>-1oz-<price>$.webp"
  // files (see the gummies note above).
  ...(
    [
      { type: "shatter", prefix: "Premium Shatter", names: ["Scooby Snacks", "Monster Cookies", "Jack The Ripper", "Blue Fin Tuna", "Blue Dream"], price: 250 },
      { type: "budder", prefix: "Budder", names: ["Grape Ape", "Lemon Sour Diesel", "Purple Kush", "Wedding Cake"], price: 250 },
      { type: "distillate", prefix: "Distillate", names: ["Delta 8", "Delta 9"], price: 400 },
      { type: "live-resin", prefix: "Live Resin", names: ["El Chapo", "Godfather OG", "Master Jedi", "Pink Gas Mask", "Super Glue"], price: 250 },
    ] as const
  ).flatMap(({ type, prefix, names, price }) =>
    names.map((strainName) => {
      const slug = `${prefix} ${strainName}`.toLowerCase().replace(/ /g, "-");
      const name = `${prefix} — ${strainName}`;
      return product({
        slug,
        name,
        category: "concentrates",
        productType: type,
        strain: null,
        thcPercent: null,
        cbdPercent: null,
        weightGrams: null,
        price,
        salePrice: null,
        priceUnit: { fr: "1 oz", en: "1 oz" },
        telegramContact: true,
        images: [{ url: `/images/shop/products/${slug}.webp`, alt: `${name} — 1 oz`, aspectRatio: 1536 / 1024 }],
        shortDescription: "",
        description: "",
        stock: null,
        badges: [],
        reviews: [],
        specs: [
          { key: "type", label: { fr: "Type", en: "Type" }, value: CONCENTRATE_TYPE_LABELS[type] },
          { key: "format", label: { fr: "Format", en: "Format" }, value: { fr: "1 oz", en: "1 oz" } },
        ],
      });
    }),
  ),

  // Eight more client-supplied Hash products (see hash() above), completing the
  // Hash set. Appended so every existing id is unchanged. The 1 lb price is read
  // off each supplied "Hash – <Name>-1pound-<price>$.webp" filename. Moroccan
  // Abraxas's supplied file is spelled "Morrocan" — referenced as it exists on
  // disk; only the display name is corrected.
  hash({ slug: "ak-47-hash", name: "AK-47", image: "Hash – AK-47-1pound-750$.webp", aspectRatio: 1846 / 852, poundPrice: 750 }),
  hash({ slug: "amg-hash", name: "AMG", image: "Hash – AMG-1pound-750$.webp", aspectRatio: 1536 / 1024, poundPrice: 750 }),
  hash({ slug: "laughing-buddha-hash", name: "Laughing Buddha", image: "Hash – Laughing Buddha-1pound-1250$.webp", aspectRatio: 1535 / 1024, poundPrice: 1250 }),
  hash({ slug: "mercedes-hash", name: "Mercedes", image: "Hash – Mercedes-1pound-750$.webp", aspectRatio: 1787 / 880, poundPrice: 750 }),
  hash({ slug: "moroccan-abraxas-hash", name: "Moroccan Abraxas", image: "Hash – Morrocan Abraxas-1pound-1250$.webp", aspectRatio: 1452 / 1083, poundPrice: 1250 }),
  hash({ slug: "rolex-hash", name: "Rolex", image: "Hash – Rolex-1pound-1250$.webp", aspectRatio: 1535 / 1024, poundPrice: 1250 }),
  hash({ slug: "rolls-royce-hash", name: "Rolls Royce", image: "Hash – Rolls Royce-1pound-1000$.webp", aspectRatio: 1535 / 1024, poundPrice: 1000 }),
  hash({ slug: "royal-palace-hash", name: "Royal Palace", image: "Hash – Royal Palace-1pound-1000$.webp", aspectRatio: 1619 / 971, poundPrice: 1000 }),

  // Four more client-supplied mushroom products (see mushroom() above) — four
  // separate products, 1 Pound price only (no 1/2 lb row: the halving rule is
  // Hash-only). Appended so every existing id is unchanged. The price is read
  // off each supplied "Mushroom – <Name>-1pound-<price>$.webp" filename.
  mushroom({ slug: "mushroom-albino-penis-envy", name: "Albino Penis Envy", price: 550, image: "Mushroom – Albino Penis Envy-1pound-550$.webp", aspectRatio: 1363 / 1154 }),
  mushroom({ slug: "mushroom-bluey-vuitton", name: "Bluey Vuitton", price: 500, image: "Mushroom – Bluey Vuitton-1pound-500$.webp", aspectRatio: 1309 / 1202 }),
  mushroom({ slug: "mushroom-iceberg", name: "Iceberg", price: 550, image: "Mushroom – Iceberg-1pound-550$.webp", aspectRatio: 1308 / 1202 }),
  mushroom({ slug: "mushroom-wollongong", name: "Wollongong", price: 500, image: "Mushroom – Wollongong-1pound-500$.webp", aspectRatio: 1308 / 1202 }),
];
