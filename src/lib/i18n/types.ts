export type Locale = "en" | "fr";

export const LOCALES: Locale[] = ["en", "fr"];
export const DEFAULT_LOCALE: Locale = "fr";

export type NavLink = {
  label: string;
  href: string;
};

export type Dictionary = {
  nav: {
    links: {
      home: string;
      products: string;
      learningCenter: string;
      about: string;
      gallery: string;
      reviews: string;
      contact: string;
    };
    visitStore: string;
    openMenu: string;
    closeMenu: string;
  };
  hero: {
    kicker: string;
    tagline: string;
    lead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    finePrint: string;
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
      flower: { name: string; description: string };
      edibles: { name: string; description: string };
      vapes: { name: string; description: string };
      concentrates: { name: string; description: string };
      cbd: { name: string; description: string };
      accessories: { name: string; description: string };
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
    cta: {
      titlePrefix: string;
      titleHighlight: string;
      subtitle: string;
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
    };
  };
  contact: {
    metaTitle: string;
    metaDescription: string;
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
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
    form: {
      eyebrow: string;
      title: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      message: string;
      submit: string;
      successTitle: string;
      successMessage: string;
      sendAnother: string;
    };
    infoStrip: {
      openDaily: { title: string; subtitle: string };
      location: { title: string; subtitle: string };
      ageRestriction: { title: string; subtitle: string };
    };
  };
  placeholders: {
    comingSoon: string;
    gallery: { title: string; description: string };
    products: { title: string; description: string };
    learningCenter: { title: string; description: string };
  };
};
