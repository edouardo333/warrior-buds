"use client";

import { useState, type FormEvent } from "react";
import { FormField, PrimaryButton, SecondaryButton, fieldClass } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAddressActions } from "@/lib/shop/auth-actions";
import type { Address, CustomerAccount } from "@/types/account";
import type { ShippingMethod } from "@/types/shop-order";

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

const SHIPPING_METHODS: ShippingMethod[] = ["standard", "expedited", "pickup"];

// Storefront — used for both signed-in checkout (addresses saved to the
// account) and Guest Checkout (account === null): a guest always sees the
// inline form and their entry is only ever attached to the order, never
// persisted to any account.
export default function ShippingStep({
  account,
  selected,
  onSelect,
  shippingMethod,
  onShippingMethodChange,
  onContinue,
}: {
  account: CustomerAccount | null;
  selected: Address | null;
  onSelect: (address: Address) => void;
  shippingMethod: ShippingMethod;
  onShippingMethodChange: (method: ShippingMethod) => void;
  onContinue: () => void;
}) {
  const { t } = useLanguage();
  const { addAddress } = useAddressActions();
  const [showForm, setShowForm] = useState(!account || account.addresses.length === 0);
  const [form, setForm] = useState(EMPTY_FORM);

  function handleAddAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) {
      // Guest Checkout never saves to an account — the address only lives
      // on this order. `label` isn't shown to the guest; it's just internal
      // bookkeeping for the Address shape.
      onSelect({ ...form, id: `guest-${Date.now().toString(36)}`, label: "Shipping Address", line2: form.line2 || null, isDefault: true });
      setForm(EMPTY_FORM);
      return;
    }
    const created = addAddress(account.id, { ...form, line2: form.line2 || null });
    const newAddress = created?.addresses[created.addresses.length - 1];
    if (newAddress) onSelect(newAddress);
    setShowForm(false);
    setForm(EMPTY_FORM);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.checkout.shipping.title}</h2>
        {account && account.addresses.length === 0 && !showForm && (
          <p className="mt-3 text-sm text-foreground/60">{t.checkout.shipping.noAddresses}</p>
        )}

        {account && account.addresses.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {account.addresses.map((address) => (
              <label
                key={address.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                  selected?.id === address.id ? "border-wb-orange bg-wb-orange/5" : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <input
                  type="radio"
                  name="shipping-address"
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
          <button type="button" onClick={() => setShowForm(true)} className="mt-4 text-sm text-wb-orange hover:underline">
            {t.checkout.shipping.addNew}
          </button>
        ) : (
          <form onSubmit={handleAddAddress} noValidate className="mt-4 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            {account && (
              <FormField label={t.account.addresses.label} htmlFor="ship-label">
                <input
                  id="ship-label"
                  required
                  value={form.label}
                  onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                  className={fieldClass()}
                />
              </FormField>
            )}
            <FormField label={t.account.addresses.fullName} htmlFor="ship-fullname">
              <input
                id="ship-fullname"
                required
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                className={fieldClass()}
              />
            </FormField>
            <FormField label={t.account.addresses.line1} htmlFor="ship-line1">
              <input
                id="ship-line1"
                required
                autoComplete="address-line1"
                value={form.line1}
                onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))}
                className={fieldClass()}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t.account.addresses.city} htmlFor="ship-city">
                <input
                  id="ship-city"
                  required
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  className={fieldClass()}
                />
              </FormField>
              <FormField label={t.account.addresses.province} htmlFor="ship-province">
                <input
                  id="ship-province"
                  required
                  autoComplete="address-level1"
                  value={form.province}
                  onChange={(e) => setForm((p) => ({ ...p, province: e.target.value }))}
                  className={fieldClass()}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t.account.addresses.postalCode} htmlFor="ship-postal">
                <input
                  id="ship-postal"
                  required
                  autoComplete="postal-code"
                  value={form.postalCode}
                  onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
                  className={fieldClass()}
                />
              </FormField>
              <FormField label={t.account.addresses.phone} htmlFor="ship-phone">
                <input
                  id="ship-phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className={fieldClass()}
                />
              </FormField>
            </div>
            <div className="flex gap-3">
              <PrimaryButton type="submit" className="px-6 py-2.5 text-xs">
                {account ? t.account.addresses.save : t.checkout.shipping.useAddress}
              </PrimaryButton>
              {account && account.addresses.length > 0 && (
                <SecondaryButton type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-xs">
                  {t.account.addresses.cancel}
                </SecondaryButton>
              )}
            </div>
          </form>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-wb-orange">{t.checkout.shipping.method}</h2>
        <div className="mt-4 flex flex-col gap-3">
          {SHIPPING_METHODS.map((method) => (
            <label
              key={method}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm transition-colors ${
                shippingMethod === method ? "border-wb-orange bg-wb-orange/5 text-foreground" : "border-white/10 bg-white/[0.02] text-foreground/70"
              }`}
            >
              <input
                type="radio"
                name="shipping-method"
                checked={shippingMethod === method}
                onChange={() => onShippingMethodChange(method)}
                className="h-4 w-4 accent-wb-orange"
              />
              {t.checkout.shipping[method]}
            </label>
          ))}
        </div>
      </div>

      <PrimaryButton type="button" disabled={!selected} onClick={onContinue} className="self-start">
        {t.checkout.shipping.continueBtn}
      </PrimaryButton>
    </div>
  );
}
