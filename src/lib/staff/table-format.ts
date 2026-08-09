/**
 * Shared date/time formatting for Staff Space tables (Orders, Payments, Security,
 * Customers, Inventory). Produces a compact, non-wrapping "date · time" string
 * using each locale's natural conventions, e.g.:
 *   en: "Aug 9, 2026 · 1:25 AM"
 *   fr: "9 août 2026 · 01 h 25"
 */
export function formatStaffDateTime(iso: string, locale: "fr" | "en"): string {
  const date = new Date(iso);
  const intlLocale = locale === "fr" ? "fr-CA" : "en-CA";
  const datePart = new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium" }).format(date);
  const timePart = new Intl.DateTimeFormat(intlLocale, { timeStyle: "short" }).format(date);
  return `${datePart} · ${timePart}`;
}
