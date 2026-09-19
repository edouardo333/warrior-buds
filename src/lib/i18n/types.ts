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
    visitStore: string;
    openMenu: string;
    closeMenu: string;
    account: string;
    login: string;
    cart: string;
    wishlist: string;
    trackOrder: string;
    cartItemsAria: (count: number) => string;
  };
  announcementBar: {
    message: string;
  };
  hero: {
    kicker: string;
    tagline: string;
    lead: string;
    ctaPrimary: string;
    ctaSecondary: string;
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
  // Homepage SEO/information accordion, placed between "Why Warrior Buds"
  // and the "Ready to Visit" final CTA. Just the section chrome lives here —
  // the actual accordion questions/answers (long-form, per data file
  // convention) live in data/homepage-seo.ts, same split as t.faq vs
  // data/faq.ts.
  homeSeo: {
    eyebrow: string;
    title: string;
    intro: string[];
    expand: (title: string) => string;
    collapse: (title: string) => string;
  };
  homeFinalCta: {
    label: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    getDirections: string;
    callNow: string;
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
    ctaTitlePrefix: string;
    ctaTitleHighlight: string;
    ctaSubtitle: string;
    callNow: string;
    paymentMethodsHeading: string;
    paymentMethodsNote: string;
    copyright: (year: number) => string;
    credit: string;
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
    };
    map: {
      title: string;
    };
    support: {
      eyebrow: string;
      title: string;
      description: string;
      chatCta: string;
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
  auth: {
    backToWebsite: string;
    login: {
      metaTitle: string;
      metaDescription: string;
      title: string;
      subtitle: string;
      email: string;
      password: string;
      submit: string;
      submitting: string;
      forgotPassword: string;
      noAccount: string;
      signUpLink: string;
      errorInvalidCredentials: string;
    };
    signup: {
      metaTitle: string;
      metaDescription: string;
      title: string;
      subtitle: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
      marketingOptIn: string;
      submit: string;
      submitting: string;
      haveAccount: string;
      loginLink: string;
      errorEmailTaken: string;
    };
    forgotPassword: {
      metaTitle: string;
      metaDescription: string;
      title: string;
      subtitle: string;
      email: string;
      submit: string;
      backToLogin: string;
      successTitle: string;
      successMessage: string;
      devTokenLabel: string;
      continueToReset: string;
      errorNotFound: string;
    };
    resetPassword: {
      metaTitle: string;
      metaDescription: string;
      title: string;
      subtitle: string;
      token: string;
      newPassword: string;
      confirmPassword: string;
      submit: string;
      successTitle: string;
      successMessage: string;
      goToLogin: string;
      errorInvalidToken: string;
      errorMismatch: string;
    };
    verifyEmail: {
      metaTitle: string;
      metaDescription: string;
      title: string;
      subtitle: string;
      token: string;
      submit: string;
      successTitle: string;
      successMessage: string;
      resend: string;
      resent: string;
      alreadyVerified: string;
      errorInvalidToken: string;
    };
  };
  account: {
    nav: {
      dashboard: string;
      profile: string;
      addresses: string;
      paymentMethods: string;
      orders: string;
      wishlist: string;
      settings: string;
      logout: string;
      backToSite: string;
    };
    guardTitle: string;
    guardMessage: string;
    guardCta: string;
    dashboard: {
      title: string;
      welcomeBack: (name: string) => string;
      recentOrders: string;
      viewAllOrders: string;
      noOrders: string;
      shopNow: string;
      quickLinks: string;
    };
    profile: {
      title: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      save: string;
      saved: string;
    };
    addresses: {
      title: string;
      addNew: string;
      empty: string;
      label: string;
      fullName: string;
      line1: string;
      line2: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
      phone: string;
      setDefault: string;
      defaultBadge: string;
      edit: string;
      delete: string;
      save: string;
      cancel: string;
    };
    paymentMethods: {
      title: string;
      addNew: string;
      empty: string;
      label: string;
      provider: string;
      setDefault: string;
      defaultBadge: string;
      delete: string;
      save: string;
      cancel: string;
      interacHint: string;
    };
    orders: {
      title: string;
      empty: string;
      shopNow: string;
      orderNumber: string;
      placedOn: string;
      status: string;
      total: string;
      viewDetails: string;
    };
    settings: {
      title: string;
      marketingOptIn: string;
      changePassword: string;
      currentPassword: string;
      newPassword: string;
      save: string;
      saved: string;
      errorCurrentPassword: string;
    };
  };
  promo: {
    label: string;
    placeholder: string;
    apply: string;
    applying: string;
    remove: string;
    appliedMessage: (code: string, amount: string) => string;
    freeShippingMessage: (threshold: string) => string;
    errorInvalid: string;
    errorAlreadyRedeemed: string;
    errorEmpty: string;
    discountLabel: (code: string) => string;
  };
  cart: {
    metaTitle: string;
    title: string;
    empty: string;
    emptyCta: string;
    product: string;
    price: string;
    quantity: string;
    lineTotal: string;
    remove: string;
    subtotal: string;
    shipping: string;
    freeShipping: string;
    tax: string;
    total: string;
    checkout: string;
    continueShopping: string;
    miniCartTitle: string;
    viewCart: string;
    itemsInCart: (count: number) => string;
    // Cart-line meta text for a format-priced item (e.g. "Format: 14g") —
    // shown under the product name in CartLineItem/MiniCart/ReviewStep. The
    // label itself is never translated (types/product.ts's ProductFormat),
    // only this surrounding phrase.
    formatLabel: (label: string) => string;
  };
  wishlist: {
    metaTitle: string;
    title: string;
    empty: string;
    emptyCta: string;
    addToCart: string;
    remove: string;
    moveToCart: string;
  };
  checkout: {
    metaTitle: string;
    title: string;
    steps: {
      shipping: string;
      billing: string;
      review: string;
      payment: string;
    };
    identity: {
      subtitle: string;
      guestTitle: string;
      guestSubtitle: string;
      guestEmailLabel: string;
      guestCta: string;
      accountTitle: string;
      accountSubtitle: string;
      accountCta: string;
      haveAccount: string;
      loginLink: string;
      benefitsTitle: string;
      benefits: string[];
      benefitsFooter: string;
    };
    shipping: {
      title: string;
      addNew: string;
      useAddress: string;
      method: string;
      standard: string;
      expedited: string;
      pickup: string;
      continueBtn: string;
      noAddresses: string;
    };
    billing: {
      title: string;
      sameAsShipping: string;
      continueBtn: string;
    };
    review: {
      title: string;
      items: string;
      edit: string;
      continueBtn: string;
    };
    payment: {
      title: string;
      choose: string;
      demoBadge: string;
      placeOrder: string;
      placing: string;
    };
    confirmation: {
      metaTitle: string;
      title: string;
      thankYou: (orderId: string) => string;
      whatNext: string;
      viewOrder: string;
      continueShopping: string;
    };
    back: string;
    emptyCartTitle: string;
    emptyCartMessage: string;
    emptyCartCta: string;
  };
  trackOrder: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    subtitle: string;
    orderNumber: string;
    email: string;
    submit: string;
    notFound: string;
  };
  orderDetail: {
    title: string;
    orderNumber: string;
    placedOn: string;
    shippingMethod: string;
    shippingMethods: { standard: string; expedited: string; pickup: string };
    trackingNumber: string;
    trackingPending: string;
    items: string;
    shippingAddress: string;
    billingAddress: string;
    paymentMethod: string;
    orderComplete: string;
    timeline: string;
    total: string;
    subtotal: string;
    shippingCost: string;
    tax: string;
    discount: (code: string) => string;
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
      addToCart: string;
      outOfStock: string;
      lowStock: string;
      startingFrom: (formattedPrice: string) => string;
      priceOnRequest: string;
    };
    detail: {
      addToCart: string;
      addedToCart: string;
      addToWishlist: string;
      removeFromWishlist: string;
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
      trustSecureCheckout: string;
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
      selectFormatPrompt: string;
      priceOnRequestNotice: string;
      infoPricingTitle: string;
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
    contactEyebrow: string;
    contactTitle: string;
    contactSubtitle: string;
    contactCta: string;
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
      askButton: string;
      contactButton: string;
    };
  };
};
