import type { Dictionary } from "../types";

const en: Dictionary = {
  nav: {
    links: {
      home: "Home",
      products: "Products",
      learningCenter: "Learning Center",
      about: "About",
      gallery: "Gallery",
      reviews: "Reviews",
      contact: "Contact",
    },
    visitStore: "Visit Store",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  hero: {
    kicker: "Kanesatake · Oka · Quebec",
    tagline: "Premium Cannabis Dispensary",
    lead: "Premium products, unbeatable selection and a community-first experience — open late in the heart of Kanesatake.",
    ctaPrimary: "Explore Products",
    ctaSecondary: "Get Directions",
    finePrint: "18+ · In-store shopping · Wholesale available",
  },
  trustBar: {
    googleRating: "Google Rating",
    googleReviews: "Google Reviews",
    openPrimary: "Open",
    openSecondary: "7 Days",
    wholesalePrimary: "24/7",
    wholesaleSecondary: "Wholesale",
  },
  categories: {
    eyebrow: "The Collection",
    title: "Explore Our Categories",
    explore: "Explore",
    items: {
      flower: { name: "Flower", description: "Hand-selected premium strains." },
      edibles: { name: "Edibles", description: "Crafted, precise, and potent." },
      vapes: { name: "Vapes", description: "Clean hardware, pure extracts." },
      concentrates: { name: "Concentrates", description: "Full-spectrum, high-potency." },
      cbd: { name: "CBD", description: "Balanced wellness, no compromise." },
      accessories: { name: "Accessories", description: "Gear built for the ritual." },
    },
  },
  whyWarriorBuds: {
    eyebrow: "The Difference",
    title: "Why Warrior Buds",
    lead: "A dispensary built on trust — curated products, a team that actually knows them, and a business rooted in this community.",
    reasons: {
      selection: {
        title: "Premium Selection",
        description: "Every product is curated for quality, potency, and consistency.",
      },
      service: {
        title: "Friendly Expert Service",
        description: "Our team knows the products and takes the time to guide you right.",
      },
      community: {
        title: "Community-Owned Experience",
        description: "Proudly rooted in Oka & Kanesatake, built by and for our community.",
      },
    },
    cta: "Our Story",
  },
  footer: {
    tagline: "Premium cannabis experience, rooted in Oka & Kanesatake.",
    exploreHeading: "Explore",
    visitHeading: "Visit Us",
    getDirections: "Get Directions",
    getDirectionsLink: "Get Directions →",
    hoursHeading: "Opening Hours",
    openDaily: "Open Daily",
    hoursValue: "10:00 AM – 2:00 AM",
    contactHeading: "Contact",
    instagram: "Instagram",
    linktree: "Linktree",
    ctaTitlePrefix: "Ready to Visit",
    ctaTitleHighlight: "Warrior Buds",
    ctaSubtitle: "Get directions and discover one of Kanesatake's most trusted dispensaries.",
    callNow: "Call Now",
    copyright: (year: number) => `© ${year} Warrior Buds. All Rights Reserved.`,
    credit: "Website designed & developed by Brochu Digital.",
    privacyPolicy: "Privacy Policy",
    terms: "Terms & Conditions",
    cookiePolicy: "Cookie Policy",
    disclaimer:
      "For adults 18+ only. Cannabis sold in accordance with the laws and regulations of Québec, Canada and the Mohawk Territory of Kanesatake.",
  },
  openingStatus: {
    openNow: "OPEN NOW",
    closingSoon: "CLOSING SOON",
    last30Minutes: "LAST 30 MINUTES",
    closed: "CLOSED",
    openUntil: (time) => `Open until ${time}`,
    closingIn: (duration) => `Closing in ${duration}`,
    opensAt: (dayLabel, time) => `Opens ${dayLabel} at ${time}`,
    hoursComingSoon: "Hours coming soon",
    today: "today",
    tomorrow: "tomorrow",
    weekdayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  },
  about: {
    metaTitle: "About | Warrior Buds",
    metaDescription:
      "Learn about Warrior Buds, a community-rooted dispensary in Oka & Kanesatake — our story, our values, and what drives us.",
    hero: {
      eyebrow: "Our Story",
      title: "OUR",
      titleHighlight: "STORY",
      subtitle: "Rooted in Kanesatake. Built for the community.",
    },
    beginning: {
      eyebrow: "Our Beginning",
      title: "How It Started",
      paragraph1:
        "Warrior Buds started with a simple idea: bring a premium, community-first cannabis dispensary to Oka & Kanesatake. We wanted a place where quality never gets compromised and every visitor feels genuinely welcome — not just another customer.",
      paragraph2:
        "Since opening our doors, we've focused on curating a selection worth trusting and building a team that takes the time to guide you toward the right product, every visit.",
    },
    values: {
      eyebrow: "What Drives Us",
      title: "Our Values",
      items: {
        quality: {
          title: "Premium Quality",
          description:
            "Every product on our shelves is curated for quality, potency, and consistency — nothing makes the cut by accident.",
        },
        community: {
          title: "Community First",
          description:
            "Proudly rooted in Oka & Kanesatake, Warrior Buds exists to serve and grow alongside the community that built it.",
        },
        service: {
          title: "Knowledgeable Service",
          description:
            "Our team knows the products inside and out, and takes the time to guide every visitor toward the right choice.",
        },
      },
    },
    community: {
      eyebrow: "Beyond The Counter",
      titlePrefix: "More Than A",
      titleHighlight: "Dispensary",
      paragraph:
        "Warrior Buds is a place built on trust. We take the time to know our regulars, welcome newcomers with an open door, and treat this community as the reason we're here — not just the market we serve. Every visit is a chance to build that relationship a little further.",
    },
    cta: {
      titlePrefix: "Come Experience",
      titleHighlight: "Warrior Buds",
      subtitle: "Stop by Oka & Kanesatake and see what a community-first dispensary feels like.",
      callNow: "Call Now",
    },
  },
  reviews: {
    metaTitle: "Reviews | Warrior Buds",
    metaDescription:
      "Real customer reviews from Warrior Buds shoppers in Oka & Kanesatake — see what hundreds of happy customers are saying.",
    hero: {
      eyebrow: "What People Say",
      title: "CUSTOMER",
      titleHighlight: "REVIEWS",
      subtitle: "Trusted by hundreds of customers across Oka and Kanesatake.",
      badgeLabel: "Google Reviews",
    },
    cta: {
      titlePrefix: "See What Everyone's",
      titleHighlight: "Saying",
      subtitle: "Join hundreds of satisfied customers across Oka and Kanesatake.",
      button: "See All Reviews on Google",
    },
  },
  contact: {
    metaTitle: "Contact | Warrior Buds",
    metaDescription: "Get in touch with Warrior Buds or find directions to our Oka & Kanesatake location.",
    hero: {
      eyebrow: "Contact & Directions",
      title: "Visit Warrior Buds",
      subtitle: "Open daily in Kanesatake, just outside Montréal.",
    },
    details: {
      eyebrow: "Get In Touch",
      title: "Come Visit Us",
      addressLabel: "Address",
      phoneLabel: "Phone",
      hoursLabel: "Hours",
      openDaily: "Open Daily",
      hoursValue: "10:00 AM – 2:00 AM",
      getDirections: "Get Directions",
      callNow: "Call Now",
      instagram: "Instagram",
      linktree: "Linktree",
    },
    map: {
      title: "Warrior Buds location map",
    },
    form: {
      eyebrow: "Questions?",
      title: "Send Us A Message",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      message: "Message",
      submit: "Send Message",
      successTitle: "Message Sent",
      successMessage: "Thanks for reaching out — we'll get back to you as soon as possible.",
      sendAnother: "Send Another Message",
    },
    infoStrip: {
      openDaily: { title: "Open Daily", subtitle: "10 AM to 2 AM" },
      location: { title: "Kanesatake / Oka", subtitle: "Local Dispensary" },
      ageRestriction: { title: "18+ Only", subtitle: "In-Store Shopping" },
    },
  },
  placeholders: {
    comingSoon: "Coming Soon",
    gallery: {
      title: "Gallery",
      description: "A look inside the store, the products, and the community — coming soon.",
    },
    products: {
      title: "Products",
      description: "Our full catalog of flower, edibles, vapes, concentrates, CBD, and accessories is on its way.",
    },
    learningCenter: {
      title: "Learning Center",
      description: "Guides on strains, effects, dosing, and responsible use — built to help you choose with confidence.",
    },
  },
};

export default en;
