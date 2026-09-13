"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import dictionaries from "./dictionaries";
import { DEFAULT_LOCALE, type Dictionary, type Locale } from "./types";
import DocumentTitleSync from "./DocumentTitleSync";

const STORAGE_KEY = "wb-locale";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function parseLocale(value: string | null): Locale | null {
  return value === "en" || value === "fr" ? value : null;
}

// Tiny external store for the persisted locale, read via useSyncExternalStore
// instead of "read localStorage in a mount effect, then setState" (the
// set-state-in-effect pattern this replaces — see LanguageContext history).
//
// Why this avoids both the lint error and a hydration mismatch:
// - getServerSnapshot always returns DEFAULT_LOCALE, so SSR output and the
//   client's first hydration pass agree — no mismatch.
// - getSnapshot lazily reads localStorage on first client call and caches
//   the result in module state, so subsequent renders don't re-read storage.
// - React re-renders once, right after hydrating, using the real client
//   snapshot if it differs from the server one. That's the same one
//   post-mount correction the old effect+setState did, except React does it
//   through useSyncExternalStore's own contract instead of a setState call
//   inside our effect body — which is what the lint actually flags. The
//   brief FR→EN re-render this produces for a returning EN visitor is not
//   eliminated (it can't be without knowing locale before the response is
//   sent — e.g. a locale cookie read on the server, which is out of scope
//   for this pass), only moved out of hand-rolled state into React's own
//   synchronization path.
let cachedLocale: Locale = DEFAULT_LOCALE;
let cachedLocaleRead = false;
const listeners = new Set<() => void>();

function readStoredLocale(): Locale {
  try {
    return parseLocale(localStorage.getItem(STORAGE_KEY)) ?? DEFAULT_LOCALE;
  } catch {
    // localStorage unavailable (private browsing, etc.) — fall back to default
    return DEFAULT_LOCALE;
  }
}

function getSnapshot(): Locale {
  if (!cachedLocaleRead) {
    cachedLocale = readStoredLocale();
    cachedLocaleRead = true;
  }
  return cachedLocale;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  // Cross-tab: reflect a locale change made in another tab. (The "storage"
  // event never fires in the tab that made the change, which is why
  // setStoredLocale below also notifies listeners directly.)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    cachedLocale = readStoredLocale();
    cachedLocaleRead = true;
    onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function setStoredLocale(next: Locale) {
  cachedLocale = next;
  cachedLocaleRead = true;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // localStorage unavailable (private browsing, etc.) — locale still updates for this session
  }
  listeners.forEach((listener) => listener());
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setStoredLocale(next);
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: dictionaries[locale] }}>
      {children}
      <DocumentTitleSync />
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
