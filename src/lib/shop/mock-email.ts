// Storefront — mock email templates + "sending". No real transport exists:
// this only logs to the console and appends to a small local sent-log for
// inspection, matching the "For now use mock email sending" requirement.
// Never imports from or writes to data/bud-guardian/**, lib/staff/**, or
// components/staff/**.

import type { Locale } from "@/lib/i18n/types";
import type { EmailMessage, EmailTemplateId } from "@/types/email";

const SENT_LOG_KEY = "wb-shop-sent-emails-v1";

export type EmailData = Record<string, string | number>;

function uid(): string {
  return `EMAIL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

type RenderedTemplate = { subject: string; heading: string; body: string; cta: string | null };

const TEMPLATES: Record<EmailTemplateId, Record<Locale, (data: EmailData) => RenderedTemplate>> = {
  welcome: {
    en: (d) => ({ subject: "Welcome to Warrior Buds", heading: `Welcome, ${d.firstName}!`, body: "Your account is ready. Explore the shop and enjoy member pricing.", cta: "Start Shopping" }),
    fr: (d) => ({ subject: "Bienvenue chez Warrior Buds", heading: `Bienvenue, ${d.firstName} !`, body: "Votre compte est prêt. Explorez la boutique et profitez des prix membres.", cta: "Magasiner" }),
  },
  "verify-email": {
    en: (d) => ({ subject: "Verify your email", heading: "Confirm your email address", body: `Use this code to verify your account: ${d.token}`, cta: "Verify Email" }),
    fr: (d) => ({ subject: "Confirmez votre courriel", heading: "Confirmez votre adresse courriel", body: `Utilisez ce code pour vérifier votre compte : ${d.token}`, cta: "Confirmer" }),
  },
  "reset-password": {
    en: (d) => ({ subject: "Reset your password", heading: "Reset your password", body: `Use this code to reset your password: ${d.token}. It expires in 1 hour.`, cta: "Reset Password" }),
    fr: (d) => ({ subject: "Réinitialisez votre mot de passe", heading: "Réinitialisez votre mot de passe", body: `Utilisez ce code pour réinitialiser votre mot de passe : ${d.token}. Il expire dans 1 heure.`, cta: "Réinitialiser" }),
  },
  "order-confirmation": {
    en: (d) => ({ subject: `Order ${d.orderId} confirmed`, heading: "Thanks for your order!", body: `We've received order ${d.orderId} for $${d.total}. We'll email you as it moves through processing.`, cta: "View Order" }),
    fr: (d) => ({ subject: `Commande ${d.orderId} confirmée`, heading: "Merci pour votre commande !", body: `Nous avons reçu la commande ${d.orderId} pour ${d.total} $. Vous recevrez un courriel à chaque étape.`, cta: "Voir la commande" }),
  },
  "payment-received": {
    en: (d) => ({ subject: `Payment received for order ${d.orderId}`, heading: "Payment received", body: `We've confirmed your Interac e-Transfer for order ${d.orderId}. Your order is now being processed.`, cta: "View Order" }),
    fr: (d) => ({ subject: `Paiement reçu pour la commande ${d.orderId}`, heading: "Paiement reçu", body: `Nous avons confirmé votre virement Interac pour la commande ${d.orderId}. Elle est maintenant en traitement.`, cta: "Voir la commande" }),
  },
  "order-processing": {
    en: (d) => ({ subject: `Order ${d.orderId} is being processed`, heading: "Your order is being prepared", body: `Order ${d.orderId} is now being processed by our team.`, cta: "View Order" }),
    fr: (d) => ({ subject: `La commande ${d.orderId} est en traitement`, heading: "Votre commande est en préparation", body: `La commande ${d.orderId} est maintenant en traitement par notre équipe.`, cta: "Voir la commande" }),
  },
  "order-shipped": {
    en: (d) => ({ subject: `Order ${d.orderId} has shipped`, heading: "Your order is on its way", body: `Order ${d.orderId} has shipped via Canada Post.`, cta: "Track Order" }),
    fr: (d) => ({ subject: `La commande ${d.orderId} a été expédiée`, heading: "Votre commande est en route", body: `La commande ${d.orderId} a été expédiée via Postes Canada.`, cta: "Suivre la commande" }),
  },
  "tracking-number": {
    en: (d) => ({ subject: `Tracking number for order ${d.orderId}`, heading: "Your tracking number is ready", body: `Canada Post tracking number: ${d.trackingNumber}`, cta: "Track Package" }),
    fr: (d) => ({ subject: `Numéro de suivi pour la commande ${d.orderId}`, heading: "Votre numéro de suivi est prêt", body: `Numéro de suivi Postes Canada : ${d.trackingNumber}`, cta: "Suivre le colis" }),
  },
  "order-delivered": {
    en: (d) => ({ subject: `Order ${d.orderId} delivered`, heading: "Your order has arrived", body: `Order ${d.orderId} was marked as delivered. Enjoy!`, cta: "Leave a Review" }),
    fr: (d) => ({ subject: `La commande ${d.orderId} a été livrée`, heading: "Votre commande est arrivée", body: `La commande ${d.orderId} a été livrée. Profitez-en !`, cta: "Laisser un avis" }),
  },
};

function renderHtml(t: RenderedTemplate): string {
  return `<div style="font-family:sans-serif;padding:24px;background:#0d0b0a;color:#f5f1ea"><h1 style="color:#f4670f">${t.heading}</h1><p>${t.body}</p>${
    t.cta ? `<p><a href="#" style="display:inline-block;margin-top:12px;padding:10px 20px;border-radius:999px;background:#f4670f;color:#000;text-decoration:none">${t.cta}</a></p>` : ""
  }</div>`;
}

function renderText(t: RenderedTemplate): string {
  return `${t.heading}\n\n${t.body}${t.cta ? `\n\n${t.cta}` : ""}`;
}

export function buildEmail(templateId: EmailTemplateId, to: string, data: EmailData, locale: Locale): EmailMessage {
  const rendered = TEMPLATES[templateId][locale](data);
  return {
    id: uid(),
    to,
    templateId,
    subject: rendered.subject,
    html: renderHtml(rendered),
    text: renderText(rendered),
    sentAt: new Date().toISOString(),
  };
}

function loadSentLog(): EmailMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SENT_LOG_KEY);
    return raw ? (JSON.parse(raw) as EmailMessage[]) : [];
  } catch {
    return [];
  }
}

function persistSentLog(log: EmailMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SENT_LOG_KEY, JSON.stringify(log));
  } catch {
    // Storage full/unavailable — the email was still "sent" (logged to console).
  }
}

// "Sends" a mock email: logs it to the console and appends it to a local
// sent-log so it can be inspected during development/demos. No network call
// is ever made.
export function sendMockEmail(to: string, templateId: EmailTemplateId, data: EmailData, locale: Locale): EmailMessage {
  const message = buildEmail(templateId, to, data, locale);
  console.info(`[mock-email] -> ${to} :: ${message.subject}`, message);
  persistSentLog([message, ...loadSentLog()].slice(0, 50));
  return message;
}

export function getSentEmails(): EmailMessage[] {
  return loadSentLog();
}
