"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StaffSession } from "@/lib/staff/staff-auth";
import StaffShell from "./StaffShell";

const TEXT = {
  fr: {
    title: "Bud Guardian — Espace employé",
    subtitle: "Choisissez un module pour commencer.",
    cards: {
      orders: { title: "Commandes", desc: "Gestion des commandes en temps réel, connectée au chatbot Bud Guardian." },
      payments: { title: "Paiements", desc: "Suivi des paiements simulés, connecté aux commandes." },
      security: { title: "Risk Engine", desc: "Analyse automatique du risque de chaque commande." },
      customers: { title: "Clients", desc: "Intelligence client connectée aux commandes, paiements et au Risk Engine." },
      inventory: { title: "Inventaire", desc: "Gestion du stock et des mouvements, connectée aux commandes et aux paiements." },
    },
  },
  en: {
    title: "Bud Guardian — Staff space",
    subtitle: "Choose a module to get started.",
    cards: {
      orders: { title: "Orders", desc: "Real-time order management, connected to the Bud Guardian chatbot." },
      payments: { title: "Payments", desc: "Simulated payment tracking, connected to orders." },
      security: { title: "Risk Engine", desc: "Automatic per-order risk analysis." },
      customers: { title: "Customers", desc: "Customer intelligence connected to orders, payments and the Risk Engine." },
      inventory: { title: "Inventory", desc: "Stock and movement management, connected to orders and payments." },
    },
  },
} as const;

const CARDS = [
  { key: "orders", href: "/staff/orders" },
  { key: "payments", href: "/staff/payments" },
  { key: "security", href: "/staff/security" },
  { key: "customers", href: "/staff/customers" },
  { key: "inventory", href: "/staff/inventory" },
] as const;

export default function StaffHub({ session }: { session: StaffSession }) {
  const { locale } = useLanguage();
  const t = TEXT[locale];

  return (
    <StaffShell session={session} active="dashboard">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header>
          <h1 className="text-gradient-ember font-display text-3xl tracking-wide sm:text-4xl">{t.title}</h1>
          <p className="mt-1 text-sm text-white/55">{t.subtitle}</p>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map(({ key, href }) => (
            <a
              key={key}
              href={href}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8 transition-colors duration-200 hover:border-wb-orange/50 hover:bg-white/[0.05]"
            >
              <h2 className="font-display text-xl tracking-wide text-white/90 group-hover:text-wb-orange">{t.cards[key].title}</h2>
              <p className="mt-2 text-sm text-white/55">{t.cards[key].desc}</p>
            </a>
          ))}
        </div>
      </div>
    </StaffShell>
  );
}
