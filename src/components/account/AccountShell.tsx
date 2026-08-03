"use client";

// Storefront — customer "My Account" shell. Structurally mirrors
// components/staff/StaffShell.tsx (sidebar + mobile top bar + active-nav-key
// pattern) but is a separate component with its own nav links — never
// imports from components/staff/**.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { CreditCard, Heart, LayoutDashboard, LogOut, MapPin, Menu, Package, Settings, User, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAccount, useAuthActions } from "@/lib/shop/auth-actions";

const LINKS = [
  { key: "dashboard", href: "/account", icon: LayoutDashboard },
  { key: "profile", href: "/account/profile", icon: User },
  { key: "addresses", href: "/account/addresses", icon: MapPin },
  { key: "paymentMethods", href: "/account/payment-methods", icon: CreditCard },
  { key: "orders", href: "/account/orders", icon: Package },
  { key: "wishlist", href: "/wishlist", icon: Heart },
  { key: "settings", href: "/account/settings", icon: Settings },
] as const;

export type AccountNavKey = (typeof LINKS)[number]["key"];

export default function AccountShell({ active, children }: { active: AccountNavKey; children: ReactNode }) {
  const { t } = useLanguage();
  const account = useAccount();
  const { logout } = useAuthActions();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!account) return null;

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="min-h-dvh bg-background bg-grain lg:flex">
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:border-white/10 lg:bg-white/[0.02] lg:px-4 lg:py-6">
        <div className="flex items-center gap-2 px-2">
          <span className="font-display text-lg tracking-wide text-white/90">{t.account.nav.dashboard}</span>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {LINKS.map(({ key, href, icon: Icon }) => {
            const isActive = key === active;
            return (
              <Link
                key={key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  isActive ? "bg-wb-orange/15 text-white" : "text-white/55 hover:bg-white/5 hover:text-white/85"
                }`}
                style={isActive ? { boxShadow: "inset 2px 0 0 0 var(--wb-orange)" } : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t.account.nav[key]}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2.5 px-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70">
              <User className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white/85">
                {account.firstName} {account.lastName}
              </p>
              <p className="truncate text-xs text-white/45">{account.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors duration-200 hover:bg-wb-red/10 hover:text-wb-red"
          >
            <LogOut className="h-4 w-4" />
            {t.account.nav.logout}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:min-w-0">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-wb-charcoal/90 px-4 py-3 backdrop-blur-xl lg:hidden">
          <span className="font-display text-base tracking-wide text-white/90">{t.account.nav.dashboard}</span>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-lg border border-white/15 p-2 text-white/75 transition-colors duration-200 hover:border-white/30"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {mobileOpen && (
          <div className="border-b border-white/10 bg-wb-charcoal/95 px-3 py-3 backdrop-blur-xl lg:hidden">
            <nav className="flex flex-col gap-1">
              {LINKS.map(({ key, href, icon: Icon }) => {
                const isActive = key === active;
                return (
                  <Link
                    key={key}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                      isActive ? "bg-wb-orange/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/85"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t.account.nav[key]}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex items-center gap-2.5 border-t border-white/10 px-3 py-2.5 pt-3 text-sm font-medium text-white/60 hover:text-wb-red"
              >
                <LogOut className="h-4 w-4" />
                {t.account.nav.logout}
              </button>
            </nav>
          </div>
        )}

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
