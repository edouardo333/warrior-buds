"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import AuthShell from "./AuthShell";
import { FormField, PrimaryButton, SecondaryButton, fieldClass } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAccount, useAuthActions } from "@/lib/shop/auth-actions";
import { sendMockEmail } from "@/lib/shop/mock-email";

export default function VerifyEmailForm() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();
  const account = useAccount();
  const { confirmEmailVerification, requestEmailVerification } = useAuthActions();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [resent, setResent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = confirmEmailVerification(token.trim());
    if (!result.ok) {
      setError(t.auth.verifyEmail.errorInvalidToken);
      return;
    }
    setError(null);
    setDone(true);
  }

  function handleResend() {
    if (!account) return;
    const newToken = requestEmailVerification(account.id);
    sendMockEmail(account.email, "verify-email", { token: newToken }, locale);
    setToken(newToken);
    setResent(true);
  }

  const isVerified = account?.emailVerified || done;

  return (
    <AuthShell title={t.auth.verifyEmail.title} subtitle={isVerified ? undefined : t.auth.verifyEmail.subtitle}>
      {isVerified ? (
        <div className="flex flex-col gap-5 text-center">
          <p className="font-display text-2xl tracking-wide text-foreground">{t.auth.verifyEmail.successTitle}</p>
          <p className="text-sm text-foreground/70">{t.auth.verifyEmail.successMessage}</p>
          <Link href="/account">
            <PrimaryButton type="button" className="w-full">
              {t.account.nav.dashboard}
            </PrimaryButton>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <FormField label={t.auth.verifyEmail.token} htmlFor="verify-token" error={error ?? undefined}>
            <input
              id="verify-token"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className={`${fieldClass(Boolean(error))} font-mono`}
            />
          </FormField>
          <PrimaryButton type="submit">{t.auth.verifyEmail.submit}</PrimaryButton>
          {account && (
            <SecondaryButton type="button" onClick={handleResend}>
              {resent ? t.auth.verifyEmail.resent : t.auth.verifyEmail.resend}
            </SecondaryButton>
          )}
        </form>
      )}
    </AuthShell>
  );
}
