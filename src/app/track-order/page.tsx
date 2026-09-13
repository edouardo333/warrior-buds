import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrackOrderView from "@/components/orders/TrackOrderView";

export const metadata: Metadata = {
  title: "Suivre ma commande | Warrior Buds",
  description: "Suivez votre commande Warrior Buds à l'aide de votre numéro de commande et de votre courriel.",
  alternates: { canonical: "/track-order" },
  openGraph: {
    title: "Suivre ma commande | Warrior Buds",
    description: "Suivez votre commande Warrior Buds à l'aide de votre numéro de commande et de votre courriel.",
    url: "/track-order",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Suivre ma commande | Warrior Buds",
    description: "Suivez votre commande Warrior Buds à l'aide de votre numéro de commande et de votre courriel.",
  },
};

export default function TrackOrderPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <TrackOrderView />
      </main>
      <Footer />
    </>
  );
}
