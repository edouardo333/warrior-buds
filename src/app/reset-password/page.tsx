import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe | Warrior Buds",
  description: "Choisissez un nouveau mot de passe pour votre compte Warrior Buds.",
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
