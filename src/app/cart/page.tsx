import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Panier | Warrior Buds",
  description: "Votre panier Warrior Buds.",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <CartView />
      </main>
      <Footer />
    </>
  );
}
