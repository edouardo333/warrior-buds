"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AuthShell from "./AuthShell";
import { FormField, PrimaryButton, fieldClass } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuthActions } from "@/lib/shop/auth-actions";
import { sendMockEmail } from "@/lib/shop/mock-email";

export default function SignupForm() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const { signUp } = useAuthActions();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", marketingOptIn: false });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = signUp(form);
    setPending(false);
    if (!result.ok) {
      setError(t.auth.signup.errorEmailTaken);
      return;
    }
    const { account, verificationToken } = result.data;
    sendMockEmail(account.email, "welcome", { firstName: account.firstName }, locale);
    sendMockEmail(account.email, "verify-email", { token: verificationToken }, locale);
    router.push(`/verify-email?token=${verificationToken}`);
  }

  return (
    <AuthShell title={t.auth.signup.title} subtitle={t.auth.signup.subtitle}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label={t.auth.signup.firstName} htmlFor="signup-first-name">
            <input
              id="signup-first-name"
              type="text"
              autoComplete="given-name"
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className={fieldClass()}
            />
          </FormField>
          <FormField label={t.auth.signup.lastName} htmlFor="signup-last-name">
            <input
              id="signup-last-name"
              type="text"
              autoComplete="family-name"
              required
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className={fieldClass()}
            />
          </FormField>
        </div>
        <FormField label={t.auth.signup.email} htmlFor="signup-email" error={error ?? undefined}>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={fieldClass(Boolean(error))}
          />
        </FormField>
        <FormField label={t.auth.signup.phone} htmlFor="signup-phone">
          <input
            id="signup-phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={fieldClass()}
          />
        </FormField>
        <FormField label={t.auth.signup.password} htmlFor="signup-password">
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className={fieldClass()}
          />
        </FormField>
        <label className="flex items-start gap-3 text-sm text-foreground/70">
          <input
            type="checkbox"
            checked={form.marketingOptIn}
            onChange={(e) => update("marketingOptIn", e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-wb-orange"
          />
          {t.auth.signup.marketingOptIn}
        </label>
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? t.auth.signup.submitting : t.auth.signup.submit}
        </PrimaryButton>
        <p className="text-center text-sm text-foreground/60">
          {t.auth.signup.haveAccount}{" "}
          <Link href="/login" className="font-semibold text-wb-orange hover:underline">
            {t.auth.signup.loginLink}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
