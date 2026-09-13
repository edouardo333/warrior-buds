export const SITE = {
  name: "Warrior Buds",
  // Production website origin (H2 SEO pass) — single source of truth for
  // metadataBase, canonical URLs, robots.ts and sitemap.ts. Deliberately a
  // different domain than the confirmed business email below — do not
  // "align" the two, they're intentionally separate (see AGENTS.md / H2
  // report).
  url: "https://warriorbuds.wtf",
  defaultTitle: "Warrior Buds | Dispensaire de cannabis haut de gamme à Oka/Kanesatake",
  defaultDescription:
    "Warrior Buds est un dispensaire de cannabis haut de gamme à Oka/Kanesatake offrant fleurs, comestibles, vapoteuses, concentrés, CBD et accessoires, avec un service expert et chaleureux.",
  addressLine1: "2 Av. 1 Terrasse Raymond",
  addressLine2: "Oka, QC J0N 1E0",
  addressLocality: "Oka",
  addressRegion: "QC",
  postalCode: "J0N 1E0",
  addressCountry: "CA",
  phoneDisplay: "+1 (514) 714-7959",
  phoneHref: "tel:+15147147959",
  // Confirmed Warrior Buds contact inbox — keep emailHref in sync if this
  // ever changes.
  email: "contact@warriorbuds.ca",
  emailHref: "mailto:contact@warriorbuds.ca",
  instagramUrl: "https://www.instagram.com/warriorbudscafe/",
  linktreeUrl: "https://linktr.ee/mohawkvibez",
  // Official Warrior Buds Dispensary Google Business listing — always link
  // here (not a generic street-address search) so "Get Directions" / map
  // CTAs open the real business profile with reviews, hours, and photos.
  mapsUrl:
    "https://www.google.com/maps/place/Warrior+Buds+Dispensary+-+24%2F7+Wholesale/@45.4854965,-74.1333004,17z/data=!3m1!4b1!4m6!3m5!1s0x4cc9330b57123d53:0xbcca68a8404f4745!8m2!3d45.4854928!4d-74.1307255!16s%2Fg%2F11rzjkzx1k?entry=ttu&g_ep=EgoyMDI2MDgwNS4xIKXMDSoASAFQAw%3D%3D",
  googleRating: "4.9",
  googleReviewCount: "610+",
} as const;
