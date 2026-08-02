import type { Dictionary } from "../types";

const fr: Dictionary = {
  nav: {
    links: {
      home: "Accueil",
      products: "Produits",
      learningCenter: "Centre d'apprentissage",
      about: "À propos",
      gallery: "Galerie",
      reviews: "Avis",
      contact: "Contact",
    },
    visitStore: "Visiter la boutique",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
  hero: {
    kicker: "Kanesatake · Oka · Québec",
    tagline: "Dispensaire de cannabis haut de gamme",
    lead: "Des produits haut de gamme, une sélection imbattable et une expérience axée sur la communauté — ouvert tard, en plein cœur de Kanesatake.",
    ctaPrimary: "Découvrir les produits",
    ctaSecondary: "Obtenir l'itinéraire",
    finePrint: "18 ans et plus · Achat en boutique · Vente en gros disponible",
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
      flower: { name: "Fleur", description: "Des variétés premium sélectionnées à la main." },
      edibles: { name: "Comestibles", description: "Élaborés avec précision, pour un effet puissant." },
      vapes: { name: "Vapoteuses", description: "Matériel de qualité, extraits purs." },
      concentrates: { name: "Concentrés", description: "Spectre complet, haute puissance." },
      cbd: { name: "CBD", description: "Bien-être équilibré, sans compromis." },
      accessories: { name: "Accessoires", description: "De l'équipement pensé pour le rituel." },
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
    ctaTitlePrefix: "Prêt à visiter",
    ctaTitleHighlight: "Warrior Buds",
    ctaSubtitle: "Obtenez l'itinéraire et découvrez l'un des dispensaires les plus fiables de Kanesatake.",
    callNow: "Appeler maintenant",
    copyright: (year: number) => `© ${year} Warrior Buds. Tous droits réservés.`,
    credit: "Site web conçu et développé par Brochu Digital.",
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
    cta: {
      titlePrefix: "Venez découvrir",
      titleHighlight: "Warrior Buds",
      subtitle: "Passez nous voir à Oka et Kanesatake, et découvrez ce que signifie un dispensaire pensé pour sa communauté.",
      callNow: "Appeler maintenant",
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
    },
  },
  contact: {
    metaTitle: "Contact | Warrior Buds",
    metaDescription: "Communiquez avec Warrior Buds ou obtenez l'itinéraire vers notre boutique d'Oka et Kanesatake.",
    hero: {
      eyebrow: "Contact et itinéraire",
      title: "Visitez Warrior Buds",
      subtitle: "Ouvert tous les jours à Kanesatake, tout près de Montréal.",
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
    },
    map: {
      title: "Carte de l'emplacement de Warrior Buds",
    },
    form: {
      eyebrow: "Des questions?",
      title: "Envoyez-nous un message",
      firstName: "Prénom",
      lastName: "Nom de famille",
      email: "Courriel",
      phone: "Téléphone",
      message: "Message",
      submit: "Envoyer le message",
      successTitle: "Message envoyé",
      successMessage: "Merci de nous avoir contactés — nous vous répondrons dans les plus brefs délais.",
      sendAnother: "Envoyer un autre message",
    },
    infoStrip: {
      openDaily: { title: "Ouvert tous les jours", subtitle: "10 h à 2 h" },
      location: { title: "Kanesatake / Oka", subtitle: "Dispensaire local" },
      ageRestriction: { title: "18 ans et plus", subtitle: "Achat en boutique" },
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
      description: "Notre catalogue complet de fleurs, comestibles, vapoteuses, concentrés, CBD et accessoires s'en vient.",
    },
    learningCenter: {
      title: "Centre d'apprentissage",
      description:
        "Des guides sur les variétés, les effets, le dosage et la consommation responsable — pour vous aider à choisir en toute confiance.",
    },
  },
};

export default fr;
