"use client";

import { useState, type FormEvent } from "react";
import { FormField, PrimaryButton, SecondaryButton, fieldClass } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAddressActions } from "@/lib/shop/auth-actions";
import type { Address, CustomerAccount } from "@/types/account";

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

// Storefront — used for both signed-in checkout (addresses saved to the
// account) and Guest Checkout (account === null): a guest always sees the
// inline form and their entry is only ever attached to the order, never
// persisted to any account.
export default function BillingStep({
  account,
  sameAsShipping,
  onSameAsShippingChange,
  selected,
  onSelect,
  onBack,
  onContinue,
}: {
  account: CustomerAccount | null;
  sameAsShipping: boolean;
  onSameAsShippingChange: (value: boolean) => void;
  selected: Address | null;
  onSelect: (address: Address) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const { t } = useLanguage();
  const { addAddress } = useAddressActions();
  const [showForm, setShowForm] = useState(!account);
  const [form, setForm] = useState(EMPTY_FORM);

  function handleAddAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) {
      // Guest Checkout never saves to an account — the address only lives
      // on this order. `label` isn't shown to the guest; it's just internal
      // bookkeeping for the Address shape.
      onSelect({ ...form, id: `guest-${Date.now().toString(36)}`, label: "Billing Address", line2: form.line2 || null, isDefault: false });
      setForm(EMPTY_FORM);
      return;
    }
    const created = addAddress(account.id, { ...form, line2: form.line2 || null, isDefault: false });
    const newAddress = created?.addresses[created.addresses.length - 1];
    if (newAddress) onSelect(newAddress);
    setShowForm(false);
    setForm(EMPTY_FORM);
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.checkout.billing.title}</h2>
      <label className="flex items-center gap-3 text-sm text-foreground/80">
        <input
          type="checkbox"
          checked={sameAsShipping}
          onChange={(e) => onSameAsShippingChange(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-white/5 accent-wb-orange"
        />
        {t.checkout.billing.sameAsShipping}
      </label>

      {!sameAsShipping && (
        <>
          {account && account.addresses.length > 0 && (
            <div className="flex flex-col gap-3">
              {account.addresses.map((address) => (
                <label
                  key={address.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                    selected?.id === address.id ? "border-wb-orange bg-wb-orange/5" : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <input
                    type="radio"
                    name="billing-address"
                    checked={selected?.id === address.id}
                    onChange={() => onSelect(address)}
                    className="mt-1 h-4 w-4 accent-wb-orange"
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">{address.label}</p>
                    <p className="text-foreground/60">{address.fullName}</p>
                    <p className="text-foreground/60">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}
                    </p>
                    <p className="text-foreground/60">
                      {address.city}, {address.province} {address.postalCode}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
          {!showForm ? (
            <button type="button" onClick={() => setShowForm(true)} className="self-start text-sm text-wb-orange hover:underline">
              {t.checkout.shipping.addNew}
            </button>
          ) : (
            <form onSubmit={handleAddAddress} noValidate className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              {account && (
                <FormField label={t.account.addresses.label} htmlFor="bill-label">
                  <input
                    id="bill-label"
                    required
                    value={form.label}
                    onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                    className={fieldClass()}
                  />
                </FormField>
              )}
              <FormField label={t.account.addresses.fullName} htmlFor="bill-fullname">
                <input
                  id="bill-fullname"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  className={fieldClass()}
                />
              </FormField>
              <FormField label={t.account.addresses.line1} htmlFor="bill-line1">
                <input
                  id="bill-line1"
                  required
                  value={form.line1}
                  onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))}
                  className={fieldClass()}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label={t.account.addresses.city} htmlFor="bill-city">
                  <input
                    id="bill-city"
                    required
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    className={fieldClass()}
                  />
                </FormField>
                <FormField label={t.account.addresses.province} htmlFor="bill-province">
                  <input
                    id="bill-province"
                    required
                    value={form.province}
                    onChange={(e) => setForm((p) => ({ ...p, province: e.target.value }))}
                    className={fieldClass()}
                  />
                </FormField>
              </div>
              <FormField label={t.account.addresses.postalCode} htmlFor="bill-postal">
                <input
                  id="bill-postal"
                  required
                  value={form.postalCode}
                  onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
                  className={fieldClass()}
                />
              </FormField>
              <div className="flex gap-3">
                <PrimaryButton type="submit" className="px-6 py-2.5 text-xs">
                  {account ? t.account.addresses.save : t.checkout.shipping.useAddress}
                </PrimaryButton>
                {account && (
                  <SecondaryButton type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-xs">
                    {t.account.addresses.cancel}
                  </SecondaryButton>
                )}
              </div>
            </form>
          )}
        </>
      )}

      <div className="flex gap-3">
        <SecondaryButton type="button" onClick={onBack} className="px-6 py-2.5 text-xs">
          {t.checkout.back}
        </SecondaryButton>
        <PrimaryButton type="button" disabled={!sameAsShipping && !selected} onClick={onContinue} className="px-6 py-2.5 text-xs">
          {t.checkout.billing.continueBtn}
        </PrimaryButton>
      </div>
    </div>
  );
}
