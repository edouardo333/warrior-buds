"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useLanguage } from "./LanguageContext";
import type { Dictionary } from "./types";

// C2 fix: every route's <title> comes from Next's static `metadata` export,
// which is fixed at build/request time in French and can't read the
// client-only locale (see AGENTS.md / LanguageContext — no locale-prefixed
// routes, locale lives in localStorage). This mirrors the *visible* title to
// the selected locale after mount/navigation/locale change, while the
// server-rendered <title> (what a crawler or no-JS request sees) stays the
// French default — see the C2+H6 report for what's server-static vs
// client-updated.
//
// Route → title resolver, reusing existing dictionary strings so this adds
// no user-facing copy of its own beyond the two home.metaTitle entries.
// Exact-match first, longest-prefix-wins ordering isn't needed since each
// check is either an exact path or a distinct prefix.
function resolveTitle(pathname: string, t: Dictionary): string | null {
  switch (pathname) {
    case "/":
      return t.home.metaTitle;
    case "/about":
      return t.about.metaTitle;
    case "/contact":
      return t.contact.metaTitle;
    case "/gallery":
      return t.gallery.metaTitle;
    case "/reviews":
      return t.reviews.metaTitle;
    case "/learning-center":
      return t.learningCenter.metaTitle;
    case "/faq":
      return t.faq.metaTitle;
    case "/products":
      return t.productCatalog.metaTitle;
    case "/cart":
      return t.cart.metaTitle;
    case "/wishlist":
      return t.wishlist.metaTitle;
    case "/track-order":
      return t.trackOrder.metaTitle;
    case "/checkout":
      return t.checkout.metaTitle;
    case "/login":
      return t.auth.login.metaTitle;
    case "/signup":
      return t.auth.signup.metaTitle;
    case "/forgot-password":
      return t.auth.forgotPassword.metaTitle;
    case "/reset-password":
      return t.auth.resetPassword.metaTitle;
    case "/verify-email":
      return t.auth.verifyEmail.metaTitle;
    case "/privacy-policy":
      return t.legal.privacy.metaTitle;
    case "/terms-and-conditions":
      return t.legal.terms.metaTitle;
    case "/cookie-policy":
      return t.legal.cookies.metaTitle;
    case "/account":
      return `${t.account.dashboard.title} | Warrior Buds`;
    case "/account/profile":
      return `${t.account.profile.title} | Warrior Buds`;
    case "/account/addresses":
      return `${t.account.addresses.title} | Warrior Buds`;
    case "/account/payment-methods":
      return `${t.account.paymentMethods.title} | Warrior Buds`;
    case "/account/settings":
      return `${t.account.settings.title} | Warrior Buds`;
    case "/account/orders":
      return `${t.account.orders.title} | Warrior Buds`;
    default:
      // /account/orders/[id] — a dynamic segment under the exact-match above
      if (pathname.startsWith("/account/orders/")) return `${t.orderDetail.title} | Warrior Buds`;
      // /checkout/confirmation/[id]
      if (pathname.startsWith("/checkout/confirmation/")) return t.checkout.confirmation.metaTitle;
      // Not localized here: /products/[slug] keeps its server title (the
      // product name doesn't vary by locale — see generateMetadata there),
      // and /staff/** is an internal tool outside the customer FR/EN toggle.
      return null;
  }
}

export default function DocumentTitleSync() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const desiredTitleRef = useRef<string | null>(null);

  useEffect(() => {
    desiredTitleRef.current = resolveTitle(pathname, t);
    const apply = () => {
      const desired = desiredTitleRef.current;
      if (desired && document.title !== desired) document.title = desired;
    };
    apply();
    // A plain one-time `document.title = ...` here is not reliable: the App
    // Router keeps reconciling <head> against the server-rendered RSC title
    // element in the background (route-cache revalidation), which silently
    // reverts a bare assignment back to the static French default seconds
    // after this effect runs — reproduced even in a production build, not
    // just dev Fast Refresh. Observing <head> and re-asserting the desired
    // title whenever that happens keeps it correct regardless of when/why
    // Next re-renders it; the guard above makes this a no-op once titles
    // already match, so it doesn't fight Next or loop on its own writes.
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [pathname, t]);

  return null;
}
