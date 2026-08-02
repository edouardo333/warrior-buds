"use client";

import { useState, type FormEvent } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
};

const INITIAL_STATE: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

type FormErrors = Partial<Record<keyof FormState, boolean>>;

export default function ContactForm() {
  const { t } = useLanguage();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: false } : prev));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors: FormErrors = {
      firstName: form.firstName.trim() === "",
      lastName: form.lastName.trim() === "",
      email: form.email.trim() === "",
      message: form.message.trim() === "",
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitted(true);
    setForm(INITIAL_STATE);
  }

  function fieldClass(hasError?: boolean) {
    return `mt-2 w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-foreground placeholder-foreground/40 outline-none transition-colors focus:border-wb-orange/60 ${
      hasError ? "border-wb-red/70" : "border-white/10"
    }`;
  }

  if (submitted) {
    return (
      <div className="mt-10 rounded-2xl border border-wb-orange/40 bg-wb-orange/10 px-6 py-10 text-center">
        <p className="font-display text-2xl tracking-wide text-foreground">
          {t.contact.form.successTitle}
        </p>
        <p className="mt-2 text-sm text-foreground/70">{t.contact.form.successMessage}</p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 rounded-full border border-white/25 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-wb-orange/60 hover:text-wb-orange"
        >
          {t.contact.form.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-10 flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="text-xs font-semibold uppercase tracking-widest text-foreground/50"
          >
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
          <label
            htmlFor="lastName"
            className="text-xs font-semibold uppercase tracking-widest text-foreground/50"
          >
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
          <label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-widest text-foreground/50"
          >
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
          <label
            htmlFor="phone"
            className="text-xs font-semibold uppercase tracking-widest text-foreground/50"
          >
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
        <label
          htmlFor="message"
          className="text-xs font-semibold uppercase tracking-widest text-foreground/50"
        >
          {t.contact.form.message}
        </label>
        <textarea
          id="message"
          rows={5}
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
          className={`${fieldClass(errors.message)} resize-none`}
        />
      </div>

      <button
        type="submit"
        className="mt-2 rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105"
      >
        {t.contact.form.submit}
      </button>
    </form>
  );
}
