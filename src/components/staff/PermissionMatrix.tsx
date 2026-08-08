"use client";

import { Fragment } from "react";
import { Check, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { STAFF_ROLES, getRoleLabel } from "@/lib/staff/staff-auth";
import { getStaffActionLabel, getStaffModuleLabel, hasPermission, PERMISSION_MATRIX, type PermissionModule } from "@/lib/staff/permissions";

const TEXT = {
  fr: {
    title: "Matrice des permissions",
    subtitle: "Ce que chaque rôle peut faire, dérivé directement de lib/staff/permissions.ts — la seule source de vérité.",
    action: "Action",
    viewNote:
      "Accès en lecture aux sept modules (Dashboard, Commandes, Paiements, Risk Engine, Clients, Inventaire, Personnel) : ouvert à tous les rôles connectés. La matrice ci-dessous ne couvre que les actions d'écriture, qui sont soumises à un rôle minimum.",
  },
  en: {
    title: "Permission matrix",
    subtitle: "What each role can do, derived directly from lib/staff/permissions.ts — the single source of truth.",
    action: "Action",
    viewNote:
      "Read access to all seven modules (Dashboard, Orders, Payments, Risk Engine, Customers, Inventory, Staff) is open to every signed-in role. The matrix below only covers write actions, which require a minimum role tier.",
  },
} as const;

const MODULE_ORDER: PermissionModule[] = ["orders", "payments", "risk", "inventory", "staff"];

export default function PermissionMatrix() {
  const { locale } = useLanguage();
  const t = TEXT[locale];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h2 className="font-display text-lg tracking-wide text-white/85">{t.title}</h2>
      <p className="mt-1 text-sm text-white/55">{t.subtitle}</p>
      <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs leading-relaxed text-white/50">{t.viewNote}</p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase tracking-wide text-white/45">
              <th className="px-4 py-3 font-medium">{t.action}</th>
              {STAFF_ROLES.map((role) => (
                <th key={role} className="px-4 py-3 text-center font-medium">
                  {getRoleLabel(role, locale)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULE_ORDER.map((module) => {
              const rows = PERMISSION_MATRIX.filter((row) => row.module === module);
              if (rows.length === 0) return null;
              return (
                <Fragment key={module}>
                  <tr className="border-b border-white/5 bg-white/[0.015]">
                    <td colSpan={STAFF_ROLES.length + 1} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/40">
                      {getStaffModuleLabel(module, locale)}
                    </td>
                  </tr>
                  {rows.map(({ action }) => (
                    <tr key={action} className="border-b border-white/5 last:border-b-0">
                      <td className="px-4 py-3 text-white/80">{getStaffActionLabel(action, locale)}</td>
                      {STAFF_ROLES.map((role) => {
                        const allowed = hasPermission(role, action);
                        return (
                          <td key={role} className="px-4 py-3 text-center">
                            {allowed ? (
                              <Check className="mx-auto h-4 w-4 text-wb-guardian-green" />
                            ) : (
                              <X className="mx-auto h-4 w-4 text-white/20" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
