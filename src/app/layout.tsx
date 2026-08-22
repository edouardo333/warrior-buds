import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import BudGuardian from "@/components/bud-guardian/BudGuardianLoader";
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
      {/* overflow-x-hidden: decorative absolutely-positioned glow elements
          (w-[36rem] blur circles in Footer, AboutValues, AuthShell, etc.)
          are wider than narrow mobile viewports; without this the page
          gains real horizontal scroll at ~320–375px. Purely a safety net —
          doesn't affect any component's own horizontal-scroll regions. */}
      {/* suppressHydrationWarning: browser extensions (Grammarly, LastPass,
          etc.) inject their own attributes onto <body> — e.g. Grammarly's
          data-gr-ext-installed / data-new-gr-c-s-check-loaded — before React
          hydrates. React then reports a hydration mismatch that isn't a bug
          in this app; nothing here renders differently between server and
          client. This is the documented fix for that exact class of false
          positive (https://react.dev/link/hydration-mismatch) and only
          silences mismatches on body's own attributes, not on its children. */}
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col overflow-x-hidden bg-background text-foreground font-sans"
      >
        <LanguageProvider>
          {children}
          <BudGuardian />
        </LanguageProvider>
      </body>
    </html>
  );
}
