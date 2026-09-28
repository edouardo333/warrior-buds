export type Locale = "en" | "fr";

export const LOCALES: Locale[] = ["en", "fr"];
export const DEFAULT_LOCALE: Locale = "fr";

export type NavLink = {
  label: string;
  href: string;
};

// Legal pages (/privacy-policy, /terms-and-conditions, /cookie-policy) —
// content blocks kept generic (paragraph / list / todo) so LegalPageContent
// can render any of the three docs from the same layout. "todo" blocks
// render as a visibly-flagged callout for provisions that depend on a real
// business practice not yet confirmed (see AGENTS.md instruction: never
// invent refunds/shipping/data practices) — replace with real copy once
// confirmed, then delete the block type usage if no longer needed.
export type LegalParagraphBlock = { type: "p"; text: string };
export type LegalListBlock = { type: "list"; items: string[] };
export type LegalTodoBlock = { type: "todo"; text: string };
export type LegalBlock = LegalParagraphBlock | LegalListBlock | LegalTodoBlock;

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export type Dictionary = {
  // Homepage <title> only — the homepage has no page-specific dictionary
  // section of its own (unlike about/reviews/contact/etc.), so this mirrors
  // the root layout's static metadata.title for client-side locale sync.
  // See DocumentTitleSync.
  home: {
    metaTitle: string;
  };
  nav: {
    links: {
      home: string;
      products: string;
      learningCenter: string;
      about: string;
      gallery: string;
      reviews: string;
      faq: string;
      contact: string;
    };
    joinUs: string;
    openMenu: string;
    closeMenu: string;
  };
  hero: {
    kicker: string;
    tagline: string;
    lead: string;
    ctaTelegram: string;
    finePrint: string;
    trustText: string;
  };
  trustBar: {
    googleRating: string;
    googleReviews: string;
    openPrimary: string;
    openSecondary: string;
    wholesalePrimary: string;
    wholesaleSecondary: string;
  };
  categories: {
    eyebrow: string;
    title: string;
    explore: string;
    items: {
      flower: { name: string; description: string; alt: string };
      edibles: { name: string; description: string; alt: string };
      vapes: { name: string; description: string; alt: string };
      concentrates: { name: string; description: string; alt: string };
      cbd: { name: string; description: string; alt: string };
      accessories: { name: string; description: string; alt: string };
      mushrooms: { name: string; description: string; alt: string };
      topicals: { name: string; description: string; alt: string };
      cigarettes: { name: string; description: string; alt: string };
    };
  };
  whyWarriorBuds: {
    eyebrow: string;
    title: string;
    lead: string;
    reasons: {
      selection: { title: string; description: string };
      service: { title: string; description: string };
      community: { title: string; description: string };
    };
    cta: string;
  };
  homeFinalCta: {
    label: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    getDirections: string;
    callNow: string;
  };
  // Shared $250 minimum-order banner (MinimumOrderCTA) — rendered on both
  // the homepage and /products. The heading is split around the amount so
  // it can be emphasized, since EN puts it first ("$250 MINIMUM ORDER") and
  // FR puts it last ("COMMANDE MINIMUM DE 250 $").
  minimumOrderCta: {
    titleBefore: string;
    titleAmount: string;
    titleAfter: string;
    body: string;
    telegramButton: string;
  };
  footer: {
    tagline: string;
    exploreHeading: string;
    visitHeading: string;
    getDirections: string;
    getDirectionsLink: string;
    hoursHeading: string;
    openDaily: string;
    hoursValue: string;
    contactHeading: string;
    instagram: string;
    linktree: string;
    telegram: string;
    ctaTitlePrefix: string;
    ctaTitleHighlight: string;
    ctaSubtitle: string;
    callNow: string;
    paymentMethodsHeading: string;
    paymentMethodsNote: string;
    copyright: (year: number) => string;
    privacyPolicy: string;
    terms: string;
    cookiePolicy: string;
    disclaimer: string;
  };
  openingStatus: {
    openNow: string;
    closingSoon: string;
    last30Minutes: string;
    closed: string;
    openUntil: (time: string) => string;
    closingIn: (duration: string) => string;
    opensAt: (dayLabel: string, time: string) => string;
    hoursComingSoon: string;
    today: string;
    tomorrow: string;
    weekdayNames: string[];
  };
  about: {
    metaTitle: string;
    metaDescription: string;
    hero: {
      eyebrow: string;
      title: string;
      titleHighlight: string;
      subtitle: string;
      locationBadge: string;
    };
    beginning: {
      eyebrow: string;
      title: string;
      paragraph1: string;
      paragraph2: string;
    };
    values: {
      eyebrow: string;
      title: string;
      items: {
        quality: { title: string; description: string };
        community: { title: string; description: string };
        service: { title: string; description: string };
      };
    };
    community: {
      eyebrow: string;
      titlePrefix: string;
      titleHighlight: string;
      paragraph: string;
    };
    experience: {
      eyebrow: string;
      title: string;
      items: {
        curated: { title: string; description: string };
        team: { title: string; description: string };
        customers: { title: string; description: string };
        community: { title: string; description: string };
      };
    };
    cta: {
      eyebrow: string;
      titlePrefix: string;
      titleHighlight: string;
      subtitle: string;
      getDirections: string;
      callNow: string;
    };
  };
  reviews: {
    metaTitle: string;
    metaDescription: string;
    hero: {
      eyebrow: string;
      title: string;
      titleHighlight: string;
      subtitle: string;
      badgeLabel: string;
    };
    cta: {
      titlePrefix: string;
      titleHighlight: string;
      subtitle: string;
      button: string;
      reviewsLabel: string;
      verifiedLabel: string;
    };
    storeCta: {
      label: string;
      titlePrefix: string;
      titleHighlight: string;
      subtitle: string;
      infoLocation: string;
      infoHours: string;
      infoPickup: string;
      getDirections: string;
      callNow: string;
    };
  };
  contact: {
    metaTitle: string;
    metaDescription: string;
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
      locationBadge: string;
    };
    details: {
      eyebrow: string;
      title: string;
      addressLabel: string;
      phoneLabel: string;
      hoursLabel: string;
      openDaily: string;
      hoursValue: string;
      getDirections: string;
      callNow: string;
      instagram: string;
      linktree: string;
      telegram: string;
    };
    map: {
      title: string;
    };
    support: {
      eyebrow: string;
      title: string;
      description: string;
      emailCta: string;
    };
    form: {
      eyebrow: string;
      title: string;
      subtitle: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      subject: string;
      subjectPlaceholder: string;
      subjectOptions: string[];
      message: string;
      charactersLabel: string;
      submit: string;
      sending: string;
      successTitle: string;
      successMessage: string;
      sendAnother: string;
      errorTitle: string;
      errorMessage: string;
      tryAgain: string;
    };
    infoStrip: {
      openDaily: { title: string; subtitle: string };
      location: { title: string; subtitle: string };
      ageRestriction: { title: string; subtitle: string };
    };
    finalCta: {
      label: string;
      titlePrefix: string;
      titleHighlight: string;
      subtitle: string;
      getDirections: string;
      callNow: string;
    };
  };
  placeholders: {
    comingSoon: string;
    gallery: { title: string; description: string };
    products: { title: string; description: string };
  };
  gallery: {
    metaTitle: string;
    metaDescription: string;
    hero: {
      label: string;
      title: string;
      subtitle: string;
    };
    video: {
      playLabel: string;
      pauseLabel: string;
      muteLabel: string;
      unmuteLabel: string;
    };
    finalCta: {
      label: string;
      titlePrefix: string;
      titleHighlight: string;
      subtitle: string;
      getDirections: string;
      callNow: string;
    };
  };
  learningCenter: {
    metaTitle: string;
    metaDescription: string;
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
    };
    guidesLabel: string;
    backToCategories: string;
    readGuide: string;
    close: string;
    disclaimerBadge: string;
    disclaimerText: string;
    cta: {
      label: string;
      titlePrefix: string;
      titleHighlight: string;
      subtitle: string;
      getDirections: string;
      callNow: string;
    };
  };
  productCatalog: {
    metaTitle: string;
    metaDescription: string;
    filters: {
      allCategories: string;
      category: string;
      categoryMenu: {
        showSubcategories: (name: string) => string;
        hideSubcategories: (name: string) => string;
        hoverHint: string;
        allInCategory: string;
      };
      strain: string;
      allStrains: string;
      onSaleOnly: string;
      search: string;
      searchPlaceholder: string;
      sort: string;
      sortFeatured: string;
      sortPriceAsc: string;
      sortPriceDesc: string;
      sortNewest: string;
      sortRating: string;
      clear: string;
      noResults: string;
      resultsCount: (count: number) => string;
    };
    card: {
      outOfStock: string;
      lowStock: string;
      startingFrom: (formattedPrice: string) => string;
      priceOnRequest: string;
      boxPrice: (formattedPrice: string, quantity: number) => string;
    };
    detail: {
      outOfStock: string;
      thc: string;
      cbd: string;
      strain: string;
      weight: string;
      brand: string;
      category: string;
      quantity: string;
      description: string;
      reviewsTitle: string;
      noReviews: string;
      verifiedPurchase: string;
      backToShop: string;
      trustInStorePickup: string;
      trustCustomerSupport: string;
      bulkPricingTitle: string;
      bulkPricingQuantity: string;
      bulkPricingPrice: string;
      bulkPricingUnit: (quantity: number) => string;
      totalPrice: (formattedPrice: string) => string;
      youSave: (formattedAmount: string) => string;
      availableFormatsTitle: string;
      formatColumn: string;
      priceColumn: string;
      inStoreOnlyNotice: string;
      priceOnRequestNotice: string;
      infoPricingTitle: string;
      boxPriceCta: string;
      telegramContact: string;
      telegramContactAria: string;
      flavourProfile: string;
      flavour: string;
      flavourCount: (count: number) => string;
      chooseFlavour: string;
      selectedFlavour: string;
      enlargeImage: (label: string) => string;
      closeImage: string;
    };
    finalCta: {
      label: string;
      titlePrefix: string;
      titleHighlight: string;
      subtitle: string;
      getDirections: string;
      callNow: string;
    };
  };
  // Global app/not-found.tsx (also reached for an invalid /products/[slug]).
  notFoundPage: {
    title: string;
    message: string;
    backToProducts: string;
    backHome: string;
  };
  legal: {
    onThisPage: string;
    backToTopLabel: string;
    lastUpdatedLabel: string;
    todoLabel: string;
    privacy: LegalDocument;
    terms: LegalDocument;
    cookies: LegalDocument;
  };
  faq: {
    metaTitle: string;
    metaDescription: string;
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
    };
    search: {
      placeholder: string;
      ariaLabel: string;
      resultsCount: (count: number) => string;
      noResultsTitle: string;
      noResultsSubtitle: string;
      clear: string;
    };
    jumpToLabel: string;
    itemsCountLabel: (count: number) => string;
    cta: {
      label: string;
      title: string;
      subtitle: string;
      contactButton: string;
    };
  };
};
