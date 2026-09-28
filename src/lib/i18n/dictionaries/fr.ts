import type { Dictionary } from "../types";

const fr: Dictionary = {
  home: {
    metaTitle: "Warrior Buds | Dispensaire de cannabis haut de gamme à Oka/Kanesatake",
  },
  nav: {
    links: {
      home: "Accueil",
      products: "Produits",
      learningCenter: "Centre d'apprentissage",
      about: "À propos",
      gallery: "Galerie",
      reviews: "Avis",
      faq: "FAQ",
      contact: "Contact",
    },
    joinUs: "Rejoignez-nous !",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
  hero: {
    kicker: "Kanesatake · Oka · Québec",
    tagline: "Dispensaire de cannabis haut de gamme",
    lead: "Des produits haut de gamme, une sélection imbattable et une expérience axée sur la communauté — ouvert tard, en plein cœur de Kanesatake.",
    ctaTelegram: "Rejoignez-nous sur Telegram !",
    finePrint: "18 ans et plus · Achat en boutique · Vente en gros disponible",
    trustText: "La confiance de milliers de clients.",
  },
  trustBar: {
    googleRating: "Note Google",
    googleReviews: "Avis Google",
    openPrimary: "Ouvert",
    openSecondary: "7 jours",
    wholesalePrimary: "24/7",
    wholesaleSecondary: "Gros",
  },
  categories: {
    eyebrow: "La Collection",
    title: "Découvrez nos catégories",
    explore: "Découvrir",
    items: {
      flower: { name: "Fleur", description: "Des variétés premium sélectionnées à la main.", alt: "Catégorie Fleur" },
      edibles: { name: "Comestibles", description: "Élaborés avec précision, pour un effet puissant.", alt: "Catégorie Comestibles" },
      vapes: { name: "Vapoteuses", description: "Matériel de qualité, extraits purs.", alt: "Catégorie Vapoteuses" },
      concentrates: { name: "Concentrés", description: "Spectre complet, haute puissance.", alt: "Catégorie Concentrés" },
      cbd: { name: "CBD", description: "Bien-être équilibré, sans compromis.", alt: "Catégorie CBD" },
      accessories: { name: "Accessoires", description: "De l'équipement pensé pour le rituel.", alt: "Catégorie Accessoires" },
      mushrooms: { name: "Champignons", description: "Champignons fonctionnels, sans THC, sans compromis.", alt: "Catégorie Champignons" },
      topicals: { name: "Produits topiques", description: "Soulagement ciblé, appliqué directement.", alt: "Catégorie Produits topiques" },
      cigarettes: { name: "Cigarettes", description: "Produits du tabac et formats sélectionnés.", alt: "Catégorie Cigarettes" },
    },
  },
  whyWarriorBuds: {
    eyebrow: "La Différence",
    title: "Pourquoi Warrior Buds",
    lead: "Un dispensaire bâti sur la confiance — des produits soigneusement sélectionnés, une équipe qui les connaît vraiment, et une entreprise profondément ancrée dans cette communauté.",
    reasons: {
      selection: {
        title: "Sélection haut de gamme",
        description: "Chaque produit est sélectionné pour sa qualité, sa puissance et sa constance.",
      },
      service: {
        title: "Un service expert et chaleureux",
        description: "Notre équipe connaît les produits et prend le temps de bien vous guider.",
      },
      community: {
        title: "Une expérience enracinée dans la communauté",
        description: "Fièrement ancrés à Oka et Kanesatake, bâtis par et pour notre communauté.",
      },
    },
    cta: "Notre histoire",
  },
  homeFinalCta: {
    label: "Visitez le commerce",
    titlePrefix: "Prêt à visiter",
    titleHighlight: "Warrior Buds",
    subtitle: "Obtenez l'itinéraire et découvrez l'un des dispensaires les plus fiables de Kanesatake.",
    getDirections: "Obtenir l'itinéraire",
    callNow: "Appeler maintenant",
  },
  // "250 $" uses a non-breaking space so the "$" never wraps onto its own line.
  minimumOrderCta: {
    titleBefore: "COMMANDE MINIMUM DE",
    titleAmount: "250 $",
    titleAfter: "",
    body: "Toutes les commandes nécessitent un minimum de 250 $. Besoin d’aide avec votre commande? Contactez directement notre équipe sur Telegram.",
    telegramButton: "CONTACTEZ NOTRE ÉQUIPE SUR TELEGRAM",
  },
  footer: {
    tagline: "Une expérience cannabis haut de gamme, enracinée à Oka et Kanesatake.",
    exploreHeading: "Explorer",
    visitHeading: "Nous visiter",
    getDirections: "Obtenir l'itinéraire",
    getDirectionsLink: "Obtenir l'itinéraire →",
    hoursHeading: "Heures d'ouverture",
    openDaily: "Ouvert tous les jours",
    hoursValue: "10 h à 2 h",
    contactHeading: "Contact",
    instagram: "Instagram",
    linktree: "Linktree",
    telegram: "Rejoignez-nous !",
    ctaTitlePrefix: "Prêt à visiter",
    ctaTitleHighlight: "Warrior Buds",
    ctaSubtitle: "Obtenez l'itinéraire et découvrez l'un des dispensaires les plus fiables de Kanesatake.",
    callNow: "Appeler maintenant",
    paymentMethodsHeading: "Modes de paiement",
    paymentMethodsNote: "Modes de paiement sécurisés disponibles lors du paiement.",
    copyright: (year: number) => `© ${year} Warrior Buds. Tous droits réservés.`,
    privacyPolicy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    cookiePolicy: "Politique de témoins",
    disclaimer:
      "Réservé aux 18 ans et plus. Le cannabis est vendu conformément aux lois et règlements du Québec, du Canada et du territoire mohawk de Kanesatake.",
  },
  openingStatus: {
    openNow: "OUVERT MAINTENANT",
    closingSoon: "FERMETURE BIENTÔT",
    last30Minutes: "DERNIÈRES 30 MINUTES",
    closed: "FERMÉ",
    openUntil: (time) => `Ouvert jusqu'à ${time}`,
    closingIn: (duration) => `Ferme dans ${duration}`,
    opensAt: (dayLabel, time) => `Ouvre ${dayLabel} à ${time}`,
    hoursComingSoon: "Horaire à venir",
    today: "aujourd'hui",
    tomorrow: "demain",
    weekdayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
  },
  about: {
    metaTitle: "À propos | Warrior Buds",
    metaDescription:
      "Découvrez Warrior Buds, un dispensaire enraciné dans la communauté d'Oka et Kanesatake — notre histoire, nos valeurs et ce qui nous anime.",
    hero: {
      eyebrow: "Notre histoire",
      title: "NOTRE",
      titleHighlight: "HISTOIRE",
      subtitle: "Enracinés à Kanesatake. Bâtis pour la communauté.",
      locationBadge: "Kanesatake • Oka • Québec",
    },
    beginning: {
      eyebrow: "Nos débuts",
      title: "Comment tout a commencé",
      paragraph1:
        "Warrior Buds est né d'une idée simple : offrir à Oka et Kanesatake un dispensaire de cannabis haut de gamme, axé sur la communauté. Nous voulions un endroit où la qualité n'est jamais compromise et où chaque visiteur se sent réellement le bienvenu — pas seulement un client parmi tant d'autres.",
      paragraph2:
        "Depuis notre ouverture, nous mettons un point d'honneur à offrir une sélection digne de confiance et à former une équipe qui prend le temps de vous guider vers le bon produit, à chaque visite.",
    },
    values: {
      eyebrow: "Ce qui nous anime",
      title: "Nos valeurs",
      items: {
        quality: {
          title: "Qualité supérieure",
          description:
            "Chaque produit sur nos tablettes est sélectionné pour sa qualité, sa puissance et sa constance — rien n'y figure par hasard.",
        },
        community: {
          title: "La communauté d'abord",
          description:
            "Fièrement enracinée à Oka et Kanesatake, Warrior Buds existe pour servir et grandir aux côtés de la communauté qui l'a bâtie.",
        },
        service: {
          title: "Un service averti",
          description:
            "Notre équipe connaît chaque produit à fond et prend le temps de guider chaque visiteur vers le bon choix.",
        },
      },
    },
    community: {
      eyebrow: "Au-delà du comptoir",
      titlePrefix: "Plus qu'un",
      titleHighlight: "Dispensaire",
      paragraph:
        "Warrior Buds est un lieu bâti sur la confiance. Nous prenons le temps de connaître nos habitués, d'accueillir les nouveaux venus à bras ouverts, et de considérer cette communauté comme la raison même de notre présence — pas seulement comme un marché à desservir. Chaque visite est une occasion de renforcer un peu plus ce lien.",
    },
    experience: {
      eyebrow: "Ce qui nous distingue",
      title: "L'expérience Warrior Buds",
      items: {
        curated: {
          title: "Produits soigneusement sélectionnés",
          description: "Chaque article sur nos tablettes est choisi pour sa qualité, sa puissance et sa constance.",
        },
        team: {
          title: "Une équipe experte et chaleureuse",
          description: "Un personnel averti qui prend le temps de vous guider vers le bon choix.",
        },
        customers: {
          title: "600+ clients satisfaits",
          description: "La confiance de centaines d'habitués à Oka et Kanesatake.",
        },
        community: {
          title: "Animés par la communauté",
          description: "Bâtis par et pour la communauté que nous sommes fiers d'appeler chez nous.",
        },
      },
    },
    cta: {
      eyebrow: "Visitez Warrior Buds",
      titlePrefix: "Prêt à visiter",
      titleHighlight: "Warrior Buds",
      subtitle: "Passez nous voir à Oka et Kanesatake et découvrez ce qu'est un dispensaire axé sur la communauté.",
      getDirections: "Obtenir l'itinéraire",
      callNow: "Appeler",
    },
  },
  reviews: {
    metaTitle: "Avis | Warrior Buds",
    metaDescription:
      "De vrais avis de clients Warrior Buds à Oka et Kanesatake — découvrez ce que disent des centaines de clients satisfaits.",
    hero: {
      eyebrow: "Ce qu'on dit de nous",
      title: "AVIS",
      titleHighlight: "CLIENTS",
      subtitle: "La confiance de centaines de clients à Oka et Kanesatake.",
      badgeLabel: "Avis Google",
    },
    cta: {
      titlePrefix: "Découvrez ce qu'on",
      titleHighlight: "en dit",
      subtitle: "Rejoignez des centaines de clients satisfaits à Oka et Kanesatake.",
      button: "Voir tous les avis sur Google",
      reviewsLabel: "avis",
      verifiedLabel: "Vérifié par Google",
    },
    storeCta: {
      label: "Visitez la boutique",
      titlePrefix: "Prêt à visiter",
      titleHighlight: "Warrior Buds",
      subtitle: "Obtenez l'itinéraire et découvrez l'un des dispensaires les plus fiables de Kanesatake.",
      infoLocation: "Oka et Kanesatake",
      infoHours: "Ouvert 7 jours",
      infoPickup: "Cueillette en boutique",
      getDirections: "Obtenir l'itinéraire",
      callNow: "Appeler maintenant",
    },
  },
  contact: {
    metaTitle: "Contact | Warrior Buds",
    metaDescription: "Communiquez avec Warrior Buds ou obtenez l'itinéraire vers notre boutique d'Oka et Kanesatake.",
    hero: {
      eyebrow: "Contact et itinéraire",
      title: "Visitez Warrior Buds",
      subtitle: "Ouvert tous les jours à Kanesatake, tout près de Montréal.",
      locationBadge: "Kanesatake • Oka • Québec",
    },
    details: {
      eyebrow: "Restons en contact",
      title: "Venez nous visiter",
      addressLabel: "Adresse",
      phoneLabel: "Téléphone",
      hoursLabel: "Heures",
      openDaily: "Ouvert tous les jours",
      hoursValue: "10 h à 2 h",
      getDirections: "Obtenir l'itinéraire",
      callNow: "Appeler maintenant",
      instagram: "Instagram",
      linktree: "Linktree",
      telegram: "Rejoignez-nous sur Telegram",
    },
    map: {
      title: "Carte de l'emplacement de Warrior Buds",
    },
    support: {
      eyebrow: "Assistance",
      title: "Besoin d'aide ?",
      description:
        "Des questions sur les produits, les prix ou le magasin ? Contactez l'équipe Warrior Buds par courriel et nous vous répondrons.",
      emailCta: "Nous écrire",
    },
    form: {
      eyebrow: "Des questions ?",
      title: "Envoyez-nous un message",
      subtitle: "Une question sur nos produits ou nos heures ? Écrivez-nous et nous vous répondrons rapidement.",
      firstName: "Prénom",
      lastName: "Nom de famille",
      email: "Courriel",
      phone: "Téléphone",
      subject: "Sujet",
      subjectPlaceholder: "Choisir un sujet (optionnel)",
      subjectOptions: ["Question générale", "Produits", "Commandes et ramassage", "Commentaires", "Autre"],
      message: "Message",
      charactersLabel: "caractères",
      submit: "Envoyer le message",
      sending: "Envoi en cours…",
      successTitle: "Message envoyé",
      successMessage: "Merci de nous avoir contactés — nous vous répondrons dans les plus brefs délais.",
      sendAnother: "Envoyer un autre message",
      errorTitle: "Une erreur est survenue",
      errorMessage: "Nous n'avons pas pu envoyer votre message. Veuillez réessayer.",
      tryAgain: "Réessayer",
    },
    infoStrip: {
      openDaily: { title: "Ouvert tous les jours", subtitle: "10 h à 2 h" },
      location: { title: "Kanesatake / Oka", subtitle: "Dispensaire local" },
      ageRestriction: { title: "18 ans et plus", subtitle: "Achat en boutique" },
    },
    finalCta: {
      label: "Visitez la boutique",
      titlePrefix: "Prêt à visiter",
      titleHighlight: "Warrior Buds",
      subtitle: "Obtenez l'itinéraire et découvrez l'un des dispensaires les plus fiables de Kanesatake.",
      getDirections: "Obtenir l'itinéraire",
      callNow: "Appeler maintenant",
    },
  },
  placeholders: {
    comingSoon: "Bientôt disponible",
    gallery: {
      title: "Galerie",
      description: "Un aperçu de la boutique, des produits et de la communauté — bientôt disponible.",
    },
    products: {
      title: "Produits",
      description: "Notre catalogue complet de fleurs, comestibles, vapoteuses, concentrés, CBD, accessoires et champignons s'en vient.",
    },
  },
  gallery: {
    metaTitle: "Galerie | Warrior Buds",
    metaDescription:
      "Un aperçu de la boutique Warrior Buds, des produits et de la communauté à Oka et Kanesatake.",
    hero: {
      label: "À l'intérieur de Warrior Buds",
      title: "Galerie",
      subtitle: "Un aperçu de la boutique, des produits et de la communauté.",
    },
    video: {
      playLabel: "Lire la vidéo",
      pauseLabel: "Mettre en pause",
      muteLabel: "Couper le son",
      unmuteLabel: "Activer le son",
    },
    finalCta: {
      label: "Visitez la boutique",
      titlePrefix: "Prêt à visiter",
      titleHighlight: "Warrior Buds",
      subtitle: "Obtenez l'itinéraire et découvrez l'un des dispensaires les plus fiables de Kanesatake.",
      getDirections: "Obtenir l'itinéraire",
      callNow: "Appeler maintenant",
    },
  },
  learningCenter: {
    metaTitle: "Centre d'apprentissage | Warrior Buds",
    metaDescription:
      "Découvrez le Centre d'apprentissage de Warrior Buds — des guides clairs sur les bases du cannabis, les concentrés, les produits à haute puissance, le CBD, les comestibles, les produits topiques, les psychédéliques, les produits de nicotine et la consommation responsable.",
    hero: {
      eyebrow: "Le savoir d'abord",
      title: "Centre d'apprentissage",
      subtitle:
        "Des guides sur le cannabis, les concentrés, les types de produits, la consommation responsable et plus encore — pour vous aider à faire des choix éclairés en toute confiance.",
    },
    guidesLabel: "guides",
    backToCategories: "Retour aux catégories",
    readGuide: "Lire le guide",
    close: "Fermer",
    disclaimerBadge: "Contenu éducatif",
    disclaimerText:
      "Ce contenu est fourni à titre éducatif seulement. Il ne constitue pas un avis médical et ne garantit aucun effet. Les produits affectent chaque personne différemment — consommez de façon responsable et informez-vous sur les lois de votre région.",
    cta: {
      label: "Visitez le commerce",
      titlePrefix: "Prêt à visiter",
      titleHighlight: "Warrior Buds",
      subtitle: "Obtenez l'itinéraire et découvrez l'un des dispensaires les plus fiables de Kanesatake.",
      getDirections: "Obtenir l'itinéraire",
      callNow: "Appeler maintenant",
    },
  },
  productCatalog: {
    metaTitle: "Produits | Warrior Buds",
    metaDescription: "Parcourez le catalogue complet Warrior Buds — fleurs, comestibles, vapoteuses, concentrés, CBD, accessoires et champignons.",
    filters: {
      allCategories: "Toutes les catégories",
      category: "Catégorie",
      categoryMenu: {
        showSubcategories: (name) => `Afficher les sous-catégories de ${name}`,
        hideSubcategories: (name) => `Masquer les sous-catégories de ${name}`,
        hoverHint: "Survolez ou sélectionnez une catégorie pour voir ses sous-catégories.",
        allInCategory: "Tous",
      },
      strain: "Variété",
      allStrains: "Toutes les variétés",
      onSaleOnly: "En promotion",
      search: "Recherche",
      searchPlaceholder: "Rechercher des produits…",
      sort: "Trier par",
      sortFeatured: "En vedette",
      sortPriceAsc: "Prix : croissant",
      sortPriceDesc: "Prix : décroissant",
      sortNewest: "Plus récents",
      sortRating: "Mieux notés",
      clear: "Réinitialiser les filtres",
      noResults: "Aucun produit ne correspond à vos filtres.",
      resultsCount: (count) => `${count} produit${count === 1 ? "" : "s"}`,
    },
    card: {
      outOfStock: "Rupture de stock",
      lowStock: "Stock limité",
      startingFrom: (formattedPrice) => `À partir de ${formattedPrice}`,
      priceOnRequest: "Prix sur demande",
      boxPrice: (formattedPrice, quantity) => `1 BOÎTE (${quantity}) — ${formattedPrice}`,
    },
    detail: {
      outOfStock: "Rupture de stock",
      thc: "THC",
      cbd: "CBD",
      strain: "Variété",
      weight: "Poids",
      brand: "Marque",
      category: "Catégorie",
      quantity: "Quantité",
      description: "Description",
      reviewsTitle: "Avis",
      noReviews: "Aucun avis pour le moment.",
      verifiedPurchase: "Achat vérifié",
      backToShop: "Retour aux produits",
      trustInStorePickup: "Cueillette en magasin",
      trustCustomerSupport: "Service à la clientèle",
      bulkPricingTitle: "Prix de gros",
      bulkPricingQuantity: "Quantité",
      bulkPricingPrice: "Prix",
      bulkPricingUnit: (quantity) => (quantity === 1 ? "unité" : "unités"),
      totalPrice: (formattedPrice) => `Prix total : ${formattedPrice}`,
      youSave: (formattedAmount) => `Vous économisez ${formattedAmount}`,
      availableFormatsTitle: "Formats disponibles",
      formatColumn: "Format",
      priceColumn: "Prix",
      inStoreOnlyNotice: "Disponible en boutique seulement — visitez-nous ou appelez pour vous procurer ce produit.",
      priceOnRequestNotice: "Le prix de ce produit n'est pas encore affiché en ligne — contactez-nous ou visitez la boutique pour plus de détails.",
      infoPricingTitle: "Prix",
      // Fixed brand label, intentionally not translated.
      boxPriceCta: "ORDER ON TELEGRAM",
      telegramContact: "Contactez notre équipe sur Telegram",
      telegramContactAria: "Contacter l'équipe Warrior Buds sur Telegram (s'ouvre dans un nouvel onglet)",
      flavourProfile: "Profil de saveur",
      flavour: "Saveur",
      flavourCount: (count) => (count === 1 ? "1 saveur" : `${count} saveurs`),
      chooseFlavour: "Choisissez une saveur",
      selectedFlavour: "Saveur sélectionnée",
      enlargeImage: (label) => `Agrandir l'image de ${label}`,
      closeImage: "Fermer l'image",
    },
    finalCta: {
      label: "Visiter la boutique",
      titlePrefix: "Prêt à magasiner",
      titleHighlight: "en personne",
      subtitle: "Obtenez l'itinéraire et découvrez l'un des dispensaires les plus fiables de Kanesatake.",
      getDirections: "Obtenir l'itinéraire",
      callNow: "Appeler maintenant",
    },
  },
  notFoundPage: {
    title: "Page introuvable",
    message: "Cette page n'existe pas ou a peut-être été déplacée.",
    backToProducts: "Retour aux produits",
    backHome: "Retour à l'accueil",
  },
  legal: {
    onThisPage: "Sur cette page",
    backToTopLabel: "Retour en haut",
    lastUpdatedLabel: "Dernière mise à jour",
    todoLabel: "À confirmer",
    privacy: {
      metaTitle: "Politique de confidentialité | Warrior Buds",
      metaDescription: "Comment Warrior Buds traite les informations lorsque vous utilisez ce site.",
      eyebrow: "Mentions légales",
      title: "Politique de confidentialité",
      intro: "Cette Politique de confidentialité explique comment Warrior Buds traite les informations lorsque vous utilisez ce site.",
      lastUpdated: "27 septembre 2026",
      sections: [
        {
          id: "scope",
          title: "Portée de cette politique",
          blocks: [
            {
              type: "p",
              text: "Cette Politique s'applique au site Warrior Buds, y compris le catalogue de produits, les pages d'information et la page Contact. Elle ne couvre pas les sites ou services tiers vers lesquels nous créons des liens ou que nous intégrons, qui sont régis par leurs propres politiques.",
            },
          ],
        },
        {
          id: "information-we-collect",
          title: "Informations que nous recueillons",
          blocks: [
            {
              type: "p",
              text: "Vous pouvez consulter ce site sans créer de compte ni fournir de renseignements personnels. Nous recevons uniquement les renseignements personnels que vous choisissez de nous transmettre volontairement — par exemple, lorsque vous communiquez avec Warrior Buds.",
            },
          ],
        },
        {
          id: "contact-information",
          title: "Coordonnées",
          blocks: [
            {
              type: "p",
              text: "Si vous nous contactez par l'un des moyens de communication indiqués sur ce site, nous utilisons les informations que vous fournissez (comme votre nom, votre numéro de téléphone, votre adresse courriel et votre message) uniquement pour vous répondre.",
            },
          ],
        },
        {
          id: "browser-storage",
          title: "Stockage du navigateur",
          blocks: [
            {
              type: "p",
              text: "Ce site enregistre votre préférence de langue (français ou anglais) dans le stockage local de votre navigateur afin d'afficher le site dans la langue choisie lors de votre prochaine visite. Cette préférence reste sur votre appareil et ne nous est pas transmise.",
            },
            {
              type: "p",
              text: "Consultez notre Politique relative aux témoins pour plus de détails et pour savoir comment effacer ces données.",
            },
          ],
        },
        {
          id: "third-party-services",
          title: "Services tiers",
          blocks: [
            {
              type: "list",
              items: [
                "Google Maps — la page Contact intègre une carte Google Maps, et certains liens ouvrent Google Maps pour l'itinéraire.",
                "Instagram et Linktree — liens externes vers nos pages Instagram et Linktree.",
              ],
            },
            {
              type: "p",
              text: "Lorsque vous chargez ou visitez ces services, ils peuvent recueillir des informations conformément à leurs propres politiques de confidentialité.",
            },
          ],
        },
        {
          id: "security",
          title: "Sécurité",
          blocks: [
            {
              type: "p",
              text: "Nous prenons des mesures raisonnables pour protéger ce site et les informations que vous nous transmettez. Toutefois, aucune méthode de transmission ou de stockage sur Internet n'est entièrement sécuritaire.",
            },
          ],
        },
        {
          id: "data-retention",
          title: "Conservation des données",
          blocks: [
            {
              type: "p",
              text: "Les informations que vous nous envoyez en communiquant avec Warrior Buds sont conservées uniquement le temps nécessaire pour vous répondre. Votre préférence de langue reste dans votre navigateur jusqu'à ce que vous l'effaciez.",
            },
          ],
        },
        {
          id: "your-rights",
          title: "Vos droits en matière de vie privée",
          blocks: [
            {
              type: "p",
              text: "Selon votre lieu de résidence, vous pourriez avoir le droit d'accéder aux renseignements personnels que vous nous avez transmis, de les faire corriger ou d'en demander la suppression. Pour faire une demande, contactez l'équipe Warrior Buds.",
            },
          ],
        },
        {
          id: "minors",
          title: "Mineurs",
          blocks: [
            {
              type: "p",
              text: "Warrior Buds s'adresse uniquement aux adultes ayant l'âge légal. Nous ne recueillons pas sciemment de renseignements personnels auprès de mineurs.",
            },
          ],
        },
        {
          id: "changes",
          title: "Modifications de cette politique",
          blocks: [
            {
              type: "p",
              text: "Nous pouvons mettre à jour cette Politique de confidentialité à l'occasion. La date « Dernière mise à jour » ci-dessus reflète la révision la plus récente.",
            },
          ],
        },
        {
          id: "contact",
          title: "Nous contacter",
          blocks: [{ type: "p", text: "Des questions sur cette Politique de confidentialité ? Contactez l'équipe Warrior Buds." }],
        },
      ],
    },
    terms: {
      metaTitle: "Modalités et conditions | Warrior Buds",
      metaDescription: "Les modalités qui régissent votre utilisation du site Warrior Buds.",
      eyebrow: "Mentions légales",
      title: "Modalités et conditions",
      intro: "Ces Modalités et conditions régissent votre utilisation du site Warrior Buds.",
      lastUpdated: "27 septembre 2026",
      sections: [
        {
          id: "acceptance",
          title: "Acceptation des modalités",
          blocks: [
            {
              type: "p",
              text: "En utilisant ce site, vous acceptez ces Modalités et conditions. Si vous ne les acceptez pas, veuillez ne pas utiliser le site.",
            },
          ],
        },
        {
          id: "age-requirement",
          title: "Exigence d'âge",
          blocks: [
            {
              type: "p",
              text: "Ce site et son contenu lié au cannabis s'adressent uniquement aux adultes ayant l'âge légal.",
            },
          ],
        },
        {
          id: "website-purpose",
          title: "Objet du site",
          blocks: [
            {
              type: "p",
              text: "Warrior Buds offre ce site à titre de site informatif et de catalogue de produits. Les produits, les prix et les informations sur le magasin peuvent y être affichés à titre indicatif; ce site n'offre ni commande ni paiement en ligne.",
            },
          ],
        },
        {
          id: "product-information",
          title: "Information sur les produits",
          blocks: [
            {
              type: "p",
              text: "Nous faisons des efforts raisonnables pour que les noms, descriptions, images, prix et disponibilités des produits soient exacts. L'emballage, les prix et la disponibilité réels peuvent changer sans préavis.",
            },
          ],
        },
        {
          id: "acceptable-use",
          title: "Utilisation acceptable",
          blocks: [
            {
              type: "p",
              text: "En utilisant ce site, vous acceptez de ne pas :",
            },
            {
              type: "list",
              items: [
                "Utiliser le site à des fins illégales.",
                "Tenter de perturber, d'endommager ou de compromettre le site ou sa sécurité.",
                "Copier, extraire ou autrement utiliser abusivement le site ou son contenu sans autorisation.",
              ],
            },
          ],
        },
        {
          id: "intellectual-property",
          title: "Propriété intellectuelle",
          blocks: [
            {
              type: "p",
              text: "Le nom Warrior Buds, son logo, et le contenu de ce site — textes, graphiques, photos et design — appartiennent à Warrior Buds ou à ses concédants et sont protégés par le droit d'auteur et le droit des marques. Vous ne pouvez pas les copier, les reproduire ou les utiliser sans notre autorisation écrite, sauf pour votre usage personnel et non commercial du site.",
            },
          ],
        },
        {
          id: "third-party-links",
          title: "Liens vers des tiers",
          blocks: [
            {
              type: "p",
              text: "Ce site contient des liens vers des services externes, ou en intègre, comme Google Maps, Instagram et Linktree. Ces services sont régis par leurs propres modalités et politiques, et Warrior Buds n'est pas responsable de leur contenu.",
            },
          ],
        },
        {
          id: "accuracy",
          title: "Exactitude des informations",
          blocks: [
            {
              type: "p",
              text: "Nous faisons des efforts raisonnables pour garder les informations de ce site à jour, mais des erreurs ou omissions peuvent survenir. Nous pouvons corriger ou mettre à jour les informations en tout temps.",
            },
          ],
        },
        {
          id: "liability",
          title: "Limitation de responsabilité",
          blocks: [
            {
              type: "p",
              text: "Ce site est fourni « tel quel ». Dans la mesure permise par la loi, Warrior Buds n'est pas responsable des dommages découlant de votre utilisation du site ou de l'impossibilité de l'utiliser.",
            },
          ],
        },
        {
          id: "changes",
          title: "Modifications des modalités",
          blocks: [
            {
              type: "p",
              text: "Nous pouvons mettre à jour ces Modalités et conditions à l'occasion. La date « Dernière mise à jour » ci-dessus reflète la révision la plus récente.",
            },
          ],
        },
        {
          id: "contact",
          title: "Nous contacter",
          blocks: [{ type: "p", text: "Des questions sur ces Modalités ? Contactez l'équipe Warrior Buds." }],
        },
      ],
    },
    cookies: {
      metaTitle: "Politique relative aux témoins | Warrior Buds",
      metaDescription: "Le stockage du navigateur utilisé par le site Warrior Buds et comment le contrôler.",
      eyebrow: "Mentions légales",
      title: "Politique relative aux témoins",
      intro:
        "Cette page explique les technologies de stockage du navigateur utilisées par le site Warrior Buds et comment les visiteurs peuvent les contrôler.",
      lastUpdated: "27 septembre 2026",
      sections: [
        {
          id: "browser-storage",
          title: "Stockage du navigateur",
          blocks: [
            {
              type: "p",
              text: "Le site Warrior Buds ne dépose pas ses propres témoins (cookies). Il utilise le stockage local de votre navigateur uniquement pour mémoriser votre préférence de langue, comme décrit ci-dessous.",
            },
          ],
        },
        {
          id: "essential-preferences",
          title: "Préférences essentielles",
          blocks: [
            {
              type: "p",
              text: "Lorsque vous choisissez le français ou l'anglais, ce choix est enregistré dans le stockage local de votre navigateur afin que le site s'affiche dans la même langue lors de votre prochaine visite. Il reste sur votre appareil et ne nous est pas transmis.",
            },
          ],
        },
        {
          id: "third-party-services",
          title: "Services tiers",
          blocks: [
            {
              type: "p",
              text: "La page Contact intègre une carte Google Maps. Lorsqu'elle se charge, Google peut déposer ses propres témoins ou utiliser des technologies similaires conformément à ses propres politiques.",
            },
          ],
        },
        {
          id: "analytics",
          title: "Analytique et publicité",
          blocks: [
            {
              type: "p",
              text: "Ce site n'utilise actuellement aucun outil tiers d'analytique ou de publicité.",
            },
          ],
        },
        {
          id: "managing",
          title: "Gérer les données du navigateur",
          blocks: [
            {
              type: "p",
              text: "Vous pouvez effacer en tout temps les témoins, le stockage local et les autres données du site dans les paramètres de votre navigateur. Cela réinitialisera votre préférence de langue.",
            },
          ],
        },
        {
          id: "changes",
          title: "Modifications de cette politique",
          blocks: [
            {
              type: "p",
              text: "Nous pouvons mettre à jour cette Politique relative aux témoins à l'occasion. La date « Dernière mise à jour » ci-dessus reflète la révision la plus récente.",
            },
          ],
        },
        {
          id: "contact",
          title: "Nous contacter",
          blocks: [{ type: "p", text: "Des questions sur cette Politique relative aux témoins ? Contactez l'équipe Warrior Buds." }],
        },
      ],
    },
  },
  faq: {
    metaTitle: "FAQ | Warrior Buds",
    metaDescription:
      "Réponses aux questions les plus fréquentes du service à la clientèle Warrior Buds — commandes, paiements, promotions, cueillette, suivi et les produits.",
    hero: {
      eyebrow: "Service à la clientèle",
      title: "Foire aux questions",
      subtitle: "Des réponses claires sur la commande, le paiement et le suivi. Vous ne trouvez pas ? Notre équipe est à un appel près.",
    },
    search: {
      placeholder: "Rechercher une question…",
      ariaLabel: "Rechercher dans la FAQ",
      resultsCount: (count) => `${count} résultat${count === 1 ? "" : "s"}`,
      noResultsTitle: "Aucune question correspondante",
      noResultsSubtitle: "Essayez un autre mot, ou contactez-nous directement — nous pouvons habituellement vous aider.",
      clear: "Effacer la recherche",
    },
    jumpToLabel: "Aller à",
    itemsCountLabel: (count) => `${count} question${count === 1 ? "" : "s"}`,
    cta: {
      label: "Besoin d'aide ?",
      title: "Contactez notre équipe",
      subtitle: "Joignez l'équipe Warrior Buds pour toute question sur les commandes, les paiements ou les produits.",
      contactButton: "Nous contacter",
    },
  },
};

export default fr;
