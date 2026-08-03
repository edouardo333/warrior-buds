// Storefront — mock email templates. "Sending" only logs to the console and
// appends to a local sent-log (see lib/shop/mock-email.ts) — there is no
// real mail transport in this build. Never imports from or writes to
// data/bud-guardian/**, lib/staff/**, or components/staff/**.

export type EmailTemplateId =
  | "welcome"
  | "verify-email"
  | "reset-password"
  | "order-confirmation"
  | "payment-received"
  | "order-processing"
  | "order-shipped"
  | "tracking-number"
  | "order-delivered";

export type EmailMessage = {
  id: string;
  to: string;
  templateId: EmailTemplateId;
  subject: string;
  html: string;
  text: string;
  sentAt: string;
};
