// Search keywords for the site's product categories. Display copy (name /
// description) already lives in the i18n dictionaries — this file only adds
// the vocabulary Bud Guardian needs to recognize a category in free text.

export type BudGuardianCategoryId =
  | "flower"
  | "edibles"
  | "vapes"
  | "concentrates"
  | "cbd"
  | "accessories";

export type BudGuardianCategory = {
  id: BudGuardianCategoryId;
  keywords: string[];
};

export const BUD_GUARDIAN_CATEGORIES: BudGuardianCategory[] = [
  {
    id: "flower",
    keywords: ["fleur", "fleurs", "weed", "bud", "buds", "flower", "flowers", "herbe", "prerolls", "preroules", "pre-roll", "joint"],
  },
  {
    id: "edibles",
    keywords: ["comestible", "comestibles", "edible", "edibles", "gummies", "bonbon", "bonbons", "chocolat", "chocolate"],
  },
  {
    id: "vapes",
    keywords: ["vape", "vapes", "vapoteuse", "vapoteuses", "vaporisateur", "cartouche", "cartridge", "pod"],
  },
  {
    id: "concentrates",
    keywords: ["concentre", "concentres", "concentrate", "concentrates", "extrait", "extraits", "extract", "hash", "shatter", "rosin"],
  },
  {
    id: "cbd",
    keywords: ["cbd", "chanvre", "hemp", "sans thc", "thc free"],
  },
  {
    id: "accessories",
    keywords: ["accessoire", "accessoires", "accessory", "accessories", "papier", "papers", "grinder", "pipe", "bong"],
  },
];
