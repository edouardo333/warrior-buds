"use client";

// Storefront — shared form primitives (label+input wrapper, input styling,
// primary button) reused across auth, account, and checkout forms. Mirrors
// the field styling already established in components/ContactForm.tsx.

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function fieldClass(hasError?: boolean): string {
  return `w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-foreground placeholder-foreground/40 outline-none transition-colors focus:border-wb-orange/60 ${
    hasError ? "border-wb-red/70" : "border-white/10"
  }`;
}

export function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-widest text-foreground/50">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1.5 text-xs text-wb-red">{error}</p>}
    </div>
  );
}

export function PrimaryButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-full bg-gradient-to-r from-wb-red via-wb-orange to-wb-yellow px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-black transition-transform duration-200 hover:scale-105 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    />
  );
}

export function SecondaryButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors duration-200 hover:border-wb-orange/60 hover:text-wb-orange disabled:pointer-events-none disabled:opacity-50 ${className}`}
    />
  );
}
