import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Connexion | Warrior Buds",
  description: "Connectez-vous à votre compte Warrior Buds.",
  robots: { index: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
