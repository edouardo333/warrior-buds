"use client";

// Storefront — Guest Checkout vs. Create an Account choice, shown instead of
// forcing login when a shopper reaches /checkout signed out. Guest Checkout
// stays the fastest path (email only, no redirect to /login or /signup);
// "Create an Account" simply links to the existing signup flow.

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { FormField, PrimaryButton, SecondaryButton, fieldClass } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CheckoutIdentityStep({ onGuestContinue }: { onGuestContinue: (email: string) => void }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    onGuestContinue(email.trim());
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-28 sm:px-8">
      <h1 className="font-display text-4xl tracking-wide text-foreground">{t.checkout.title}</h1>
      <p className="mt-3 max-w-xl text-sm text-foreground/60">{t.checkout.identity.subtitle}</p>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] p-7 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-wb-orange">{t.checkout.identity.guestTitle}</p>
          <p className="mt-3 text-sm text-foreground/60">{t.checkout.identity.guestSubtitle}</p>
          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-1 flex-col justify-end gap-4">
            <FormField label={t.checkout.identity.guestEmailLabel} htmlFor="guest-checkout-email">
              <input
                id="guest-checkout-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass()}
              />
            </FormField>
            <PrimaryButton type="submit" className="w-full">
              {t.checkout.identity.guestCta}
            </PrimaryButton>
          </form>
        </div>

        <div className="flex flex-col rounded-3xl border border-wb-orange/30 bg-gradient-to-b from-wb-orange/10 via-wb-orange/5 to-transparent p-7 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-wb-orange">{t.checkout.identity.accountTitle}</p>
          <p className="mt-3 text-sm text-foreground/60">{t.checkout.identity.accountSubtitle}</p>
          <div className="mt-6 flex flex-1 flex-col justify-end gap-4">
            <Link href="/signup">
              <SecondaryButton type="button" className="w-full">
                {t.checkout.identity.accountCta}
              </SecondaryButton>
            </Link>
            <p className="text-center text-xs text-foreground/50">
              {t.checkout.identity.haveAccount}{" "}
              <Link href="/login" className="font-semibold text-wb-orange hover:underline">
                {t.checkout.identity.loginLink}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-7 sm:p-8">
        <h2 className="font-display text-xl tracking-wide text-foreground">{t.checkout.identity.benefitsTitle}</h2>
        <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {t.checkout.identity.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5 text-sm text-foreground/70">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-wb-orange" />
              {benefit}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-foreground/50">{t.checkout.identity.benefitsFooter}</p>
      </div>
    </div>
  );
}
