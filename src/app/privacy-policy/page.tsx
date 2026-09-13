import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalPageContent from "@/components/legal/LegalPageContent";

export const metadata: Metadata = {
  title: "Politique de confidentialité | Warrior Buds",
  description:
    "Découvrez quelles informations Warrior Buds recueille sur ce site, pourquoi, et comment elles sont conservées et utilisées.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: {
    title: "Politique de confidentialité | Warrior Buds",
    description:
      "Découvrez quelles informations Warrior Buds recueille sur ce site, pourquoi, et comment elles sont conservées et utilisées.",
    url: "/privacy-policy",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Politique de confidentialité | Warrior Buds",
    description:
      "Découvrez quelles informations Warrior Buds recueille sur ce site, pourquoi, et comment elles sont conservées et utilisées.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <LegalPageContent page="privacy" />
      </main>
      <Footer hideCta />
    </>
  );
}
