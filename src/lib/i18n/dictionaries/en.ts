import type { Dictionary } from "../types";

const en: Dictionary = {
  home: {
    metaTitle: "Warrior Buds | Premium Cannabis Dispensary in Oka/Kanesatake",
  },
  nav: {
    links: {
      home: "Home",
      products: "Products",
      learningCenter: "Learning Center",
      about: "About",
      gallery: "Gallery",
      reviews: "Reviews",
      faq: "FAQ",
      contact: "Contact",
    },
    joinUs: "Join Us!",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  hero: {
    kicker: "Kanesatake · Oka · Quebec",
    tagline: "Premium Cannabis Dispensary",
    lead: "Premium products, unbeatable selection and a community-first experience — open late in the heart of Kanesatake.",
    ctaTelegram: "Join Us on Telegram!",
    finePrint: "18+ · In-store shopping · Wholesale available",
    trustText: "Trusted by thousands of customers.",
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
      flower: { name: "Flower", description: "Hand-selected premium strains.", alt: "Flower category" },
      edibles: { name: "Edibles", description: "Crafted, precise, and potent.", alt: "Edibles category" },
      vapes: { name: "Vapes", description: "Clean hardware, pure extracts.", alt: "Vapes category" },
      concentrates: { name: "Concentrates", description: "Full-spectrum, high-potency.", alt: "Concentrates category" },
      cbd: { name: "CBD", description: "Balanced wellness, no compromise.", alt: "CBD category" },
      accessories: { name: "Accessories", description: "Gear built for the ritual.", alt: "Accessories category" },
      mushrooms: { name: "Mushrooms", description: "Functional fungi, no THC, no compromise.", alt: "Mushrooms category" },
      topicals: { name: "Topicals", description: "Targeted relief, applied directly.", alt: "Topicals category" },
      cigarettes: { name: "Cigarettes", description: "Selected tobacco products and formats.", alt: "Cigarettes category" },
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
  homeFinalCta: {
    label: "Visit The Store",
    titlePrefix: "Ready to Visit",
    titleHighlight: "Warrior Buds",
    subtitle: "Get directions and discover one of Kanesatake's most trusted dispensaries.",
    getDirections: "Get Directions",
    callNow: "Call Now",
  },
  minimumOrderCta: {
    titleBefore: "",
    titleAmount: "$250",
    titleAfter: "MINIMUM ORDER",
    body: "All orders require a minimum of $250. Need help with your order? Contact our team directly on Telegram.",
    telegramButton: "CONTACT OUR TEAM ON TELEGRAM",
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
    telegram: "Join Us!",
    ctaTitlePrefix: "Ready to Visit",
    ctaTitleHighlight: "Warrior Buds",
    ctaSubtitle: "Get directions and discover one of Kanesatake's most trusted dispensaries.",
    callNow: "Call Now",
    paymentMethodsHeading: "Payment Methods",
    paymentMethodsNote: "Secure payment options available at checkout.",
    copyright: (year: number) => `© ${year} Warrior Buds. All Rights Reserved.`,
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
      locationBadge: "Kanesatake • Oka • Québec",
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
    experience: {
      eyebrow: "What Sets Us Apart",
      title: "The Warrior Buds Experience",
      items: {
        curated: {
          title: "Carefully Curated Products",
          description: "Every item on our shelves is chosen for quality, potency, and consistency.",
        },
        team: {
          title: "Friendly Expert Team",
          description: "Knowledgeable staff who take the time to guide you toward the right choice.",
        },
        customers: {
          title: "600+ Happy Customers",
          description: "Trusted by hundreds of regulars across Oka & Kanesatake.",
        },
        community: {
          title: "Community Driven",
          description: "Built by and for the community we're proud to call home.",
        },
      },
    },
    cta: {
      eyebrow: "Visit Warrior Buds",
      titlePrefix: "Ready to Visit",
      titleHighlight: "Warrior Buds",
      subtitle: "Stop by Oka & Kanesatake and see what a community-first dispensary feels like.",
      getDirections: "Get Directions",
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
      reviewsLabel: "Reviews",
      verifiedLabel: "Google Verified",
    },
    storeCta: {
      label: "Visit the Store",
      titlePrefix: "Ready to Visit",
      titleHighlight: "Warrior Buds",
      subtitle: "Get directions and discover one of Kanesatake's most trusted dispensaries.",
      infoLocation: "Oka & Kanesatake",
      infoHours: "Open 7 Days",
      infoPickup: "In-Store Pickup",
      getDirections: "Get Directions",
      callNow: "Call Now",
    },
  },
  contact: {
    metaTitle: "Contact | Warrior Buds",
    metaDescription: "Get in touch with Warrior Buds or find directions to our Oka & Kanesatake location.",
    hero: {
      eyebrow: "Contact & Directions",
      title: "Visit Warrior Buds",
      subtitle: "Open daily in Kanesatake, just outside Montréal.",
      locationBadge: "Kanesatake • Oka • Québec",
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
      telegram: "Join Us on Telegram",
    },
    map: {
      title: "Warrior Buds location map",
    },
    support: {
      eyebrow: "Support",
      title: "Need Help?",
      description:
        "Questions about products, pricing or store information? Contact the Warrior Buds team by email and we'll get back to you.",
      emailCta: "Email Us",
    },
    form: {
      eyebrow: "Questions?",
      title: "Send Us A Message",
      subtitle: "Have a question about our products or hours? Drop us a line and we'll get back to you.",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      subject: "Subject",
      subjectPlaceholder: "Select a topic (optional)",
      subjectOptions: ["General Question", "Products", "Orders & Pickup", "Feedback", "Other"],
      message: "Message",
      charactersLabel: "characters",
      submit: "Send Message",
      sending: "Sending…",
      successTitle: "Message Sent",
      successMessage: "Thanks for reaching out — we'll get back to you as soon as possible.",
      sendAnother: "Send Another Message",
      errorTitle: "Something Went Wrong",
      errorMessage: "We couldn't send your message. Please try again.",
      tryAgain: "Try Again",
    },
    infoStrip: {
      openDaily: { title: "Open Daily", subtitle: "10 AM to 2 AM" },
      location: { title: "Kanesatake / Oka", subtitle: "Local Dispensary" },
      ageRestriction: { title: "18+ Only", subtitle: "In-Store Shopping" },
    },
    finalCta: {
      label: "Visit The Store",
      titlePrefix: "Ready to Visit",
      titleHighlight: "Warrior Buds",
      subtitle: "Get directions and discover one of Kanesatake's most trusted dispensaries.",
      getDirections: "Get Directions",
      callNow: "Call Now",
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
      description: "Our full catalog of flower, edibles, vapes, concentrates, CBD, accessories, and mushrooms is on its way.",
    },
  },
  gallery: {
    metaTitle: "Gallery | Warrior Buds",
    metaDescription:
      "A look inside the Warrior Buds store, the products, and the community in Oka & Kanesatake.",
    hero: {
      label: "Inside Warrior Buds",
      title: "Gallery",
      subtitle: "A look inside the store, the products, and the community.",
    },
    video: {
      playLabel: "Play video",
      pauseLabel: "Pause video",
      muteLabel: "Mute",
      unmuteLabel: "Unmute",
    },
    finalCta: {
      label: "Visit The Store",
      titlePrefix: "Ready to Visit",
      titleHighlight: "Warrior Buds",
      subtitle: "Get directions and discover one of Kanesatake's most trusted dispensaries.",
      getDirections: "Get Directions",
      callNow: "Call Now",
    },
  },
  learningCenter: {
    metaTitle: "Learning Center | Warrior Buds",
    metaDescription:
      "Explore the Warrior Buds Learning Center — clear, educational guides on cannabis basics, concentrates, high-potency products, CBD, edibles, topicals, psychedelics, nicotine products, and responsible use.",
    hero: {
      eyebrow: "Knowledge First",
      title: "Learning Center",
      subtitle:
        "Guides on cannabis, concentrates, product types, responsible use, and more — helping you make informed choices with confidence.",
    },
    guidesLabel: "guides",
    backToCategories: "Back to Categories",
    readGuide: "Read Guide",
    close: "Close",
    disclaimerBadge: "Educational Only",
    disclaimerText:
      "This content is for general education only. It is not medical advice and does not guarantee any effect. Products affect everyone differently — consume responsibly and know your local laws.",
    cta: {
      label: "Visit The Store",
      titlePrefix: "Ready to Visit",
      titleHighlight: "Warrior Buds",
      subtitle: "Get directions and discover one of Kanesatake's most trusted dispensaries.",
      getDirections: "Get Directions",
      callNow: "Call Now",
    },
  },
  productCatalog: {
    metaTitle: "Products | Warrior Buds",
    metaDescription: "Browse the full Warrior Buds catalog — flower, edibles, vapes, concentrates, CBD, accessories, and mushrooms.",
    filters: {
      allCategories: "All Categories",
      category: "Category",
      categoryMenu: {
        showSubcategories: (name) => `Show ${name} subcategories`,
        hideSubcategories: (name) => `Hide ${name} subcategories`,
        hoverHint: "Hover or select a category to see its subcategories.",
        allInCategory: "All",
      },
      strain: "Strain",
      allStrains: "All Strains",
      onSaleOnly: "On Sale",
      search: "Search",
      searchPlaceholder: "Search products…",
      sort: "Sort By",
      sortFeatured: "Featured",
      sortPriceAsc: "Price: Low to High",
      sortPriceDesc: "Price: High to Low",
      sortNewest: "Newest",
      sortRating: "Top Rated",
      clear: "Clear Filters",
      noResults: "No products match your filters.",
      resultsCount: (count) => `${count} product${count === 1 ? "" : "s"}`,
      loadMore: "Load More",
      showingCount: (shown, total) => `Showing ${shown} of ${total}`,
    },
    card: {
      outOfStock: "Out of Stock",
      lowStock: "Low Stock",
      startingFrom: (formattedPrice) => `From ${formattedPrice}`,
      priceOnRequest: "Price on request",
      boxPrice: (formattedPrice, quantity) => `${formattedPrice} — 1 BOX (${quantity})`,
    },
    detail: {
      outOfStock: "Out of Stock",
      thc: "THC",
      cbd: "CBD",
      strain: "Strain",
      weight: "Weight",
      brand: "Brand",
      category: "Category",
      quantity: "Quantity",
      description: "Description",
      reviewsTitle: "Reviews",
      noReviews: "No reviews yet.",
      verifiedPurchase: "Verified Purchase",
      backToShop: "Back to Products",
      trustInStorePickup: "In-Store Pickup",
      trustCustomerSupport: "Customer Support",
      bulkPricingTitle: "Bulk Pricing",
      bulkPricingQuantity: "Quantity",
      bulkPricingPrice: "Price",
      bulkPricingUnit: (quantity) => (quantity === 1 ? "unit" : "units"),
      totalPrice: (formattedPrice) => `Total price: ${formattedPrice}`,
      youSave: (formattedAmount) => `You save ${formattedAmount}`,
      availableFormatsTitle: "Available Formats",
      formatColumn: "Format",
      priceColumn: "Price",
      inStoreOnlyNotice: "Available in-store only — visit us or call to purchase this product.",
      priceOnRequestNotice: "This product's price isn't listed online yet — contact us or visit the store for details.",
      infoPricingTitle: "Pricing",
      boxPriceCta: "ORDER ON TELEGRAM",
      telegramContact: "Contact Our Team on Telegram",
      telegramContactAria: "Contact the Warrior Buds team on Telegram (opens in a new tab)",
      flavourProfile: "Flavour Profile",
      flavour: "Flavour",
      flavourCount: (count) => (count === 1 ? "1 flavour" : `${count} flavours`),
      chooseFlavour: "Choose a flavour",
      selectedFlavour: "Selected flavour",
      enlargeImage: (label) => `View larger image of ${label}`,
      closeImage: "Close image",
    },
    finalCta: {
      label: "Visit The Store",
      titlePrefix: "Ready to Shop",
      titleHighlight: "In Person",
      subtitle: "Get directions and discover one of Kanesatake's most trusted dispensaries.",
      getDirections: "Get Directions",
      callNow: "Call Now",
    },
  },
  notFoundPage: {
    title: "Page Not Found",
    message: "This page doesn't exist or may have moved.",
    backToProducts: "Back to Products",
    backHome: "Back to Home",
  },
  legal: {
    onThisPage: "On This Page",
    backToTopLabel: "Back to top",
    lastUpdatedLabel: "Last updated",
    todoLabel: "Pending confirmation",
    privacy: {
      metaTitle: "Privacy Policy | Warrior Buds",
      metaDescription: "How Warrior Buds handles information when you use this website.",
      eyebrow: "Legal",
      title: "Privacy Policy",
      intro: "This Privacy Policy explains how Warrior Buds handles information when you use this website.",
      lastUpdated: "September 27, 2026",
      sections: [
        {
          id: "scope",
          title: "Scope of This Policy",
          blocks: [
            {
              type: "p",
              text: "This Policy applies to the Warrior Buds website, including the product catalogue, informational pages and Contact page. It does not cover third-party websites or services we link to or embed, which are governed by their own policies.",
            },
          ],
        },
        {
          id: "information-we-collect",
          title: "Information We Collect",
          blocks: [
            {
              type: "p",
              text: "You can browse this website without creating an account or providing personal information. We only receive personal information that you choose to share with us voluntarily — for example, when you contact Warrior Buds.",
            },
          ],
        },
        {
          id: "contact-information",
          title: "Contact Information",
          blocks: [
            {
              type: "p",
              text: "If you contact us through any of the contact methods listed on this website, we use the information you provide (such as your name, phone number, email address and message) only to respond to you.",
            },
          ],
        },
        {
          id: "browser-storage",
          title: "Browser Storage",
          blocks: [
            {
              type: "p",
              text: "This website stores your language preference (French or English) in your browser's local storage so the site is shown in the language you chose on your next visit. This preference stays on your device and is not sent to us.",
            },
            {
              type: "p",
              text: "See our Cookie Policy for more details and for how to clear this data.",
            },
          ],
        },
        {
          id: "third-party-services",
          title: "Third-Party Services",
          blocks: [
            {
              type: "list",
              items: [
                "Google Maps — the Contact page embeds a Google Maps map, and some links open Google Maps for directions.",
                "Instagram and Linktree — external links to our Instagram and Linktree pages.",
              ],
            },
            {
              type: "p",
              text: "When you load or visit these services, they may collect information according to their own privacy policies.",
            },
          ],
        },
        {
          id: "security",
          title: "Security",
          blocks: [
            {
              type: "p",
              text: "We take reasonable measures to protect this website and any information you share with us. However, no method of transmission or storage over the internet is completely secure.",
            },
          ],
        },
        {
          id: "data-retention",
          title: "Data Retention",
          blocks: [
            {
              type: "p",
              text: "Information you send us when contacting Warrior Buds is kept only as long as needed to respond to you. Your language preference stays in your browser until you clear it.",
            },
          ],
        },
        {
          id: "your-rights",
          title: "Your Privacy Rights",
          blocks: [
            {
              type: "p",
              text: "Depending on where you live, you may have the right to access, correct or request deletion of personal information you have shared with us. To make a request, contact the Warrior Buds team.",
            },
          ],
        },
        {
          id: "minors",
          title: "Minors",
          blocks: [
            {
              type: "p",
              text: "Warrior Buds is intended for legal-age adults only. We do not knowingly collect personal information from minors.",
            },
          ],
        },
        {
          id: "changes",
          title: "Changes to This Policy",
          blocks: [
            {
              type: "p",
              text: "We may update this Privacy Policy from time to time. The \"Last updated\" date above reflects the most recent revision.",
            },
          ],
        },
        {
          id: "contact",
          title: "Contact Us",
          blocks: [{ type: "p", text: "Questions about this Privacy Policy? Contact the Warrior Buds team." }],
        },
      ],
    },
    terms: {
      metaTitle: "Terms & Conditions | Warrior Buds",
      metaDescription: "The terms that govern your use of the Warrior Buds website.",
      eyebrow: "Legal",
      title: "Terms & Conditions",
      intro: "These Terms & Conditions govern your use of the Warrior Buds website.",
      lastUpdated: "September 27, 2026",
      sections: [
        {
          id: "acceptance",
          title: "Acceptance of These Terms",
          blocks: [
            {
              type: "p",
              text: "By using this website, you agree to these Terms & Conditions. If you do not agree, please do not use the site.",
            },
          ],
        },
        {
          id: "age-requirement",
          title: "Age Requirement",
          blocks: [
            {
              type: "p",
              text: "This website and its cannabis-related content are intended for legal-age adults only.",
            },
          ],
        },
        {
          id: "website-purpose",
          title: "Website Purpose",
          blocks: [
            {
              type: "p",
              text: "Warrior Buds provides this website as an informational site and product catalogue. Products, prices and store information may be displayed online for reference; this website does not offer online ordering or payment.",
            },
          ],
        },
        {
          id: "product-information",
          title: "Product Information",
          blocks: [
            {
              type: "p",
              text: "We make reasonable efforts to keep product names, descriptions, images, prices and availability accurate. Actual packaging, prices and availability may change without notice.",
            },
          ],
        },
        {
          id: "acceptable-use",
          title: "Acceptable Use",
          blocks: [
            {
              type: "p",
              text: "When using this website, you agree not to:",
            },
            {
              type: "list",
              items: [
                "Use the site for any unlawful purpose.",
                "Attempt to disrupt, damage or compromise the site or its security.",
                "Copy, scrape or otherwise abuse the site or its content without authorization.",
              ],
            },
          ],
        },
        {
          id: "intellectual-property",
          title: "Intellectual Property",
          blocks: [
            {
              type: "p",
              text: "The Warrior Buds name, logo, and the content on this site — text, graphics, photos and design — belong to Warrior Buds or its licensors and are protected by copyright and trademark law. You may not copy, reproduce or use them without our written permission, other than for your own personal, non-commercial use of the site.",
            },
          ],
        },
        {
          id: "third-party-links",
          title: "Third-Party Links",
          blocks: [
            {
              type: "p",
              text: "This website links to or embeds external services such as Google Maps, Instagram and Linktree. Those services are governed by their own terms and policies, and Warrior Buds is not responsible for their content.",
            },
          ],
        },
        {
          id: "accuracy",
          title: "Accuracy of Information",
          blocks: [
            {
              type: "p",
              text: "We make reasonable efforts to keep the information on this website current, but errors or omissions can occur. We may correct or update information at any time.",
            },
          ],
        },
        {
          id: "liability",
          title: "Limitation of Liability",
          blocks: [
            {
              type: "p",
              text: "This website is provided \"as is\". To the extent permitted by law, Warrior Buds is not liable for any damages arising from your use of, or inability to use, this website.",
            },
          ],
        },
        {
          id: "changes",
          title: "Changes to These Terms",
          blocks: [
            {
              type: "p",
              text: "We may update these Terms & Conditions from time to time. The \"Last updated\" date above reflects the most recent revision.",
            },
          ],
        },
        {
          id: "contact",
          title: "Contact Us",
          blocks: [{ type: "p", text: "Questions about these Terms? Contact the Warrior Buds team." }],
        },
      ],
    },
    cookies: {
      metaTitle: "Cookie Policy | Warrior Buds",
      metaDescription: "The browser storage used by the Warrior Buds website and how to control it.",
      eyebrow: "Legal",
      title: "Cookie Policy",
      intro:
        "This page explains the browser storage technologies used by the Warrior Buds website and how visitors can control them.",
      lastUpdated: "September 27, 2026",
      sections: [
        {
          id: "browser-storage",
          title: "Browser Storage",
          blocks: [
            {
              type: "p",
              text: "The Warrior Buds website does not set its own cookies. It uses your browser's local storage only to remember your language preference, as described below.",
            },
          ],
        },
        {
          id: "essential-preferences",
          title: "Essential Preferences",
          blocks: [
            {
              type: "p",
              text: "When you choose French or English, that choice is saved in your browser's local storage so the site displays in the same language on your next visit. It stays on your device and is not sent to us.",
            },
          ],
        },
        {
          id: "third-party-services",
          title: "Third-Party Services",
          blocks: [
            {
              type: "p",
              text: "The Contact page embeds a Google Maps map. When it loads, Google may set its own cookies or use similar technologies according to Google's own policies.",
            },
          ],
        },
        {
          id: "analytics",
          title: "Analytics & Advertising",
          blocks: [
            {
              type: "p",
              text: "This website does not currently use third-party analytics or advertising tools.",
            },
          ],
        },
        {
          id: "managing",
          title: "Managing Browser Data",
          blocks: [
            {
              type: "p",
              text: "You can clear cookies, local storage and other site data at any time through your browser settings. Clearing it will reset your language preference.",
            },
          ],
        },
        {
          id: "changes",
          title: "Changes to This Policy",
          blocks: [
            {
              type: "p",
              text: "We may update this Cookie Policy from time to time. The \"Last updated\" date above reflects the most recent revision.",
            },
          ],
        },
        {
          id: "contact",
          title: "Contact Us",
          blocks: [{ type: "p", text: "Questions about this Cookie Policy? Contact the Warrior Buds team." }],
        },
      ],
    },
  },
  faq: {
    metaTitle: "FAQ | Warrior Buds",
    metaDescription:
      "Answers to Warrior Buds' most common customer support questions — orders, payments, promotions, pickup, tracking, and products.",
    hero: {
      eyebrow: "Customer Support",
      title: "Frequently Asked Questions",
      subtitle: "Straight answers about ordering, paying, and tracking. Can't find it? Our team is one call away.",
    },
    search: {
      placeholder: "Search a question…",
      ariaLabel: "Search the FAQ",
      resultsCount: (count) => `${count} result${count === 1 ? "" : "s"}`,
      noResultsTitle: "No matching questions",
      noResultsSubtitle: "Try a different word, or contact us directly — we can usually help.",
      clear: "Clear search",
    },
    jumpToLabel: "Jump to",
    itemsCountLabel: (count) => `${count} question${count === 1 ? "" : "s"}`,
    cta: {
      label: "Still Need Help?",
      title: "Contact Our Team",
      subtitle: "Reach the Warrior Buds team for any order, payment, or product question.",
      contactButton: "Contact Us",
    },
  },
};

export default en;
