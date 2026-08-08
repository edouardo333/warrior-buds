"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, ShieldX, UserCog, Users, type LucideIcon } from "lucide-react";
import type { StaffMemberStatus } from "@/types/staff";
import type { StaffRole } from "@/types/staff-order";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getRoleLabel, STAFF_ROLES, type StaffSession } from "@/lib/staff/staff-auth";
import { getStaffStatusLabel } from "@/lib/bud-guardian/staff-engine";
import { useStaffDirectory } from "@/lib/staff/staff-actions";
import { useAnimatedNumber } from "@/lib/bud-guardian/useAnimatedNumber";
import StaffDirectoryTable from "./StaffDirectoryTable";
import StaffMemberDetails from "./StaffMemberDetails";
import PermissionMatrix from "./PermissionMatrix";
import StaffShell from "./StaffShell";

const TEXT = {
  fr: {
    title: "Bud Guardian — Personnel",
    subtitle: "Répertoire des comptes de démonstration, rôles, statuts et activité récente, connecté au journal d'audit partagé.",
    searchPlaceholder: "Nom, courriel ou rôle…",
    roleAll: "Tous les rôles",
    statusAll: "Tous les statuts",
    clearFilters: "Réinitialiser",
    kpis: { total: "Personnel", active: "Actifs", suspended: "Suspendus", admins: "Administrateurs" },
    selectHint: "Sélectionnez un membre du personnel pour voir son profil.",
  },
  en: {
    title: "Bud Guardian — Staff",
    subtitle: "Directory of demo accounts, roles, statuses, and recent activity, connected to the shared audit log.",
    searchPlaceholder: "Name, email, or role…",
    roleAll: "All roles",
    statusAll: "All statuses",
    clearFilters: "Reset",
    kpis: { total: "Staff", active: "Active", suspended: "Suspended", admins: "Admins" },
    selectHint: "Select a staff member to see their profile.",
  },
} as const;

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

export default function StaffTeamDashboard({ session }: { session: StaffSession }) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const members = useStaffDirectory();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<StaffRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StaffMemberStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      total: members.length,
      active: members.filter((m) => m.status === "active").length,
      suspended: members.filter((m) => m.status === "suspended").length,
      admins: members.filter((m) => m.role === "admin").length,
    }),
    [members]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      const matches = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || getRoleLabel(m.role, locale).toLowerCase().includes(q);
      return matches && (roleFilter === "all" || m.role === roleFilter) && (statusFilter === "all" || m.status === statusFilter);
    });
  }, [members, search, roleFilter, statusFilter, locale]);

  const selectedMember = selectedId ? (members.find((m) => m.id === selectedId) ?? null) : null;

  const kpiItems: { key: keyof typeof counts; label: string; icon: LucideIcon; solid: string; rgb: string }[] = [
    { key: "total", label: t.kpis.total, icon: Users, solid: "#f4670f", rgb: "244, 103, 15" },
    { key: "active", label: t.kpis.active, icon: ShieldCheck, solid: "#3ce27a", rgb: "60, 226, 122" },
    { key: "suspended", label: t.kpis.suspended, icon: ShieldX, solid: "#e0202e", rgb: "224, 32, 46" },
    { key: "admins", label: t.kpis.admins, icon: UserCog, solid: "#2f9bf0", rgb: "47, 155, 240" },
  ];

  return (
    <StaffShell session={session} active="team">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-gradient-ember font-display text-3xl tracking-wide sm:text-4xl">{t.title}</h1>
          <p className="mt-1 text-sm text-white/55">{t.subtitle}</p>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as StaffRole | "all")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none focus:border-wb-orange/60"
          >
            <option value="all" className="bg-wb-charcoal">
              {t.roleAll}
            </option>
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role} className="bg-wb-charcoal">
                {getRoleLabel(role, locale)}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StaffMemberStatus | "all")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none focus:border-wb-orange/60"
          >
            <option value="all" className="bg-wb-charcoal">
              {t.statusAll}
            </option>
            <option value="active" className="bg-wb-charcoal">
              {getStaffStatusLabel("active", locale)}
            </option>
            <option value="suspended" className="bg-wb-charcoal">
              {getStaffStatusLabel("suspended", locale)}
            </option>
          </select>
          {(search || roleFilter !== "all" || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
              className="text-sm text-white/50 underline-offset-2 hover:text-white/80 hover:underline"
            >
              {t.clearFilters}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <StaffDirectoryTable members={filtered} selectedId={selectedId} onSelect={setSelectedId} session={session} />
          </div>
          <div className="lg:col-span-5">
            {selectedMember ? (
              <StaffMemberDetails key={selectedMember.id} member={selectedMember} session={session} onClose={() => setSelectedId(null)} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-sm text-white/40">
                {t.selectHint}
              </div>
            )}
          </div>
        </div>

        <PermissionMatrix />
      </div>
    </StaffShell>
  );
}
