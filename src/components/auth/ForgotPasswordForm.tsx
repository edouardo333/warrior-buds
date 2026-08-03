"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import AuthShell from "./AuthShell";
import { FormField, PrimaryButton, fieldClass } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuthActions } from "@/lib/shop/auth-actions";
import { sendMockEmail } from "@/lib/shop/mock-email";

export default function ForgotPasswordForm() {
  const { t, locale } = useLanguage();
  const { requestPasswordReset } = useAuthActions();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = requestPasswordReset(email);
    if (!result.ok) {
      setError(t.auth.forgotPassword.errorNotFound);
      return;
    }
    setError(null);
    sendMockEmail(email, "reset-password", { token: result.data.token }, locale);
    setToken(result.data.token);
  }

  return (
    <AuthShell title={t.auth.forgotPassword.title} subtitle={t.auth.forgotPassword.subtitle}>
      {token ? (
        <div className="flex flex-col gap-5 text-center">
          <p className="font-display text-2xl tracking-wide text-foreground">{t.auth.forgotPassword.successTitle}</p>
          <p className="text-sm text-foreground/70">{t.auth.forgotPassword.successMessage}</p>
          <div className="rounded-xl border border-wb-orange/30 bg-wb-orange/10 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-wb-orange">{t.auth.forgotPassword.devTokenLabel}</p>
            <p className="mt-1 break-all font-mono text-sm text-foreground">{token}</p>
          </div>
          <Link href={`/reset-password?token=${token}`}>
            <PrimaryButton type="button" className="w-full">
              {t.auth.forgotPassword.continueToReset}
            </PrimaryButton>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <FormField label={t.auth.forgotPassword.email} htmlFor="forgot-email" error={error ?? undefined}>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass(Boolean(error))}
            />
          </FormField>
          <PrimaryButton type="submit">{t.auth.forgotPassword.submit}</PrimaryButton>
          <p className="text-center text-sm">
            <Link href="/login" className="text-foreground/60 transition-colors hover:text-wb-orange">
              {t.auth.forgotPassword.backToLogin}
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
