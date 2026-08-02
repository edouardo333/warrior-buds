"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();

  const NAV_LINKS = [
    { label: t.nav.links.home, href: "/" },
    { label: t.nav.links.products, href: "/products" },
    { label: t.nav.links.learningCenter, href: "/learning-center" },
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

  return (
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

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium uppercase tracking-wide text-foreground/80 transition-colors hover:text-wb-orange"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-6 lg:flex">
          <LanguageSwitcher />
          <Link
            href="/contact"
            className="rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-5 py-2 text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105"
          >
            {t.nav.visitStore}
          </Link>
        </div>

        <button
          type="button"
          aria-label={isOpen ? t.nav.closeMenu : t.nav.openMenu}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
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
        className={`fixed inset-0 top-16 z-40 bg-background/98 backdrop-blur-lg transition-all duration-300 lg:hidden ${
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
