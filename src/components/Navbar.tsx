"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { TelegramIcon } from "./SocialIcons";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, locale } = useLanguage();
  // French nav labels ("Centre d'apprentissage") run noticeably longer than
  // their English counterparts, so the desktop nav needs tighter gaps to fit
  // on one line at the same widths EN already fits comfortably.
  const isFr = locale === "fr";

  const NAV_LINKS = [
    { label: t.nav.links.home, href: "/" },
    { label: t.nav.links.products, href: "/products" },
    { label: t.nav.links.learningCenter, href: "/learning-center" },
    { label: t.nav.links.reviews, href: "/reviews" },
    { label: t.nav.links.contact, href: "/contact" },
  ];

  useEffect(() => {
    // While the mobile menu is open, body is pinned with `position: fixed`
    // (see the scroll-lock effect below) so it can't visually scroll — but
    // that pin itself makes `window.scrollY` read back as 0, since the page
    // no longer has any real scroll offset while pinned. Left unguarded,
    // that synthetic 0 fires this listener and flips the header back to its
    // transparent top-of-page look mid-open, exposing whatever real page
    // content sits behind the now-transparent header strip. Skipping scroll
    // reads while the menu is open keeps the header exactly as it looked
    // the moment the menu opened.
    const onScroll = () => {
      if (isOpen) return;
      setIsScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOpen]);

  // Body scroll lock for the open mobile menu. Plain `overflow: hidden` on
  // body is not enough — iOS Safari still lets touch-scrolling bleed through
  // to the page behind a fixed overlay. Pinning the body itself with
  // `position: fixed` (offset by the current scrollY) is the standard fix:
  // it fully blocks background scrolling and, since the page never actually
  // scrolled while pinned, restoring position/top and calling scrollTo puts
  // the user back exactly where they were.
  const scrollPositionRef = useRef(0);
  useEffect(() => {
    if (!isOpen) return;
    scrollPositionRef.current = window.scrollY;
    const { style } = document.body;
    const previousPosition = style.position;
    const previousTop = style.top;
    const previousLeft = style.left;
    const previousRight = style.width;
    style.position = "fixed";
    style.top = `-${scrollPositionRef.current}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    return () => {
      style.position = previousPosition;
      style.top = previousTop;
      style.left = previousLeft;
      style.width = previousRight;
      style.right = "";
      window.scrollTo(0, scrollPositionRef.current);
    };
  }, [isOpen]);

  // Escape closes the menu, and so does growing past the xl breakpoint
  // (tablet rotation) — the overlay is xl:hidden there, which would otherwise
  // leave the body pinned by the scroll lock above with no visible way out.
  useEffect(() => {
    if (!isOpen) return;
    const desktop = window.matchMedia("(min-width: 80rem)");
    const close = () => setIsOpen(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) close();
    };
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [isOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-md border-b border-white/10"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" onClick={() => setIsOpen(false)}>
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
            <LanguageSwitcher />
            <a
              href={SITE.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-wb-telegram py-2 text-sm font-semibold uppercase tracking-wide text-white ring-1 ring-inset ring-white/15 transition-[background-color,transform] duration-200 hover:scale-105 hover:bg-wb-telegram-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wb-telegram-bright ${
                isFr ? "pl-3 pr-4" : "pl-3.5 pr-5"
              }`}
            >
              <TelegramIcon variant="mono" className="h-[18px] w-[18px] shrink-0" />
              {t.nav.joinUs}
              <span className="sr-only"> (Telegram)</span>
            </a>
          </div>

          <button
            type="button"
            aria-label={isOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={isOpen}
            aria-controls="wb-mobile-nav"
            onClick={() => setIsOpen((v) => !v)}
            className="relative z-50 -mr-0.5 flex h-11 w-11 flex-col items-center justify-center gap-1.5 xl:hidden"
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
      </header>

      {/* Rendered as a header SIBLING, not a child — `header` gains
          `backdrop-blur-md` once the page is scrolled, and a backdrop-filter
          (like a transform or filter) creates a containing block for any
          `position: fixed` descendant. That reparented the overlay's "fixed"
          coordinates onto header's own small box instead of the viewport,
          which is why it only looked like a true fullscreen overlay at
          scrollY 0 (before backdrop-blur-md ever applied). Living outside
          header keeps it fixed to the viewport no matter how far the page
          has scrolled or what styles header picks up. */}
      {/* Closed state uses `invisible` (visibility: hidden) on top of the
          opacity fade, so the hidden links leave the tab order and the
          accessibility tree instead of staying focusable behind the page.
          No backdrop-filter: the 98%-opaque fill already hides the page, and
          a full-screen blur is costly to animate on phones. */}
      <div
        id="wb-mobile-nav"
        className={`fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain bg-background/98 transition-[opacity,visibility] duration-300 xl:hidden ${
          isOpen
            ? "visible pointer-events-auto opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      >
        <ul className="flex flex-col items-center gap-3 px-6 py-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="inline-block px-3 py-1.5 text-center font-display text-3xl tracking-wide text-foreground/90 transition-colors hover:text-wb-orange"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <LanguageSwitcher className="text-base" buttonClassName="min-h-11 min-w-11 justify-center" />
          </li>
          <li className="pt-4">
            <a
              href={SITE.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-2.5 rounded-full bg-wb-telegram px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white ring-1 ring-inset ring-white/15 transition-colors hover:bg-wb-telegram-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wb-telegram-bright"
            >
              <TelegramIcon variant="mono" className="h-5 w-5 shrink-0" />
              {t.nav.joinUs}
              <span className="sr-only"> (Telegram)</span>
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
