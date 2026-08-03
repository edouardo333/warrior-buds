// Bud Guardian V4.1 — public access-control layer. This is a hard boundary:
// no matter what the customer asks, staff-only information (dashboards,
// other customers' data, payment records at large, CRM, internal notes,
// risk/fraud scores, revenue/analytics, employee info, security/access
// codes) is never answered from the public chat. Runs before any other
// engine so a blocked ask can never be smuggled in mid-session.

import type { Locale } from "@/lib/i18n/types";
import type { QuickActionId } from "@/data/bud-guardian/types";
import { findBestMatch, type SearchableEntry } from "./search";

export type AccessControlResponse = {
  answer: string;
  suggestions: QuickActionId[];
  found: boolean;
};

type BlockedTopic = SearchableEntry;

const BLOCKED_TOPICS: BlockedTopic[] = [
  // Staff dashboard / back office
  {
    keywords: [
      "tableau de bord employe", "tableau de bord personnel", "tableau de bord staff",
      "panneau admin", "acces admin", "back office", "espace employe", "espace staff",
      "staff dashboard", "admin dashboard", "admin panel", "back office", "employee portal",
    ],
  },
  // Other customers' / all orders
  {
    keywords: [
      "commande d un autre client", "commande de quelqu un d autre", "toutes les commandes",
      "liste des commandes", "toutes les commandes des clients", "commandes de tous les clients",
      "all orders", "every order", "other customer's order", "someone else's order", "list of all orders",
    ],
  },
  // Payment records at large (not "my payment" — that's a legitimate order-assistance flow)
  {
    keywords: [
      "tous les paiements", "liste des paiements", "paiements de tous les clients",
      "historique des paiements de la boutique", "registre des paiements",
      "all payments", "payment records", "list of all payments", "every transaction", "transactions of all customers",
    ],
  },
  // CRM / customer profiles
  {
    keywords: [
      "profil client", "fiche client", "dossier client", "base de donnees clients",
      "customer profile", "customer record", "crm", "client database", "customer database",
    ],
  },
  // Internal notes
  {
    keywords: [
      "notes internes", "notes du personnel", "notes de l equipe", "commentaires internes",
      "internal notes", "staff notes", "internal comments",
    ],
  },
  // Risk / fraud scores
  {
    keywords: [
      "score de risque", "niveau de risque", "score de fraude", "evaluation du risque",
      "risk score", "fraud score", "risk level", "risk assessment",
    ],
  },
  // Revenue / analytics
  {
    keywords: [
      "chiffre d affaires", "revenu total", "ventes totales", "statistiques de vente",
      "rapport de ventes", "revenue", "total sales", "sales report", "sales analytics", "analytics dashboard",
    ],
  },
  // Employee information
  {
    keywords: [
      "liste des employes", "information des employes", "salaire des employes", "horaire des employes",
      "employee list", "employee information", "staff list", "employee salary", "employee schedule",
    ],
  },
  // Security rules / access codes
  {
    keywords: [
      "code d acces", "code de securite", "mot de passe staff", "identifiants staff",
      "comment se connecter au personnel", "regles de securite internes",
      "access code", "security code", "staff password", "staff credentials", "staff login", "internal security rules",
    ],
  },
];

const BLOCKED_MESSAGE: Record<Locale, string> = {
  fr: "Cette information est réservée au personnel Warrior Buds. Je peux toutefois vous aider avec les produits, les horaires, votre propre commande ou vous mettre en contact avec l'équipe.",
  en: "That information is restricted to Warrior Buds staff. I can still help with products, store hours, your own order or contacting the team.",
};

const BLOCKED_SUGGESTIONS: QuickActionId[] = ["products", "hours", "order-track", "instagram"];

export function checkAccessControl(text: string, locale: Locale): AccessControlResponse | null {
  const match = findBestMatch(text, BLOCKED_TOPICS);
  if (!match) return null;
  return { answer: BLOCKED_MESSAGE[locale], suggestions: BLOCKED_SUGGESTIONS, found: true };
}
