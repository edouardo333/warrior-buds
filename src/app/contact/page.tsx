import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactPageContent from "@/components/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact | Warrior Buds",
  description:
    "Communiquez avec Warrior Buds ou obtenez l'itinéraire vers notre boutique d'Oka et Kanesatake.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ContactPageContent />
      </main>
      <Footer hideCta />
    </>
  );
}
