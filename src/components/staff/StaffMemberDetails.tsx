"use client";

import { useMemo, useState } from "react";
import { Mail, ShieldCheck, ShieldX, User, X } from "lucide-react";
import type { AuditModule } from "@/types/audit";
import type { StaffMember } from "@/types/staff";
import type { StaffRole } from "@/types/staff-order";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getRoleLabel, STAFF_ROLES, type StaffSession } from "@/lib/staff/staff-auth";
import { getStaffStatusLabel } from "@/lib/bud-guardian/staff-engine";
import { staffChangeRole, staffChangeStatus } from "@/lib/staff/staff-actions";
import { getStaffActionLabel, getStaffModuleLabel, hasPermission, minRoleFor, PERMISSION_MATRIX } from "@/lib/staff/permissions";
import { useAuditLog } from "@/lib/staff/audit-log";
import { ROLE_COLORS, STATUS_COLORS } from "./StaffDirectoryTable";

// Activity entries can come from any audited module (including "customers",
// which isn't part of the gated permission matrix), so this covers every
// AuditModule value rather than reusing getStaffModuleLabel's narrower
// PermissionModule domain.
const AUDIT_MODULE_LABELS: Record<AuditModule, { fr: string; en: string }> = {
  orders: { fr: "Commandes", en: "Orders" },
  payments: { fr: "Paiements", en: "Payments" },
  risk: { fr: "Risk Engine", en: "Risk Engine" },
  inventory: { fr: "Inventaire", en: "Inventory" },
  customers: { fr: "Clients", en: "Customers" },
  staff: { fr: "Personnel", en: "Staff" },
  moderation: { fr: "Modération", en: "Moderation" },
};

const TEXT = {
  fr: {
    you: "Vous",
    email: "Courriel",
    joined: "Date d'embauche",
    role: "Rôle",
    status: "Statut",
    suspend: "Suspendre",
    reactivate: "Réactiver",
    restricted: (role: string) => `Réservé aux rôles ${role} et plus.`,
    lastAdmin: "Action impossible — dernier administrateur actif.",
    permissions: "Permissions du rôle",
    allowed: "Autorisé",
    notAllowed: "Non autorisé",
    activity: "Activité récente",
    noActivity: "Aucune activité enregistrée dans le journal d'audit pour ce membre.",
    close: "Fermer",
    denied: "refusé",
  },
  en: {
    you: "You",
    email: "Email",
    joined: "Joined",
    role: "Role",
    status: "Status",
    suspend: "Suspend",
    reactivate: "Reactivate",
    restricted: (role: string) => `Reserved for ${role} and above.`,
    lastAdmin: "Action blocked — last active administrator.",
    permissions: "Role permissions",
    allowed: "Allowed",
    notAllowed: "Not allowed",
    activity: "Recent activity",
    noActivity: "No activity recorded in the audit log for this staff member.",
    close: "Close",
    denied: "denied",
  },
} as const;

function formatDateTime(iso: string, locale: "fr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

function formatDate(iso: string, locale: "fr" | "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "long" }).format(new Date(iso));
}

export default function StaffMemberDetails({
  member,
  session,
  onClose,
}: {
  member: StaffMember;
  session: StaffSession;
  onClose?: () => void;
}) {
  const { locale } = useLanguage();
  const t = TEXT[locale];
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const auditLog = useAuditLog();

  const isSelf = member.name === session.name;
  const canEditRole = hasPermission(session.role, "staff.roleChange");
  const canEditStatus = hasPermission(session.role, "staff.statusChange");
  const roleColor = ROLE_COLORS[member.role];
  const statusColor = STATUS_COLORS[member.status];

  const activity = useMemo(() => auditLog.filter((entry) => entry.actor === member.name).slice(0, 12), [auditLog, member.name]);

  function handleRoleChange(role: StaffRole) {
    if (role === member.role) return;
    setBusy(true);
    const updated = staffChangeRole(member.id, role, session);
    setBusy(false);
    setNotice(updated ? null : t.lastAdmin);
  }

  function handleStatusToggle() {
    const next = member.status === "active" ? "suspended" : "active";
    setBusy(true);
    const updated = staffChangeStatus(member.id, next, session);
    setBusy(false);
    setNotice(updated ? null : t.lastAdmin);
  }

  return (
    <div className="wb-risk-details-in flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
            style={{ background: `rgba(${roleColor.rgb}, 0.16)`, color: roleColor.solid }}
          >
            {member.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white/90">
              {member.name}
              {isSelf && <span className="rounded-full border border-white/15 px-1.5 py-0.5 text-[10px] font-normal text-white/50">{t.you}</span>}
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/45">
              <Mail className="h-3 w-3" />
              {member.email}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="rounded-full border border-white/10 p-1.5 text-white/60 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.role}</p>
          <select
            value={member.role}
            onChange={(e) => handleRoleChange(e.target.value as StaffRole)}
            disabled={!canEditRole || busy}
            title={!canEditRole ? t.restricted(getRoleLabel(minRoleFor("staff.roleChange"), locale)) : undefined}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-wb-orange/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role} className="bg-wb-charcoal">
                {getRoleLabel(role, locale)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.status}</p>
          <div className="mt-1.5 flex items-center gap-2.5">
            <span
              className="wb-badge-pop inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
              style={{ borderColor: statusColor.solid, background: `rgba(${statusColor.rgb}, 0.14)`, color: statusColor.solid }}
            >
              {getStaffStatusLabel(member.status, locale)}
            </span>
            <button
              type="button"
              onClick={handleStatusToggle}
              disabled={!canEditStatus || busy}
              title={!canEditStatus ? t.restricted(getRoleLabel(minRoleFor("staff.statusChange"), locale)) : undefined}
              className="rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-medium text-white/70 transition-colors duration-200 hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {member.status === "active" ? t.suspend : t.reactivate}
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/45">{t.joined}</p>
          <p className="mt-1 text-white/85">{formatDate(member.joinedAt, locale)}</p>
        </div>
      </div>

      {notice && <p className="rounded-xl border border-wb-red/40 bg-wb-red/10 px-3.5 py-2 text-xs text-wb-red">{notice}</p>}

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{t.permissions}</h3>
        <ul className="mt-3 flex flex-col gap-1.5">
          {PERMISSION_MATRIX.map(({ module, action }) => {
            const allowed = hasPermission(member.role, action);
            return (
              <li
                key={action}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs"
              >
                <span className="text-white/70">
                  <span className="text-white/35">{getStaffModuleLabel(module, locale)} · </span>
                  {getStaffActionLabel(action, locale)}
                </span>
                {allowed ? (
                  <span className="inline-flex shrink-0 items-center gap-1 font-medium text-wb-guardian-green">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t.allowed}
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1 font-medium text-white/35">
                    <ShieldX className="h-3.5 w-3.5" />
                    {t.notAllowed}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">{t.activity}</h3>
        {activity.length === 0 ? (
          <p className="mt-2 text-sm text-white/45">{t.noActivity}</p>
        ) : (
          <ol className="mt-3 flex flex-col gap-0">
            {activity.map((entry, index) => {
              const isLast = index === activity.length - 1;
              return (
                <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {!isLast && <span className="absolute left-[5px] top-3 h-full w-px bg-white/10" />}
                  <span
                    className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.outcome === "denied" ? "#e0202e" : "rgba(255,255,255,0.3)" }}
                  />
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-white/85">
                      <User className="h-3 w-3 text-white/30" />
                      {entry.description}
                      {entry.outcome === "denied" && <span className="text-xs font-normal text-wb-red">({t.denied})</span>}
                    </span>
                    <span className="text-xs text-white/45">
                      {formatDateTime(entry.at, locale)} · {AUDIT_MODULE_LABELS[entry.module][locale]}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
