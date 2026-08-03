"use client";

import { useState, type FormEvent } from "react";
import { FormField, PrimaryButton, fieldClass } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAccount, useProfileActions } from "@/lib/shop/auth-actions";

export default function AccountSettingsForm() {
  const { t } = useLanguage();
  const account = useAccount();
  const { updateMarketingOptIn, changePassword } = useProfileActions();
  const [marketingSaved, setMarketingSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  if (!account) return null;

  function handleMarketingChange(checked: boolean) {
    updateMarketingOptIn(account!.id, checked);
    setMarketingSaved(true);
  }

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = changePassword(account!.id, currentPassword, newPassword);
    if (!result.ok) {
      setPasswordError(t.account.settings.errorCurrentPassword);
      setPasswordSaved(false);
      return;
    }
    setPasswordError(null);
    setPasswordSaved(true);
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl tracking-wide text-foreground">{t.account.settings.title}</h1>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <label className="flex items-center gap-3 text-sm text-foreground/80">
          <input
            type="checkbox"
            checked={account.marketingOptIn}
            onChange={(e) => handleMarketingChange(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-wb-orange"
          />
          {t.account.settings.marketingOptIn}
        </label>
        {marketingSaved && <p className="mt-2 text-xs text-wb-guardian-green">{t.account.settings.saved}</p>}
      </div>

      <form onSubmit={handlePasswordSubmit} noValidate className="mt-6 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.account.settings.changePassword}</h2>
        <FormField label={t.account.settings.currentPassword} htmlFor="settings-current-password" error={passwordError ?? undefined}>
          <input
            id="settings-current-password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={fieldClass(Boolean(passwordError))}
          />
        </FormField>
        <FormField label={t.account.settings.newPassword} htmlFor="settings-new-password">
          <input
            id="settings-new-password"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={fieldClass()}
          />
        </FormField>
        <div className="flex items-center gap-4">
          <PrimaryButton type="submit" className="px-6 py-2.5 text-xs">
            {t.account.settings.save}
          </PrimaryButton>
          {passwordSaved && <p className="text-sm text-wb-guardian-green">{t.account.settings.saved}</p>}
        </div>
      </form>
    </div>
  );
}
