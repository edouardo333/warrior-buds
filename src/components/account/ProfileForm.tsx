"use client";

import { useState, type FormEvent } from "react";
import { FormField, PrimaryButton, fieldClass } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAccount, useProfileActions } from "@/lib/shop/auth-actions";

export default function ProfileForm() {
  const { t } = useLanguage();
  const account = useAccount();
  const { updateProfile } = useProfileActions();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: account?.firstName ?? "",
    lastName: account?.lastName ?? "",
    phone: account?.phone ?? "",
  });

  if (!account) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateProfile(account!.id, form);
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl tracking-wide text-foreground">{t.account.profile.title}</h1>
      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label={t.account.profile.firstName} htmlFor="profile-first-name">
            <input
              id="profile-first-name"
              type="text"
              value={form.firstName}
              onChange={(e) => {
                setForm((p) => ({ ...p, firstName: e.target.value }));
                setSaved(false);
              }}
              className={fieldClass()}
            />
          </FormField>
          <FormField label={t.account.profile.lastName} htmlFor="profile-last-name">
            <input
              id="profile-last-name"
              type="text"
              value={form.lastName}
              onChange={(e) => {
                setForm((p) => ({ ...p, lastName: e.target.value }));
                setSaved(false);
              }}
              className={fieldClass()}
            />
          </FormField>
        </div>
        <FormField label={t.account.profile.email} htmlFor="profile-email">
          <input id="profile-email" type="email" disabled value={account.email} className={`${fieldClass()} cursor-not-allowed opacity-60`} />
        </FormField>
        <FormField label={t.account.profile.phone} htmlFor="profile-phone">
          <input
            id="profile-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => {
              setForm((p) => ({ ...p, phone: e.target.value }));
              setSaved(false);
            }}
            className={fieldClass()}
          />
        </FormField>
        <div className="flex items-center gap-4">
          <PrimaryButton type="submit">{t.account.profile.save}</PrimaryButton>
          {saved && <p className="text-sm text-wb-guardian-green">{t.account.profile.saved}</p>}
        </div>
      </form>
    </div>
  );
}
