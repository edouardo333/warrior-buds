import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalPageContent from "@/components/legal/LegalPageContent";

export const metadata: Metadata = {
  title: "Politique relative aux témoins | Warrior Buds",
  description:
    "Comment Warrior Buds utilise le stockage local, le stockage de session et les intégrations tierces — et comment les contrôler.",
  alternates: { canonical: "/cookie-policy" },
  openGraph: {
    title: "Politique relative aux témoins | Warrior Buds",
    description:
      "Comment Warrior Buds utilise le stockage local, le stockage de session et les intégrations tierces — et comment les contrôler.",
    url: "/cookie-policy",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Politique relative aux témoins | Warrior Buds",
    description:
      "Comment Warrior Buds utilise le stockage local, le stockage de session et les intégrations tierces — et comment les contrôler.",
  },
};

export default function CookiePolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <LegalPageContent page="cookies" />
      </main>
      <Footer hideCta />
    </>
  );
}
