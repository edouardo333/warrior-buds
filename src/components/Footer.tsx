"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Smartphone } from "lucide-react";
import Logo from "./Logo";
import Reveal from "./Reveal";
import { SITE } from "@/lib/site";
import OpeningStatus from "./OpeningStatus";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { InstagramIcon, LinktreeIcon } from "./SocialIcons";

type FooterProps = {
  hideCta?: boolean;
};

// Decorative brand marks only — the payment integrations these represent are
// unchanged by this list. Each source file is the real brand asset supplied
// in public/images/logo/, but every one of them was exported onto its own
// oversized transparent canvas with a very different amount of internal
// padding (e.g. the Visa wordmark only fills ~27% of its square canvas'
// height, while Mastercard's circles fill ~99% of theirs). Sizing the <img>
// box itself by that raw canvas height would make some logos look shrunken
// (Visa) or force the row to reserve a huge invisible margin around others
// just to make their ink match — neither reads as "balanced."
//
// Instead each entry below defines a `boxClass` sized to the logo's actual
// visible ink (its cropped bounding box), and an `imgClass` sized to that
// same box's underlying full canvas at the same scale. The image is rendered
// oversized and centered inside an overflow-hidden box (boxClass), so only
// the ink shows — the transparent padding is simply clipped, never distorted
// or stretched. Both classes are derived from each file's measured
// bounding-box aspect ratio, so this is still exactly the source file,
// scaled uniformly and cropped to its own artwork — not recreated.
// Desktop (sm:) box/img sizes below are derived from each file's measured
// visible-ink bounding box (via a one-off sharp alpha-scan), scaled so that
// bounding box hits the requested desktop target — e.g. Visa's box is
// 160px wide because its ink (not its square canvas) measures 160px wide
// at that scale. Mobile (unprefixed) sizes are the same bounding box scaled
// to ~55% of the desktop target, keeping every logo's proportions identical
// across breakpoints while fitting a 7-up wrapped row on small screens.
const PAYMENT_METHODS = [
  {
    id: "interac",
    src: "/images/logo/interac-email-transfer-logo.webp",
    alt: "Interac e-Transfer",
    canvasWidth: 300,
    canvasHeight: 376,
    // Desktop target: ~85px visible height — sized down for row balance.
    boxClass: "h-[47px] w-[34px] sm:h-[85px] sm:w-[62px]",
    imgClass: "h-[52px] w-[42px] sm:h-[95px] sm:w-[76px]",
  },
  {
    id: "visa",
    src: "/images/logo/visa-logo-png_seeklogo-149697.webp",
    alt: "Visa",
    canvasWidth: 320,
    canvasHeight: 320,
    // Desktop target: ~115px visible width — sized down for row balance.
    boxClass: "h-[19px] w-[63px] sm:h-[35px] sm:w-[115px]",
    imgClass: "h-[70px] w-[70px] sm:h-[128px] sm:w-[128px]",
  },
  {
    id: "mastercard",
    src: "/images/logo/MasterCard_Logo.svg.webp",
    alt: "Mastercard",
    canvasWidth: 1280,
    canvasHeight: 768,
    // Desktop target: ~105px visible width — sized down for row balance.
    boxClass: "h-[35px] w-[58px] sm:h-[63px] sm:w-[105px]",
    imgClass: "h-[35px] w-[58px] sm:h-16 sm:w-[106px]",
  },
  {
    id: "amex",
    src: "/images/logo/American-Express-Logo.webp",
    alt: "American Express",
    canvasWidth: 3840,
    canvasHeight: 2160,
    // Desktop target: ~100px visible height — unchanged.
    boxClass: "h-[55px] w-[55px] sm:h-[100px] sm:w-[100px]",
    imgClass: "h-[57px] w-[101px] sm:h-[103px] sm:w-[183px]",
  },
  {
    id: "bitcoin",
    src: "/images/logo/logo-bitcoin-transparent.webp",
    alt: "Bitcoin",
    canvasWidth: 1536,
    canvasHeight: 1024,
    // Desktop target: ~150px visible height including wordmark — enlarged
    // to be the row's intentionally most-prominent mark. Size unchanged
    // from prior pass.
    boxClass: "h-[83px] w-[65px] sm:h-[150px] sm:w-[119px]",
    imgClass: "h-[109px] w-[163px] sm:h-[198px] sm:w-[297px]",
    // This file's ink sits well above the canvas's vertical center (top
    // margin 95px vs. bottom margin 154px), so plain -50% centering was
    // cropping into the coin's top edge while leaving dead space at the
    // bottom. Nudges the crop window down to match the true bounding box.
    translateYClass: "translate-y-[calc(-50%_+_3px)] sm:translate-y-[calc(-50%_+_6px)]",
  },
  {
    id: "ethereum",
    // New purple transparent asset, used directly as the image source (no
    // recoloring, no old asset). Canvas matches this file's real 1536x1024
    // dimensions.
    src: "/images/logo/logo-ethereum-01-transparent.webp",
    alt: "Ethereum",
    canvasWidth: 1536,
    canvasHeight: 1024,
    // Desktop target: ~150px visible height including wordmark — matched to
    // Bitcoin's visible height so the two read as the same visual weight.
    // Size unchanged from prior pass.
    boxClass: "h-[83px] w-[87px] sm:h-[150px] sm:w-[158px]",
    imgClass: "h-[120px] w-[180px] sm:h-[218px] sm:w-[328px]",
    // Renders at full opacity — see `opacityClass` fallback below. This
    // asset's purple must stay exactly as authored, with no dimming/filter.
    opacityClass: "opacity-100",
    // This file's ink sits left-and-above the canvas's true center (right
    // margin 23px narrower than left, bottom margin 63px taller than top),
    // so plain -50%/-50% centering was cropping into the mark and leaving
    // it off-center in its box. Nudges the crop window to match the true
    // bounding box, both for correct vertical centering and so the box's
    // horizontal edges sit exactly at the ink for even row spacing.
    translateXClass: "translate-x-[calc(-50%_-_1px)] sm:translate-x-[calc(-50%_-_2px)]",
    translateYClass: "translate-y-[calc(-50%_+_4px)] sm:translate-y-[calc(-50%_+_7px)]",
  },
  {
    id: "shakepay",
    src: "/images/logo/logo-shakepay-transparent.webp",
    alt: "Shakepay",
    canvasWidth: 1536,
    canvasHeight: 1024,
    // Desktop target: ~120px visible width — unchanged.
    boxClass: "h-[53px] w-[66px] sm:h-[97px] sm:w-[120px]",
    imgClass: "h-[78px] w-[117px] sm:h-[142px] sm:w-[212px]",
    // This file's ink sits right-and-above the canvas's true center (left
    // margin 26px narrower than right, bottom margin 105px taller than
    // top), so plain -50%/-50% centering was cropping into the mark and
    // leaving it off-center in its box. Same correction as Ethereum above.
    translateXClass: "translate-x-[calc(-50%_+_1px)] sm:translate-x-[calc(-50%_+_2px)]",
    translateYClass: "translate-y-[calc(-50%_+_4px)] sm:translate-y-[calc(-50%_+_7px)]",
  },
] as const;

export default function Footer({ hideCta = false }: FooterProps = {}) {
  const { t } = useLanguage();

  const NAV_LINKS = [
    { label: t.nav.links.home, href: "/" },
    { label: t.nav.links.products, href: "/products" },
    { label: t.nav.links.learningCenter, href: "/learning-center" },
    { label: t.nav.links.about, href: "/about" },
    { label: t.nav.links.gallery, href: "/gallery" },
    { label: t.nav.links.contact, href: "/contact" },
    { label: t.nav.trackOrder, href: "/track-order" },
    { label: t.nav.account, href: "/account" },
  ];

  return (
    <>
      {!hideCta && (
        <section className="relative overflow-hidden border-t border-white/10 bg-black px-5 py-20 sm:px-8">
          <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-wb-orange/10 blur-[150px]" />
          <Reveal className="relative mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl tracking-wide text-foreground sm:text-5xl">
              {t.footer.ctaTitlePrefix}{" "}
              <span className="text-gradient-ember">{t.footer.ctaTitleHighlight}</span>?
            </h2>
            <p className="mt-4 text-foreground/60">{t.footer.ctaSubtitle}</p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105"
              >
                {t.footer.getDirections}
              </a>
              <a
                href={SITE.phoneHref}
                className="rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-wb-orange/60 hover:text-wb-orange"
              >
                {t.footer.callNow}
              </a>
            </div>
          </Reveal>
        </section>
      )}

      <footer className="relative border-t border-white/10 bg-black px-5 pb-24 pt-16 sm:px-8 sm:pb-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-[0.9fr_0.85fr_0.9fr_1.5fr_0.85fr]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Logo imageClassName="h-[150px]" />
            <p className="mt-4 max-w-xs text-sm text-foreground/60">{t.footer.tagline}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-wb-orange">
              {t.footer.exploreHeading}
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/70 transition-colors duration-200 hover:text-wb-orange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-wb-orange">
              {t.footer.visitHeading}
            </h3>
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-4 flex items-start gap-2 transition-transform duration-200 hover:scale-[1.02]"
            >
              <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-red-500 transition-[filter] duration-200 group-hover:brightness-125" />
              <address className="flex flex-col gap-1 text-sm not-italic text-foreground/70 transition-colors duration-200 group-hover:text-foreground/90">
                <span>{SITE.addressLine1}</span>
                <span>{SITE.addressLine2}</span>
              </address>
            </a>
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-foreground/70 transition-colors duration-200 hover:text-wb-orange"
            >
              {t.footer.getDirectionsLink}
            </a>
          </div>

          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-wb-orange">
              {t.footer.hoursHeading}
            </h3>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-foreground/90">
              {t.footer.openDaily}
            </p>
            <p className="mt-1 text-sm text-foreground/70">{t.footer.hoursValue}</p>
            <div className="mt-3">
              <OpeningStatus size="sm" />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-wb-orange">
              {t.footer.contactHeading}
            </h3>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-foreground/70">
              <li>
                <a
                  href={SITE.phoneHref}
                  className="group inline-flex items-center gap-2 transition-transform duration-200 hover:scale-[1.02] hover:text-foreground/90"
                >
                  <Smartphone className="h-[18px] w-[18px] shrink-0 text-blue-500 transition-[filter] duration-200 group-hover:brightness-125" />
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 transition-transform duration-200 hover:scale-[1.02] hover:text-foreground/90"
                >
                  <InstagramIcon className="h-[18px] w-[18px] shrink-0 transition-[filter] duration-200 group-hover:brightness-110" />
                  {t.footer.instagram}
                </a>
              </li>
              <li>
                <a
                  href={SITE.linktreeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 transition-transform duration-200 hover:scale-[1.02] hover:text-foreground/90"
                >
                  <LinktreeIcon className="h-[18px] w-[18px] shrink-0 transition-[filter] duration-200 group-hover:brightness-125" />
                  {t.footer.linktree}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider-ember mx-auto mt-14 max-w-6xl" />

        <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center gap-4 text-center">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-wb-orange">
            {t.footer.paymentMethodsHeading}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-4 sm:gap-x-9 lg:gap-x-10">
            {PAYMENT_METHODS.map((method) => {
              // Each mark defaults to a dimmed 80%-opacity resting state
              // (brightening to 100% on hover), but an entry can opt out via
              // `opacityClass` when that default reads too dark for its
              // ink — see the Ethereum entry above.
              const opacityClass =
                "opacityClass" in method ? method.opacityClass : "opacity-80 hover:opacity-100";
              // Plain -50%/-50% centers the full (padded) canvas, not the
              // visible ink — fine when a file's bounding box sits centered
              // in its canvas, but wrong when it doesn't (see Bitcoin,
              // Ethereum, Shakepay above). Those entries supply a corrected
              // calc()-based translate so the crop window lands exactly on
              // the ink: centered in its box, tight against every edge, so
              // the row's uniform gap reads as equal visual distance
              // between logos rather than between mismatched padding.
              const translateXClass = "translateXClass" in method ? method.translateXClass : "-translate-x-1/2";
              const translateYClass = "translateYClass" in method ? method.translateYClass : "-translate-y-1/2";
              return (
                <span key={method.id} className={`relative overflow-hidden ${method.boxClass}`}>
                  <Image
                    src={method.src}
                    alt={method.alt}
                    width={method.canvasWidth}
                    height={method.canvasHeight}
                    className={`absolute left-1/2 top-1/2 object-contain transition-[opacity,transform] duration-200 hover:scale-105 ${opacityClass} ${translateXClass} ${translateYClass} ${method.imgClass}`}
                  />
                </span>
              );
            })}
          </div>
          <p className="text-xs text-foreground/40">{t.footer.paymentMethodsNote}</p>
        </div>

        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 pt-8 text-center text-xs text-foreground/40">
          <p>
            {t.footer.copyright(new Date().getFullYear())}
            <span className="mx-1.5 text-foreground/20">·</span>
            {t.footer.credit}
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <Link href="/privacy-policy" className="transition-colors hover:text-foreground/70">
              {t.footer.privacyPolicy}
            </Link>
            <span className="text-foreground/20">•</span>
            <Link href="/terms-and-conditions" className="transition-colors hover:text-foreground/70">
              {t.footer.terms}
            </Link>
            <span className="text-foreground/20">•</span>
            <Link href="/cookie-policy" className="transition-colors hover:text-foreground/70">
              {t.footer.cookiePolicy}
            </Link>
          </p>
          <p className="max-w-2xl text-foreground/30">{t.footer.disclaimer}</p>
        </div>
      </footer>
    </>
  );
}
