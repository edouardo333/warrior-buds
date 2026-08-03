"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { PrimaryButton } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAccount } from "@/lib/shop/auth-actions";
import AccountShell, { type AccountNavKey } from "./AccountShell";

export default function AccountGuard({ active, children }: { active: AccountNavKey; children: ReactNode }) {
  const { t } = useLanguage();
  const account = useAccount();

  if (!account) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background bg-grain px-6 text-center">
        <p className="font-display text-3xl tracking-wide text-foreground">{t.account.guardTitle}</p>
        <p className="text-sm text-foreground/60">{t.account.guardMessage}</p>
        <Link href="/login">
          <PrimaryButton type="button">{t.account.guardCta}</PrimaryButton>
        </Link>
      </div>
    );
  }

  return <AccountShell active={active}>{children}</AccountShell>;
}
