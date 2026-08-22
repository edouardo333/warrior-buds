// Homepage — SEO/information accordion content, rendered by
// components/HomeSeoAccordion.tsx between "Why Warrior Buds" and the
// "Ready to Visit" final CTA on the homepage (app/page.tsx). Deliberately a
// data file, not inline dictionary strings — same split as FAQ content
// (data/faq.ts) vs its dictionary chrome (t.faq).
//
// This section is commercial/product/local discovery copy: what Warrior
// Buds carries, Kanesatake/Oka context, and how ordering works. It is
// intentionally NOT a duplicate of:
//   - the Learning Center (data/learning-center.ts) — in-depth cannabinoid/
//     effects/dosing education stays there; this section only introduces
//     concepts and links out to it.
//   - the Customer Support FAQ (data/faq.ts) — practical "how do I…"
//     questions stay there; this section covers the same topics at a
//     higher, discovery level and links to the FAQ for procedural detail.
//
// Every claim here is grounded in real, verified site behaviour (lib/shop/**
// business rules, lib/site.ts, the FAQ/Learning Center content it links to)
// — never invented policies, SLAs, or "#1/best" claims. Never imports from
// or writes to data/bud-guardian/**, lib/staff/**, or components/staff/**.

import {
  ShieldCheck,
  MapPin,
  Gem,
  FlaskConical,
  Candy,
  Compass,
  Leaf,
  ShoppingBag,
  Truck,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import type { LocalizedText } from "./learning-center";

export type HomeSeoLink = { label: LocalizedText; href: string };

export type HomeSeoAccordionItem = {
  slug: string;
  icon: LucideIcon;
  title: LocalizedText;
  body: { en: string[]; fr: string[] };
  list?: { en: string[]; fr: string[] };
  links?: HomeSeoLink[];
};

export const HOME_SEO_ACCORDION: HomeSeoAccordionItem[] = [
  {
    slug: "why-warrior-buds",
    icon: ShieldCheck,
    title: { en: "Why Choose Warrior Buds?", fr: "Pourquoi choisir Warrior Buds ?" },
    body: {
      en: [
        "Warrior Buds is a cannabis dispensary rooted in Kanesatake, built around a simple idea: every product on the shelf should be something our own team would actually choose. From cannabis flower and pre-rolls to concentrates, edibles, vapes, and accessories, every item is selected for quality, consistency, and value before it ever reaches a customer.",
        "What sets a community dispensary apart isn't just the catalog — it's the people behind the counter. Our team gets to know regulars by name, walks first-time visitors through the basics without judgment, and keeps the same honest, no-pressure approach whether you're picking a single pre-roll or building a full order for the week.",
      ],
      fr: [
        "Warrior Buds est un dispensaire de cannabis enraciné à Kanesatake, bâti autour d'une idée simple : chaque produit sur les tablettes devrait être quelque chose que notre propre équipe choisirait vraiment. Des fleurs de cannabis et pré-roulés aux concentrés, comestibles, vapoteuses et accessoires, chaque article est sélectionné pour sa qualité, sa constance et son juste prix avant même d'arriver chez le client.",
        "Ce qui distingue un dispensaire communautaire, ce n'est pas seulement le catalogue — c'est aussi les gens derrière le comptoir. Notre équipe connaît les habitués par leur nom, guide les nouveaux visiteurs à travers les bases sans jugement, et garde la même approche honnête et sans pression, que vous choisissiez un seul pré-roulé ou que vous montiez une commande complète pour la semaine.",
      ],
    },
    list: {
      en: [
        "Curated cannabis flower, pre-rolls, concentrates, edibles, vapes, CBD, topicals, and mushrooms",
        "A locally rooted, community-first business",
        "Fast answers from Bud Guardian, our virtual assistant, any time of day",
      ],
      fr: [
        "Fleurs de cannabis, pré-roulés, concentrés, comestibles, vapoteuses, CBD, topiques et champignons sélectionnés",
        "Une entreprise enracinée localement, axée sur la communauté",
        "Des réponses rapides grâce à Bud Guardian, notre assistant virtuel, en tout temps",
      ],
    },
    links: [
      { label: { en: "Our Story", fr: "Notre histoire" }, href: "/about" },
      { label: { en: "Browse products", fr: "Parcourir les produits" }, href: "/products" },
    ],
  },
  {
    slug: "premium-cannabis-kanesatake",
    icon: MapPin,
    title: { en: "Premium Cannabis in Kanesatake", fr: "Cannabis haut de gamme à Kanesatake" },
    body: {
      en: [
        "Warrior Buds operates out of Oka, on the edge of Kanesatake — a location that's become a familiar stop for people across the region looking for a cannabis dispensary they can trust. Being part of this community isn't a marketing line; it shapes how we buy, stock, and price everything on the site.",
        "Because we're locally rooted, we hear directly what our neighbours actually want — whether that's a specific indica for sleep, a reliable daytime sativa, or a concentrate for someone who already knows exactly what they're after. That feedback loop is part of why the catalog looks the way it does.",
        "Whether you're stopping in from Oka, Kanesatake, or making the drive from further out, the goal is the same: a straightforward visit, honest guidance, and cannabis flower and products that are actually worth the trip.",
      ],
      fr: [
        "Warrior Buds opère à Oka, à la limite de Kanesatake — un emplacement devenu un arrêt familier pour les gens de la région qui cherchent un dispensaire de cannabis en qui ils peuvent avoir confiance. Faire partie de cette communauté n'est pas qu'une ligne publicitaire; ça façonne la manière dont nous achetons, stockons et fixons le prix de chaque produit sur le site.",
        "Parce que nous sommes enracinés localement, on entend directement ce que nos voisins recherchent vraiment — que ce soit une indica précise pour dormir, une sativa fiable pour le jour, ou un concentré pour quelqu'un qui sait déjà exactement ce qu'il veut. Cette boucle de rétroaction fait partie de la raison pour laquelle le catalogue a cette forme.",
        "Que vous veniez d'Oka, de Kanesatake, ou que vous fassiez le trajet depuis plus loin, l'objectif reste le même : une visite simple, des conseils honnêtes, et des fleurs de cannabis et produits qui valent vraiment le déplacement.",
      ],
    },
    links: [
      { label: { en: "Visit us", fr: "Nous rendre visite" }, href: "/contact" },
      { label: { en: "Our Story", fr: "Notre histoire" }, href: "/about" },
    ],
  },
  {
    slug: "top-shelf-craft-cannabis",
    icon: Gem,
    title: { en: "Top-Shelf & Craft Cannabis", fr: "Cannabis haut de gamme et artisanal" },
    body: {
      en: [
        "Not every gram of cannabis flower is grown, cured, or trimmed the same way, and it shows. Warrior Buds carries a range from everyday value flower up through top-shelf and craft-grown cannabis — the kind of small-batch product where slower curing and hand-trimming actually change the smell, texture, and smoke.",
        "Craft cannabis tends to cost more for a reason: lower yields, more hands-on attention, and less room for shortcuts. If you've never compared a true craft flower next to a standard offering, the difference in aroma and burn is usually obvious within the first jar.",
        "Every flower and pre-roll listed shows its strain type — Indica, Sativa, or Hybrid — along with THC percentage, so you can compare options before deciding rather than guessing at the counter.",
      ],
      fr: [
        "Chaque gramme de fleur de cannabis n'est pas cultivé, séché et taillé de la même façon, et ça se voit. Warrior Buds offre une gamme allant de fleurs économiques jusqu'à des fleurs haut de gamme et artisanales — le genre de produit en petit lot où un séchage plus lent et une taille à la main changent réellement l'arôme, la texture et la combustion.",
        "Le cannabis artisanal coûte généralement plus cher pour une bonne raison : rendements plus faibles, plus d'attention manuelle, et moins de place pour les raccourcis. Si vous n'avez jamais comparé une vraie fleur artisanale à une offre standard, la différence d'arôme et de combustion est habituellement évidente dès le premier pot.",
        "Chaque fleur et pré-roulé affiché indique son type de variété — Indica, Sativa ou Hybride — ainsi que son pourcentage de THC, pour que vous puissiez comparer les options avant de décider plutôt que de deviner au comptoir.",
      ],
    },
    links: [{ label: { en: "Browse products", fr: "Parcourir les produits" }, href: "/products" }],
  },
  {
    slug: "cannabis-concentrates-explained",
    icon: FlaskConical,
    title: { en: "Cannabis Concentrates Explained", fr: "Les concentrés de cannabis expliqués" },
    body: {
      en: [
        "Concentrates are cannabis with the flower's cannabinoids and terpenes extracted and concentrated into a much smaller, much stronger product. Warrior Buds' concentrate selection spans a range of extraction styles — from solventless options like rosin, pressed from flower using only heat and pressure, to solvent-based extracts like shatter and live resin, made from fresh-frozen flower to preserve flavour.",
        "Different concentrate styles suit different setups: some are meant for dabbing, others work in a vape or alongside flower. If terms like budder, crumble, diamonds, or terp sauce are new to you, our Learning Center breaks down what each texture actually means and how they're typically used.",
        "Because concentrates are significantly more potent than flower gram-for-gram, they're generally recommended for experienced cannabis users rather than a starting point.",
      ],
      fr: [
        "Les concentrés sont du cannabis dont les cannabinoïdes et les terpènes de la fleur ont été extraits et concentrés en un produit beaucoup plus petit et beaucoup plus puissant. La sélection de concentrés de Warrior Buds couvre plusieurs styles d'extraction — des options sans solvant comme le rosin, pressé à partir de la fleur avec seulement de la chaleur et de la pression, jusqu'à des extraits à base de solvant comme le shatter et le live resin, faits à partir de fleur fraîchement congelée pour préserver la saveur.",
        "Différents styles de concentrés conviennent à différentes façons de consommer : certains sont faits pour le dabbing, d'autres s'utilisent dans une vapoteuse ou avec de la fleur. Si des termes comme budder, crumble, diamants ou terp sauce vous sont inconnus, notre Centre d'apprentissage explique ce que chaque texture signifie concrètement et comment elle est habituellement utilisée.",
        "Parce que les concentrés sont beaucoup plus puissants que la fleur, gramme pour gramme, ils sont généralement recommandés aux consommateurs expérimentés plutôt qu'à un point de départ.",
      ],
    },
    links: [
      { label: { en: "Browse products", fr: "Parcourir les produits" }, href: "/products" },
      { label: { en: "Learning Center", fr: "Centre d'apprentissage" }, href: "/learning-center" },
    ],
  },
  {
    slug: "edibles-vapes-more",
    icon: Candy,
    title: { en: "Edibles, Vapes & More", fr: "Comestibles, vapoteuses et plus encore" },
    body: {
      en: [
        "Not everyone wants to smoke, and Warrior Buds' catalog reflects that. Edibles range from precisely-dosed gummies to chocolate, giving you a discreet, smoke-free way to measure exactly how much THC or CBD you're taking in a single, consistent piece.",
        "Vapes offer a different middle ground — a 510-thread cartridge or an all-in-one disposable pen deliver effects faster than an edible, without the smoke and smell of flower. Beyond flower, concentrates, edibles, and vapes, the shop also carries CBD, topicals, and functional mushroom products for customers looking for non-intoxicating or alternative options.",
        "Whatever category you're browsing, every product page lists potency, weight or dose, and current stock, so there are no surprises at checkout.",
      ],
      fr: [
        "Tout le monde ne veut pas fumer, et le catalogue de Warrior Buds en tient compte. Les comestibles vont de gommes précisément dosées au chocolat, offrant une façon discrète et sans fumée de mesurer exactement la quantité de THC ou de CBD consommée dans une pièce uniforme.",
        "Les vapoteuses offrent un autre entre-deux — une cartouche à filetage 510 ou un stylo jetable tout-en-un procurent des effets plus rapides qu'un comestible, sans la fumée ni l'odeur de la fleur. Au-delà de la fleur, des concentrés, des comestibles et des vapoteuses, la boutique offre aussi du CBD, des topiques et des produits à base de champignons fonctionnels pour les clients qui cherchent des options non intoxicantes ou différentes.",
        "Peu importe la catégorie que vous parcourez, chaque fiche produit indique la puissance, le poids ou la dose, ainsi que le stock actuel, pour qu'il n'y ait aucune surprise au moment de payer.",
      ],
    },
    links: [{ label: { en: "Browse products", fr: "Parcourir les produits" }, href: "/products" }],
  },
  {
    slug: "how-to-choose",
    icon: Compass,
    title: { en: "How to Choose the Right Cannabis Product", fr: "Comment choisir le bon produit de cannabis" },
    body: {
      en: [
        "With flower, pre-rolls, concentrates, edibles, and vapes all on the same shelf, picking the right product usually comes down to three questions: how do you want to consume it, how strong an effect are you looking for, and how quickly do you want it to hit.",
        "As a general starting point, flower and vapes tend to act within minutes and wear off relatively quickly, while edibles take longer to kick in but the effects usually last longer. THC percentage is a rough guide to strength, but strain type and your own tolerance matter just as much.",
        "If you're not sure where to start, that's exactly what Bud Guardian is for — describe what you're looking for (a use case, a strain preference, a budget) in the chat bubble and it will suggest matching products from the current catalog. Our Learning Center also has plain-language guides on dosing, onset time, and how to pick a first product.",
      ],
      fr: [
        "Avec de la fleur, des pré-roulés, des concentrés, des comestibles et des vapoteuses sur les mêmes tablettes, choisir le bon produit revient habituellement à trois questions : comment voulez-vous le consommer, quelle intensité d'effet recherchez-vous, et à quelle vitesse voulez-vous le ressentir.",
        "En règle générale, la fleur et les vapoteuses agissent en quelques minutes et s'estompent relativement vite, tandis que les comestibles prennent plus de temps à faire effet, mais celui-ci dure habituellement plus longtemps. Le pourcentage de THC donne une idée approximative de l'intensité, mais le type de variété et votre propre tolérance comptent tout autant.",
        "Si vous ne savez pas par où commencer, c'est exactement à ça que sert Bud Guardian — décrivez ce que vous cherchez (un usage précis, une préférence de variété, un budget) dans la bulle de clavardage, et il proposera des produits correspondants tirés du catalogue actuel. Notre Centre d'apprentissage propose aussi des guides clairs sur le dosage, le délai d'action et comment choisir un premier produit.",
      ],
    },
    links: [
      { label: { en: "Learning Center", fr: "Centre d'apprentissage" }, href: "/learning-center" },
      { label: { en: "Browse products", fr: "Parcourir les produits" }, href: "/products" },
    ],
  },
  {
    slug: "indica-sativa-hybrid",
    icon: Leaf,
    title: { en: "Understanding Indica, Sativa & Hybrid", fr: "Comprendre l'Indica, le Sativa et l'Hybride" },
    body: {
      en: [
        "Every flower and pre-roll at Warrior Buds is labelled Indica, Sativa, or Hybrid. Indica is traditionally associated with a heavier, more relaxing body effect and is often chosen for evenings or winding down. Sativa is generally linked to a lighter, more energizing effect suited to daytime use, while Hybrid strains blend traits from both parent types.",
        "In practice, most modern cannabis is hybridized to some degree, so these labels are best treated as a starting point rather than a strict rule — the specific cannabinoid and terpene profile of a given product often matters more than the category alone.",
        "You can filter the shop by strain type directly, and our Learning Center goes deeper into what Indica, Sativa, and Hybrid actually mean if you want the full picture before choosing.",
      ],
      fr: [
        "Chaque fleur et pré-roulé chez Warrior Buds est étiqueté Indica, Sativa ou Hybride. L'indica est traditionnellement associée à un effet corporel plus lourd et plus relaxant, souvent choisie pour le soir ou pour se détendre. Le sativa est généralement lié à un effet plus léger et plus énergisant, adapté à une utilisation de jour, tandis que les variétés hybrides combinent des traits des deux types d'origine.",
        "En pratique, la plupart du cannabis moderne est hybridé à un certain degré, donc ces étiquettes sont mieux vues comme un point de départ que comme une règle stricte — le profil précis de cannabinoïdes et de terpènes d'un produit donné compte souvent plus que la seule catégorie.",
        "Vous pouvez filtrer la boutique directement par type de variété, et notre Centre d'apprentissage approfondit ce que signifient réellement l'Indica, le Sativa et l'Hybride si vous voulez le portrait complet avant de choisir.",
      ],
    },
    links: [
      { label: { en: "Browse products", fr: "Parcourir les produits" }, href: "/products" },
      { label: { en: "Learning Center", fr: "Centre d'apprentissage" }, href: "/learning-center" },
    ],
  },
  {
    slug: "ordering",
    icon: ShoppingBag,
    title: { en: "Ordering From Warrior Buds", fr: "Commander chez Warrior Buds" },
    body: {
      en: [
        "Ordering online at Warrior Buds works the way you'd expect: browse the shop, add what you want to your cart, and check out either as a guest or with an account. Creating an account saves your addresses and payment preferences and keeps a running order history, but it's never required.",
        "Every order moves through a clear set of stages — from payment confirmation through processing, packing, and shipping — and you can check exactly where things stand at any time from your account or the order tracking page.",
        "If a question comes up mid-order — a payment method, a promo code, or just whether something's in stock — Bud Guardian is available in the chat bubble on every page to help, in English or French.",
      ],
      fr: [
        "Commander en ligne chez Warrior Buds fonctionne comme on s'y attend : parcourez la boutique, ajoutez ce que vous voulez à votre panier, puis passez au paiement en tant qu'invité ou avec un compte. Créer un compte enregistre vos adresses et préférences de paiement et conserve un historique de commandes, mais ce n'est jamais obligatoire.",
        "Chaque commande passe par une série d'étapes claires — de la confirmation du paiement jusqu'au traitement, à l'emballage et à l'expédition — et vous pouvez voir exactement où elle en est à tout moment depuis votre compte ou la page de suivi de commande.",
        "Si une question survient en cours de commande — un mode de paiement, un code promo, ou simplement si un article est en stock — Bud Guardian est disponible dans la bulle de clavardage sur chaque page pour vous aider, en français ou en anglais.",
      ],
    },
    links: [
      { label: { en: "Browse products", fr: "Parcourir les produits" }, href: "/products" },
      { label: { en: "FAQ", fr: "FAQ" }, href: "/faq" },
    ],
  },
  {
    slug: "shipping-delivery",
    icon: Truck,
    title: { en: "Shipping & Delivery", fr: "Livraison et expédition" },
    body: {
      en: [
        "Warrior Buds ships orders directly to customers, with Standard and Expedited shipping options available at checkout, plus in-store pickup for anyone who'd rather grab their order from Oka in person.",
        "Orders of $100 or more qualify for free shipping automatically — no code needed, it's applied once your cart reaches that total. Below that threshold, shipping is calculated at checkout.",
        "Once an order ships, tracking is available from your account or the order lookup page using your order number and email, and Bud Guardian can check current status for you if you'd rather ask than log in.",
      ],
      fr: [
        "Warrior Buds expédie les commandes directement aux clients, avec des options de livraison Standard et Accélérée offertes au moment du paiement, en plus de la cueillette en boutique pour ceux qui préfèrent récupérer leur commande à Oka en personne.",
        "Les commandes de 100 $ ou plus donnent droit à la livraison gratuite automatiquement — aucun code requis, elle s'applique dès que votre panier atteint ce montant. En dessous de ce seuil, les frais de livraison sont calculés au paiement.",
        "Une fois la commande expédiée, le suivi est disponible depuis votre compte ou la page de repérage de commande à l'aide de votre numéro de commande et de votre courriel, et Bud Guardian peut aussi vérifier le statut actuel pour vous si vous préférez simplement demander plutôt que de vous connecter.",
      ],
    },
    links: [
      { label: { en: "FAQ", fr: "FAQ" }, href: "/faq" },
      { label: { en: "Track an order", fr: "Suivre une commande" }, href: "/track-order" },
    ],
  },
  {
    slug: "payments-support",
    icon: CreditCard,
    title: { en: "Payments & Customer Support", fr: "Paiements et service à la clientèle" },
    body: {
      en: [
        "Warrior Buds accepts a wide range of payment methods online — Interac e-Transfer, credit and debit cards, and select cryptocurrency options like Bitcoin, Ethereum, and Shakepay — with cash, card, or Interac also available in person for anyone visiting the store.",
        "First-time customers can apply a one-time 5% discount code at checkout, and it can be combined with free shipping on qualifying orders.",
        "For anything that needs a real answer — order status, a payment question, or help deciding what to buy — Bud Guardian is available around the clock in the chat bubble, and the team is reachable by phone or Instagram for anything it can't resolve on its own.",
      ],
      fr: [
        "Warrior Buds accepte plusieurs modes de paiement en ligne — virement Interac, cartes de crédit et de débit, ainsi que certaines options de cryptomonnaie comme Bitcoin, Ethereum et Shakepay — avec comptant, carte ou Interac aussi disponibles en personne pour ceux qui visitent la boutique.",
        "Les nouveaux clients peuvent appliquer un code de rabais unique de 5 % au paiement, et il peut être combiné avec la livraison gratuite sur les commandes admissibles.",
        "Pour tout ce qui demande une vraie réponse — le statut d'une commande, une question de paiement, ou de l'aide pour choisir quoi acheter — Bud Guardian est disponible en tout temps dans la bulle de clavardage, et l'équipe reste joignable par téléphone ou Instagram pour tout ce qu'il ne peut pas résoudre lui-même.",
      ],
    },
    links: [
      { label: { en: "FAQ", fr: "FAQ" }, href: "/faq" },
      { label: { en: "Contact us", fr: "Nous contacter" }, href: "/contact" },
    ],
  },
];
