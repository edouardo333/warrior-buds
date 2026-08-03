"use client";

import Link from "next/link";
import { MapPin, Smartphone } from "lucide-react";
import Logo from "./Logo";
import Reveal from "./Reveal";
import { SITE } from "@/lib/site";
import OpeningStatus from "./OpeningStatus";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { InstagramIcon, LinktreeIcon } from "./SocialIcons";

export default function Footer() {
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

      <footer className="relative border-t border-white/10 bg-black px-5 pb-8 pt-16 sm:px-8">
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
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 pt-6 text-center text-xs text-foreground/40">
          <p>
            {t.footer.copyright(new Date().getFullYear())}
            <span className="mx-1.5 text-foreground/20">·</span>
            {t.footer.credit}
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="transition-colors hover:text-foreground/70">{t.footer.privacyPolicy}</span>
            <span className="text-foreground/20">•</span>
            <span className="transition-colors hover:text-foreground/70">{t.footer.terms}</span>
            <span className="text-foreground/20">•</span>
            <span className="transition-colors hover:text-foreground/70">{t.footer.cookiePolicy}</span>
          </p>
          <p className="max-w-2xl text-foreground/30">{t.footer.disclaimer}</p>
        </div>
      </footer>
    </>
  );
}
