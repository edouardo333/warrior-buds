"use client";

import { useState, type FormEvent } from "react";
import { Send, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const INITIAL_STATE: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const MESSAGE_MAX_LENGTH = 600;

type FormErrors = Partial<Record<keyof FormState, boolean>>;
type SubmitStatus = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const { t } = useLanguage();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: false } : prev));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors: FormErrors = {
      firstName: form.firstName.trim() === "",
      lastName: form.lastName.trim() === "",
      email: form.email.trim() === "",
      message: form.message.trim() === "",
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setStatus("sending");
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setStatus("success");
      setForm(INITIAL_STATE);
    } catch {
      setStatus("error");
    }
  }

  function fieldClass(hasError?: boolean) {
    return `mt-2 w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-foreground placeholder-foreground/40 outline-none transition-all duration-200 focus:border-wb-orange/60 focus:ring-4 focus:ring-wb-orange/15 ${
      hasError ? "border-wb-red/70 focus:border-wb-red/70 focus:ring-wb-red/15" : "border-white/10"
    }`;
  }

  const labelClass = "text-xs font-semibold uppercase tracking-widest text-foreground/50";

  if (status === "success") {
    return (
      <div className="mt-10 flex flex-col items-center rounded-2xl border border-wb-orange/40 bg-wb-orange/10 px-6 py-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-wb-orange" strokeWidth={1.75} />
        <p className="mt-4 font-display text-2xl tracking-wide text-foreground">
          {t.contact.form.successTitle}
        </p>
        <p className="mt-2 text-sm text-foreground/70">{t.contact.form.successMessage}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full border border-white/25 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-wb-orange/60 hover:text-wb-orange"
        >
          {t.contact.form.sendAnother}
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-10 flex flex-col items-center rounded-2xl border border-wb-red/40 bg-wb-red/10 px-6 py-10 text-center">
        <AlertTriangle className="h-10 w-10 text-wb-red" strokeWidth={1.75} />
        <p className="mt-4 font-display text-2xl tracking-wide text-foreground">
          {t.contact.form.errorTitle}
        </p>
        <p className="mt-2 text-sm text-foreground/70">{t.contact.form.errorMessage}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full border border-white/25 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-wb-orange/60 hover:text-wb-orange"
        >
          {t.contact.form.tryAgain}
        </button>
      </div>
    );
  }

  const isSending = status === "sending";

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-10 flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelClass}>
            {t.contact.form.firstName}
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className={fieldClass(errors.firstName)}
          />
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>
            {t.contact.form.lastName}
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            value={form.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className={fieldClass(errors.lastName)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>
            {t.contact.form.email}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={fieldClass(errors.email)}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            {t.contact.form.phone}
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={fieldClass(false)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className={labelClass}>
          {t.contact.form.subject}
        </label>
        <select
          id="subject"
          value={form.subject}
          onChange={(e) => handleChange("subject", e.target.value)}
          className={`${fieldClass(false)} appearance-none`}
        >
          <option value="" className="bg-wb-charcoal text-foreground/60">
            {t.contact.form.subjectPlaceholder}
          </option>
          {t.contact.form.subjectOptions.map((option) => (
            <option key={option} value={option} className="bg-wb-charcoal text-foreground">
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="message" className={labelClass}>
            {t.contact.form.message}
          </label>
          <span className="text-xs text-foreground/40">
            {form.message.length}/{MESSAGE_MAX_LENGTH} {t.contact.form.charactersLabel}
          </span>
        </div>
        <textarea
          id="message"
          rows={5}
          maxLength={MESSAGE_MAX_LENGTH}
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
          className={`${fieldClass(errors.message)} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={isSending}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow bg-[length:200%_100%] bg-left px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-black transition-[background-position,box-shadow,transform] duration-500 ease-out hover:scale-105 hover:bg-right hover:shadow-[0_0_32px_-4px_rgba(244,103,15,0.65)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        {isSending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            {t.contact.form.sending}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" strokeWidth={2} />
            {t.contact.form.submit}
          </>
        )}
      </button>
    </form>
  );
}
