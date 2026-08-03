"use client";

import { useState, type FormEvent } from "react";
import { FormField, PrimaryButton, SecondaryButton, fieldClass } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAccount, useAddressActions } from "@/lib/shop/auth-actions";
import type { Address } from "@/types/account";

const EMPTY_FORM = {
  label: "",
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  province: "",
  postalCode: "",
  country: "Canada",
  phone: "",
  isDefault: false,
};

export default function AddressBook() {
  const { t } = useLanguage();
  const account = useAccount();
  const { addAddress, updateAddress, removeAddress, setDefaultAddress } = useAddressActions();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  if (!account) return null;

  function startAdd() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(address: Address) {
    setForm({ ...address, line2: address.line2 ?? "" });
    setEditingId(address.id);
    setShowForm(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { ...form, line2: form.line2 || null };
    if (editingId) updateAddress(account!.id, editingId, payload);
    else addAddress(account!.id, payload);
    setShowForm(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide text-foreground">{t.account.addresses.title}</h1>
        {!showForm && (
          <SecondaryButton type="button" onClick={startAdd} className="px-5 py-2 text-xs">
            {t.account.addresses.addNew}
          </SecondaryButton>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <FormField label={t.account.addresses.label} htmlFor="addr-label">
            <input
              id="addr-label"
              required
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              className={fieldClass()}
            />
          </FormField>
          <FormField label={t.account.addresses.fullName} htmlFor="addr-fullname">
            <input
              id="addr-fullname"
              required
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              className={fieldClass()}
            />
          </FormField>
          <FormField label={t.account.addresses.line1} htmlFor="addr-line1">
            <input
              id="addr-line1"
              required
              value={form.line1}
              onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))}
              className={fieldClass()}
            />
          </FormField>
          <FormField label={t.account.addresses.line2} htmlFor="addr-line2">
            <input
              id="addr-line2"
              value={form.line2}
              onChange={(e) => setForm((p) => ({ ...p, line2: e.target.value }))}
              className={fieldClass()}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-5">
            <FormField label={t.account.addresses.city} htmlFor="addr-city">
              <input
                id="addr-city"
                required
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                className={fieldClass()}
              />
            </FormField>
            <FormField label={t.account.addresses.province} htmlFor="addr-province">
              <input
                id="addr-province"
                required
                value={form.province}
                onChange={(e) => setForm((p) => ({ ...p, province: e.target.value }))}
                className={fieldClass()}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <FormField label={t.account.addresses.postalCode} htmlFor="addr-postal">
              <input
                id="addr-postal"
                required
                value={form.postalCode}
                onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
                className={fieldClass()}
              />
            </FormField>
            <FormField label={t.account.addresses.country} htmlFor="addr-country">
              <input
                id="addr-country"
                required
                value={form.country}
                onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                className={fieldClass()}
              />
            </FormField>
          </div>
          <FormField label={t.account.addresses.phone} htmlFor="addr-phone">
            <input
              id="addr-phone"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className={fieldClass()}
            />
          </FormField>
          <label className="flex items-center gap-2 text-sm text-foreground/70">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
              className="h-4 w-4 rounded border-white/20 bg-white/5 accent-wb-orange"
            />
            {t.account.addresses.setDefault}
          </label>
          <div className="flex gap-3">
            <PrimaryButton type="submit" className="px-6 py-2.5 text-xs">
              {t.account.addresses.save}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-xs">
              {t.account.addresses.cancel}
            </SecondaryButton>
          </div>
        </form>
      ) : account.addresses.length === 0 ? (
        <p className="mt-8 text-sm text-foreground/60">{t.account.addresses.empty}</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {account.addresses.map((address) => (
            <li key={address.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {address.label}
                    {address.isDefault && (
                      <span className="rounded-full bg-wb-orange/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-wb-orange">
                        {t.account.addresses.defaultBadge}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-foreground/60">{address.fullName}</p>
                  <p className="text-sm text-foreground/60">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {address.city}, {address.province} {address.postalCode}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 text-xs">
                  <button type="button" onClick={() => startEdit(address)} className="text-foreground/60 hover:text-wb-orange">
                    {t.account.addresses.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAddress(account.id, address.id)}
                    className="text-foreground/60 hover:text-wb-red"
                  >
                    {t.account.addresses.delete}
                  </button>
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => setDefaultAddress(account.id, address.id)}
                      className="text-foreground/60 hover:text-wb-orange"
                    >
                      {t.account.addresses.setDefault}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
