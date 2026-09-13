import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactPageContent from "@/components/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact | Warrior Buds",
  description:
    "Communiquez avec Warrior Buds ou obtenez l'itinéraire vers notre boutique d'Oka et Kanesatake.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | Warrior Buds",
    description:
      "Communiquez avec Warrior Buds ou obtenez l'itinéraire vers notre boutique d'Oka et Kanesatake.",
    url: "/contact",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact | Warrior Buds",
    description:
      "Communiquez avec Warrior Buds ou obtenez l'itinéraire vers notre boutique d'Oka et Kanesatake.",
  },
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
