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
    case "/contact":
      return t.contact.metaTitle;
    case "/reviews":
      return t.reviews.metaTitle;
    case "/learning-center":
      return t.learningCenter.metaTitle;
    case "/products":
      return t.productCatalog.metaTitle;
    case "/privacy-policy":
      return t.legal.privacy.metaTitle;
    case "/terms-and-conditions":
      return t.legal.terms.metaTitle;
    case "/cookie-policy":
      return t.legal.cookies.metaTitle;
    default:
      // Not localized here: /products/[slug] keeps its server title (the
      // product name doesn't vary by locale — see generateMetadata there).
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
