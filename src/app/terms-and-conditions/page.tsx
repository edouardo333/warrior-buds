import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalPageContent from "@/components/legal/LegalPageContent";

export const metadata: Metadata = {
  title: "Modalités et conditions | Warrior Buds",
  description: "Les modalités qui régissent votre utilisation du site Warrior Buds et toute commande passée avec nous.",
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <LegalPageContent page="terms" />
      </main>
      <Footer hideCta />
    </>
  );
}
