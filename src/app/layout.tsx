import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import BudGuardian from "@/components/bud-guardian/BudGuardianLoader";
import { SITE } from "@/lib/site";
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

// H2 SEO pass — production domain / metadataBase and site-wide defaults.
// Individual routes override title/description/alternates.canonical/robots
// as needed (see app/**/page.tsx); openGraph/twitter set here are inherited
// by any route that doesn't define its own (Next shallow-merges metadata
// per segment — a child that sets its own `openGraph` replaces this one
// wholesale, which is why pages with distinct copy repeat their own title/
// description inside their openGraph/twitter blocks instead of relying on
// inheritance).
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.defaultTitle,
  description: SITE.defaultDescription,
  applicationName: SITE.name,
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
    url: "/",
    // No dedicated 1200x630 social-preview image exists in the repo yet —
    // see the H2 SEO report. Do not add an `images` entry here until a real
    // asset is provided; a missing/placeholder file would break OG previews
    // on every page that inherits this block.
    locale: "fr_CA",
  },
  twitter: {
    // "summary" (not summary_large_image) because no OG image exists yet —
    // see the openGraph note above. Revisit once a real image is added.
    card: "summary",
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
  },
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
        {/* Organization/LocalBusiness structured data — built only from
            verified fields in lib/site.ts (name, url, phone, email, postal
            address, and the two confirmed social profiles). Deliberately
            omits aggregateRating (SITE.googleReviewCount is the approximate
            "610+" from the Google Business listing, not a clean integer
            Schema.org requires), openingHours, geo, and priceRange, none of
            which are verified here — see the H2 SEO report. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: SITE.name,
              url: SITE.url,
              telephone: SITE.phoneHref.replace(/^tel:/, ""),
              email: SITE.email,
              address: {
                "@type": "PostalAddress",
                streetAddress: SITE.addressLine1,
                addressLocality: SITE.addressLocality,
                addressRegion: SITE.addressRegion,
                postalCode: SITE.postalCode,
                addressCountry: SITE.addressCountry,
              },
              sameAs: [SITE.instagramUrl, SITE.linktreeUrl],
            }),
          }}
        />
        <LanguageProvider>
          {children}
          <BudGuardian />
        </LanguageProvider>
      </body>
    </html>
  );
}
