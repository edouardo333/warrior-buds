import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Vérifier le courriel | Warrior Buds",
  description: "Vérifiez l'adresse courriel de votre compte Warrior Buds.",
  robots: { index: false },
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
