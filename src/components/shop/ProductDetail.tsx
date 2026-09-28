"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BatteryCharging,
  Droplet,
  FlaskConical,
  Headset,
  Layers,
  Leaf,
  Monitor,
  Package,
  Percent,
  Scale,
  Store,
  Tag,
  TriangleAlert,
  Weight,
  Wind,
} from "lucide-react";
import ProductBadges from "./ProductBadges";
import ProductFlavourSelector from "./ProductFlavourSelector";
import ProductGallery from "./ProductGallery";
import ShopCta from "./ShopCta";
import StarRating from "./StarRating";
import Reveal from "@/components/Reveal";
import { TelegramIcon } from "@/components/SocialIcons";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  formatBoxPrice,
  formatPrice,
  getAverageRating,
  getBulkSavings,
  getBulkUnitLabel,
  getCategoryLabel,
  getEffectivePrice,
  getInfoPricingFloor,
  getProductPriceForQuantity,
  getStockStatus,
  getStrainLabel,
  isFormatPriced,
  isInStoreOnly,
  isOnSale,
  isPriceOnRequest,
} from "@/lib/shop/product-engine";
import type { ProductFormat, ProductSpec, StorefrontProduct } from "@/types/product";

const SPEC_ICONS: Record<ProductSpec["key"], typeof Tag> = {
  puffs: Wind,
  display: Monitor,
  "e-liquid": Droplet,
  charging: BatteryCharging,
  format: Weight,
  type: Layers,
  box: Package,
  line: Tag,
  "thc-total": Leaf,
  "thc-per-unit": Leaf,
  "cbd-total": Droplet,
  doses: Layers,
  volume: FlaskConical,
  ratio: Scale,
};

export default function ProductDetail({ product }: { product: StorefrontProduct }) {
  const { t, locale } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  // Format-priced products only (see isFormatPriced below): the format row
  // the shopper clicked in the "Available Formats" table, or null before any
  // click — no format is pre-selected on load, so the top price area keeps
  // showing "starting from" until the shopper picks one. Read directly from
  // product.formats, never recomputed/interpolated — see ProductFormat.
  const [selectedFormat, setSelectedFormat] = useState<ProductFormat | null>(null);

  const stockStatus = getStockStatus(product);
  const rating = getAverageRating(product);
  // Format-priced products (verified format/size pricing, e.g. regulated
  // cannabis flower — types/product.ts's ProductFormat) skip the
  // quantity-tier pricing entirely and show the price of whichever format
  // row the shopper picked in the "Available Formats" table below instead —
  // see selectedFormat above and product-engine.ts's isFormatPriced header.
  const formatPriced = isFormatPriced(product);
  // Never purchasable through this site (e.g. age-restricted cigarettes —
  // types/product.ts's inStoreOnly): shows the in-store notice below.
  const inStoreOnly = isInStoreOnly(product);
  // No verified price yet (types/product.ts's priceOnRequest): shows the
  // "price on request" wording and a contact notice in place of the price,
  // never a price or $0.
  const priceOnRequest = isPriceOnRequest(product);
  // Display-only price list (types/product.ts's infoPricing): replaces the
  // "price on request" wording with a "From $X" line and a Pricing table below.
  // Purely informational — never wired to quantity.
  const infoPricing = product.infoPricing && product.infoPricing.length > 0 ? product.infoPricing : null;
  // Tiers for the full-width "Bulk Pricing" card: a product's real bulkPricing
  // (selectable rows) only. Display-only infoPricingAsBulk tiers are never
  // tabled on the detail page — only their "From $X" floor is shown.
  const bulkTiers = product.bulkPricing && product.bulkPricing.length > 0 ? product.bulkPricing : null;
  // Plain price line for Telegram-ordered products — see ProductCard's priceLabel.
  const priceLabel = product.boxPricing
    ? t.productCatalog.card.boxPrice(formatBoxPrice(product.boxPricing.price, locale), product.boxPricing.quantity)
    : product.telegramOrder && infoPricing
      ? t.productCatalog.card.startingFrom(formatPrice(getInfoPricingFloor(infoPricing), locale))
      : null;

  // The official product name/brand are language-independent identity data
  // (types/product.ts) and are read directly below — never through `t` or
  // any locale-keyed lookup. Only supporting copy is localized here.
  const shortDescription = product.shortDescriptionLocalized?.[locale] ?? product.shortDescription;

  // Total price for the selected quantity — resolves to the verified bulk
  // tier when `quantity` matches one exactly, otherwise unit price × quantity.
  // Single source of truth: lib/shop/product-engine.ts's getProductPriceForQuantity.
  // Format-priced products (formatPriced) never go through this quantity-tier
  // pricing at all — they render getEffectivePrice directly instead (see the
  // formatPriced branches below) — so these are skipped for them.
  const totalPrice = formatPriced ? 0 : getProductPriceForQuantity(product, quantity);
  const savings = formatPriced ? null : getBulkSavings(product, quantity);

  const specs = [
    { key: "category", icon: Tag, label: t.productCatalog.detail.category, value: getCategoryLabel(product.category, locale) },
    product.strain && { key: "strain", icon: Leaf, label: t.productCatalog.detail.strain, value: getStrainLabel(product.strain, locale) },
    product.thcPercent !== null && { key: "thc", icon: Percent, label: t.productCatalog.detail.thc, value: `${product.thcPercent}%` },
    product.cbdPercent !== null && { key: "cbd", icon: Droplet, label: t.productCatalog.detail.cbd, value: `${product.cbdPercent}%` },
    product.weightGrams !== null && { key: "weight", icon: Weight, label: t.productCatalog.detail.weight, value: `${product.weightGrams} g` },
    ...(product.specs ?? []).map((spec) => ({ key: spec.key, icon: SPEC_ICONS[spec.key], label: spec.label[locale], value: spec.value[locale] })),
  ].filter(Boolean) as { key: string; icon: typeof Tag; label: string; value: string }[];

  const trustBadges = [
    { icon: Store, label: t.productCatalog.detail.trustInStorePickup },
    { icon: Headset, label: t.productCatalog.detail.trustCustomerSupport },
  ];

  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,_#1a0f08_0%,_#050403_45%,_#000000_100%)]" />
      <div className="absolute inset-0 -z-20 bg-noise opacity-[0.035]" />
      <div className="pointer-events-none absolute -top-20 left-[8%] -z-10 h-72 w-72 animate-pulse-glow rounded-full bg-wb-red/10 blur-[120px] wb-glow-soft" />
      <div
        className="pointer-events-none absolute top-1/4 right-[4%] -z-10 h-80 w-80 animate-pulse-glow rounded-full bg-wb-orange/10 blur-[140px] wb-glow-soft"
        style={{ animationDelay: "1s" }}
      />

      <div className="mx-auto max-w-6xl px-5 py-28 sm:px-8">
        <Link href="/products" className="mb-8 inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors duration-250 hover:text-wb-orange">
          <ArrowLeft className="h-4 w-4" />
          {t.productCatalog.detail.backToShop}
        </Link>

        {/* The gallery and info columns are plain divs, not <Reveal>: they're
            above the fold on every screen size, and Reveal renders at
            opacity 0 until hydration + its IntersectionObserver fire — which
            held back the product image (the page's LCP) and title/price on
            phones. Lower sections below keep their Reveal entrance. */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductGallery images={product.detailImages ?? product.images} fallbackLabel={product.category} />
          </div>

          <div className="min-w-0">
            {/* Same brand → grade → category-label fallback as ProductCard's
                eyebrow — see its comment. */}
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40">
              {product.brand ?? product.grade ?? getCategoryLabel(product.category, locale)}
            </p>
            <h1 className="mt-2 font-display text-3xl tracking-wide text-foreground sm:text-4xl">{product.name}</h1>
            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={rating} size="md" />
            </div>
            <ProductBadges badges={product.badges} className="mt-4" />

            {priceLabel ? (
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-3xl tracking-wide text-gradient-ember sm:text-4xl">{priceLabel}</span>
              </div>
            ) : priceOnRequest ? (
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-3xl tracking-wide text-gradient-ember sm:text-4xl">
                  {infoPricing ? t.productCatalog.card.startingFrom(formatPrice(getInfoPricingFloor(infoPricing), locale)) : t.productCatalog.card.priceOnRequest}
                </span>
              </div>
            ) : formatPriced ? (
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-4xl tracking-wide text-gradient-ember">
                  {selectedFormat
                    ? `${selectedFormat.labelLocalized?.[locale] ?? selectedFormat.label} — ${formatPrice(selectedFormat.price, locale)}`
                    : t.productCatalog.card.startingFrom(formatPrice(getEffectivePrice(product), locale))}
                </span>
              </div>
            ) : (
              <>
                <div className="mt-6 flex items-baseline gap-3">
                  {isOnSale(product) && <span className="text-lg text-foreground/40 line-through">{formatPrice(product.price * quantity, locale)}</span>}
                  <span className="font-display text-4xl tracking-wide text-gradient-ember">{formatPrice(totalPrice, locale)}</span>
                  {product.priceUnit && <span className="text-lg font-semibold text-foreground/70">/ {product.priceUnit[locale]}</span>}
                </div>
                {quantity > 1 && (
                  <p className="mt-1.5 text-xs text-foreground/50">
                    {quantity} {getBulkUnitLabel(product, quantity, locale, t.productCatalog.detail.bulkPricingUnit(quantity))}
                    <br />
                    {t.productCatalog.detail.totalPrice(formatPrice(totalPrice, locale))}
                  </p>
                )}
                {savings !== null && (
                  <p className="mt-1.5 text-xs font-semibold text-wb-green">{t.productCatalog.detail.youSave(formatPrice(savings, locale))}</p>
                )}
              </>
            )}

            {shortDescription && <p className="mt-4 text-sm leading-relaxed text-foreground/70">{shortDescription}</p>}

            {specs.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {specs.map(({ key, icon: Icon, label, value }) => (
                  <div
                    key={key}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-colors duration-250 hover:border-wb-orange/30 hover:bg-white/[0.05]"
                  >
                    <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/40">
                      <Icon className="h-3.5 w-3.5 text-wb-orange/70" strokeWidth={2} />
                      {label}
                    </dt>
                    <dd className="mt-1.5 text-sm font-semibold text-foreground/90">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {product.flavourGroups && product.flavourGroups.length > 0 && <ProductFlavourSelector groups={product.flavourGroups} />}

            {priceOnRequest && infoPricing && product.infoPricingAsBulk ? null : priceOnRequest && infoPricing ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">
                  {product.infoPricingAsFormats ? t.productCatalog.detail.availableFormatsTitle : t.productCatalog.detail.infoPricingTitle}
                </h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
                        <th className="pb-3 pr-4 font-semibold">
                          {product.infoPricingAsFormats ? t.productCatalog.detail.formatColumn : t.productCatalog.detail.bulkPricingQuantity}
                        </th>
                        <th className="pb-3 font-semibold">
                          {product.infoPricingAsFormats ? t.productCatalog.detail.priceColumn : t.productCatalog.detail.bulkPricingPrice}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {infoPricing.map((tier) => (
                        <tr key={tier.label?.en ?? tier.quantity} className="border-b border-white/5 last:border-0">
                          <td className="py-2.5 pr-4 text-foreground/80">
                            {tier.label ? tier.label[locale] : `${tier.quantity} ${t.productCatalog.detail.bulkPricingUnit(tier.quantity)}`}
                          </td>
                          <td className="py-2.5 font-semibold text-foreground">{formatPrice(tier.price, locale)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : priceOnRequest ? (
              <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-foreground/70">
                <Store className="h-4 w-4 shrink-0 text-wb-orange" strokeWidth={2} />
                {t.productCatalog.detail.priceOnRequestNotice}
              </div>
            ) : inStoreOnly ? (
              <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-foreground/70">
                <Store className="h-4 w-4 shrink-0 text-wb-orange" strokeWidth={2} />
                {t.productCatalog.detail.inStoreOnlyNotice}
              </div>
            ) : !formatPriced && stockStatus === "out-of-stock" ? (
              <p className="mt-6 text-sm font-semibold text-wb-red">{t.productCatalog.detail.outOfStock}</p>
            ) : null}

            {/* Team communication link only — carries no price, quantity or
                order state (types/product.ts's telegramContact). Every vape
                shows it, since vapes are ordered through the team on Telegram. */}
            {(product.telegramContact || product.category === "vapes") && (
              <a
                href={SITE.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.productCatalog.detail.telegramContactAria}
                className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-wb-telegram px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-wide text-white ring-1 ring-inset ring-white/15 transition-[background-color,box-shadow,transform] duration-300 ease-out hover:scale-[1.02] hover:bg-wb-telegram-hover hover:shadow-[0_0_28px_-6px_rgba(42,171,238,0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wb-telegram-bright sm:w-auto sm:inline-flex"
              >
                <TelegramIcon variant="mono" className="h-5 w-5 shrink-0" />
                {t.productCatalog.detail.telegramContact}
              </a>
            )}

            {product.warning && (
              <div role="note" className="mt-6 flex items-start gap-2.5 rounded-xl border border-wb-red/30 bg-wb-red/[0.06] p-4 text-sm font-semibold text-foreground/85">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-wb-red" strokeWidth={2} />
                <span className="min-w-0 break-words">{product.warning[locale]}</span>
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 gap-2.5 border-t border-white/10 pt-6 sm:grid-cols-2">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-xs text-foreground/60">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-wb-orange">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {product.formats && product.formats.length > 0 && (
          <Reveal className="mt-10 sm:mt-12">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.productCatalog.detail.availableFormatsTitle}</h2>
              <div className="mt-5 max-w-2xl overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
                      <th className="pb-3 pr-4 font-semibold">{t.productCatalog.detail.formatColumn}</th>
                      <th className="pb-3 font-semibold">{t.productCatalog.detail.priceColumn}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.formats.map((format) => {
                      const active = selectedFormat?.label === format.label;
                      return (
                        <tr
                          key={format.label}
                          role="button"
                          tabIndex={0}
                          aria-pressed={active}
                          onClick={() => setSelectedFormat(format)}
                          onKeyDown={(e) => {
                            if (e.key !== "Enter" && e.key !== " ") return;
                            e.preventDefault();
                            setSelectedFormat(format);
                          }}
                          className={`cursor-pointer border-b border-white/5 transition-colors duration-200 last:border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-wb-orange/60 ${
                            active ? "bg-wb-orange/10" : "hover:bg-white/[0.04]"
                          }`}
                        >
                          <td className={`py-2.5 pr-4 ${active ? "font-semibold text-wb-orange" : "text-foreground/80"}`}>{format.labelLocalized?.[locale] ?? format.label}</td>
                          <td className={`py-2.5 font-semibold ${active ? "text-wb-orange" : "text-foreground"}`}>
                            {formatPrice(format.price, locale)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        )}

        {bulkTiers && (
          <Reveal className="mt-10 sm:mt-12">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.productCatalog.detail.bulkPricingTitle}</h2>
              <div className="mt-5 max-w-2xl overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
                      <th className="pb-3 pr-4 font-semibold">{t.productCatalog.detail.bulkPricingQuantity}</th>
                      <th className="pb-3 font-semibold">{t.productCatalog.detail.bulkPricingPrice}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkTiers.map((tier) => {
                      const active = tier.quantity === quantity;
                      return (
                        <tr
                          key={tier.quantity}
                          role="button"
                          tabIndex={0}
                          aria-pressed={active}
                          onClick={() => setQuantity(tier.quantity)}
                          onKeyDown={(e) => {
                            if (e.key !== "Enter" && e.key !== " ") return;
                            e.preventDefault();
                            setQuantity(tier.quantity);
                          }}
                          className={`cursor-pointer border-b border-white/5 transition-colors duration-200 last:border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-wb-orange/60 ${
                            active ? "bg-wb-orange/10" : "hover:bg-white/[0.04]"
                          }`}
                        >
                          <td className={`py-2.5 pr-4 ${active ? "font-semibold text-wb-orange" : "text-foreground/80"}`}>
                            {tier.quantity} {getBulkUnitLabel(product, tier.quantity, locale, t.productCatalog.detail.bulkPricingUnit(tier.quantity))}
                          </td>
                          <td className={`py-2.5 font-semibold ${active ? "text-wb-orange" : "text-foreground"}`}>
                            {formatPrice(tier.price, locale)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        )}

        <ShopCta />
      </div>
    </div>
  );
}
