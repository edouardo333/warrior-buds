"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import AuthShell from "./AuthShell";
import { FormField, PrimaryButton, fieldClass } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuthActions } from "@/lib/shop/auth-actions";

export default function ResetPasswordForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuthActions();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t.auth.resetPassword.errorMismatch);
      return;
    }
    const result = resetPassword(token.trim(), newPassword);
    if (!result.ok) {
      setError(t.auth.resetPassword.errorInvalidToken);
      return;
    }
    setError(null);
    setDone(true);
  }

  return (
    <AuthShell title={t.auth.resetPassword.title} subtitle={t.auth.resetPassword.subtitle}>
      {done ? (
        <div className="flex flex-col gap-5 text-center">
          <p className="font-display text-2xl tracking-wide text-foreground">{t.auth.resetPassword.successTitle}</p>
          <p className="text-sm text-foreground/70">{t.auth.resetPassword.successMessage}</p>
          <Link href="/login">
            <PrimaryButton type="button" className="w-full">
              {t.auth.resetPassword.goToLogin}
            </PrimaryButton>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <FormField label={t.auth.resetPassword.token} htmlFor="reset-token">
            <input
              id="reset-token"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className={`${fieldClass()} font-mono`}
            />
          </FormField>
          <FormField label={t.auth.resetPassword.newPassword} htmlFor="reset-new-password">
            <input
              id="reset-new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={fieldClass()}
            />
          </FormField>
          <FormField label={t.auth.resetPassword.confirmPassword} htmlFor="reset-confirm-password" error={error ?? undefined}>
            <input
              id="reset-confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={fieldClass(Boolean(error))}
            />
          </FormField>
          <PrimaryButton type="submit">{t.auth.resetPassword.submit}</PrimaryButton>
        </form>
      )}
    </AuthShell>
  );
}
