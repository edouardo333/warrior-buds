import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import BudGuardian from "@/components/bud-guardian/BudGuardian";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Warrior Buds | Dispensaire de cannabis haut de gamme à Oka/Kanesatake",
  description:
    "Warrior Buds est un dispensaire de cannabis haut de gamme à Oka/Kanesatake offrant fleurs, comestibles, vapoteuses, concentrés, CBD et accessoires, avec un service expert et chaleureux.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <LanguageProvider>
          {children}
          <BudGuardian />
        </LanguageProvider>
      </body>
    </html>
  );
}
