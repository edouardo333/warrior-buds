import type { Metadata } from "next";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Inscription | Warrior Buds",
  description: "Créez votre compte Warrior Buds.",
  robots: { index: false },
};

export default function SignupPage() {
  return <SignupForm />;
}
