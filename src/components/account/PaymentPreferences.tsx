"use client";

import { useState, type FormEvent } from "react";
import { FormField, PrimaryButton, SecondaryButton, fieldClass } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAccount, usePaymentPreferenceActions } from "@/lib/shop/auth-actions";
import { getEnabledProviders } from "@/lib/shop/payment-providers/registry";
import type { PaymentProviderId } from "@/types/shop-payment";

export default function PaymentPreferences() {
  const { t, locale } = useLanguage();
  const account = useAccount();
  const { addPaymentPreference, removePaymentPreference, setDefaultPaymentPreference } = usePaymentPreferenceActions();
  const providers = getEnabledProviders();
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [providerId, setProviderId] = useState<PaymentProviderId>(providers[0]?.id ?? "interac");

  if (!account) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addPaymentPreference(account!.id, { providerId, label, isDefault: account!.paymentPreferences.length === 0 });
    setLabel("");
    setShowForm(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide text-foreground">{t.account.paymentMethods.title}</h1>
        {!showForm && (
          <SecondaryButton type="button" onClick={() => setShowForm(true)} className="px-5 py-2 text-xs">
            {t.account.paymentMethods.addNew}
          </SecondaryButton>
        )}
      </div>
      <p className="mt-3 text-xs text-foreground/50">{t.account.paymentMethods.interacHint}</p>

      {showForm && (
        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <FormField label={t.account.paymentMethods.provider} htmlFor="pref-provider">
            <select
              id="pref-provider"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value as PaymentProviderId)}
              className={fieldClass()}
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.getDisplayName(locale)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t.account.paymentMethods.label} htmlFor="pref-label">
            <input
              id="pref-label"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="my.email@example.com"
              className={fieldClass()}
            />
          </FormField>
          <div className="flex gap-3">
            <PrimaryButton type="submit" className="px-6 py-2.5 text-xs">
              {t.account.paymentMethods.save}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-xs">
              {t.account.paymentMethods.cancel}
            </SecondaryButton>
          </div>
        </form>
      )}

      {account.paymentPreferences.length === 0 && !showForm ? (
        <p className="mt-8 text-sm text-foreground/60">{t.account.paymentMethods.empty}</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {account.paymentPreferences.map((pref) => (
            <li key={pref.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                {pref.label}
                {pref.isDefault && (
                  <span className="rounded-full bg-wb-orange/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-wb-orange">
                    {t.account.paymentMethods.defaultBadge}
                  </span>
                )}
              </p>
              <div className="flex gap-3 text-xs">
                {!pref.isDefault && (
                  <button
                    type="button"
                    onClick={() => setDefaultPaymentPreference(account.id, pref.id)}
                    className="text-foreground/60 hover:text-wb-orange"
                  >
                    {t.account.paymentMethods.setDefault}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removePaymentPreference(account.id, pref.id)}
                  className="text-foreground/60 hover:text-wb-red"
                >
                  {t.account.paymentMethods.delete}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
