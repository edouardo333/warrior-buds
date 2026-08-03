"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AuthShell from "./AuthShell";
import { FormField, PrimaryButton, fieldClass } from "@/components/forms/FormField";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuthActions } from "@/lib/shop/auth-actions";

export default function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const { login } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = login(email, password);
    setPending(false);
    if (!result.ok) {
      setError(t.auth.login.errorInvalidCredentials);
      return;
    }
    router.push("/account");
  }

  return (
    <AuthShell title={t.auth.login.title} subtitle={t.auth.login.subtitle}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormField label={t.auth.login.email} htmlFor="login-email">
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass()}
          />
        </FormField>
        <FormField label={t.auth.login.password} htmlFor="login-password" error={error ?? undefined}>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass(Boolean(error))}
          />
        </FormField>
        <div className="text-right text-sm">
          <Link href="/forgot-password" className="text-foreground/60 transition-colors hover:text-wb-orange">
            {t.auth.login.forgotPassword}
          </Link>
        </div>
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? t.auth.login.submitting : t.auth.login.submit}
        </PrimaryButton>
        <p className="text-center text-sm text-foreground/60">
          {t.auth.login.noAccount}{" "}
          <Link href="/signup" className="font-semibold text-wb-orange hover:underline">
            {t.auth.login.signUpLink}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
