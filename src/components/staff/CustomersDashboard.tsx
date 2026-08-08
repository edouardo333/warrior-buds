"use client";

import { useMemo, useState } from "react";
import { Bell, Crown, Sparkles, TriangleAlert, UserCheck, Users, type LucideIcon } from "lucide-react";
import type { CustomerSegment } from "@/types/customer";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StaffSession } from "@/lib/staff/staff-auth";
import { useStaffCustomers, type StaffCustomerView } from "@/lib/staff/customer-actions";
import { getCustomerSegmentLabel } from "@/lib/bud-guardian/customer-engine";
import { useAnimatedNumber } from "@/lib/bud-guardian/useAnimatedNumber";
import CustomersTable, { CUSTOMER_SEGMENT_COLORS } from "./CustomersTable";
import CustomerDetails from "./CustomerDetails";
import StaffShell from "./StaffShell";

const SEGMENT_FLOW: CustomerSegment[] = ["new", "active", "vip", "at-risk"];

const TEXT = {
  fr: {
    title: "Bud Guardian — CRM",
    subtitle: "Intelligence client connectée aux commandes, aux paiements et au Risk Engine.",
    searchPlaceholder: "Client, téléphone ou courriel…",
    segmentAll: "Tous les segments",
    clearFilters: "Réinitialiser",
    kpis: {
      total: "Clients",
      new: "Nouveaux",
      active: "Actifs",
      vip: "VIP",
      atRisk: "À risque",
      followUps: "Suivis à faire",
    },
    selectHint: "Sélectionnez un client pour voir son profil.",
  },
  en: {
    title: "Bud Guardian — CRM",
    subtitle: "Customer intelligence connected to orders, payments and the Risk Engine.",
    searchPlaceholder: "Customer, phone or email…",
    segmentAll: "All segments",
    clearFilters: "Reset",
    kpis: {
      total: "Customers",
      new: "New",
      active: "Active",
      vip: "VIP",
      atRisk: "At risk",
      followUps: "Follow-ups due",
    },
    selectHint: "Select a customer to see their profile.",
  },
} as const;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function KpiCard({ label, icon: Icon, solid, rgb, value }: { label: string; icon: LucideIcon; solid: string; rgb: string; value: number }) {
  const animated = useAnimatedNumber(value, 800, 0);
  return (
    <div className="group flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105"
        style={{ background: `rgba(${rgb}, 0.14)`, color: solid }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-2xl font-semibold text-white/90">{Math.round(animated)}</p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  );
}

function matchesSearch(customer: StaffCustomerView, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (customer.id.toLowerCase().includes(q)) return true;
  if (customer.name.toLowerCase().includes(q)) return true;
  if (customer.email.toLowerCase().includes(q)) return true;
  const qDigits = digitsOnly(q);
  if (qDigits.length >= 3 && digitsOnly(customer.phone).includes(qDigits)) return true;
  return false;
}

export default function CustomersDashboard({ session }: { session: StaffSession }) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const customers = useStaffCustomers();

  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegment | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      total: customers.length,
      new: customers.filter((c) => c.segment === "new").length,
      active: customers.filter((c) => c.segment === "active").length,
      vip: customers.filter((c) => c.segment === "vip").length,
      atRisk: customers.filter((c) => c.segment === "at-risk").length,
      followUps: customers.reduce((sum, c) => sum + c.meta.followUps.filter((f) => f.status === "pending").length, 0),
    }),
    [customers]
  );

  const filtered = useMemo(
    () => customers.filter((c) => matchesSearch(c, search) && (segmentFilter === "all" || c.segment === segmentFilter)),
    [customers, search, segmentFilter]
  );

  const selectedCustomer = selectedId ? customers.find((c) => c.id === selectedId) ?? null : null;

  const kpiItems: { key: keyof typeof counts; label: string; icon: LucideIcon; solid: string; rgb: string }[] = [
    { key: "total", label: t.kpis.total, icon: Users, solid: "#f4670f", rgb: "244, 103, 15" },
    { key: "new", label: t.kpis.new, icon: Sparkles, ...CUSTOMER_SEGMENT_COLORS.new },
    { key: "active", label: t.kpis.active, icon: UserCheck, ...CUSTOMER_SEGMENT_COLORS.active },
    { key: "vip", label: t.kpis.vip, icon: Crown, ...CUSTOMER_SEGMENT_COLORS.vip },
    { key: "atRisk", label: t.kpis.atRisk, icon: TriangleAlert, ...CUSTOMER_SEGMENT_COLORS["at-risk"] },
    { key: "followUps", label: t.kpis.followUps, icon: Bell, solid: "#8a8f98", rgb: "138, 143, 152" },
  ];

  return (
    <StaffShell session={session} active="customers">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-gradient-ember font-display text-3xl tracking-wide sm:text-4xl">{t.title}</h1>
          <p className="mt-1 text-sm text-white/55">{t.subtitle}</p>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kpiItems.map(({ key, label, icon, solid, rgb }) => (
            <KpiCard key={key} label={label} icon={icon} solid={solid} rgb={rgb} value={counts[key]} />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none focus:border-wb-orange/60"
          />
          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value as CustomerSegment | "all")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none focus:border-wb-orange/60"
          >
            <option value="all" className="bg-wb-charcoal">
              {t.segmentAll}
            </option>
            {SEGMENT_FLOW.map((segment) => (
              <option key={segment} value={segment} className="bg-wb-charcoal">
                {getCustomerSegmentLabel(segment, locale)}
              </option>
            ))}
          </select>
          {(search || segmentFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSegmentFilter("all");
              }}
              className="text-sm text-white/50 underline-offset-2 hover:text-white/80 hover:underline"
            >
              {t.clearFilters}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <CustomersTable customers={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <div className="lg:col-span-5">
            {selectedCustomer ? (
              <CustomerDetails key={selectedCustomer.id} customer={selectedCustomer} session={session} onClose={() => setSelectedId(null)} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-sm text-white/40">
                {t.selectHint}
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
