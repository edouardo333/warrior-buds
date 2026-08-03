import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutView from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Paiement | Warrior Buds",
  description: "Complétez votre commande Warrior Buds.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <CheckoutView />
      </main>
      <Footer />
    </>
  );
}
