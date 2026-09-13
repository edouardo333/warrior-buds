// Storefront — Customer Support FAQ content (/faq). Deliberately separate
// from data/learning-center.ts: this file only answers practical "how do I…"
// support questions about ordering, paying, tracking, Bud Guardian, and
// accounts. It never explains cannabinoid effects, dosing, strain education,
// concentrates, psychedelics, nicotine, or responsible-use guidance — those
// stay exclusively in the Learning Center. Every answer here is grounded in
// verified current functionality/business rules (lib/shop/**,
// lib/bud-guardian/**, legal pages) — never invented refunds, SLAs, or
// policies. See AGENTS.md.

import {
  ClipboardList,
  CreditCard,
  Percent,
  Truck,
  Bot,
  ShieldCheck,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import type { LocalizedText } from "./learning-center";

export type FaqLink = { label: LocalizedText; href: string };

export type FaqItem = {
  slug: string;
  question: LocalizedText;
  answer: LocalizedText;
  links?: FaqLink[];
};

export type FaqCategory = {
  slug: string;
  icon: LucideIcon;
  title: LocalizedText;
  description: LocalizedText;
  items: FaqItem[];
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    slug: "orders-accounts",
    icon: ClipboardList,
    title: { en: "Orders & Accounts", fr: "Commandes et comptes" },
    description: {
      en: "Placing, tracking, and managing your orders.",
      fr: "Passer, suivre et gérer vos commandes.",
    },
    items: [
      {
        slug: "how-to-order",
        question: { en: "How do I place an order?", fr: "Comment puis-je passer une commande ?" },
        answer: {
          en: "Browse the Shop, add items to your cart, then go to checkout. Choose to continue as a guest or sign in, enter your shipping and billing details, review your order (apply a promo code if you have one), pick a payment method, and place your order. You'll land on an order confirmation page you can revisit anytime.",
          fr: "Parcourez la Boutique, ajoutez des articles à votre panier, puis passez au paiement. Choisissez de continuer en tant qu'invité ou de vous connecter, entrez vos coordonnées de livraison et de facturation, révisez votre commande (appliquez un code promo si vous en avez un), choisissez un mode de paiement, puis passez la commande. Vous arriverez sur une page de confirmation que vous pouvez consulter à nouveau en tout temps.",
        },
        links: [{ label: { en: "Shop now", fr: "Magasiner" }, href: "/products" }],
      },
      {
        slug: "guest-vs-account",
        question: {
          en: "Do I need an account, or can I check out as a guest?",
          fr: "Ai-je besoin d'un compte, ou puis-je commander en tant qu'invité ?",
        },
        answer: {
          en: "An account isn't required — Guest Checkout lets you order with just your email and shipping details. Creating an account additionally saves your addresses and payment preferences, keeps a full order history, and syncs your wishlist.",
          fr: "Un compte n'est pas requis — la commande en tant qu'invité vous permet de commander avec seulement votre courriel et vos coordonnées de livraison. Créer un compte enregistre en plus vos adresses et préférences de paiement, conserve l'historique complet de vos commandes et synchronise votre liste de souhaits.",
        },
      },
      {
        slug: "track-edit-cancel",
        question: {
          en: "Can I track, edit, or cancel an order?",
          fr: "Puis-je suivre, modifier ou annuler une commande ?",
        },
        answer: {
          en: "Tracking: signed-in customers see live status under Account → Orders; anyone, including guests, can also look up an order at Track Order using the order number and the email used at checkout. Editing or cancelling: you can request cancellation within 48 hours of placing your order, as long as it hasn't already shipped or been prepared for pickup — contact us (phone, Instagram, or Bud Guardian) as soon as possible with your order number. Once an order has shipped, it can no longer be cancelled.",
          fr: "Suivi : les clients connectés voient le statut en direct dans Compte → Commandes; tout le monde, y compris les invités, peut aussi repérer une commande dans Suivre ma commande avec le numéro de commande et le courriel utilisé lors du paiement. Modification ou annulation : vous pouvez demander l'annulation dans les 48 heures suivant le passage de votre commande, à condition qu'elle n'ait pas déjà été expédiée ou préparée pour la cueillette — contactez-nous (téléphone, Instagram ou Bud Guardian) le plus vite possible avec votre numéro de commande. Une fois la commande expédiée, elle ne peut plus être annulée.",
        },
        links: [
          { label: { en: "Account → Orders", fr: "Compte → Commandes" }, href: "/account/orders" },
          { label: { en: "Track an order", fr: "Suivre une commande" }, href: "/track-order" },
        ],
      },
      {
        slug: "pending-abandoned",
        question: {
          en: "What does \"Pending Payment\" mean, and what if I never finish paying?",
          fr: "Que signifie « En attente de paiement », et qu'arrive-t-il si je ne termine jamais le paiement ?",
        },
        answer: {
          en: "Every order starts as Pending Payment until we confirm payment was received; it then moves through Payment Received → Processing → Packed → Shipped → Delivered. If you placed an order but haven't completed payment, it simply stays in Pending Payment — reach out to us or ask Bud Guardian if you'd like to finish paying, switch payment methods, or cancel it.",
          fr: "Chaque commande commence « En attente de paiement » jusqu'à ce que nous confirmions la réception du paiement; elle passe ensuite par Paiement reçu → En traitement → Emballée → Expédiée → Livrée. Si vous avez passé une commande sans terminer le paiement, elle reste simplement « En attente de paiement » — contactez-nous ou demandez à Bud Guardian si vous voulez terminer le paiement, changer de mode de paiement ou l'annuler.",
        },
      },
      {
        slug: "order-problems",
        question: {
          en: "Something's wrong with my order (missing, wrong, or damaged item) — what do I do?",
          fr: "Il y a un problème avec ma commande (article manquant, erroné ou endommagé) — que faire ?",
        },
        answer: {
          en: "Contact us with your order number as soon as possible — call, message us on Instagram, or open Bud Guardian and ask to speak with a person. We'll take it from there.",
          fr: "Contactez-nous avec votre numéro de commande dès que possible — appelez, écrivez-nous sur Instagram, ou ouvrez Bud Guardian et demandez à parler à une personne. Nous prendrons le relais à partir de là.",
        },
      },
    ],
  },
  {
    slug: "payments",
    icon: CreditCard,
    title: { en: "Payments", fr: "Paiements" },
    description: {
      en: "Accepted methods and checking a payment's status.",
      fr: "Modes acceptés et vérification du statut d'un paiement.",
    },
    items: [
      {
        slug: "accepted-methods",
        question: { en: "What payment methods do you accept?", fr: "Quels modes de paiement acceptez-vous ?" },
        answer: {
          en: "Online: Interac e-Transfer, Credit/Debit Card (Visa, Mastercard, Amex), Bitcoin, Ethereum, and Shakepay. You can also pay directly in-store — cash, card, or Interac at the counter.",
          fr: "En ligne : virement Interac, carte de crédit/débit (Visa, Mastercard, Amex), Bitcoin, Ethereum et Shakepay. Vous pouvez aussi payer directement en boutique — comptant, carte ou Interac au comptoir.",
        },
      },
      {
        slug: "pending-payment",
        question: {
          en: "My payment shows as pending — how long does it take?",
          fr: "Mon paiement est indiqué comme en attente — combien de temps cela prend-il ?",
        },
        answer: {
          en: "An Interac e-Transfer request is valid for 24 hours after it's generated. Once we confirm your payment, the order automatically moves to Payment Received. Not sure where things stand? Ask Bud Guardian to check (you'll need two of: order number, phone, or email) or contact us directly.",
          fr: "Une demande de virement Interac est valide 24 heures après sa création. Une fois le paiement confirmé, la commande passe automatiquement à Paiement reçu. Pas certain où ça en est ? Demandez à Bud Guardian de vérifier (deux informations parmi : numéro de commande, téléphone ou courriel) ou contactez-nous directement.",
        },
      },
      {
        slug: "declined-expired",
        question: {
          en: "What if my payment is declined or my Interac request expires?",
          fr: "Que se passe-t-il si mon paiement est refusé ou que ma demande Interac expire ?",
        },
        answer: {
          en: "The order simply stays unpaid — you can try again, choose a different payment method, or pay in-store. Ask Bud Guardian or contact us if you need a new payment request sent.",
          fr: "La commande reste simplement impayée — vous pouvez réessayer, choisir un autre mode de paiement ou payer en boutique. Demandez à Bud Guardian ou contactez-nous si vous avez besoin d'une nouvelle demande de paiement.",
        },
      },
      {
        slug: "payment-confirmation",
        question: {
          en: "How do I know my payment and order are confirmed?",
          fr: "Comment savoir si mon paiement et ma commande sont confirmés ?",
        },
        answer: {
          en: "The order status changes to Payment Received in Account → Orders (or via Track Order), and Bud Guardian can confirm both your payment and order status if you provide your order number plus a phone number or email.",
          fr: "Le statut de la commande passe à Paiement reçu dans Compte → Commandes (ou via Suivre ma commande), et Bud Guardian peut confirmer le paiement et le statut de la commande si vous fournissez votre numéro de commande ainsi qu'un téléphone ou courriel.",
        },
      },
    ],
  },
  {
    slug: "promotions",
    icon: Percent,
    title: { en: "Promotions", fr: "Promotions" },
    description: {
      en: "BUDS5 and free shipping — how they actually work.",
      fr: "BUDS5 et la livraison gratuite — comment ça fonctionne vraiment.",
    },
    items: [
      {
        slug: "buds5",
        question: {
          en: "Is there a discount code I can use?",
          fr: "Y a-t-il un code de rabais que je peux utiliser ?",
        },
        answer: {
          en: "Yes — enter code BUDS5 at checkout on the Review step for 5% off. It's automatically validated: it can be used once per account (or per guest email), on any order — not only your first one.",
          fr: "Oui — entrez le code BUDS5 à l'étape de révision du paiement pour 5 % de rabais. Il est validé automatiquement : il peut être utilisé une seule fois par compte (ou par courriel d'invité), sur n'importe quelle commande — pas seulement la première.",
        },
      },
      {
        slug: "free-shipping",
        question: { en: "Do you offer free shipping?", fr: "Offrez-vous la livraison gratuite ?" },
        answer: {
          en: "Yes — orders of $100 or more qualify for free shipping automatically once your cart reaches that total. No code needed.",
          fr: "Oui — les commandes de 100 $ ou plus donnent droit à la livraison gratuite automatiquement dès que votre panier atteint ce montant. Aucun code requis.",
        },
      },
      {
        slug: "combine-promo",
        question: {
          en: "Can I combine BUDS5 with free shipping?",
          fr: "Puis-je combiner BUDS5 avec la livraison gratuite ?",
        },
        answer: {
          en: "Yes — if your order already qualifies for free shipping, applying BUDS5 still gives you 5% off on top. The two aren't mutually exclusive.",
          fr: "Oui — si votre commande donne déjà droit à la livraison gratuite, appliquer BUDS5 vous donne quand même 5 % de rabais en plus. Les deux ne s'excluent pas.",
        },
      },
      {
        slug: "buds5-reuse",
        question: {
          en: "Can I use BUDS5 again on a later order?",
          fr: "Puis-je réutiliser BUDS5 sur une commande future ?",
        },
        answer: {
          en: "No — BUDS5 can be redeemed once per account (or per guest email). Placing orders without the code doesn't use up your eligibility, but once BUDS5 has actually been applied to an order, that account can't use it again.",
          fr: "Non — BUDS5 peut être utilisé une seule fois par compte (ou par courriel d'invité). Passer des commandes sans le code ne fait pas perdre votre admissibilité, mais une fois que BUDS5 a été appliqué à une commande, ce compte ne peut plus le réutiliser.",
        },
      },
    ],
  },
  {
    slug: "pickup-fulfillment",
    icon: Truck,
    title: { en: "Pickup, Fulfillment & Tracking", fr: "Cueillette, traitement et suivi" },
    description: {
      en: "Shipping methods, order statuses, and tracking numbers.",
      fr: "Modes de livraison, statuts de commande et numéros de suivi.",
    },
    items: [
      {
        slug: "order-statuses",
        question: {
          en: "What are the order statuses and what do they mean?",
          fr: "Quels sont les statuts de commande et que signifient-ils ?",
        },
        answer: {
          en: "Pending Payment → Payment Received → Processing → Packed → Shipped → Delivered (or Cancelled). See the current stage anytime on your order's tracking timeline.",
          fr: "En attente de paiement → Paiement reçu → En traitement → Emballée → Expédiée → Livrée (ou Annulée). Consultez l'étape actuelle en tout temps sur la chronologie de suivi de votre commande.",
        },
        links: [{ label: { en: "Account → Orders", fr: "Compte → Commandes" }, href: "/account/orders" }],
      },
      {
        slug: "pickup",
        question: {
          en: "Can I pick up my order at the store instead of shipping?",
          fr: "Puis-je récupérer ma commande en boutique plutôt que de la faire livrer ?",
        },
        answer: {
          en: "Yes — Pickup is offered as a shipping method at checkout alongside Standard and Expedited shipping. Choose it on the Shipping step.",
          fr: "Oui — la Cueillette est offerte comme mode de livraison lors du paiement, en plus des options Standard et Accélérée. Choisissez-la à l'étape de livraison.",
        },
      },
      {
        slug: "tracking-number",
        question: {
          en: "How do I track my order — is there a tracking number?",
          fr: "Comment suivre ma commande — y a-t-il un numéro de suivi ?",
        },
        answer: {
          en: "Once your order ships, a tracking number appears on its order detail page under Account → Orders. Guests can look up status anytime at Track Order with their order number and email.",
          fr: "Une fois votre commande expédiée, un numéro de suivi apparaît sur sa page de détail dans Compte → Commandes. Les invités peuvent vérifier le statut en tout temps dans Suivre ma commande avec leur numéro de commande et courriel.",
        },
        links: [{ label: { en: "Track an order", fr: "Suivre une commande" }, href: "/track-order" }],
      },
      {
        slug: "delay",
        question: {
          en: "My order seems delayed — what should I do?",
          fr: "Ma commande semble retardée — que dois-je faire ?",
        },
        answer: {
          en: "Check its current status and timeline first, in Account → Orders or via Track Order. If it looks stuck or off, contact us or ask Bud Guardian and we'll look into it.",
          fr: "Vérifiez d'abord son statut actuel et sa chronologie, dans Compte → Commandes ou via Suivre ma commande. Si ça semble bloqué ou anormal, contactez-nous ou demandez à Bud Guardian, et nous allons vérifier.",
        },
      },
    ],
  },
  {
    slug: "bud-guardian",
    icon: Bot,
    title: { en: "Bud Guardian", fr: "Bud Guardian" },
    description: {
      en: "Our virtual assistant — what it can do and when to ask for a human.",
      fr: "Notre assistant virtuel — ce qu'il peut faire et quand demander une personne.",
    },
    items: [
      {
        slug: "what-is",
        question: { en: "What is Bud Guardian?", fr: "Qu'est-ce que Bud Guardian ?" },
        answer: {
          en: "Bud Guardian is Warrior Buds' virtual assistant, available 24/7 in the chat bubble on every page. It answers questions about products, orders, payments, and the store, in French or English.",
          fr: "Bud Guardian est l'assistant virtuel de Warrior Buds, disponible 24 h/24, 7 j/7 dans la bulle de clavardage sur chaque page. Il répond aux questions sur les produits, les commandes, les paiements et la boutique, en français ou en anglais.",
        },
      },
      {
        slug: "what-can-it-do",
        question: { en: "What can Bud Guardian help me with?", fr: "Avec quoi Bud Guardian peut-il m'aider ?" },
        answer: {
          en: "Product questions (availability, pricing, recommendations), order lookups and status, payment status checks, general store info, and connecting you to the team when needed.",
          fr: "Questions sur les produits (disponibilité, prix, recommandations), repérage et statut de commande, vérification du statut de paiement, informations générales sur la boutique, et mise en contact avec l'équipe au besoin.",
        },
      },
      {
        slug: "when-human",
        question: {
          en: "When do I need to talk to a real person instead?",
          fr: "Quand dois-je parler à une vraie personne plutôt qu'à Bud Guardian ?",
        },
        answer: {
          en: "Bud Guardian offers to connect you with the team — by phone, Instagram, or a callback request — whenever it can't resolve something, or if you ask for a human directly. It can't place real phone calls itself.",
          fr: "Bud Guardian propose de vous mettre en contact avec l'équipe — par téléphone, Instagram ou une demande de rappel — chaque fois qu'il ne peut pas résoudre quelque chose, ou si vous demandez directement une personne. Il ne peut pas effectuer de vrais appels téléphoniques lui-même.",
        },
      },
      {
        slug: "how-to-open",
        question: { en: "How do I open Bud Guardian?", fr: "Comment ouvrir Bud Guardian ?" },
        answer: {
          en: "Click the chat bubble in the bottom-right corner of any page, or use the \"Ask Bud Guardian\" button below.",
          fr: "Cliquez sur la bulle de clavardage en bas à droite de n'importe quelle page, ou utilisez le bouton « Demander à Bud Guardian » ci-dessous.",
        },
      },
    ],
  },
  {
    slug: "account-privacy-security",
    icon: ShieldCheck,
    title: { en: "Account, Privacy & Security", fr: "Compte, confidentialité et sécurité" },
    description: {
      en: "Managing your account and understanding our policies.",
      fr: "Gérer votre compte et comprendre nos politiques.",
    },
    items: [
      {
        slug: "manage-account",
        question: { en: "What can I manage from my account?", fr: "Que puis-je gérer depuis mon compte ?" },
        answer: {
          en: "Your profile info, saved shipping addresses, saved payment preferences, your full order history, and settings — including your password and marketing email preference.",
          fr: "Vos informations de profil, vos adresses de livraison enregistrées, vos préférences de paiement enregistrées, l'historique complet de vos commandes, ainsi que vos paramètres — incluant votre mot de passe et votre préférence pour les courriels promotionnels.",
        },
        links: [{ label: { en: "Go to My Account", fr: "Aller à Mon compte" }, href: "/account" }],
      },
      {
        slug: "change-password",
        question: { en: "How do I change my password?", fr: "Comment changer mon mot de passe ?" },
        answer: {
          en: "Go to Account → Settings and use the Change Password section — you'll need your current password to set a new one.",
          fr: "Allez à Compte → Paramètres et utilisez la section Changer le mot de passe — vous devez fournir votre mot de passe actuel pour en définir un nouveau.",
        },
        links: [{ label: { en: "Account → Settings", fr: "Compte → Paramètres" }, href: "/account/settings" }],
      },
      {
        slug: "forgot-password",
        question: {
          en: "I forgot my password / can't log in — what now?",
          fr: "J'ai oublié mon mot de passe / je n'arrive pas à me connecter — que faire ?",
        },
        answer: {
          en: "Use \"Forgot password\" on the login page to reset it by email, or contact us / ask Bud Guardian if you're still stuck.",
          fr: "Utilisez « Mot de passe oublié » sur la page de connexion pour le réinitialiser par courriel, ou contactez-nous / demandez à Bud Guardian si vous êtes toujours bloqué.",
        },
        links: [{ label: { en: "Forgot password", fr: "Mot de passe oublié" }, href: "/forgot-password" }],
      },
      {
        slug: "privacy",
        question: {
          en: "Is my personal information kept private?",
          fr: "Mes renseignements personnels sont-ils protégés ?",
        },
        answer: {
          en: "Yes — our Privacy Policy explains exactly what we collect and how it's used.",
          fr: "Oui — notre Politique de confidentialité explique exactement ce que nous recueillons et comment c'est utilisé.",
        },
        links: [{ label: { en: "Read the Privacy Policy", fr: "Lire la Politique de confidentialité" }, href: "/privacy-policy" }],
      },
      {
        slug: "legal-links",
        question: {
          en: "Where can I find your Terms and Cookie Policy?",
          fr: "Où puis-je trouver vos Conditions et votre Politique de témoins ?",
        },
        answer: {
          en: "Linked here and in the footer of every page.",
          fr: "Ils sont liés ici et dans le pied de page de chaque page.",
        },
        links: [
          { label: { en: "Terms and Conditions", fr: "Conditions générales" }, href: "/terms-and-conditions" },
          { label: { en: "Cookie Policy", fr: "Politique de témoins" }, href: "/cookie-policy" },
        ],
      },
    ],
  },
  {
    slug: "products",
    icon: Leaf,
    title: { en: "Products", fr: "Produits" },
    description: {
      en: "Finding what you need in our catalog.",
      fr: "Trouver ce que vous cherchez dans notre catalogue.",
    },
    items: [
      {
        slug: "stock",
        question: {
          en: "How do I know if a product is in stock?",
          fr: "Comment savoir si un produit est en stock ?",
        },
        answer: {
          en: "Every product page shows its current availability — In Stock, Low Stock, or Out of Stock.",
          fr: "Chaque page produit affiche sa disponibilité actuelle — En stock, Stock limité ou Rupture de stock.",
        },
      },
      {
        slug: "categories",
        question: {
          en: "What categories of products do you carry?",
          fr: "Quelles catégories de produits offrez-vous ?",
        },
        answer: {
          en: "Cannabis (flower & pre-rolls, including indica/sativa/hybrid), Concentrates, Edibles, Vapes, CBD, Topicals, Mushrooms, and Accessories — browse and filter them all on the Shop page.",
          fr: "Cannabis (fleurs et pré-roulés, incluant indica/sativa/hybride), Concentrés, Comestibles, Vapoteuses, CBD, Topiques, Champignons et Accessoires — parcourez et filtrez le tout sur la page Boutique.",
        },
        links: [{ label: { en: "Browse products", fr: "Parcourir les produits" }, href: "/products" }],
      },
      {
        slug: "recommendations",
        question: {
          en: "Can Bud Guardian recommend products for me?",
          fr: "Bud Guardian peut-il me recommander des produits ?",
        },
        answer: {
          en: "Yes — ask Bud Guardian about a category, strain, or use case, and it can suggest matching products, prices, and availability from the current catalog.",
          fr: "Oui — demandez à Bud Guardian une catégorie, une variété ou un usage, et il peut suggérer des produits correspondants, avec prix et disponibilité, tirés du catalogue actuel.",
        },
      },
      {
        slug: "find-product",
        question: { en: "How do I find a specific product?", fr: "Comment trouver un produit précis ?" },
        answer: {
          en: "Use the search and category filters on the Shop page, or ask Bud Guardian by name or description.",
          fr: "Utilisez la recherche et les filtres de catégorie sur la page Boutique, ou demandez à Bud Guardian par nom ou description.",
        },
        links: [{ label: { en: "Browse products", fr: "Parcourir les produits" }, href: "/products" }],
      },
      {
        slug: "education",
        question: {
          en: "Where can I learn about THC/CBD, effects, dosing, or product education?",
          fr: "Où puis-je en apprendre sur le THC/CBD, les effets, le dosage ou l'éducation aux produits ?",
        },
        answer: {
          en: "That's exactly what our Learning Center is for — clear guides on cannabis basics, concentrates, high-potency products, psychedelics, nicotine products, and responsible use.",
          fr: "C'est exactement à ça que sert notre Centre d'apprentissage — des guides clairs sur les bases du cannabis, les concentrés, les produits à haute puissance, les psychédéliques, les produits de nicotine et la consommation responsable.",
        },
        links: [{ label: { en: "Visit the Learning Center", fr: "Visiter le Centre d'apprentissage" }, href: "/learning-center" }],
      },
    ],
  },
];
