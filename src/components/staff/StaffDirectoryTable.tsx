"use client";

import type { StaffMemberStatus } from "@/types/staff";
import type { StaffRole } from "@/types/staff-order";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getRoleLabel } from "@/lib/staff/staff-auth";
import { getStaffStatusLabel } from "@/lib/bud-guardian/staff-engine";
import type { StaffSession } from "@/lib/staff/staff-auth";

export const ROLE_COLORS: Record<StaffRole, { solid: string; rgb: string }> = {
  employee: { solid: "#8a8f98", rgb: "138, 143, 152" },
  manager: { solid: "#2f9bf0", rgb: "47, 155, 240" },
  supervisor: { solid: "#f4670f", rgb: "244, 103, 15" },
  admin: { solid: "#e0202e", rgb: "224, 32, 46" },
};

export const STATUS_COLORS: Record<StaffMemberStatus, { solid: string; rgb: string }> = {
  active: { solid: "#3ce27a", rgb: "60, 226, 122" },
  suspended: { solid: "#e0202e", rgb: "224, 32, 46" },
};

const TEXT = {
  fr: {
    empty: "Aucun membre du personnel ne correspond à cette recherche.",
    name: "Nom",
    role: "Rôle",
    status: "Statut",
    email: "Courriel",
    joined: "Embauché",
    you: "Vous",
  },
  en: {
    empty: "No staff member matches this search.",
    name: "Name",
    role: "Role",
    status: "Status",
    email: "Email",
    joined: "Joined",
    you: "You",
  },
} as const;

function formatDate(iso: string, locale: "fr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "medium" }).format(new Date(iso));
}

function RoleBadge({ role, locale }: { role: StaffRole; locale: "fr" | "en" }) {
  const color = ROLE_COLORS[role];
  return (
    <span
      className="wb-badge-pop inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{ borderColor: color.solid, background: `rgba(${color.rgb}, 0.14)`, color: color.solid }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color.solid }} />
      {getRoleLabel(role, locale)}
    </span>
  );
}

function StatusBadge({ status, locale }: { status: StaffMemberStatus; locale: "fr" | "en" }) {
  const color = STATUS_COLORS[status];
  return (
    <span
      className="wb-badge-pop inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{ borderColor: color.solid, background: `rgba(${color.rgb}, 0.14)`, color: color.solid }}
    >
      {getStaffStatusLabel(status, locale)}
    </span>
  );
}

export default function StaffDirectoryTable({
  members,
  selectedId,
  onSelect,
  session,
}: {
  members: { id: string; name: string; role: StaffRole; status: StaffMemberStatus; email: string; joinedAt: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  session: StaffSession;
}) {
  const { locale } = useLanguage();
  const t = TEXT[locale];

  if (members.length === 0) {
    return <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-white/50">{t.empty}</p>;
  }

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden overflow-x-auto rounded-2xl border border-white/10 sm:block">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase tracking-wide text-white/45">
              <th className="px-4 py-3 font-medium">{t.name}</th>
              <th className="px-4 py-3 font-medium">{t.role}</th>
              <th className="px-4 py-3 font-medium">{t.status}</th>
              <th className="px-4 py-3 font-medium">{t.email}</th>
              <th className="px-4 py-3 font-medium">{t.joined}</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const selected = member.id === selectedId;
              const isSelf = member.name === session.name;
              return (
                <tr
                  key={member.id}
                  onClick={() => onSelect(member.id)}
                  className={`cursor-pointer border-b border-white/5 transition-all duration-200 ease-out last:border-b-0 hover:bg-white/[0.04] ${
                    selected ? "bg-wb-orange/10" : ""
                  }`}
                  style={{
                    boxShadow: selected
                      ? "inset 3px 0 0 0 #f4670f, inset 0 0 0 1px rgba(224, 32, 46, 0.3)"
                      : "inset 3px 0 0 0 rgba(244, 103, 15, 0), inset 0 0 0 1px rgba(224, 32, 46, 0)",
                  }}
                >
                  <td className="px-4 py-3 font-medium text-white/85">
                    {member.name}
                    {isSelf && (
                      <span className="ml-2 rounded-full border border-white/15 px-1.5 py-0.5 text-[10px] font-normal text-white/50">{t.you}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={member.role} locale={locale} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={member.status} locale={locale} />
                  </td>
                  <td className="px-4 py-3 text-white/60">{member.email}</td>
                  <td className="px-4 py-3 text-white/45">{formatDate(member.joinedAt, locale)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        {members.map((member) => {
          const selected = member.id === selectedId;
          const isSelf = member.name === session.name;
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => onSelect(member.id)}
              className={`rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ease-out ${
                selected ? "border-wb-orange/50 bg-wb-orange/10" : "border-white/10 bg-white/[0.03]"
              }`}
              style={{
                boxShadow: selected
                  ? "inset 3px 0 0 0 #f4670f, inset 0 0 0 1px rgba(224, 32, 46, 0.3)"
                  : "inset 3px 0 0 0 rgba(244, 103, 15, 0), inset 0 0 0 1px rgba(224, 32, 46, 0)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-white/85">
                  {member.name}
                  {isSelf && (
                    <span className="ml-2 rounded-full border border-white/15 px-1.5 py-0.5 text-[10px] font-normal text-white/50">{t.you}</span>
                  )}
                </span>
                <StatusBadge status={member.status} locale={locale} />
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <RoleBadge role={member.role} locale={locale} />
              </div>
              <div className="mt-2 text-xs text-white/50">{member.email}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}
