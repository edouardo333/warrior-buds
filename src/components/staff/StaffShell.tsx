"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, CreditCard, LayoutDashboard, LogOut, Menu, Package, Shield, User, UserCog, Users, Warehouse, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getRoleLabel, endSession, type StaffSession } from "@/lib/staff/staff-auth";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const TEXT = {
  fr: {
    brand: "Bud Guardian",
    dashboard: "Dashboard",
    orders: "Commandes",
    payments: "Paiements",
    security: "Risk Engine",
    customers: "Clients",
    inventory: "Inventaire",
    analytics: "Analytique",
    team: "Personnel",
    account: "Compte",
    logout: "Déconnexion",
    menu: "Menu",
    backToSite: "Retour au site",
  },
  en: {
    brand: "Bud Guardian",
    dashboard: "Dashboard",
    orders: "Orders",
    payments: "Payments",
    security: "Risk Engine",
    customers: "Customers",
    inventory: "Inventory",
    analytics: "Analytics",
    team: "Staff",
    account: "Account",
    logout: "Log out",
    menu: "Menu",
    backToSite: "Back to website",
  },
} as const;

const LINKS = [
  { key: "dashboard", href: "/staff", icon: LayoutDashboard },
  { key: "orders", href: "/staff/orders", icon: Package },
  { key: "payments", href: "/staff/payments", icon: CreditCard },
  { key: "security", href: "/staff/security", icon: Shield },
  { key: "customers", href: "/staff/customers", icon: Users },
  { key: "inventory", href: "/staff/inventory", icon: Warehouse },
  { key: "analytics", href: "/staff/analytics", icon: BarChart3 },
  { key: "team", href: "/staff/team", icon: UserCog },
] as const;

export type StaffNavKey = (typeof LINKS)[number]["key"];

export default function StaffShell({
  session,
  active,
  children,
}: {
  session: StaffSession;
  active: StaffNavKey;
  children: React.ReactNode;
}) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background bg-grain lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:border-white/10 lg:bg-white/[0.02] lg:px-4 lg:py-6">
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">🛡</span>
            <span className="font-display text-lg tracking-wide text-white/90">{t.brand}</span>
          </div>
          <LanguageSwitcher className="text-xs" />
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {LINKS.map(({ key, href, icon: Icon }) => {
            const isActive = key === active;
            return (
              <a
                key={key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  isActive ? "bg-wb-orange/15 text-white" : "text-white/55 hover:bg-white/5 hover:text-white/85"
                }`}
                style={isActive ? { boxShadow: "inset 2px 0 0 0 var(--wb-orange)" } : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t[key]}
              </a>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-4">
          <p className="px-3 text-[11px] uppercase tracking-wide text-white/35">{t.account}</p>
          <div className="flex items-center gap-2.5 px-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70">
              <User className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white/85">{session.name}</p>
              <p className="truncate text-xs text-white/45">{getRoleLabel(session.role, locale)}</p>
            </div>
          </div>
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition-all duration-200 hover:bg-white/5 hover:text-white/85 hover:shadow-[0_0_16px_-4px_rgba(255,255,255,0.2)]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
            {t.backToSite}
          </Link>
          <button
            type="button"
            onClick={endSession}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors duration-200 hover:bg-wb-red/10 hover:text-wb-red"
          >
            <LogOut className="h-4 w-4" />
            {t.logout}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:min-w-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-wb-charcoal/90 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">🛡</span>
            <span className="font-display text-base tracking-wide text-white/90">{t.brand}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher className="text-xs" />
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={t.menu}
              aria-expanded={mobileOpen}
              className="rounded-lg border border-white/15 p-2 text-white/75 transition-colors duration-200 hover:border-white/30"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div className="border-b border-white/10 bg-wb-charcoal/95 px-3 py-3 backdrop-blur-xl lg:hidden">
            <nav className="flex flex-col gap-1">
              {LINKS.map(({ key, href, icon: Icon }) => {
                const isActive = key === active;
                return (
                  <a
                    key={key}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                      isActive ? "bg-wb-orange/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/85"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t[key]}
                  </a>
                );
              })}
            </nav>
            <Link
              href="/"
              className="group mt-3 flex items-center gap-2.5 rounded-xl border-t border-white/10 px-1 pt-3 text-sm font-medium text-white/50 transition-all duration-200 hover:text-white/85"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
              {t.backToSite}
            </Link>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-white/50" />
                <div>
                  <p className="text-sm font-medium text-white/85">{session.name}</p>
                  <p className="text-xs text-white/45">{getRoleLabel(session.role, locale)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={endSession}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-medium text-white/70 transition-colors duration-200 hover:border-wb-red/50 hover:text-wb-red"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t.logout}
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
