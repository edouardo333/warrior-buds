// Colloquial / slang terms mapped to the canonical word used in the FAQ
// keyword lists, applied during tokenization (see lib/bud-guardian/search.ts)
// so both the customer's query and the FAQ keywords speak the same
// vocabulary. Keys and values are already normalized (lowercase, no accents)
// since normalize() runs before this map is consulted.

export const SYNONYMS: Record<string, string> = {
  // Flower / weed slang (FR + EN)
  mari: "fleur",
  marijuana: "fleur",
  weed: "fleur",
  herbe: "fleur",
  pot: "fleur",
  grass: "fleur",
  bud: "fleur",
  buds: "fleur",
  flower: "fleur",
  flowers: "fleur",

  // Vapes
  vapo: "vape",
  vaporisateur: "vape",
  vaporizer: "vape",
  cartouche: "vape",
  cartridge: "vape",

  // Concentrates
  dab: "concentre",
  dabs: "concentre",
  extrait: "concentre",
  extraits: "concentre",
  extract: "concentre",
  extracts: "concentre",
  hash: "concentre",
  shatter: "concentre",
  rosin: "concentre",

  // Pre-rolls / joints
  joint: "preroule",
  joints: "preroule",
  "pre-roll": "preroule",
  "pre-rolls": "preroule",
  preroll: "preroule",
  prerolls: "preroule",

  // Pricing
  cher: "prix",
  couter: "prix",
  cout: "prix",
  price: "prix",
  cost: "prix",

  // Money / payment slang
  cash: "comptant",
  argent: "comptant",

  // Staff/human
  budtender: "employe",
  employee: "employe",
  staff: "employe",
};
