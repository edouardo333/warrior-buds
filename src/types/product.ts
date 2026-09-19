// Storefront — public Product Catalog types. Deliberately separate from the
// staff Inventory module's InventoryProduct (types/inventory.ts —
// warehouse/SKU/supplier/purchase-cost operations) and from the empty CRM
// BudGuardianProduct fixture (data/bud-guardian/products.ts, which Bud
// Guardian's chat must never invent from). This is the new customer-facing
// shop catalog, seeded with its own sample data in data/shop/products.ts.
// Never imports from or writes to data/bud-guardian/**, lib/staff/**, or
// components/staff/**.

export type ProductCategory =
  | "flower"
  | "pre-rolls"
  | "edibles"
  | "concentrates"
  | "vapes"
  | "cbd"
  | "accessories"
  | "topicals"
  | "mushrooms"
  // No verified cigarette products exist in the catalog yet — this value is
  // wired through the same taxonomy (CATEGORY_LABELS below, the
  // "cigarettes" node in lib/shop/category-tree.ts, Bud Guardian's
  // CATEGORY_KEYWORDS in lib/bud-guardian/product-intent.ts) so the category
  // exists and correctly counts/filters to 0 everywhere, never fabricated.
  | "cigarettes";

export type ProductBadge = "new" | "best-seller" | "sale" | "staff-pick" | "limited" | "low-stock";

export type ProductStrain = "sativa" | "indica" | "hybrid";

export type ProductReview = {
  id: string;
  author: string;
  rating: number; // 1-5
  title: string;
  body: string;
  createdAt: string;
  verifiedPurchase: boolean;
};

export type ProductImage = {
  url: string;
  alt: string;
  // True for a tall (2:3) infographic-style image that must be shown whole
  // rather than cropped into the catalog's 4:5 card / square gallery frames
  // (ProductCard letterboxes it, ProductGallery gives it a portrait frame).
  // Undefined for every existing product image — unchanged rendering.
  portrait?: boolean;
  // Width ÷ height of artwork whose printed text must not be cropped (e.g. a
  // near-square product sheet). ProductGallery sizes its frame to this ratio
  // and ProductCard letterboxes it, like `portrait` above. Undefined for every
  // existing product image — unchanged rendering.
  aspectRatio?: number;
};

// One verified quantity/price tier from a client-provided wholesale price
// sheet (e.g. "10 units for $300"). Single source of truth for bulk pricing —
// consumed via lib/shop/product-engine.ts's getProductPriceForQuantity by
// Product Detail, Add to Cart, the cart, and checkout, so an exact tier
// quantity always resolves to this price instead of basePrice × quantity.
export type BulkPriceTier = {
  quantity: number;
  price: number;
};

// A piece of copy that legitimately differs by language (descriptions only —
// never the product name/brand, which are language-independent identity
// data set once on StorefrontProduct itself, see name/brand below).
export type LocalizedText = {
  fr: string;
  en: string;
};

// One verified size/format + price pairing for a product that's priced by
// format (e.g. cannabis flower sold by 3.5g/7g/14g/1oz/QP/HP/lb) rather than
// by the quantity-tier model above. Deliberately separate from
// BulkPriceTier/getProductPriceForQuantity: a `formats` product is never run
// through that quantity-tier pricing logic, and never exposes an Add to
// Cart/wishlist control (see the isFormatPriced gate in product-engine.ts and
// its use in ProductCard/ProductDetail) — it's an informational listing
// only, consistent with not wiring regulated flower into the existing
// checkout/payment flow. `label` is the exact customer-facing size name
// ("3.5g", "1 oz", "QP", "HP", "1 lb", "2 lb"); `price` is the verified exact
// price for that size — never interpolated between sizes.
export type ProductFormat = {
  label: string;
  price: number;
  // Optional localized override of `label`, for a format whose customer-
  // facing quantity wording genuinely differs by language (e.g. "5 bags" vs.
  // "5 sacs" — plural quantity units, unlike the unit-abbreviation labels
  // like "3.5g"/"1 oz"/"QP"/"HP" that already read identically in both
  // locales and so leave this unset). Same fallback rule as
  // shortDescriptionLocalized/descriptionLocalized: falls back to `label`
  // when unset. `label` itself stays the non-localized default read by
  // consumers that don't localize (search, Bud Guardian).
  labelLocalized?: LocalizedText;
};

// One flavour family of a flavour-selectable product (e.g. "Fruit + Ice").
// `label` is the localized family name (supporting UI terminology); each entry
// of `flavours` is an official flavour name — identity data like
// StorefrontProduct.name, never translated or localized.
export type ProductFlavourGroup = {
  id: string;
  label: LocalizedText;
  flavours: string[];
};

// One verified headline spec ("50,000 puffs", "20 mL e-liquid") shown in the
// Product Detail spec grid. `key` picks the grid icon; label/value are
// supporting copy and therefore localized.
export type ProductSpec = {
  key: "puffs" | "display" | "e-liquid" | "charging";
  label: LocalizedText;
  value: LocalizedText;
};

export type StorefrontProduct = {
  id: string; // e.g. "PROD-1001"
  slug: string;
  // Official product name — language-independent identity data (manufacturer/
  // client-provided). Never translated, shortened, or localized: it must
  // render byte-for-byte identical in every locale, in the catalog, cart,
  // and checkout alike.
  name: string;
  // Same rule as `name` above — the brand is identity data, not UI copy.
  // Optional: not every product has a real manufacturer/brand name distinct
  // from its own product name (e.g. the flower products below, which only
  // have a client-supplied grade — see `grade` below, never invented here).
  brand?: string;
  // Optional product quality GRADE (e.g. cannabis grading tiers "AAA"/
  // "AAA+"/"AAAA") — structured catalog data, read directly by filtering
  // (lib/shop/category-tree.ts's cannabis-aaa/cannabis-aaa-plus nodes) and
  // display (ProductCard/ProductDetail eyebrow label). Distinct from
  // `brand`: a grade is a quality tier, not a manufacturer name, so it must
  // never be stuffed into `brand` just to have somewhere to put it. Never
  // translated — renders identically in both locales, same rule as
  // name/brand. `null`/undefined means no verified grade.
  grade?: string | null;
  category: ProductCategory;
  // Optional structured storefront product type within `category` (e.g.
  // "wax-pen" under vapes) — read directly by lib/shop/category-tree.ts's
  // matching leaf node, never inferred from description text.
  productType?: string | null;
  strain: ProductStrain | null;
  thcPercent: number | null;
  cbdPercent: number | null;
  weightGrams: number | null;
  price: number;
  salePrice: number | null;
  images: ProductImage[];
  // Optional separate image set for the Product Detail gallery (hero, thumbs
  // and lightbox). `images` stays the card/cart/wishlist image; when
  // `detailImages` is unset the detail page uses `images` as before, so only
  // a product that wants a different detail artwork sets this.
  detailImages?: ProductImage[];
  // Default/fallback copy (English) read by consumers that don't localize
  // (search indexing in lib/shop/category-tree.ts + product-engine.ts,
  // Bud Guardian's chat text, page metadata). The storefront UI itself
  // prefers shortDescriptionLocalized/descriptionLocalized below when set.
  shortDescription: string;
  description: string;
  // Optional localized override of shortDescription/description, shown by
  // the storefront UI (e.g. ProductDetail) when present. Falls back to the
  // plain fields above for products that haven't been localized yet.
  shortDescriptionLocalized?: LocalizedText;
  descriptionLocalized?: LocalizedText;
  // Verified inventory count, or `null` when the client hasn't provided one
  // yet. `null` means "no known cap" — never displayed as a number, and
  // never invented (see lib/shop/product-engine.ts's getAvailableStock/
  // getStockStatus for how consumers treat it).
  stock: number | null;
  badges: ProductBadge[];
  reviews: ProductReview[];
  createdAt: string;
  // Optional verified bulk/wholesale pricing tiers, lowest quantity first.
  // Undefined when no bulk pricing has been provided for a product.
  bulkPricing?: BulkPriceTier[];
  // Optional product-specific noun for a bulk tier's quantity ("1 pen" /
  // "2 pens") shown in Product Detail's bulk pricing table and total line.
  // Falls back to the generic localized "unit(s)" wording when unset.
  bulkUnitLabel?: { singular: LocalizedText; plural: LocalizedText };
  // Optional verified format-based pricing (see ProductFormat above),
  // smallest format first. When set, `price` above holds the lowest
  // verified format's price for card/sort/search display ("starting from")
  // only — never an addable per-unit price. Mutually exclusive with
  // bulkPricing in practice; a product should set one or the other, not
  // both.
  formats?: ProductFormat[];
  // True for a product that must never be purchasable through this site at
  // all (e.g. age-restricted cigarettes/tobacco) — informational catalog
  // listing only, in-store purchase. Distinct from isFormatPriced, which
  // still lets a shopper add a selected format to cart/checkout: this flag
  // additionally hides the quantity stepper, Add to Cart, and wishlist
  // controls on Product Detail (see the inStoreOnly branch there) and
  // shows t.productCatalog.detail.inStoreOnlyNotice instead. Undefined/false
  // for every other product — never changes their existing cart behavior.
  inStoreOnly?: boolean;
  // True when no verified price has been supplied for this product yet. It is
  // an informational listing only: `price` holds 0 as a placeholder that must
  // never be displayed, compared or sorted as a real price (see
  // lib/shop/product-engine.ts's isPriceOnRequest / getPriceLabel), and it
  // never exposes Add to Cart or wishlist controls. Undefined/false for every
  // other product.
  priceOnRequest?: boolean;
  // Optional client-supplied quantity → price list shown as an informational
  // "Pricing" table on Product Detail (and "From $X" on the card) in place of
  // the "price on request" wording. DISPLAY ONLY: it never feeds
  // getProductPriceForQuantity, Add to Cart, the cart or checkout, and the
  // product stays priceOnRequest (not purchasable online) regardless. Lowest
  // quantity first. Undefined for every other product.
  infoPricing?: BulkPriceTier[];
  // When true, infoPricing is presented exactly like a product's bulkPricing:
  // the full-width "Bulk Pricing" card below the product (same markup as
  // Pack Man), with the product's bulkUnitLabel wording — instead of the
  // compact "Pricing" table beside the flavours. Still display only: the rows
  // are not selectable and nothing reaches the cart. Undefined for every
  // other product.
  infoPricingAsBulk?: boolean;
  // Optional selectable flavours, grouped into families (see
  // ProductFlavourGroup). One product with many flavours, not one product per
  // flavour. Undefined for every product without a flavour choice.
  flavourGroups?: ProductFlavourGroup[];
  // Optional verified headline specs (see ProductSpec), rendered after the
  // standard category/strain/THC/CBD/weight specs.
  specs?: ProductSpec[];
  // Optional legally required warning shown verbatim (localized) on Product
  // Detail — e.g. the nicotine warning printed on the product packaging.
  warning?: LocalizedText;
};
