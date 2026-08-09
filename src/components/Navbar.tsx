"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, PackageSearch, ShoppingCart, User } from "lucide-react";
import AnnouncementBar from "./AnnouncementBar";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import MiniCart from "./cart/MiniCart";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAccount } from "@/lib/shop/auth-actions";

const STAFF_ACCESS_CLICK_COUNT = 5;
const STAFF_ACCESS_WINDOW_MS = 3000;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, locale } = useLanguage();
  // French nav labels ("Centre d'apprentissage", "À propos") run noticeably
  // longer than their English counterparts, so the desktop nav needs tighter
  // gaps to fit on one line at the same widths EN already fits comfortably.
  const isFr = locale === "fr";
  const router = useRouter();
  const account = useAccount();
  const accountHref = account ? "/account" : "/login";
  const logoClickTimestamps = useRef<number[]>([]);
  const headerRef = useRef<HTMLElement | null>(null);
  // AnnouncementBar sits above the nav row inside this same fixed header,
  // and its text can wrap to 2–3 lines on narrow viewports (longer in FR),
  // so the header's real height isn't a fixed constant — measure it so the
  // mobile menu overlay below can start exactly where the header ends
  // instead of a hardcoded offset that would gap or overlap.
  const [headerHeight, setHeaderHeight] = useState(0);

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const now = Date.now();
    const recentClicks = logoClickTimestamps.current.filter(
      (timestamp) => now - timestamp < STAFF_ACCESS_WINDOW_MS
    );
    recentClicks.push(now);

    if (recentClicks.length >= STAFF_ACCESS_CLICK_COUNT) {
      logoClickTimestamps.current = [];
      event.preventDefault();
      setIsOpen(false);
      router.push("/staff");
      return;
    }

    logoClickTimestamps.current = recentClicks;
    setIsOpen(false);
  };

  const NAV_LINKS = [
    { label: t.nav.links.home, href: "/" },
    { label: t.nav.links.products, href: "/products" },
    { label: t.nav.links.learningCenter, href: "/learning-center" },
    { label: t.nav.links.faq, href: "/faq" },
    { label: t.nav.links.about, href: "/about" },
    { label: t.nav.links.gallery, href: "/gallery" },
    { label: t.nav.links.reviews, href: "/reviews" },
    { label: t.nav.links.contact, href: "/contact" },
  ];

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setHeaderHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [t]);

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-white/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <AnnouncementBar />
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" onClick={handleLogoClick}>
          <Logo imageClassName="h-9 sm:h-11" />
        </Link>

        <ul className={`hidden items-center gap-4 xl:flex ${isFr ? "xl:gap-3" : "xl:gap-6"}`}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="whitespace-nowrap text-sm font-medium uppercase tracking-wide text-foreground/80 transition-colors hover:text-wb-orange"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={`hidden items-center gap-2.5 xl:flex ${isFr ? "xl:gap-1.5" : "xl:gap-3"}`}>
          <Link
            href="/track-order"
            aria-label={t.nav.trackOrder}
            title={t.nav.trackOrder}
            className="flex h-9 w-9 items-center justify-center text-foreground/80 transition-colors hover:text-wb-orange"
          >
            <PackageSearch className="h-5 w-5" />
          </Link>
          <Link
            href="/wishlist"
            aria-label={t.nav.wishlist}
            title={t.nav.wishlist}
            className="flex h-9 w-9 items-center justify-center text-foreground/80 transition-colors hover:text-wb-orange"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            href={accountHref}
            aria-label={account ? t.nav.account : t.nav.login}
            title={account ? t.nav.account : t.nav.login}
            className="flex h-9 w-9 items-center justify-center text-foreground/80 transition-colors hover:text-wb-orange"
          >
            <User className="h-5 w-5" />
          </Link>
          <MiniCart />
          <span className="mx-1 h-6 w-px bg-white/10" aria-hidden="true" />
          <LanguageSwitcher />
          <Link
            href="/contact"
            className={`whitespace-nowrap rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow py-2 text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105 ${
              isFr ? "px-4" : "px-5"
            }`}
          >
            {t.nav.visitStore}
          </Link>
        </div>

        <button
          type="button"
          aria-label={isOpen ? t.nav.closeMenu : t.nav.openMenu}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 xl:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-foreground transition-transform duration-300 ${
              isOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-foreground transition-opacity duration-300 ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-foreground transition-transform duration-300 ${
              isOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      <div
        style={{ top: headerHeight || undefined }}
        className={`fixed inset-x-0 bottom-0 top-16 z-40 bg-background/98 backdrop-blur-lg transition-all duration-300 xl:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="flex flex-col items-center gap-6 px-6 py-10">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-display text-3xl tracking-wide text-foreground/90 transition-colors hover:text-wb-orange"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-6 pt-2">
            <Link
              href="/track-order"
              onClick={() => setIsOpen(false)}
              aria-label={t.nav.trackOrder}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-foreground/80 transition-colors hover:border-wb-orange/50 hover:text-wb-orange"
            >
              <PackageSearch className="h-5 w-5" />
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setIsOpen(false)}
              aria-label={t.nav.wishlist}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-foreground/80 transition-colors hover:border-wb-orange/50 hover:text-wb-orange"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <Link
              href={accountHref}
              onClick={() => setIsOpen(false)}
              aria-label={account ? t.nav.account : t.nav.login}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-foreground/80 transition-colors hover:border-wb-orange/50 hover:text-wb-orange"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              aria-label={t.nav.cart}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-foreground/80 transition-colors hover:border-wb-orange/50 hover:text-wb-orange"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </li>
          <li className="pt-2">
            <LanguageSwitcher className="text-base" />
          </li>
          <li className="pt-4">
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-8 py-3 text-sm font-semibold uppercase tracking-wide text-black"
            >
              {t.nav.visitStore}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
