"use client";

// Global 404 (also reached from an invalid /products/[slug] via
// notFound() in app/products/[slug]/page.tsx — see the H4 product-route
// verification report). Kept intentionally simple: real nav chrome plus a
// usable path back to the shop and the homepage, no invented content.
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="relative isolate flex min-h-[60vh] flex-col items-center justify-center overflow-hidden px-5 py-28 text-center sm:px-8">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,_#1a0f08_0%,_#050403_45%,_#000000_100%)]" />
          <div className="pointer-events-none absolute -top-20 left-[8%] -z-10 h-72 w-72 rounded-full bg-wb-red/10 blur-[120px]" />
          <p className="font-display text-6xl tracking-wide text-gradient-ember sm:text-7xl">404</p>
          <h1 className="mt-4 text-xl font-semibold text-foreground sm:text-2xl">{t.notFoundPage.title}</h1>
          <p className="mt-3 max-w-md text-sm text-foreground/60">{t.notFoundPage.message}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-250 hover:scale-[1.02]"
            >
              {t.notFoundPage.backToProducts}
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/15 bg-white/[0.03] px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-foreground/80 transition-colors duration-250 hover:border-wb-orange/50 hover:text-wb-orange"
            >
              {t.notFoundPage.backHome}
            </Link>
          </div>
        </div>
      </main>
      <Footer hideCta />
    </>
  );
}
